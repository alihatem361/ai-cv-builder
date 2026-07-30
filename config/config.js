import { config } from "dotenv";

// Load environment variables
config();

export const CONFIG = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // 🔥 التعديل هنا: قائمة الموديلات بالترتيب بدلاً من موديل واحد
  // الكود هيجرب الأول، ولو فشل يدخل على الثاني وهكذا
  GEMINI_MODELS_PRIORITY: [
    // Prefer stable aliases first (model names change over time)
    "gemini-2.5-flash", // ❌
    "gemini-3.5-flash", // ❌
    "gemini-3.1-flash-lite", // ❌
    "gemini-2.5-flash-lite", // ✅
    "gemini-2.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-pro", // legacy fallback (some keys only have older models)

    // روابط الأسماء العامة الثابتة (شاملة الـ Thinking)
    "gemini-flash-latest", // ❌
    "gemini-pro-latest", // ❌
    "gemini-flash-lite-latest", // 🥲

    // نماذج الجيل 2.5 المستقرة والقوية جداً في الصياغة والتحليل
    "gemini-2.5-pro", // ❌

    // النماذج الخفيفة والسريعة كحلول بديلة مضمونة (Fallbacks)
    "gemini-3.1-flash-lite-preview", // ❌
    "gemini-2.0-flash-lite", // ❌
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
