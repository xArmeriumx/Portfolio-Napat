import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const stats = {
  totalCalls: 0,
  totalErrors: 0,
  fallbackCount: 0,
  modelUsage: {} as Record<string, number>,
  actionUsage: {} as Record<string, number>,
  avgLatencyMs: 0,
  _latencySum: 0,
};

const VALID_ACTIONS = new Set([
  "summarize",
  "search_rag",
  "generate_prompts",
  "explain_selection",
  "review_code",
]);
const MAX_PAYLOAD_SIZE = 15000;

function createCorsHeaders(origin: string | null) {
  const headers = new Headers();
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://napatdev.com",
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin || "*");
  }

  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-turnstile-token");
  return headers;
}

function checkRateLimit(ip: string, headers: Headers) {
  const now = Date.now();
  const data = rateLimitMap.get(ip);

  if (!data || now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    headers.set("X-RateLimit-Remaining", String(MAX_REQUESTS_PER_MINUTE - 1));
    return true;
  }

  if (data.count >= MAX_REQUESTS_PER_MINUTE) {
    const resetIn = Math.ceil((data.resetTime - now) / 1000);
    headers.set("X-RateLimit-Remaining", "0");
    headers.set("X-RateLimit-Reset", String(resetIn));
    return false;
  }

  data.count += 1;
  const remaining = MAX_REQUESTS_PER_MINUTE - data.count;
  headers.set("X-RateLimit-Remaining", String(remaining));

  if (remaining <= 2) headers.set("X-RateLimit-Warning", "approaching-limit");
  return true;
}

function recordStats(model: string, action: string, latencyMs: number, isFallback = false) {
  stats.totalCalls++;
  stats.modelUsage[model] = (stats.modelUsage[model] || 0) + 1;
  stats.actionUsage[action] = (stats.actionUsage[action] || 0) + 1;
  stats._latencySum += latencyMs;
  stats.avgLatencyMs = Math.round(stats._latencySum / stats.totalCalls);
  if (isFallback) stats.fallbackCount++;
}

function validateRequest(action: string, payload: unknown) {
  if (!action || !payload) return "Bad Request. Missing action or payload.";
  if (!VALID_ACTIONS.has(action)) {
    return `Unknown action: "${action}". Valid actions: ${[...VALID_ACTIONS].join(", ")}`;
  }

  const payloadStr = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
  if (payloadStr.length > MAX_PAYLOAD_SIZE) {
    return `Payload too large (${payloadStr.length} chars). Max: ${MAX_PAYLOAD_SIZE}`;
  }

  const data = payload as Record<string, unknown>;
  if (action === "search_rag") {
    if (!data.query || !data.context) return 'search_rag requires "query" and "context" in payload.';
    if (typeof data.query !== "string" || data.query.trim().length === 0) {
      return 'search_rag "query" must be a non-empty string.';
    }
  }
  if (action === "explain_selection" && (!data.selection || !data.context)) {
    return 'explain_selection requires "selection" and "context" in payload.';
  }
  if (action === "review_code" && !data.code) return 'review_code requires "code" in payload.';

  return null;
}

function json(headers: Headers, body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers });
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: createCorsHeaders(request.headers.get("origin")) });
}

export async function POST(request: NextRequest) {
  const requestStart = Date.now();
  const headers = createCorsHeaders(request.headers.get("origin"));
  const forwardedFor = request.headers.get("x-forwarded-for");
  const rawIp = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(rawIp, headers)) {
    return json(headers, { error: "Too Many Requests (Rate Limit Exceeded). Please slow down and try again later." }, 429);
  }

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";
    const isAllowedDomain =
      origin.includes("napatdev.com") || origin.includes("vercel.app") || origin.includes("localhost");

    if (!isAllowedDomain) return json(headers, { error: "Forbidden: Origin validation failed" }, 403);

    const turnstileToken = request.headers.get("x-turnstile-token");
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

    if (!turnstileToken || !turnstileSecret) {
      return json(headers, { error: "Unauthorized Access: Missing CAPTCHA Token." }, 403);
    }

    const formData = new URLSearchParams();
    formData.append("secret", turnstileSecret);
    formData.append("response", turnstileToken);
    if (rawIp) formData.append("remoteip", rawIp);

    const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const outcome = await cfRes.json();

    if (!outcome.success) {
      console.warn("[Turnstile] Validation failed:", outcome["error-codes"]);
      return json(headers, { error: "Unauthorized Access: CAPTCHA Validation Failed." }, 403);
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(headers, { error: "Bad Request. Invalid JSON body." }, 400);
  }

  const { action, payload, stream } = body as { action: string; payload: unknown; stream?: boolean };
  const validationError = validateRequest(action, payload);
  if (validationError) return json(headers, { error: validationError }, 400);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return json(headers, { error: "Internal Configuration Error. API Key not found." }, 500);

  try {
    let systemPrompt = "";
    let userMessage = "";

    if (action === "summarize") {
      systemPrompt = "คุณคือ AI ผู้ช่วยนักพัฒนาซอฟต์แวร์สุดล้ำ ช่วยสรุปประเด็นสำคัญจากเอกสารโน้ต/Cheatsheet นี้ให้อ่านง่ายที่สุด โดยดึงแก่นสำคัญออกมาเป็น Bullet Points 3-5 ข้อ ด้วยภาษาที่เป็นมิตรและเข้าใจง่าย (เขียนเป็นภาษาไทย)";
      userMessage = String(payload);
    } else if (action === "search_rag") {
      const { query, context } = payload as Record<string, any>;
      systemPrompt = `คุณคือตัวช่วยค้นหาอัจฉริยะ (Semantic Search Engine) สำหรับเอกสารนี้
หน้าที่ของคุณคือเชื่อมโยง "ความต้องการของผู้ใช้" เข้ากับ "เนื้อหาในเอกสาร"

กฎในการค้นหา:
1. ผู้ใช้อาจพิมพ์คำค้นหาที่ไม่สมบูรณ์, พิมพ์ผิด, หรือใช้คำที่มีความหมายคล้ายกัน (Synonym) ให้คุณตีความเจตนาที่แท้จริง
2. ค้นหาประโยคหรือหัวข้อใน "ข้อมูลแนบ (Context)" ที่ตอบโจทย์การค้นหาของผู้ใช้ได้ดีที่สุด
3. ตอบคำถามผู้ใช้โดยอ้างอิงจากข้อมูลที่มีเท่านั้น ห้ามหลอน (Hallucinate) เด็ดขาด
4. ส่งคืนเป็ยรูปแบบ JSON อย่างเคร่งครัด โครงสร้างดังนี้:
{
  "answer": "คำตอบอธิบายแบบรวบรัด (ถ้าเนื้อหาไม่มีความเกี่ยวข้องเลย ให้คืนค่า null)",
  "quote": "ประโยคหรือหัวข้อ (Header) จากเนื้อหาเป๊ะๆ 1 ประโยค (ห้ามแก้แม้แต่ตัวอักษรเดียว) เพื่อใช้อ้างอิงการขีด Highlight ในหน้าเว็บ ถ้าไม่พบให้ใส่ null"
}`;
      userMessage = `ข้อมูลแนบ (Context):\n${context}\n\nคำถาม: ${query}`;
    } else if (action === "generate_prompts") {
      const { context } = payload as Record<string, any>;
      systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการตั้งคำถาม (Prompt Engineer)
หน้าที่ของคุณคืออ่านเอกสาร "ข้อมูลแนบ (Context)" แล้วสร้างคำถาม 3 ข้อที่สั้น กระชับ และน่าสนใจที่สุด ที่ผู้ใช้ควรอยากจะถามเกี่ยวกับเนื้อหานั้นๆ

กฎเหล็ก:
1. คำถามต้องดึงดูด น่ากด สั้นกระชับ
2. ส่งคืนรูปแบบ JSON Array เท่านั้น`;
      userMessage = `ข้อมูลแนบ (Context):\n${context}`;
    } else if (action === "explain_selection") {
      const { selection, context } = payload as Record<string, any>;
      systemPrompt = `คุณคือผู้ช่วยส่วนตัว (Personal AI Tutor)
หน้าที่ของคุณคือ อธิบายข้อความที่ผู้ใช้ "คลุมดำ" (Selection) โดยอิงตามบริบทเอกสาร (Context) เพื่อให้เข้าใจง่ายที่สุด

กฎเหล็ก:
1. อธิบายสั้นๆ กระชับที่สุด เป็นภาษาไทย
2. ส่งคืนรูปแบบ JSON อย่างเคร่งครัด โครงสร้าง:
{
  "explanation": "คำอธิบายที่อ่านง่าย"
}`;
      userMessage = `ข้อมูลแนบ (Context):\n${context}\n\nข้อความที่ผู้ใช้คลุมดำ (Selection): "${selection}"\n\nคำสั่ง: โปรดอธิบายข้อความนี้ให้เข้าใจง่ายที่สุด:`;
    } else if (action === "review_code") {
      const { code, language } = payload as Record<string, any>;
      systemPrompt = `คุณคือ Senior Software Engineer ขอให้คุณอธิบายหลักการทำงานของโค้ดให้เข้าใจง่ายและชัดเจน

กฎเหล็ก:
1. ตอบเป็นภาษาไทยด้วยน้ำเสียงกึ่งทางการ (Professional and formal) อธิบายให้กระชับและตรงประเด็น
2. ห้ามใช้อีโมจิ (Emojis) ใดๆ ทั้งสิ้นในข้อความของคุณโดยเด็ดขาด
3. อธิบายโค้ดนี้${language ? ` ภาษา ${language}` : ""} แบบละเอียดที่สุดแบบเข้าใจง่าย อธิบายแบบเห็นภาพ โฟกัสไปที่ "การทำงานของโค้ดแต่ละส่วน"
4. ใช้ Markdown Formatting อย่างมีระเบียบ${stream ? "" : `
5. ส่งคืนรูปแบบ JSON อย่างเคร่งครัดตามโครงสร้างนี้:
{
  "explanation": "คำอธิบายการทำงานของโค้ดที่ร้อยเรียงมาอย่างสวยงามพร้อม Markdown Formatting..."
}`}`;
      userMessage = `โค้ดที่ต้องการคำอธิบาย:\n\`\`\`${language || ""}\n${code}\n\`\`\``;
    }

    const FALLBACK_MODELS = [
      "llama-3.1-8b-instant",
      "qwen-2.5-32b",
      "moonshotai/kimi-k2-instruct",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "llama-3.3-70b-versatile",
      "llama3-8b-8192",
      "llama3-70b-8192",
    ];

    let lastError: Error | null = null;
    let modelIndex = 0;

    for (const model of FALLBACK_MODELS) {
      modelIndex++;
      const isFallback = modelIndex > 1;

      try {
        const abortController = new AbortController();
        const upstreamTimeout = setTimeout(() => abortController.abort(), 25000);

        try {
          const requestPayload = payload as Record<string, any>;
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                ...(action === "search_rag" && requestPayload.history
                  ? requestPayload.history.map((h: any) => ({
                      role: h.role === "assistant" ? "assistant" : "user",
                      content: h.role === "system" ? `[Memory]: ${h.content}` : h.content,
                    }))
                  : []),
                { role: "user", content: userMessage },
              ],
              temperature: action === "search_rag" ? 0.1 : 0.3,
              max_tokens: 600,
              stream: !!stream,
              ...(["search_rag", "review_code"].includes(action) && !stream
                ? { response_format: { type: "json_object" } }
                : {}),
            }),
            signal: abortController.signal,
          });

          clearTimeout(upstreamTimeout);

          if (response.status === 429) {
            lastError = new Error(`Rate limit exceeded for ${model}`);
            continue;
          }

          if (!response.ok) {
            const errText = await response.text();
            console.error(`[AI] Error with model ${model}:`, response.status, errText);
            if (response.status === 404 || response.status === 400) continue;
            throw new Error(`Upstream API Error: ${response.status}`);
          }

          const latency = Date.now() - requestStart;
          recordStats(model, action, latency, isFallback);

          if (stream) {
            const streamHeaders = new Headers(headers);
            streamHeaders.set("Content-Type", "text/event-stream");
            streamHeaders.set("Cache-Control", "no-cache");
            streamHeaders.set("Connection", "keep-alive");
            return new Response(response.body, { status: 200, headers: streamHeaders });
          }

          const data = await response.json();
          const resultText = data.choices[0]?.message?.content || "";
          return json(headers, { result: resultText.trim() }, 200);
        } finally {
          clearTimeout(upstreamTimeout);
        }
      } catch (err: any) {
        lastError = err;
        const isAbort = err.name === "AbortError";
        console.warn(`[AI] ${isAbort ? "Timeout" : "Exception"} with model ${model}:`, err.message);
        stats.totalErrors++;
      }
    }

    throw lastError || new Error("All fallback models failed.");
  } catch (error) {
    console.error("Serverless Execution Error:", error);
    stats.totalErrors++;
    return json(headers, { error: "Failed to process AI request temporarily." }, 500);
  }
}
