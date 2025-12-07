import { config } from "dotenv";

// Load environment variables
config();

export const CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: "gpt-4o", // Using GPT-4o

  // File Paths
  PATHS: {
    MASTER_CV: "./input/master_cv.html",
    JOB_DESCRIPTION: "./input/job_description.txt",
    OUTPUT_DIR: "./output",
  },

  // Personal info
  USER: {
    FULL_NAME: "Ali Hatem Ramadan",
  },

  // AI Settings
  AI_SETTINGS: {
    TEMPERATURE: 0.7,
  },
};

// Validate required configuration
export function validateConfig() {
  if (!CONFIG.OPENAI_API_KEY) {
    console.error("❌ Error: Please set your OPENAI_API_KEY in the .env file");
    process.exit(1);
  }
  return true;
}
