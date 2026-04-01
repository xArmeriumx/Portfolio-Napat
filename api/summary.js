/**
 * Vercel Serverless Function: AI Gateway
 * Path: api/summary.js 
 * Note: Named generically to obscure the backend provider logic.
 */

export default async function handler(req, res) {
  // 1. Basic Security: CORS & Origin Check
  // Allow local development and the production domain
  const allowedOrigins = ['http://localhost:5173', 'https://napatdev.com', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Fast return for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Security Protection: Validate request source to prevent stolen quota
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    // 1. Check Origin/Referer: Blocks other websites from requesting our API via browser fetch (CORS spoofing is blocked by browsers natively)
    const origin = req.headers.origin || req.headers.referer || '';
    const isAllowedDomain = origin.includes('napatdev.com') || origin.includes('vercel.app') || origin.includes('localhost');
    
    if (!isAllowedDomain) {
      return res.status(403).json({ error: 'Forbidden: Origin validation failed' });
    }

    // 2. CAPTCHA / Cloudflare Turnstile Validation (Final Boss)
    const turnstileToken = req.headers['x-turnstile-token'];
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    
    if (!turnstileToken) {
       return res.status(403).json({ error: 'Unauthorized Access: Missing CAPTCHA Token.' });
    }

    const formData = new URLSearchParams();
    formData.append('secret', turnstileSecret);
    formData.append('response', turnstileToken);
    
    // Check if behind proxy or retrieve normal IP
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

  const { action, payload } = req.body || {};
  if (!action || !payload) {
    return res.status(400).json({ error: 'Bad Request. Missing action or payload.' });
  }

  // Process.env holds secrets securely in Vercel Cloud Server
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Internal Configuration Error. API Key not found.' });
  }

  try {
    let systemPrompt = "";
    let userMessage = "";

    // 2. Routing logic (Summarize vs RAG)
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
       systemPrompt = `คุณคือ Senior Staff Software Engineer ผู้เชี่ยวชาญและใจดี
หน้าที่ของคุณคืออธิบายหลัการทำงานของโค้ดให้เข้าใจง่ายที่สุด

กฎเหล็ก:
1. ตอบเป็นภาษาไทย เสมอ อธิบายให้เข้าใจง่าย เป็นกันเองเหมือนรุ่นพี่สอนรุ่นน้อง
2. อธิบายโค้ดนี้${language ? ` ภาษา ${language}` : ''} แบบละเอียดที่สุดแบบเข้าใจง่าย อธิบายแบบเห็นภาพชัดที่สุด และจัดวางให้สวยงาม
3. ไม่ต้องแยกเรื่อง Issues, Warnings หรือ Suggestions ให้โฟกัสแค่ "อธิบายการทำงานของโค้ด" เท่านั้น
4. จัดเรียงโดยใช้ Markdown Formatting อย่างสวยงาม (เช่น ใส่ **ตัวหนา**, \`code\`, สัญลักษณ์ Bullet Points)
5. ส่งคืนรูปแบบ JSON อย่างเคร่งครัดตามโครงสร้างนี้:
{
  "explanation": "คำอธิบายการทำงานของโค้ดที่ร้อยเรียงมาอย่างสวยงามพร้อม Markdown Formatting..."
}`;
       userMessage = `โค้ดที่ต้องการคำอธิบาย:\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    } else {
       return res.status(400).json({ error: 'Unknown Action Type' });
    }

    // 3. Multi-Model Fallback Queue
    // We loop through available models. If one hits Rate Limit (429), we silently switch to the next!
    const FALLBACK_MODELS = [
      'llama-3.1-8b-instant', 
      'qwen-2.5-32b',
      'moonshotai/kimi-k2-instruct',
      'openai/gpt-oss-120b',         // Adding custom requested model
      'openai/gpt-oss-20b',          // Adding custom requested model
      'llama-3.3-70b-versatile',
      'llama3-8b-8192',
      'llama3-70b-8192'
    ];

    let lastError = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { // Can be changed to openrouter URL if using those models
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: action === 'search_rag' ? 0.1 : 0.3,
            max_tokens: 600,
            ...((['search_rag', 'review_code'].includes(action)) && { response_format: { type: 'json_object' } })
          })
        });

        if (response.status === 429) {
          console.warn(`[AI] Rate limit hit for model: ${model}. Falling back to next model...`);
          lastError = new Error(`Rate limit exceeded for ${model}`);
          continue; // Trigger fallback
        }

        if (!response.ok) {
           const errText = await response.text();
           console.error(`[AI] Error with model ${model}:`, response.status, errText);
           // If it's a model not found error (like kimi on groq), we should fallback too
           if (response.status === 404 || response.status === 400) {
              continue;
           }
           throw new Error(`Upstream API Error: ${response.status}`);
        }

        const data = await response.json();
        const resultText = data.choices[0]?.message?.content || "";

        // 4. Send back securely on first success!
        // Note: intentionally omitting _usedModel to hide architecture implementation details
        return res.status(200).json({ result: resultText.trim() });

      } catch (err) {
        lastError = err;
        console.warn(`[AI] Exception with model ${model}:`, err.message);
        // Continue to next model on fetch failures
      }
    }

    // If loop finishes without returning, all models failed (or limit totally reached)
    throw lastError || new Error("All fallback models failed.");

  } catch (error) {
    console.error('Serverless Execution Error:', error);
    return res.status(500).json({ error: 'Failed to process AI request temporarily.' });
  }
}
