import { describe, it, expect } from "vitest";
import categories from "../src/data/categories.json";
import faqs from "../src/data/faqs.json";
import { CategorySchema, FAQSchema } from "../src/lib/validation";

describe("Seed Data Validation", () => {
  it("should validate all categories against CategorySchema", () => {
    expect(categories.length).toBeGreaterThanOrEqual(6);
    categories.forEach((cat) => {
      const result = CategorySchema.safeParse(cat);
      expect(result.success, `Category failed validation: ${JSON.stringify(cat)}`).toBe(true);
    });
  });

  it("should validate all FAQs against FAQSchema and ensure at least 18 FAQs exist", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(18);
    faqs.forEach((faq) => {
      const result = FAQSchema.safeParse(faq);
      expect(result.success, `FAQ failed validation: ${JSON.stringify(faq)}`).toBe(true);
    });
  });

  it("should ensure every FAQ category exists in categories.json", () => {
    const validCategoryIds = new Set(categories.map((c) => c.id));
    faqs.forEach((faq) => {
      expect(
        validCategoryIds.has(faq.category),
        `FAQ ${faq.id} references non-existent category "${faq.category}"`
      ).toBe(true);
    });
  });

  it("should have at least 3 FAQs per category", () => {
    const categoryCounts: Record<string, number> = {};
    categories.forEach((c) => {
      categoryCounts[c.id] = 0;
    });

    faqs.forEach((faq) => {
      categoryCounts[faq.category] = (categoryCounts[faq.category] || 0) + 1;
    });

    categories.forEach((cat) => {
      expect(
        categoryCounts[cat.id],
        `Category "${cat.id}" has fewer than 3 FAQs (found ${categoryCounts[cat.id]})`
      ).toBeGreaterThanOrEqual(3);
    });
  });

  it("should ensure every FAQ has between 4 and 6 keywords", () => {
    faqs.forEach((faq) => {
      expect(
        faq.keywords.length,
        `FAQ ${faq.id} should have between 4 and 6 keywords (has ${faq.keywords.length})`
      ).toBeGreaterThanOrEqual(4);
      expect(
        faq.keywords.length,
        `FAQ ${faq.id} should have between 4 and 6 keywords (has ${faq.keywords.length})`
      ).toBeLessThanOrEqual(6);
    });
  });
});
