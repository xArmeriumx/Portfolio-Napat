/**
 * AI Service Integration
 * Acts as the bridge between the Frontend Components and the Secure Vercel Serverless Function.
 */
import { FEATURES } from '../config/features.js';

// --- In-Memory Cache (Context Collapse & Cache) ---
// ช่วยป้องกันการยิง API ซ้ำเมื่อผู้ใช้ถามคำถามเดิม หรือให้สรุปบทความที่เคยสรุปไปแล้ว โควต้าไม่เสียเปล่า!
const aiCache = new Map();

function getCacheKey(action, payload) {
  const str = typeof payload === 'object' ? JSON.stringify(payload) : payload;
  return `${action}-${str.length}-${str.substring(0, 30)}`;
}

// --- Context Compaction Helper (Token Budgeting) ---
// บีบอัดข้อมูลก่อนส่งโดยตัดบล็อกโค้ดทิ้ง (เพราะสรุปใจความไม่ค่อยจำเป็นต้องใช้โค้ดเพียวๆ) ช่วยลด Token ได้ 50-80%
function compactMarkdown(md) {
  if (!md) return '';
  // นำ Code blocks ออกแล้วแทนที่เล็กๆ เพื่อประหยัด Token ป้องกัน Context ล้น
  let compacted = md.replace(/```[\s\S]*?```/g, '\n[Code...]\n');
  return compacted.length > 5000 ? compacted.substring(0, 5000) + '...' : compacted;
}

// --- Mini QueryEngine (Session Memory) ---
// คอยจำบริบท (Context) 3 เรื่องล่าสุดที่ผู้ใช้งานเพิ่งให้ AI อ่านหรืออธิบายไป (เลียนแบบ QueryEngine ของ claude-code)
let sessionMemory = [];

export function recordAiMemory(role, shortContext) {
  sessionMemory.push({ role, content: shortContext });
  if (sessionMemory.length > 4) sessionMemory.shift(); // จำแค่ 4 แอคชันล่าสุด
}

export function clearAiMemory() {
  sessionMemory = [];
}


// --- Cloudflare Turnstile Integration (Vanilla JS) ---
let turnstileInjected = false;

function getTurnstileToken() {
  return new Promise((resolve) => {
    if (!turnstileInjected) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      turnstileInjected = true;
    }

    if (!document.getElementById('cf-turnstile-container')) {
      const div = document.createElement('div');
      div.id = 'cf-turnstile-container';
      document.body.appendChild(div);
    }

    const checkAndRender = () => {
      if (window.turnstile) {
        const widgetId = window.turnstile.render('#cf-turnstile-container', {
          sitekey: '0x4AAAAAACy5u8zujWObefIl',
          callback: function (token) {
            resolve(token);
            // reset immediately after use so it's fresh for next API call
            setTimeout(() => window.turnstile.remove(widgetId), 100);
          },
          "error-callback": function () {
            resolve('');
          }
        });
      } else {
        setTimeout(checkAndRender, 100);
      }
    };
    checkAndRender();
  });
}

export async function summarizeContent(content, onChunk) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;

  // ใช้ Compaction เพื่อประหยัด Token และสร้าง Cache Key
  const compactedContent = compactMarkdown(content);
  const cacheKey = getCacheKey('summarize', compactedContent);
  
  if (aiCache.has(cacheKey)) {
    console.log('[AI Cache Hit] Summarize');
    const cached = aiCache.get(cacheKey);
    if (onChunk) onChunk(cached);
    return cached;
  }

  try {
    const cfToken = await getTurnstileToken();

    // Calling our secure serverless backend
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-turnstile-token': cfToken
      },
      body: JSON.stringify({ action: 'summarize', payload: compactedContent, stream: !!onChunk })
    });

    if (!response.ok) {
      try {
         const data = await response.json();
         throw new Error(data.error || 'Failed to summarize document');
      } catch (e) {
         throw new Error('Failed to summarize document');
      }
    }

    if (onChunk) {
      // 🚀 Streaming Response Handler
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '' || line.includes('[DONE]')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data:\s*/, ''));
              const contentPiece = data.choices?.[0]?.delta?.content || '';
              resultText += contentPiece;
              onChunk(resultText); // Update UI in real-time!
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
      aiCache.set(cacheKey, resultText);
      return resultText;
    } else {
      const data = await response.json();
      aiCache.set(cacheKey, data.result); // บันทึกผลไว้ใน Cache
      return data.result;
    }
  } catch (error) {
    console.error("[aiService] Error:", error);
    throw error;
  }
}

// Helper for API calls
async function callBackendApi(action, payload) {
  // ตรวจสอบ Cache ก่อนเสมอ
  const cacheKey = getCacheKey(action, payload);
  if (aiCache.has(cacheKey)) {
    console.log(`[AI Cache Hit] ${action}`);
    return aiCache.get(cacheKey);
  }

  const cfToken = await getTurnstileToken();

  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-turnstile-token': cfToken
    },
    body: JSON.stringify({ action, payload })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'AI Server Error');
  
  aiCache.set(cacheKey, data.result); // บันทึกผลลง Cache
  return data.result;
}

export async function askAiContext(query, context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return { answer: "", quote: null };
  try {
    recordAiMemory('user', `ผู้ใช้ถามว่า: ${query}`);

    // ส่ง Session Memory ไปประกอบร่างเป็น Multi-turn Conversation
    const result = await callBackendApi('search_rag', { 
       query, 
       context,
       history: sessionMemory // ส่งประวัติเข้าไปด้วย!
    });
    
    if (!result) return { answer: "ขออภัย ติดขัดปัญหาการส่งข้อมูลครับ", quote: null };
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      recordAiMemory('assistant', `AI ตอบว่า: ${parsed.answer}`);
      return parsed;
    } catch (e) {
      return { answer: result, quote: null };
    }
  } catch (error) {
    console.error('askAiContext error:', error);
    return { answer: "ไม่สามารถค้นหาข้อมูลได้ในขณะนี้", quote: null };
  }
}

export async function generatePrompts(context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    // ใช้ Context Compaction ก่อนส่งสร้างคำถาม
    const compactedContext = compactMarkdown(context);
    const result = await callBackendApi('generate_prompts', { context: compactedContext });
    if (!result) return null;
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error('generatePrompts error:', error);
    return null;
  }
}

export async function explainSelection(selection, context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    // อธิบายโค้ดไม่ต้องใช้ทั้งเอกสาร บีบอัด Context เพื่อลดสัญญาณรบกวน (Noise)
    const compactedContext = compactMarkdown(context);
    const result = await callBackendApi('explain_selection', { selection, context: compactedContext });
    if (!result) return "ไม่มีคำอธิบายจากส่วนนี้";
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const explanation = parsed.explanation || result;
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ AI อธิบายประโยคนี้: "${selection.substring(0, 50)}..."`);
      return explanation;
    } catch (e) {
      recordAiMemory('system', `ผู้ใช้เพิ่งให้อธิบายคำว่า: "${selection.substring(0, 20)}..."`);
      return result;
    }
  } catch (error) {
    console.error('explainSelection error:', error);
    return "ขออภัย ไม่สามารถดึงข้อมูลอธิบายได้";
  }
}

export async function reviewCode(code, language, onChunk) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    // Cap code length to ~3000 chars to stay within token limits
    const trimmedCode = code.substring(0, 3000);
    const cacheKey = getCacheKey('review_code', trimmedCode + (language || ''));

    if (aiCache.has(cacheKey)) {
       const cached = aiCache.get(cacheKey);
       if (onChunk) onChunk(typeof cached === 'string' ? cached : cached.explanation);
       return typeof cached === 'string' ? { explanation: cached } : cached;
    }

    const cfToken = await getTurnstileToken();
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-turnstile-token': cfToken
      },
      body: JSON.stringify({ action: 'review_code', payload: { code: trimmedCode, language }, stream: !!onChunk })
    });

    if (!response.ok) {
      try {
         const data = await response.json();
         throw new Error(data.error || 'Failed to review code');
      } catch (e) {
         throw new Error('Failed to review code');
      }
    }

    if (onChunk) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '' || line.includes('[DONE]')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data:\s*/, ''));
              const contentPiece = data.choices?.[0]?.delta?.content || '';
              resultText += contentPiece;
              onChunk(resultText); 
            } catch (e) {}
          }
        }
      }
      aiCache.set(cacheKey, resultText);
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ระบบช่วย Review โค้ดภาษา ${language}`);
      return { explanation: resultText };
    } else {
      const data = await response.json();
      let parsed;
      try {
        const cleaned = data.result.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        parsed = { explanation: data.result };
      }
      aiCache.set(cacheKey, parsed);
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ระบบช่วย Review โค้ดภาษา ${language}`);
      return parsed;
    }
  } catch (error) {
    console.error('reviewCode error:', error);
    return null;
  }
}
