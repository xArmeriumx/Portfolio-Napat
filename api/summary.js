/**
 * Vercel Serverless Function: AI Gateway (Enhanced with Claude Code Patterns)
 * Path: api/summary.js 
 * 
 * Patterns applied from Sheet/:
 *  - Input Validation (Part 5 Philosophy 3 — 4-Phase Tool Lifecycle)
 *  - Observability / Stats Tracking (Part 4 Philosophy 2)
 *  - Proactive Rate Limit Warning Headers (Part 4 Philosophy 7)
 *  - AbortSignal timeout for upstream calls (Part 7 Philosophy 3)
 */

// ============================================================
// 🛡️ Rate Limiter (enhanced with warning headers)
// ============================================================
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip, res) {
  const now = Date.now();
  if (rateLimitMap.has(ip)) {
     const data = rateLimitMap.get(ip);
     if (now > data.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS_PER_MINUTE - 1);
        return true;
     }
     
     if (data.count >= MAX_REQUESTS_PER_MINUTE) {
        const resetIn = Math.ceil((data.resetTime - now) / 1000);
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', resetIn.toString());
        return false;
     }
     
     data.count += 1;
     const remaining = MAX_REQUESTS_PER_MINUTE - data.count;
     res.setHeader('X-RateLimit-Remaining', remaining.toString());
     
     // Proactive Warning (Sheet Part 4 §7): บอก frontend ก่อนถูก limit
     if (remaining <= 2) {
       res.setHeader('X-RateLimit-Warning', 'approaching-limit');
     }
     return true;
  } else {
     rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
     res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS_PER_MINUTE - 1).toString());
     return true;
  }
}


// ============================================================
// 📊 Observability Stats (Sheet Part 4 §2)
// ============================================================
// Simple in-memory counters per hot container — ไม่ต้อง external service
const stats = {
  totalCalls: 0,
  totalErrors: 0,
  fallbackCount: 0,
  modelUsage: {},
  actionUsage: {},
  avgLatencyMs: 0,
  _latencySum: 0,
};

function recordStats(model, action, latencyMs, isFallback = false) {
  stats.totalCalls++;
  stats.modelUsage[model] = (stats.modelUsage[model] || 0) + 1;
  stats.actionUsage[action] = (stats.actionUsage[action] || 0) + 1;
  stats._latencySum += latencyMs;
  stats.avgLatencyMs = Math.round(stats._latencySum / stats.totalCalls);
  if (isFallback) stats.fallbackCount++;
}


// ============================================================
// 🔍 Input Validation (Sheet Part 5 §3 — Phase 1: Validation)
// ============================================================
const VALID_ACTIONS = new Set(['summarize', 'search_rag', 'generate_prompts', 'explain_selection', 'review_code']);
const MAX_PAYLOAD_SIZE = 15000; // 15KB max payload

function validateRequest(action, payload) {
  if (!action || !payload) {
    return 'Bad Request. Missing action or payload.';
  }
  if (!VALID_ACTIONS.has(action)) {
    return `Unknown action: "${action}". Valid actions: ${[...VALID_ACTIONS].join(', ')}`;
  }
  
  // Size check
  const payloadStr = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
  if (payloadStr.length > MAX_PAYLOAD_SIZE) {
    return `Payload too large (${payloadStr.length} chars). Max: ${MAX_PAYLOAD_SIZE}`;
  }
  
  // Action-specific validation
  if (action === 'search_rag') {
    if (!payload.query || !payload.context) {
      return 'search_rag requires "query" and "context" in payload.';
    }
    if (typeof payload.query !== 'string' || payload.query.trim().length === 0) {
      return 'search_rag "query" must be a non-empty string.';
    }
  }
  if (action === 'explain_selection') {
    if (!payload.selection || !payload.context) {
      return 'explain_selection requires "selection" and "context" in payload.';
    }
  }
  if (action === 'review_code') {
    if (!payload.code) {
      return 'review_code requires "code" in payload.';
    }
  }
  
  return null; // valid
}

// ============================================================
// 🚀 Main Handler
// ============================================================
export default async function handler(req, res) {
  const requestStart = Date.now();

  // 1. Basic Security: CORS & Origin Check
  const allowedOrigins = ['http://localhost:5173', 'https://napatdev.com', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-turnstile-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Rate Limit (enhanced with warning headers)
  const forwardedFor = req.headers['x-forwarded-for'];
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.socket?.remoteAddress || 'unknown');
  
  if (!checkRateLimit(rawIp, res)) {
    return res.status(429).json({ error: 'Too Many Requests (Rate Limit Exceeded). Please slow down and try again later.' });
  }

  // 3. Security (Turnstile CAPTCHA)
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    const origin = req.headers.origin || req.headers.referer || '';
    const isAllowedDomain = origin.includes('napatdev.com') || origin.includes('vercel.app') || origin.includes('localhost');
    
    if (!isAllowedDomain) {
      return res.status(403).json({ error: 'Forbidden: Origin validation failed' });
    }

    const turnstileToken = req.headers['x-turnstile-token'];
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!turnstileToken) {
       return res.status(403).json({ error: 'Unauthorized Access: Missing CAPTCHA Token.' });
    }

    const formData = new URLSearchParams();
    formData.append('secret', turnstileSecret);
    formData.append('response', turnstileToken);
    
    const remoteIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    if (remoteIp) formData.append('remoteip', remoteIp);

    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    const outcome = await cfRes.json();
    
    if (!outcome.success) {
       console.warn("[Turnstile] Validation failed:", outcome['error-codes']);
       return res.status(403).json({ error: 'Unauthorized Access: CAPTCHA Validation Failed.' });
    }
  }

  // 4. Input Validation (Sheet Part 5 §3)
  const { action, payload, stream } = req.body || {};
  
  const validationError = validateRequest(action, payload);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Internal Configuration Error. API Key not found.' });
  }

  try {
    let systemPrompt = "";
    let userMessage = "";

    // 5. Routing logic
    if (action === 'summarize') {
       systemPrompt = "คุณคือ AI ผู้ช่วยนักพัฒนาซอฟต์แวร์สุดล้ำ ช่วยสรุปประเด็นสำคัญจากเอกสารโน้ต/Cheatsheet นี้ให้อ่านง่ายที่สุด โดยดึงแก่นสำคัญออกมาเป็น Bullet Points 3-5 ข้อ ด้วยภาษาที่เป็นมิตรและเข้าใจง่าย (เขียนเป็นภาษาไทย)";
       userMessage = payload;
    } else if (action === 'search_rag') {
       const { query, context } = payload;
       systemPrompt = `คุณคือตัวช่วยค้นหาอัจฉริยะ (Semantic Search Engine) สำหรับเอกสารนี้
หน้าที่ของคุณคือเชื่อมโยง "ความต้องการของผู้ใช้" เข้ากับ "เนื้อหาในเอกสาร"

กฎในการค้นหา:
1. ผู้ใช้อาจพิมพ์คำค้นหาที่ไม่สมบูรณ์, พิมพ์ผิด, หรือใช้คำที่มีความหมายคล้ายกัน (Synonym) ให้คุณตีความเจตนาที่แท้จริง
   (ตัวอย่าง: ถ้าผู้ใช้พิมพ์ "ลบข้อมูล" หรือ "ทิ้งตาราง" ให้คุณโยงไปหา "DELETE" หรือ "DROP TABLE" ในเอกสาร)
2. ค้นหาประโยคหรือหัวข้อใน "ข้อมูลแนบ (Context)" ที่ตอบโจทย์การค้นหาของผู้ใช้ได้ดีที่สุด
3. ตอบคำถามผู้ใช้โดยอ้างอิงจากข้อมูลที่มีเท่านั้น ห้ามหลอน (Hallucinate) เด็ดขาด
4. ส่งคืนเป็ยรูปแบบ JSON อย่างเคร่งครัด โครงสร้างดังนี้:
{
  "answer": "คำตอบอธิบายแบบรวบรัด (ถ้าเนื้อหาไม่มีความเกี่ยวข้องเลย ให้คืนค่า null)",
  "quote": "ประโยคหรือหัวข้อ (Header) จากเนื้อหาเป๊ะๆ 1 ประโยค (ห้ามแก้แม้แต่ตัวอักษรเดียว) เพื่อใช้อ้างอิงการขีด Highlight ในหน้าเว็บ ถ้าไม่พบให้ใส่ null"
}`;
       userMessage = `ข้อมูลแนบ (Context):\n${context}\n\nคำถาม: ${query}`;
    } else if (action === 'generate_prompts') {
       const { context } = payload;
       systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการตั้งคำถาม (Prompt Engineer)
หน้าที่ของคุณคืออ่านเอกสาร "ข้อมูลแนบ (Context)" แล้วสร้างคำถาม 3 ข้อที่สั้น กระชับ และน่าสนใจที่สุด ที่ผู้ใช้ควรอยากจะถามเกี่ยวกับเนื้อหานั้นๆ

กฎเหล็ก:
1. คำถามต้องดึงดูด น่ากด สั้นกระชับ (เช่น "สรุปใจความสำคัญแบบ 1 นาที", "ข้อควรระวัง", "เทคนิคที่น่าสนใจ")
2. ส่งคืนรูปแบบ JSON Array เท่านั้น โครงสร้างคือ: 
[
  "คำถามสั้นๆ 1",
  "คำถามสั้นๆ 2",
  "คำถามสั้นๆ 3"
]`;
       userMessage = `ข้อมูลแนบ (Context):\n${context}`;
    } else if (action === 'explain_selection') {
       const { selection, context } = payload;
       systemPrompt = `คุณคือผู้ช่วยส่วนตัว (Personal AI Tutor)
หน้าที่ของคุณคือ อธิบายข้อความที่ผู้ใช้ "คลุมดำ" (Selection) โดยอิงตามบริบทเอกสาร (Context) เพื่อให้เข้าใจง่ายที่สุด

กฎเหล็ก:
1. อธิบายสั้นๆ กระชับที่สุด เป็นภาษาไทย คล้ายๆ การกด Force Touch ดู Glossary ใน iOS
2. หากเป็นความรู้ซับซ้อน ให้อธิบายแบบภาษาคน (Layman) ให้เข้าใจใน 1-2 ย่อหน้า
3. ส่งคืนรูปแบบ JSON อย่างเคร่งครัด โครงสร้าง:
{
  "explanation": "คำอธิบายที่อ่านง่าย"
}`;
       userMessage = `ข้อมูลแนบ (Context):\n${context}\n\nข้อความที่ผู้ใช้คลุมดำ (Selection): "${selection}"\n\nคำสั่ง: โปรดอธิบายข้อความนี้ให้เข้าใจง่ายที่สุด:`;
    } else if (action === 'review_code') {
       const { code, language } = payload;
       systemPrompt = `คุณคือ Senior Software Engineer ขอให้คุณอธิบายหลักการทำงานของโค้ดให้เข้าใจง่ายและชัดเจน

กฎเหล็ก:
1. ตอบเป็นภาษาไทยด้วยน้ำเสียงกึ่งทางการ (Professional and formal) อธิบายให้กระชับและตรงประเด็น
2. ห้ามใช้อีโมจิ (Emojis) ใดๆ ทั้งสิ้นในข้อความของคุณโดยเด็ดขาด
3. อธิบายโค้ดนี้${language ? ` ภาษา ${language}` : ''} แบบละเอียดที่สุดแบบเข้าใจง่าย อธิบายแบบเห็นภาพ โฟกัสไปที่ "การทำงานของโค้ดแต่ละส่วน"
4. ใช้ Markdown Formatting อย่างมีระเบียบ (เช่น ใช้ **ตัวหนา**, \`code\`, ตัวเลขลำดับ หรือ Bullet Points) อย่าเว้นบรรทัดพร่ำเพรื่อ` + 
(stream ? "" : `
5. ส่งคืนรูปแบบ JSON อย่างเคร่งครัดตามโครงสร้างนี้:
{
  "explanation": "คำอธิบายการทำงานของโค้ดที่ร้อยเรียงมาอย่างสวยงามพร้อม Markdown Formatting..."
}`);
       userMessage = `โค้ดที่ต้องการคำอธิบาย:\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    }

    // 6. Multi-Model Fallback Queue (เดิมมีอยู่แล้ว)
    const FALLBACK_MODELS = [
      'llama-3.1-8b-instant', 
      'qwen-2.5-32b',
      'moonshotai/kimi-k2-instruct',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'llama3-8b-8192',
      'llama3-70b-8192'
    ];

    let lastError = null;
    let modelIndex = 0;

    for (const model of FALLBACK_MODELS) {
      modelIndex++;
      const isFallback = modelIndex > 1;
      
      try {
        // AbortSignal timeout สำหรับ upstream call (Sheet Part 7 §3)
        const abortController = new AbortController();
        const upstreamTimeout = setTimeout(() => abortController.abort(), 25000); // 25s timeout

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...(action === 'search_rag' && payload.history ? payload.history.map(h => ({
                    role: h.role === 'assistant' ? 'assistant' : 'user',
                    content: h.role === 'system' ? `[Memory]: ${h.content}` : h.content
                })) : []),
                { role: 'user', content: userMessage }
              ],
              temperature: action === 'search_rag' ? 0.1 : 0.3,
              max_tokens: 600,
              stream: !!stream,
              ...((['search_rag', 'review_code'].includes(action) && !stream) && { response_format: { type: 'json_object' } })
            }),
            signal: abortController.signal
          });

          clearTimeout(upstreamTimeout);

          if (response.status === 429) {
            console.warn(`[AI] Rate limit hit for model: ${model}. Falling back to next model...`);
            lastError = new Error(`Rate limit exceeded for ${model}`);
            continue;
          }

          if (!response.ok) {
             const errText = await response.text();
             console.error(`[AI] Error with model ${model}:`, response.status, errText);
             if (response.status === 404 || response.status === 400) {
                continue;
             }
             throw new Error(`Upstream API Error: ${response.status}`);
          }

          // Streaming mode
          if (stream) {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            });
            
            if (response.body && response.body.getReader) {
              const reader = response.body.getReader();
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
            } else if (response.body) {
              for await (const chunk of response.body) {
                res.write(chunk);
              }
            }
            res.end();

            // 📊 Record stats (Sheet Part 4 §2)
            const latency = Date.now() - requestStart;
            recordStats(model, action, latency, isFallback);
            console.log(`[AI OK] model=${model} action=${action} latency=${latency}ms fallback=${isFallback}`);
            return;
          }

          const data = await response.json();
          const resultText = data.choices[0]?.message?.content || "";

          // 📊 Record stats
          const latency = Date.now() - requestStart;
          recordStats(model, action, latency, isFallback);
          console.log(`[AI OK] model=${model} action=${action} latency=${latency}ms fallback=${isFallback}`);

          return res.status(200).json({ result: resultText.trim() });

        } finally {
          clearTimeout(upstreamTimeout);
        }

      } catch (err) {
        lastError = err;
        const isAbort = err.name === 'AbortError';
        console.warn(`[AI] ${isAbort ? 'Timeout' : 'Exception'} with model ${model}:`, err.message);
        stats.totalErrors++;
      }
    }

    throw lastError || new Error("All fallback models failed.");

  } catch (error) {
    console.error('Serverless Execution Error:', error);
    stats.totalErrors++;
    return res.status(500).json({ error: 'Failed to process AI request temporarily.' });
  }
}
