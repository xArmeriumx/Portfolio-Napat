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
       systemPrompt = `คุณคือระบบ AI อัจฉริยะที่ช่วยค้นหาข้อมูลในเอกสารของฉัน 
กฎเหล็กที่ต้องปฏิบัติอย่างเคร่งครัด:
1. ตอบคำถามผู้ใช้โดยอ้างอิงจาก "ข้อมูลแนบ (Context)" ที่หามาให้เท่านั้น ห้ามแต่งเติมเองเด็ดขาด
2. ตอบอย่างกระชับ ตรงประเด็น เป็นภาษาไทย
3. สำคัญ: ให้ส่งคืนข้อมูลกลับมาเป็นรูปแบบ JSON format อย่างเคร่งครัด ห้ามมีคำอธิบายเพิ่มเติม โครงสร้างต้องเป็นดังนี้:
{
  "answer": "คำตอบของคุณ (ถ้าไม่มีในเนื้อหาให้พิมพ์ว่า ไม่พบข้อมูล)",
  "quote": "ประโยคจากเนื้อหาที่ใช้ตอบ คัดลอกมาแบบเป๊ะๆ 1 ประโยค (ห้ามดัดแปลงคำเด็ดขาด) เอาไว้ใช้อ้างอิง Highlighting หรือใส่ null ถ้าไม่พบ"
}`;
       userMessage = `ข้อมูลแนบ (Context):\n${context}\n\nคำถาม: ${query}`;
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
        model: 'llama-3.3-70b-versatile',
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
