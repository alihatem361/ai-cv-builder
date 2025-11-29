import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONFIG } from "../../config/config.js";

// Initialize the Gemini client
let genAI = null;
let model = null;

/**
 * Initialize the Gemini AI client
 */
export function initializeGemini() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: CONFIG.GEMINI_MODEL,
      generationConfig: {
        temperature: CONFIG.AI_SETTINGS.TEMPERATURE,
        maxOutputTokens: CONFIG.AI_SETTINGS.MAX_OUTPUT_TOKENS,
      },
    });
  }
  return model;
}

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} The generated response
 */
export async function generateContent(prompt) {
  const aiModel = initializeGemini();

  try {
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (error.message?.includes("API_KEY")) {
      throw new Error(
        "Invalid API key. Please check your GEMINI_API_KEY in .env file"
      );
    }
    if (error.message?.includes("quota")) {
      throw new Error(
        "API quota exceeded. Please check your Google AI Studio quota."
      );
    }
    throw error;
  }
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

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Try to find JSON object in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(
          "Failed to parse AI response as JSON. Response may be malformed."
        );
      }
    }
    throw new Error("No valid JSON found in AI response.");
  }
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
