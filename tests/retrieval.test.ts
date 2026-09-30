import { describe, it, expect } from "vitest";
import { searchFaqs, scoreFaq, normalizeText } from "@/lib/retrieval/matcher";
import { FAQ } from "@/types";

describe("FAQ Retrieval & Ranking (searchFaqs)", () => {
  it("should rank the most relevant FAQ highest based on keywords and token overlap", () => {
    const results = searchFaqs("Where is the Central Library located and borrowing limits?");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("lib-001");
    expect(results[0].category).toBe("library");
  });

  it("should apply category boost to prioritize category-specific queries", () => {
    const resultsWithCategory = searchFaqs("How do I start a new student club?", {
      category: "clubs-societies",
    });
    expect(resultsWithCategory.length).toBeGreaterThan(0);
    expect(resultsWithCategory[0].id).toBe("club-003");
    expect(resultsWithCategory[0].category).toBe("clubs-societies");
  });

  it("should return an empty array for completely unrelated queries below minScore threshold", () => {
    const unrelatedQuery = "how to bake sourdough bread with olive oil in oven";
    const results = searchFaqs(unrelatedQuery, { minScore: 15 });
    expect(results).toEqual([]);
  });

  it("should correctly calculate text normalization and score metrics", () => {
    const rawText = "  What's the ATTENDANCE Policy in 2026?!!  ";
    const normalized = normalizeText(rawText);
    expect(normalized).toBe("what s the attendance policy in 2026");

    const sampleFaq: FAQ = {
      id: "acad-001",
      category: "academics",
      question: "What is the minimum attendance requirement to appear for semester end exams?",
      answer: "Students must maintain a minimum of 75% attendance in each registered course.",
      keywords: ["attendance", "minimum criteria", "semester exams"],
      updatedAt: "2026-09-01T10:00:00Z",
    };

    const tokens = normalized.split(" ").filter((t) => t.length > 2);
    const score = scoreFaq(sampleFaq, normalized, tokens);
    expect(score).toBeGreaterThan(30);
  });
});
