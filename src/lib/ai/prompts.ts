import { FAQ } from "@/types";

export const SYSTEM_PROMPT = `You are the helpful, friendly Campus FAQ Assistant for college students.
Your job is to answer student questions accurately, politely, and strictly grounded in the provided FAQ context.
Rules:
1. ONLY answer based on the provided FAQ context.
2. If the FAQ context does not contain enough information to answer the question, clearly state that and guide the student to the relevant campus office.
3. Never make up deadlines, timings, locations, or regulations not present in the context.
4. Keep answers concise, clear, and easy to read.`;

export interface FormatContextParams {
  faqs: FAQ[];
}

/**
 * Builds the context string for LLM prompting from matched FAQs.
 */
export function buildFaqPromptContext({ faqs }: FormatContextParams): string {
  if (!faqs || faqs.length === 0) {
    return "No relevant FAQ context found.";
  }

  return faqs
    .map(
      (faq, index) =>
        `[FAQ ${index + 1} | Category: ${faq.category}]\nQ: ${faq.question}\nA: ${faq.answer}`
    )
    .join("\n\n");
}
