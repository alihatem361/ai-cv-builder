import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CONFIG } from "../../config/config.js";

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    companyName: {
      type: SchemaType.STRING,
      description: "The company name extracted from job description",
    },
    jobPosition: {
      type: SchemaType.STRING,
      description: "The job title/position extracted from job description",
    },
    customizedCV: {
      type: SchemaType.STRING,
      description:
        "The complete HTML of the customized CV with preserved Tailwind CSS classes",
    },
    coverLetter: {
      type: SchemaType.STRING,
      description: "The complete cover letter text in English",
    },
    coverLetterArabic: {
      type: SchemaType.STRING,
      description: "The complete cover letter text in Arabic",
    },
  },
  required: [
    "companyName",
    "jobPosition",
    "customizedCV",
    "coverLetter",
    "coverLetterArabic",
  ],
};

// Initialize the Gemini client
let genAI = null;

let discoveredModelCandidatesCache = null;

function asString(value) {
  return typeof value === "string" ? value : String(value ?? "");
}

function isModelNotFoundError(error) {
  const message = asString(error?.message);
  return (
    message.includes("404") ||
    message.includes("Not Found") ||
    message.includes("is not found for API version") ||
    message.toLowerCase().includes("not supported for generatecontent")
  );
}

function isQuotaError(error) {
  const message = asString(error?.message).toLowerCase();
  return message.includes("quota") || message.includes("resource exhausted");
}

function isInvalidApiKeyError(error) {
  const message = asString(error?.message).toLowerCase();
  return (
    message.includes("api_key") ||
    message.includes("api key") ||
    message.includes("permission_denied") ||
    message.includes("unauthorized") ||
    message.includes("403")
  );
}

function isUnsupportedResponseMimeTypeError(error) {
  const message = asString(error?.message).toLowerCase();
  return (
    message.includes("responsemimetype") ||
    message.includes("response_mime_type") ||
    message.includes("mime type")
  );
}

function isMaxOutputTokensError(error) {
  const message = asString(error?.message).toLowerCase();
  return (
    message.includes("maxoutputtokens") ||
    message.includes("max output tokens") ||
    message.includes("max_output_tokens")
  );
}

function normalizeModelName(modelName) {
  return asString(modelName)
    .replace(/^models\//, "")
    .trim();
}

function parseGeminiVersionParts(modelName) {
  const normalized = normalizeModelName(modelName).toLowerCase();
  const match = normalized.match(/gemini-(\d+(?:\.\d+)*)(?:-|$)/);
  if (!match) return [0, 0, 0];
  const parts = match[1]
    .split(".")
    .map((p) => Number.parseInt(p, 10))
    .filter((n) => Number.isFinite(n));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function scoreModelForTextGeneration(model) {
  const shortName = normalizeModelName(model?.name);
  const lower = shortName.toLowerCase();

  // Must be a Gemini text generation model
  if (!lower.includes("gemini")) return -1;
  if (lower.includes("embedding")) return -1;

  // Prefer fast/cheap text models
  let score = 0;
  if (lower.includes("flash")) score += 2000;
  if (lower.includes("pro")) score += 1500;
  if (lower.includes("lite")) score -= 50;
  if (lower.includes("experimental") || lower.includes("exp")) score -= 200;
  if (lower.includes("latest")) score += 25;

  const [major, minor, patch] = parseGeminiVersionParts(shortName);
  score += major * 100 + minor * 10 + patch;

  return score;
}

async function listModelsViaRest({ apiKey, apiVersion }) {
  const url = new URL(
    `https://generativelanguage.googleapis.com/${apiVersion}/models`,
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("pageSize", "100");

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `ListModels failed (${apiVersion}): ${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 200)}` : ""}`,
    );
  }

  const data = await response.json();
  return Array.isArray(data?.models) ? data.models : [];
}

async function discoverModelCandidates(apiKey) {
  if (!globalThis.fetch) {
    throw new Error(
      "Model auto-discovery requires Node.js 18+ (global fetch is missing).",
    );
  }

  const apiVersionsToTry = ["v1beta", "v1"];
  let lastError = null;

  for (const apiVersion of apiVersionsToTry) {
    try {
      const models = await listModelsViaRest({ apiKey, apiVersion });

      const candidates = models
        .filter((m) => {
          const supported = m?.supportedGenerationMethods;
          if (Array.isArray(supported) && supported.length > 0) {
            return supported.includes("generateContent");
          }
          // Fallback: if API doesn't return supported methods, at least keep gemini-* (non-embedding)
          const name = normalizeModelName(m?.name).toLowerCase();
          return name.includes("gemini") && !name.includes("embedding");
        })
        .sort(
          (a, b) =>
            scoreModelForTextGeneration(b) - scoreModelForTextGeneration(a),
        )
        .map((m) => normalizeModelName(m?.name))
        .filter(Boolean);

      // Deduplicate while keeping order
      const unique = [];
      const seen = new Set();
      for (const name of candidates) {
        if (seen.has(name)) continue;
        seen.add(name);
        unique.push(name);
      }

      return unique;
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Failed to discover available Gemini models.");
}

async function getDiscoveredModelCandidates() {
  if (discoveredModelCandidatesCache) return discoveredModelCandidatesCache;
  discoveredModelCandidatesCache = await discoverModelCandidates(
    CONFIG.GEMINI_API_KEY,
  );
  return discoveredModelCandidatesCache;
}

async function generateWithModel({ client, modelName, prompt }) {
  const baseGenerationConfig = {
    temperature: CONFIG.AI_SETTINGS.TEMPERATURE,
    maxOutputTokens: CONFIG.AI_SETTINGS.MAX_OUTPUT_TOKENS,
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  };

  const runOnce = async (generationConfig) => {
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  try {
    return await runOnce(baseGenerationConfig);
  } catch (error) {
    // If model itself doesn't exist, don't waste calls retrying config variants
    if (isModelNotFoundError(error)) throw error;

    let lastError = error;
    const triedConfigs = [];

    if (isUnsupportedResponseMimeTypeError(error)) {
      const cfg = { ...baseGenerationConfig };
      delete cfg.responseMimeType;
      triedConfigs.push(cfg);
    }

    if (isMaxOutputTokensError(error)) {
      const reduced = {
        ...baseGenerationConfig,
        maxOutputTokens: Math.min(baseGenerationConfig.maxOutputTokens, 8192),
      };
      triedConfigs.push(reduced);
      if (reduced.responseMimeType) {
        const reducedNoMime = { ...reduced };
        delete reducedNoMime.responseMimeType;
        triedConfigs.push(reducedNoMime);
      }
    }

    for (const cfg of triedConfigs) {
      try {
        return await runOnce(cfg);
      } catch (e) {
        lastError = e;
        if (isModelNotFoundError(e)) break;
      }
    }

    throw lastError;
  }
}

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

  const triedModels = new Set();
  const errors = [];

  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`   🤖 Trying model: ${modelName}...`);

      triedModels.add(modelName);
      const text = await generateWithModel({ client, modelName, prompt });

      if (text) {
        console.log(`   ✅ Success with model: ${modelName}`);
        return text;
      }
    } catch (error) {
      console.warn(
        `   ⚠️ Failed with ${modelName}: ${error.message?.slice(0, 100)}...`,
      );
      lastError = error;
      errors.push({ modelName, error });

      if (isInvalidApiKeyError(error)) {
        throw new Error(
          "Invalid API key. Please check your GEMINI_API_KEY in .env file",
        );
      }

      continue;
    }
  }

  // If model names are outdated, auto-discover models available to this API key.
  const hasModelNotFound = errors.some((e) => isModelNotFoundError(e.error));
  if (hasModelNotFound) {
    try {
      console.log("   🔎 Auto-discovering available Gemini models...");
      const discoveredCandidates = await getDiscoveredModelCandidates();

      for (const discoveredModel of discoveredCandidates.slice(0, 8)) {
        if (!discoveredModel || triedModels.has(discoveredModel)) continue;

        try {
          console.log(`   🤖 Trying discovered model: ${discoveredModel}...`);
          triedModels.add(discoveredModel);
          const text = await generateWithModel({
            client,
            modelName: discoveredModel,
            prompt,
          });

          if (text) {
            console.log(
              `   ✅ Success with discovered model: ${discoveredModel}`,
            );
            return text;
          }
        } catch (e) {
          lastError = e;
          console.warn(
            `   ⚠️ Failed with discovered ${discoveredModel}: ${e.message?.slice(0, 100)}...`,
          );

          if (isInvalidApiKeyError(e)) {
            throw new Error(
              "Invalid API key. Please check your GEMINI_API_KEY in .env file",
            );
          }

          if (isQuotaError(e)) break;
        }
      }
    } catch (e) {
      // If discovery fails, keep original lastError (the real generation failure)
      console.warn(`   ⚠️ Model discovery failed: ${e.message}`);
    }
  }

  console.error("❌ All models failed to generate content.");
  if (isQuotaError(lastError)) {
    throw new Error("API quota exceeded on all models.");
  }

  throw lastError || new Error("All fallback models failed.");
}

// ... (باقي دوال parseAIResponse و generateCustomizedCV زي ما هي)
/**
 * Parse JSON response from AI
 */
export function parseAIResponse(response) {
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error("Failed to parse AI response as JSON: " + e.message);
  }
}

export async function generateCustomizedCV(prompt) {
  console.log("🤖 Sending request to Gemini AI...");
  const response = await generateContent(prompt);
  console.log("📝 Parsing AI response...");
  const parsed = parseAIResponse(response);
  return parsed;
}
