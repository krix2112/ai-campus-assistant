import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/config/env";
import { FAQ, ChatMessage } from "@/types";
import { buildSystemInstruction } from "./prompts";

export type AiErrorKind = "auth" | "model_not_found" | "quota" | "timeout" | "other";

export function classifyAiError(err: unknown): { errorKind: AiErrorKind; status: number } {
  const errMsg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (
    errMsg.includes("401") ||
    errMsg.includes("403") ||
    errMsg.includes("auth") ||
    errMsg.includes("unauthenticated") ||
    errMsg.includes("api key") ||
    errMsg.includes("permission")
  ) {
    return { errorKind: "auth", status: 401 };
  }

  if (
    errMsg.includes("404") ||
    errMsg.includes("not found") ||
    errMsg.includes("no longer available") ||
    errMsg.includes("not supported")
  ) {
    return { errorKind: "model_not_found", status: 404 };
  }

  if (
    errMsg.includes("429") ||
    errMsg.includes("503") ||
    errMsg.includes("quota") ||
    errMsg.includes("resource exhausted") ||
    errMsg.includes("high demand") ||
    errMsg.includes("unavailable")
  ) {
    return { errorKind: "quota", status: 429 };
  }

  if (errMsg.includes("time out") || errMsg.includes("timed out") || errMsg.includes("timeout")) {
    return { errorKind: "timeout", status: 504 };
  }

  return { errorKind: "other", status: 500 };
}

let aiClientInstance: GoogleGenAI | null = null;

/**
 * Initializes and returns the singleton Google GenAI client.
 * Server-side only: API key is never exposed to the client.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const env = getEnv();
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (
    !apiKey ||
    apiKey === "development-dummy-key" ||
    apiKey === "your_gemini_api_key_here" ||
    apiKey === "mock-key-stage-1"
  ) {
    return null;
  }
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
}

export interface GenerateGroundedAnswerParams {
  query: string;
  contextFaqs: FAQ[];
  history?: ChatMessage[];
}

export interface GroundedAnswerResult {
  reply: string;
  sources: string[];
  degraded?: boolean;
  ai: "gemini" | "fallback";
}

const NO_MATCH_FALLBACK =
  "I'm sorry, but I don't have verified information about that in the campus knowledge base. Please visit or contact the Campus Administrative Office or Student Helpdesk for assistance.";

/**
 * Wraps Gemini API call with an execution timeout.
 */
async function callGeminiWithTimeout(
  client: GoogleGenAI,
  model: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  timeoutMs = 15000
) {
  const callPromise = client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Gemini API request timed out"));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([callPromise, timeoutPromise]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Generates a grounded response using Gemini API with retry and automatic fallback.
 */
export async function generateGroundedAnswer(
  params: GenerateGroundedAnswerParams
): Promise<GroundedAnswerResult> {
  const { query, contextFaqs, history = [] } = params;
  const env = getEnv();
  const client = getGeminiClient();

  // If no Gemini API key is configured, fallback to top FAQ answer verbatim or default message
  if (!client) {
    if (contextFaqs.length > 0) {
      return {
        reply: contextFaqs[0].answer,
        sources: [contextFaqs[0].id],
        degraded: true,
        ai: "fallback",
      };
    }
    return {
      reply: NO_MATCH_FALLBACK,
      sources: [],
      degraded: true,
      ai: "fallback",
    };
  }

  // Build grounded prompt system instruction
  const systemInstruction = buildSystemInstruction({ relevantFaqs: contextFaqs });

  // Use the last 6 messages from conversation history
  const recentHistory = history.slice(-6);
  const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = recentHistory.map(
    (msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })
  );

  // Add the current user query turn
  formattedContents.push({
    role: "user",
    parts: [{ text: query }],
  });

  const modelName = env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  // Attempt generation with 1 retry on failure
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await callGeminiWithTimeout(
        client,
        modelName,
        formattedContents,
        systemInstruction,
        15000
      );

      const generatedText = response.text?.trim();
      if (generatedText) {
        return {
          reply: generatedText,
          sources: contextFaqs.map((f) => f.id),
          degraded: false,
          ai: "gemini",
        };
      }
    } catch (err) {
      lastError = err;
      const { errorKind, status } = classifyAiError(err);
      // Log upstream failure server-side (status and errorKind only)
      console.error(`[Gemini Attempt ${attempt} Failed]: status=${status}, errorKind=${errorKind}`);

      // Wait 300ms before retry if first attempt failed
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  // Both attempts failed: gracefully degrade to top FAQ answer or fallback message
  void lastError;
  if (contextFaqs.length > 0) {
    return {
      reply: contextFaqs[0].answer,
      sources: [contextFaqs[0].id],
      degraded: true,
      ai: "fallback",
    };
  }

  return {
    reply: NO_MATCH_FALLBACK,
    sources: [],
    degraded: true,
    ai: "fallback",
  };
}
