import { FAQ } from "@/types";
import faqsData from "@/data/faqs.json";

export interface MatchFaqsParams {
  query: string;
  category?: string;
  limit?: number;
}

export interface MatchFaqResult {
  matches: FAQ[];
  score: number;
}

/**
 * Retrieves matching FAQs based on user query and optional category filter.
 * Stage 1 typed stub. Stage 2 will introduce semantic / BM25 keyword ranking.
 */
export async function retrieveRelevantFaqs(
  params: MatchFaqsParams
): Promise<MatchFaqResult> {
  const { query, category, limit = 3 } = params;
  const normalizedQuery = query.toLowerCase().trim();

  let filtered = (faqsData as FAQ[]).filter((faq) => {
    if (category && faq.category !== category) {
      return false;
    }
    return true;
  });

  if (normalizedQuery) {
    filtered = filtered.filter(
      (faq) =>
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.keywords.some((kw) => normalizedQuery.includes(kw.toLowerCase()))
    );
  }

  const results = filtered.slice(0, limit);

  return {
    matches: results,
    score: results.length > 0 ? 1.0 : 0.0,
  };
}
