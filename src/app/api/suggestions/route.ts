import { NextRequest } from "next/server";
import { successResponse } from "@/lib/utils";
import rawFaqs from "@/data/faqs.json";
import rawCategories from "@/data/categories.json";
import { FAQ, Category } from "@/types";

const faqs: FAQ[] = rawFaqs as FAQ[];
const categories: Category[] = rawCategories as Category[];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryParam = searchParams.get("category")?.trim().toLowerCase();

  if (categoryParam && categoryParam !== "all") {
    // Return up to 4 questions from this specific category
    const categoryFaqs = faqs.filter(
      (f) => f.category.toLowerCase() === categoryParam
    );

    const questions = categoryFaqs.slice(0, 4).map((f) => f.question);
    return successResponse({ suggestions: questions });
  }

  // Mixed 6 questions (1 from each category where possible)
  const mixedQuestions: string[] = [];
  for (const cat of categories) {
    const matchedFaq = faqs.find((f) => f.category === cat.id);
    if (matchedFaq) {
      mixedQuestions.push(matchedFaq.question);
    }
  }

  // Fallback to first 6 if fewer categories
  if (mixedQuestions.length < 6) {
    const remaining = faqs
      .filter((f) => !mixedQuestions.includes(f.question))
      .map((f) => f.question);
    mixedQuestions.push(...remaining.slice(0, 6 - mixedQuestions.length));
  }

  return successResponse({ suggestions: mixedQuestions.slice(0, 6) });
}
