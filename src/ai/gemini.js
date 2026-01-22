import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONFIG } from "../../config/config.js"; //

// Initialize the Gemini client
let genAI = null;

/**
 * Initialize the Gemini AI client instance
 */
export function getGeminiClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Generate content using Gemini AI with Fallback mechanism
 */
export async function generateContent(prompt) {
  const client = getGeminiClient();

  // 🔥 هنا بناخد القائمة من ملف الإعدادات مباشرة
  const models = CONFIG.GEMINI_MODELS_PRIORITY;

  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`   🤖 Trying model: ${modelName}...`);

      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: CONFIG.AI_SETTINGS.TEMPERATURE,
          maxOutputTokens: CONFIG.AI_SETTINGS.MAX_OUTPUT_TOKENS,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`   ✅ Success with model: ${modelName}`);
        return text;
      }
    } catch (error) {
      console.warn(
        `   ⚠️ Failed with ${modelName}: ${error.message?.slice(0, 100)}...`,
      );
      lastError = error;

      if (error.message?.includes("API_KEY")) {
        throw new Error(
          "Invalid API key. Please check your GEMINI_API_KEY in .env file",
        );
      }

      continue;
    }
  }

  console.error("❌ All models failed to generate content.");
  if (lastError?.message?.includes("quota")) {
    throw new Error("API quota exceeded on all models.");
  }

  throw lastError || new Error("All fallback models failed.");
}

// ... (باقي دوال parseAIResponse و generateCustomizedCV زي ما هي)
/**
 * Parse JSON response from AI
 */
export function parseAIResponse(response) {
  let jsonString = response.trim();
  if (jsonString.startsWith("```json")) jsonString = jsonString.slice(7);
  else if (jsonString.startsWith("```")) jsonString = jsonString.slice(3);
  if (jsonString.endsWith("```")) jsonString = jsonString.slice(0, -3);
  jsonString = jsonString.trim();

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    // ... (باقي كود الـ Parsing المعقد اللي كتبناه قبل كده)
    // عشان نوفر مساحة، استخدم نفس دالة parseAIResponse القديمة هنا
    // فهي ممتازة ولا تحتاج تغيير.
    const startIndex = response.indexOf("{");
    if (startIndex !== -1) {
      const lastBrace = response.lastIndexOf("}");
      if (lastBrace > startIndex) {
        try {
          return JSON.parse(response.substring(startIndex, lastBrace + 1));
        } catch (e) {}
      }
    }
    throw new Error("Failed to parse AI response as JSON.");
  }
}

export async function generateCustomizedCV(prompt) {
  console.log("🤖 Sending request to Gemini AI...");
  const response = await generateContent(prompt);
  console.log("📝 Parsing AI response...");
  const parsed = parseAIResponse(response);
  return parsed;
}
