import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/config/env";

let aiClientInstance: GoogleGenAI | null = null;

/**
 * Initializes and returns the singleton Google GenAI client.
 * Server-side only: API key is never sent to the client.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!aiClientInstance) {
    const env = getEnv();
    aiClientInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiClientInstance;
}

export interface GenerateGroundedAnswerParams {
  query: string;
  contextFaqs: Array<{ question: string; answer: string }>;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface GroundedAnswerResult {
  reply: string;
  sources: string[];
}

/**
 * Typed stub for Stage 2 Gemini RAG generation.
 */
export async function generateGroundedAnswer(
  _params: GenerateGroundedAnswerParams
): Promise<GroundedAnswerResult> {
  // Stage 1 stub implementation
  return {
    reply: "This is a placeholder response from the Campus FAQ Assistant. Full LLM integration arrives in Stage 2.",
    sources: [],
  };
}
