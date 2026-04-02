/**
 * Feature Flags Configuration (Enhanced with Claude Code Patterns)
 * 
 * Patterns applied from Sheet/:
 *  - Latched State at session start (Part 4 Philosophy 1)
 *  - Multi-level override: URL param → env var → default (Part 4 Philosophy 3)
 * 
 * Override via URL: ?feature_AI=false to disable AI for testing
 */

// Multi-level feature flag resolution (Sheet Part 4 §3)
// Priority: URL param > Environment variable > Default
function getFeature(name, defaultValue) {
  // Level 1: URL param override (for testing/debugging)
  if (typeof window !== 'undefined') {
    const urlParam = new URLSearchParams(window.location.search).get(`feature_${name}`);
    if (urlParam !== null) return urlParam === 'true';
  }

  // Level 2: Build-time environment variable
  const envKey = `VITE_ENABLE_${name}`;
  const envVal = import.meta.env?.[envKey];
  if (envVal !== undefined) return envVal === 'true';

  // Level 3: Hardcoded default (ultimate fallback)
  return defaultValue;
}

// Latched (Sheet Part 4 §1): ค่าถูก freeze ตอน app start ไม่เปลี่ยนกลาง session
// ✅ Switch via URL: ?feature_AI=false to instantly disable AI for testing
// ✅ Switch via env: VITE_ENABLE_AI=false in .env to disable at build time
export const FEATURES = Object.freeze({
  ENABLE_AI_ASSISTANT: getFeature('AI', true),
});

export default FEATURES;
