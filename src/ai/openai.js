import OpenAI from "openai";
import { CONFIG } from "../../config/config.js";

let openai = null;

export function initializeOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
  }
  return openai;
}

export async function generateContent(prompt) {
  const client = initializeOpenAI();
  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs JSON only.",
        },
        { role: "user", content: prompt },
      ],
      model: CONFIG.OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: CONFIG.AI_SETTINGS.TEMPERATURE,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`OpenAI API Failed: ${error.message}`);
  }
}

export function parseAIResponse(response) {
  try {
    return JSON.parse(response);
  } catch (error) {
    const jsonString = response.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(jsonString);
  }
}

export async function generateCustomizedCV(prompt) {
  console.log("🤖 Sending request to OpenAI (GPT-4o)...");
  const response = await generateContent(prompt);
  console.log("📝 Parsing AI response...");
  const parsed = parseAIResponse(response);

  const requiredFields = [
    "companyName",
    "jobPosition",
    "customizedCV",
    "coverLetter",
    "coverLetterArabic",
  ];
  for (const field of requiredFields) {
    if (!parsed[field])
      throw new Error(`AI response missing required field: ${field}`);
  }
  return parsed;
}
