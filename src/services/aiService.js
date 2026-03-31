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

export async function askAiContext(query, context) {
  if (!FEATURES.ENABLE_AI_ASSISTANT) return null;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'search_rag', 
        payload: { query, context } 
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI Server Processing Error');
    
    try {
      const cleanJson = data.result.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { answer: parsed.answer || data.result, quote: parsed.quote || null };
    } catch (e) {
      return { answer: data.result, quote: null };
    }
  } catch (error) {
    console.error("[aiService] RAG Error:", error);
    throw error;
  }
}
