/**
 * AI Service Integration
 * Acts as the bridge between the Frontend Components and the Secure Vercel Serverless Function.
 */
import { FEATURES } from '../config/features.js';

export async function summarizeContent(content) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;

  try {
    // Calling our serverless backend (api/ai.js)
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
