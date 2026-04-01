/**
 * AI Service Integration
 * Acts as the bridge between the Frontend Components and the Secure Vercel Serverless Function.
 */
import { FEATURES } from '../config/features.js';

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
          sitekey: '0x4AAAAAAACy5u8zujWObefIl',
          callback: function(token) {
            resolve(token);
            // reset immediately after use so it's fresh for next API call
            setTimeout(() => window.turnstile.remove(widgetId), 100);
          },
          "error-callback": function() {
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

export async function summarizeContent(content) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;

  try {
    const cfToken = await getTurnstileToken();

    // Calling our secure serverless backend
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-turnstile-token': cfToken
      },
      body: JSON.stringify({ action: 'summarize', payload: content })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to summarize document');
    
    return data.result;
  } catch (error) {
    console.error("[aiService] Error:", error);
    throw error;
  }
}

// Helper for API calls
async function callBackendApi(action, payload) {
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
  return data.result;
}

export async function askAiContext(query, context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return { answer: "", quote: null };
  try {
    const result = await callBackendApi('search_rag', { query, context });
    if (!result) return { answer: "ขออภัย ติดขัดปัญหาการส่งข้อมูลครับ", quote: null };
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
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
    const result = await callBackendApi('generate_prompts', { context });
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
    const result = await callBackendApi('explain_selection', { selection, context });
    if (!result) return "ไม่มีคำอธิบายจากส่วนนี้";
    try {
       const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
       const parsed = JSON.parse(cleaned);
       return parsed.explanation || result;
    } catch (e) {
       return result;
    }
  } catch (error) {
    console.error('explainSelection error:', error);
    return "ขออภัย ไม่สามารถดึงข้อมูลอธิบายได้";
  }
}

export async function reviewCode(code, language) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    // Cap code length to ~3000 chars to stay within token limits
    const trimmedCode = code.substring(0, 3000);
    const result = await callBackendApi('review_code', { code: trimmedCode, language });
    if (!result) return null;
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      // If AI returned plain text instead of JSON, wrap it
      return { summary: result, issues: [], suggestions: '', improved_code: null };
    }
  } catch (error) {
    console.error('reviewCode error:', error);
    return null;
  }
}
