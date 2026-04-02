/**
 * AI Service Integration (Enhanced with Claude Code Patterns)
 * 
 * Patterns applied from Sheet/:
 *  - SmartCache with TTL + LRU eviction (Part 7 Philosophy 2)
 *  - withRetry + Multiplexed Backoff (Part 3 Pattern 5)
 *  - Circuit Breaker (Part 3 Pattern 4)
 *  - AbortController timeout (Part 7 Philosophy 3)
 *  - Latched Turnstile state (Part 4 Philosophy 1)
 *  - Context Compaction (already existed, enhanced)
 */
import { FEATURES } from '../config/features.js';

// ============================================================
// 📦 SmartCache — TTL + LRU bounded cache (Sheet Part 7 §2)
// ============================================================
// แก้ปัญหา: Map() เปล่าๆ โตไปเรื่อยๆ ไม่มี cleanup
// Solution: TTL 30 นาที + Max 50 entries + LRU eviction
class SmartCache {
  constructor(maxEntries = 50, ttlMs = 30 * 60 * 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key); // expired → evict
      return undefined;
    }
    // LRU: promote to most-recently-used by re-inserting
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    // LRU eviction: remove oldest when full
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  has(key) {
    return this.get(key) !== undefined; // checks TTL too
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

const aiCache = new SmartCache(50, 30 * 60 * 1000); // 50 entries, 30min TTL

function getCacheKey(action, payload) {
  const str = typeof payload === 'object' ? JSON.stringify(payload) : payload;
  return `${action}-${str.length}-${str.substring(0, 30)}`;
}

// ============================================================
// 🔁 withRetry — Exponential Backoff (Sheet Part 3 §5)
// ============================================================
// แก้ปัญหา: network fail 1 ครั้ง = fail forever
// Solution: retry ตาม error type, exponential backoff + jitter
async function withRetry(fn, { maxRetries = 2, onRetry, signal } = {}) {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn(signal);
    } catch (error) {
      // Don't retry if aborted by user
      if (signal?.aborted) throw error;
      // Don't retry on final attempt
      if (attempt > maxRetries) throw error;

      // Multiplexed: เลือก delay ตาม error type
      const isRateLimit = error.message?.includes('429') || error.message?.includes('Rate Limit');
      const isTimeout = error.name === 'AbortError';
      const baseDelay = isRateLimit ? 3000 : isTimeout ? 1000 : 500;
      const delay = Math.min(baseDelay * 2 ** (attempt - 1), 15000)
                    + Math.random() * 300; // jitter ป้องกัน thundering herd

      onRetry?.(attempt, delay, error);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ============================================================
// 🎭 Circuit Breaker (Sheet Part 3 §4)
// ============================================================
// แก้ปัญหา: AI fail ซ้ำๆ → ยังพยายามส่ง request + waste Turnstile token
// Solution: หลัง fail 3 ครั้งติด → หยุดพยายามชั่วคราว 60 วินาที
const circuitBreaker = {
  consecutiveFailures: 0,
  maxFailures: 3,
  cooldownMs: 60 * 1000, // 60 seconds
  lastFailureTime: 0,

  recordSuccess() {
    this.consecutiveFailures = 0;
  },

  recordFailure() {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();
  },

  isOpen() {
    if (this.consecutiveFailures < this.maxFailures) return false;
    // ถ้าเลย cooldown แล้ว → half-open (ลองอีกครั้ง)
    if (Date.now() - this.lastFailureTime > this.cooldownMs) {
      this.consecutiveFailures = 0; // reset
      return false;
    }
    return true; // circuit still open → block
  },

  getRemainingCooldown() {
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, Math.ceil((this.cooldownMs - elapsed) / 1000));
  }
};


// ============================================================
// ✂️ Context Compaction (เดิมมีอยู่แล้ว, เพิ่ม comment)
// ============================================================
// บีบอัดข้อมูลก่อนส่ง ตัดบล็อกโค้ดออก ช่วยลด Token ได้ 50-80%
function compactMarkdown(md) {
  if (!md) return '';
  let compacted = md.replace(/```[\s\S]*?```/g, '\n[Code...]\n');
  return compacted.length > 5000 ? compacted.substring(0, 5000) + '...' : compacted;
}

// ============================================================
// 🧠 Mini QueryEngine — Session Memory (เดิมมีอยู่แล้ว)
// ============================================================
let sessionMemory = [];

export function recordAiMemory(role, shortContext) {
  sessionMemory.push({ role, content: shortContext });
  if (sessionMemory.length > 4) sessionMemory.shift();
}

export function clearAiMemory() {
  sessionMemory = [];
}


// ============================================================
// 🧊 Turnstile — Latched injection (Sheet Part 4 §1)
// ============================================================
// Latch: inject script ครั้งเดียว ไม่ flip state กลาง session
let turnstileInjected = false;

function getTurnstileToken() {
  return new Promise((resolve) => {
    if (!turnstileInjected) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      turnstileInjected = true; // latched — one-way, never revert
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


// ============================================================
// 🛡️ Core API Call Helper — with all patterns integrated
// ============================================================
async function callBackendApi(action, payload) {
  // Circuit Breaker check
  if (circuitBreaker.isOpen()) {
    const remaining = circuitBreaker.getRemainingCooldown();
    throw new Error(`AI service temporarily paused (${remaining}s). กรุณารอสักครู่แล้วลองใหม่ครับ`);
  }

  // Cache check
  const cacheKey = getCacheKey(action, payload);
  const cached = aiCache.get(cacheKey);
  if (cached !== undefined) {
    console.log(`[AI Cache Hit] ${action}`);
    return cached;
  }

  // Retry wrapper with abort timeout
  const result = await withRetry(async (signal) => {
    const cfToken = await getTurnstileToken();

    // AbortController with timeout (Sheet Part 7 §3)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-turnstile-token': cfToken
        },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI Server Error');

      circuitBreaker.recordSuccess();
      aiCache.set(cacheKey, data.result);
      return data.result;
    } finally {
      clearTimeout(timeoutId);
    }
  }, {
    maxRetries: 2,
    onRetry: (attempt, delay, error) => {
      console.warn(`[AI Retry] Attempt ${attempt}, waiting ${Math.round(delay)}ms:`, error.message);
    }
  });

  return result;
}


// ============================================================
// 📡 Streaming Helper — with abort + stall metadata
// ============================================================
async function callBackendApiStreaming(action, payload, onChunk) {
  // Circuit Breaker check
  if (circuitBreaker.isOpen()) {
    const remaining = circuitBreaker.getRemainingCooldown();
    throw new Error(`AI service temporarily paused (${remaining}s). กรุณารอสักครู่แล้วลองใหม่ครับ`);
  }

  const cacheKey = getCacheKey(action, typeof payload === 'object' ? JSON.stringify(payload) : payload);
  const cached = aiCache.get(cacheKey);
  if (cached !== undefined) {
    console.log(`[AI Cache Hit] ${action} (streaming)`);
    onChunk?.(cached);
    return cached;
  }

  const result = await withRetry(async () => {
    const cfToken = await getTurnstileToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s for streaming

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-turnstile-token': cfToken
        },
        body: JSON.stringify({ action, payload, stream: true }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errMsg = 'Failed to process request';
        try {
          const data = await response.json();
          errMsg = data.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

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
              onChunk?.(resultText);
            } catch (_) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      circuitBreaker.recordSuccess();
      aiCache.set(cacheKey, resultText);
      return resultText;
    } finally {
      clearTimeout(timeoutId);
    }
  }, {
    maxRetries: 1, // streaming ลด retry เหลือ 1 เพื่อ UX ไม่ช้าเกินไป
    onRetry: (attempt, delay, error) => {
      console.warn(`[AI Streaming Retry] Attempt ${attempt}, waiting ${Math.round(delay)}ms:`, error.message);
    }
  });

  return result;
}


// ============================================================
// 🔒 Error Wrapper — Circuit Breaker recording
// ============================================================
function withCircuitBreaker(fn) {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  };
}


// ============================================================
// 📝 Public API Functions
// ============================================================

export async function summarizeContent(content, onChunk) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;

  const compactedContent = compactMarkdown(content);

  try {
    if (onChunk) {
      return await withCircuitBreaker(callBackendApiStreaming)('summarize', compactedContent, onChunk);
    } else {
      return await withCircuitBreaker(callBackendApi)('summarize', compactedContent);
    }
  } catch (error) {
    console.error("[aiService] summarizeContent Error:", error);
    throw error;
  }
}


export async function askAiContext(query, context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return { answer: "", quote: null };
  try {
    recordAiMemory('user', `ผู้ใช้ถามว่า: ${query}`);

    const result = await withCircuitBreaker(callBackendApi)('search_rag', {
      query,
      context,
      history: sessionMemory
    });

    if (!result) return { answer: "ขออภัย ติดขัดปัญหาการส่งข้อมูลครับ", quote: null };
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      recordAiMemory('assistant', `AI ตอบว่า: ${parsed.answer}`);
      return parsed;
    } catch (_) {
      return { answer: result, quote: null };
    }
  } catch (error) {
    console.error('askAiContext error:', error);
    return { answer: error.message?.includes('temporarily paused')
      ? error.message
      : "ไม่สามารถค้นหาข้อมูลได้ในขณะนี้", quote: null };
  }
}


export async function generatePrompts(context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    const compactedContext = compactMarkdown(context);
    const result = await withCircuitBreaker(callBackendApi)('generate_prompts', { context: compactedContext });
    if (!result) return null;
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (_) {
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
    const compactedContext = compactMarkdown(context);
    const result = await withCircuitBreaker(callBackendApi)('explain_selection', { selection, context: compactedContext });
    if (!result) return "ไม่มีคำอธิบายจากส่วนนี้";
    try {
      const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const explanation = parsed.explanation || result;
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ AI อธิบายประโยคนี้: "${selection.substring(0, 50)}..."`);
      return explanation;
    } catch (_) {
      recordAiMemory('system', `ผู้ใช้เพิ่งให้อธิบายคำว่า: "${selection.substring(0, 20)}..."`);
      return result;
    }
  } catch (error) {
    console.error('explainSelection error:', error);
    return error.message?.includes('temporarily paused')
      ? error.message
      : "ขออภัย ไม่สามารถดึงข้อมูลอธิบายได้";
  }
}


export async function reviewCode(code, language, onChunk) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;
  try {
    const trimmedCode = code.substring(0, 3000);

    if (onChunk) {
      const resultText = await withCircuitBreaker(callBackendApiStreaming)(
        'review_code',
        { code: trimmedCode, language },
        onChunk
      );
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ระบบช่วย Review โค้ดภาษา ${language}`);
      return { explanation: resultText };
    } else {
      const result = await withCircuitBreaker(callBackendApi)('review_code', { code: trimmedCode, language });
      let parsed;
      try {
        const cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (_) {
        parsed = { explanation: result };
      }
      recordAiMemory('system', `ผู้ใช้เพิ่งกดให้ระบบช่วย Review โค้ดภาษา ${language}`);
      return parsed;
    }
  } catch (error) {
    console.error('reviewCode error:', error);
    return null;
  }
}
