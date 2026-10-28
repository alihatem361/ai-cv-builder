import { config } from "dotenv";

// Load environment variables
config();

export const CONFIG = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // 🔥 التعديل هنا: قائمة الموديلات بالترتيب بدلاً من موديل واحد
  // الكود هيجرب الأول، ولو فشل يدخل على الثاني وهكذا
  // Prefer currently documented stable models, with a short fallback chain.
  // Keep this list short: sequential 404s on retired model IDs add avoidable delay.
  GEMINI_MODELS_PRIORITY: [
    "gemini-3.5-flash-lite", // Fast, cost-efficient default for routine generation
    "gemini-3.8-flash",      // Higher-capability fallback
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite", // Legacy fallback for keys with existing access
    "gemini-2.5-flash",
  ],
  // File Paths
  PATHS: {
    MASTER_CV: "./input/master_cv.html",
    JOB_DESCRIPTION: "./input/job_description.txt",
    OUTPUT_DIR: "./output",
  },

  // Your personal info
  USER: {
    FULL_NAME: "Ali Hatem Ramadan",
  },

  // AI Generation Settings
  AI_SETTINGS: {
    TEMPERATURE: 0.5,
    MAX_OUTPUT_TOKENS: 32768,
  },
};

export function validateConfig() {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "your_api_key_here") {
    console.error("❌ Error: Please set your GEMINI_API_KEY in the .env file");
    process.exit(1);
  }
  return true;
}
