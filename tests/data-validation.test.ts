import { describe, it, expect } from "vitest";
import categoriesData from "@/data/categories.json";
import faqsData from "@/data/faqs.json";
import { CategorySchema, FAQSchema } from "@/lib/validation/schemas";

describe("Seed Data Validation", () => {
  it("should validate all categories against CategorySchema", () => {
    expect(Array.isArray(categoriesData)).toBe(true);
    expect(categoriesData.length).toBeGreaterThanOrEqual(6);

    for (const category of categoriesData) {
      const result = CategorySchema.safeParse(category);
      expect(result.success, `Invalid category: ${JSON.stringify(category)}`).toBe(true);
    }
  });

  it("should validate all FAQs against FAQSchema and verify category existence", () => {
    expect(Array.isArray(faqsData)).toBe(true);
    expect(faqsData.length).toBeGreaterThanOrEqual(18);

    const validCategoryIds = new Set(categoriesData.map((c) => c.id));

    // Ensure we have at least 3 FAQs per category
    const categoryCounts: Record<string, number> = {};

    for (const faq of faqsData) {
      const result = FAQSchema.safeParse(faq);
      expect(
        result.success,
        `FAQ validation failed for id=${faq.id}: ${!result.success ? JSON.stringify(result.error.issues) : ""}`
      ).toBe(true);

      // Verify category exists in categories.json
      expect(
        validCategoryIds.has(faq.category),
        `FAQ ${faq.id} references non-existent category: "${faq.category}"`
      ).toBe(true);

      categoryCounts[faq.category] = (categoryCounts[faq.category] || 0) + 1;

      // Verify keywords length between 4 and 6
      expect(faq.keywords.length).toBeGreaterThanOrEqual(4);
      expect(faq.keywords.length).toBeLessThanOrEqual(6);
    }

    // Every category must have at least 3 FAQs
    for (const cat of categoriesData) {
      expect(
        categoryCounts[cat.id],
        `Category "${cat.id}" has fewer than 3 FAQs (found ${categoryCounts[cat.id] || 0})`
      ).toBeGreaterThanOrEqual(3);
    }
  });
});
