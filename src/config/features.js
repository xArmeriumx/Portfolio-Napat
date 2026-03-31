/**
 * Feature Flags Configuration
 * A central place to instantly toggle features on or off in the frontend.
 * If you ever want to completely block the AI tools without breaking the website,
 * simply change ENABLE_AI_ASSISTANT to false.
 */
export const FEATURES = {
  // ✅ Switch to false to instantly hide all AI summarize & search UI.
  ENABLE_AI_ASSISTANT: true, 
};

export default FEATURES;
