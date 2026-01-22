import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONFIG } from "../../config/config.js";

// قائمة الموديلات بالترتيب - لو الأول فشل يدخل على الثاني وهكذا
// تم اختيار هذه الموديلات بناءً على القائمة التي أرسلتها (نصوص سريعة)
const MODELS_PRIORITY = [
  CONFIG.GEMINI_MODEL, // الموديل الأساسي من الإعدادات
  "gemini-2.5-flash", // الخيار الثاني: فلاش القياسي (سريع وقوي)
  "gemini-2.5-flash-lite", // الخيار الثالث: النسخة الأخف
  "gemini-3-flash", // الخيار الرابع: الجيل الجديد
];

// Initialize the Gemini client
let genAI = null;

/**
 * Initialize the Gemini AI client instance
 * @returns {GoogleGenerativeAI} The initialized client
 */
export function getGeminiClient() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Generate content using Gemini AI with Fallback mechanism
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} The generated response
 */
export async function generateContent(prompt) {
  const client = getGeminiClient();

  // إزالة التكرار من قائمة الموديلات (في حالة كان الموديل الأساسي موجود مرتين)
  const uniqueModels = [...new Set(MODELS_PRIORITY)];

  let lastError = null;

  // المحاولة مع كل موديل بالترتيب
  for (const modelName of uniqueModels) {
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

      // لو الخطأ بسبب مفتاح API غير صحيح، مفيش فايدة نجرب باقي الموديلات
      if (error.message?.includes("API_KEY")) {
        throw new Error(
          "Invalid API key. Please check your GEMINI_API_KEY in .env file",
        );
      }

      // استمر للموديل التالي...
      continue;
    }
  }

  // لو وصلنا هنا يبقى كل الموديلات فشلت
  console.error("❌ All models failed to generate content.");
  if (lastError?.message?.includes("quota")) {
    throw new Error(
      "API quota exceeded on all models. Please check your Google AI Studio quota.",
    );
  }

  throw lastError || new Error("All fallback models failed.");
}

/**
 * Parse JSON response from AI, handling potential formatting issues
 * @param {string} response - The AI response string
 * @returns {Object} Parsed JSON object
 */
export function parseAIResponse(response) {
  // Try to extract JSON from the response
  let jsonString = response.trim();

  // Remove markdown code blocks if present
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }

  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }

  jsonString = jsonString.trim();

  // First attempt: direct parse
  try {
    return JSON.parse(jsonString);
  } catch (firstError) {
    console.log("⚠️ Direct JSON parse failed, trying extraction methods...");
  }

  // Second attempt: find JSON by looking for opening brace and parse from there
  const startIndex = response.indexOf("{");
  if (startIndex !== -1) {
    // Try parsing from the start brace to the end
    const possibleJson = response.substring(startIndex).trim();
    try {
      return JSON.parse(possibleJson);
    } catch (e) {
      // Continue to next method
    }

    // Third attempt: find the last closing brace and try that range
    const lastBrace = response.lastIndexOf("}");
    if (lastBrace > startIndex) {
      const extractedJson = response.substring(startIndex, lastBrace + 1);
      try {
        return JSON.parse(extractedJson);
      } catch (e) {
        // Continue to next method
      }
    }

    // Fourth attempt: proper brace counting that respects strings
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIndex = -1;

    for (let i = startIndex; i < response.length; i++) {
      const char = response[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") braceCount++;
        else if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }

    if (endIndex !== -1) {
      const extractedJson = response.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(extractedJson);
      } catch (parseError) {
        console.error("❌ JSON parsing failed after extraction.");
        console.error("Parse error:", parseError.message);
        console.error("First 500 chars:", extractedJson.substring(0, 500));
        console.error(
          "Last 500 chars:",
          extractedJson.substring(extractedJson.length - 500),
        );
        throw new Error(
          "Failed to parse AI response as JSON. Response may be malformed.",
        );
      }
    }
  }

  // Log the response for debugging when no JSON is found
  console.error("❌ No JSON object found in response. Response preview:");
  console.error("Length:", response.length);
  console.error("First 1000 chars:", response.substring(0, 1000));
  console.error("Last 1000 chars:", response.substring(response.length - 1000));
  throw new Error("No valid JSON found in AI response.");
}

/**
 * Generate customized CV and cover letter
 * @param {string} prompt - The complete prompt with CV and job description
 * @returns {Promise<Object>} Object containing companyName, jobPosition, customizedCV, coverLetter
 */
export async function generateCustomizedCV(prompt) {
  console.log("🤖 Sending request to Gemini AI...");

  const response = await generateContent(prompt);

  console.log("📝 Parsing AI response...");
  const parsed = parseAIResponse(response);

  // Validate the response has all required fields
  const requiredFields = [
    "companyName",
    "jobPosition",
    "customizedCV",
    "coverLetter",
    "coverLetterArabic",
  ];
  for (const field of requiredFields) {
    if (!parsed[field]) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }

  return parsed;
}
