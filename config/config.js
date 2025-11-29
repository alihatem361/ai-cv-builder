import { config } from "dotenv";

// Load environment variables
config();

export const CONFIG = {
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: "gemini-2.0-flash",

  // File Paths
  PATHS: {
    MASTER_CV: "./input/master_cv.html",
    JOB_DESCRIPTION: "./input/job_description.txt",
    OUTPUT_DIR: "./output",
  },

  // Your personal info (used for file naming)
  USER: {
    FULL_NAME: "Ali Hatem Ramadan", // ← اكتب اسمك هنا
  },

  // AI Generation Settings
  AI_SETTINGS: {
    TEMPERATURE: 0.7,
    MAX_OUTPUT_TOKENS: 8192,
  },
};

// Validate required configuration
export function validateConfig() {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "your_api_key_here") {
    console.error("❌ Error: Please set your GEMINI_API_KEY in the .env file");
    console.log(
      "   Get your API key from: https://makersuite.google.com/app/apikey"
    );
    process.exit(1);
  }
  return true;
}
