import { FAQ } from "@/types";
import faqsData from "@/data/faqs.json";

export interface SearchFaqsOptions {
  category?: string;
  limit?: number;
  minScore?: number;
}

export interface ScoredFaq {
  faq: FAQ;
  score: number;
}

export const DEFAULT_MIN_SCORE = 15;

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "in",
  "of",
  "for",
  "how",
  "can",
  "i",
  "do",
  "does",
  "where",
  "when",
  "which",
  "who",
  "what",
  "with",
  "at",
  "by",
  "from",
  "on",
  "it",
  "is",
  "are",
  "was",
  "were",
  "this",
  "that",
  "my",
  "your",
  "we",
  "be",
  "as",
  "if",
  "not",
  "have",
  "has",
]);

/**
 * Normalizes text for consistent tokenization and matching.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts non-stopword tokens from text.
 */
export function getMeaningfulTokens(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Calculates a relevance score for a given FAQ against a query and its meaningful tokens.
 */
export function scoreFaq(
  faq: FAQ,
  normalizedQuery: string,
  queryMeaningfulTokens: string[],
  categoryFilter?: string
): number {
  if (!normalizedQuery) return 0;

  let score = 0;
  const normQuestion = normalizeText(faq.question);
  const normAnswer = normalizeText(faq.answer);
  const normKeywords = faq.keywords.map((k) => normalizeText(k));
  const questionTokens = new Set(normQuestion.split(" "));
  const answerTokens = new Set(normAnswer.split(" "));

  // 1. Exact query phrase match in question (+100)
  if (normQuestion.includes(normalizedQuery)) {
    score += 100;
  }

  // 2. Category Filter / Boost
  const matchesCategory =
    Boolean(categoryFilter) &&
    faq.category.toLowerCase() === categoryFilter?.toLowerCase();
  if (matchesCategory) {
    score += 40;
  }

  // 3. Keyword matches
  for (const kw of normKeywords) {
    if (normalizedQuery.includes(kw)) {
      score += 40;
    } else {
      const kwTokens = kw.split(" ").filter((t) => !STOP_WORDS.has(t));
      const matchedKwTokens = kwTokens.filter((t) =>
        queryMeaningfulTokens.includes(t)
      );
      if (matchedKwTokens.length > 0) {
        score += matchedKwTokens.length * 15;
      }
    }
  }

  // 4. Token Overlap
  for (const token of queryMeaningfulTokens) {
    if (questionTokens.has(token)) {
      score += 15;
    } else if (normQuestion.includes(token)) {
      score += 8;
    }

    if (answerTokens.has(token)) {
      score += 4;
    } else if (normAnswer.includes(token)) {
      score += 2;
    }
  }

  // If no content tokens or keywords matched at all, do not award category boost in isolation
  if (score === (matchesCategory ? 40 : 0)) {
    return 0;
  }

  return score;
}

/**
 * Searches FAQs using weighted keywords, token overlap, category boost, and minimum score threshold.
 */
export function searchFaqs(
  query: string,
  options: SearchFaqsOptions = {}
): FAQ[] {
  const { category, limit = 3, minScore = DEFAULT_MIN_SCORE } = options;
  const normalizedQuery = normalizeText(query);
  const queryTokens = getMeaningfulTokens(query);

  if (!normalizedQuery || queryTokens.length === 0) {
    return [];
  }

  const allFaqs = faqsData as FAQ[];
  const scoredList: ScoredFaq[] = allFaqs
    .map((faq) => ({
      faq,
      score: scoreFaq(faq, normalizedQuery, queryTokens, category),
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return scoredList.slice(0, limit).map((item) => item.faq);
}
