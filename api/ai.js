/**
 * Vercel Serverless Function: AI Gateway
 * Path: api/ai.js 
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
    } else {
       return res.status(400).json({ error: 'Unknown Action Type' });
    }

    // 3. Native Fetch to obscure usage of heavier libraries
    // We use the direct OpenAI-compatible endpoint from Groq 
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Switched to 8b model for higher token limits
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: action === 'search_rag' ? 0.1 : 0.3, // Low temperature for high accuracy
        max_tokens: 600,
        ...(action === 'search_rag' && { response_format: { type: 'json_object' } })
      })
    });

    if (!response.ok) {
       const errText = await response.text();
       console.error("AI Provider Error:", response.status, errText);
       throw new Error(`Upstream API Error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content || "";

    // 4. Send back securely
    return res.status(200).json({ result: resultText.trim() });

  } catch (error) {
    console.error('Serverless Execution Error:', error);
    return res.status(500).json({ error: 'Failed to process AI request temporarily.' });
  }
}
