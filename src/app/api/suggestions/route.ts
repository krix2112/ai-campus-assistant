import { NextRequest, NextResponse } from "next/server";
import { FAQ, ApiError } from "@/types";
import faqsData from "@/data/faqs.json";
import { FaqQuerySchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ suggestions: string[] } | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") || undefined;

    const parsed = FaqQuerySchema.safeParse({ category: categoryParam });
    if (!parsed.success) {
      return apiError("INVALID_QUERY", "Invalid query parameter", 400);
    }

    const allFaqs = faqsData as FAQ[];
    let filteredFaqs = allFaqs;

    if (parsed.data.category) {
      filteredFaqs = allFaqs.filter(
        (faq) => faq.category.toLowerCase() === parsed.data.category?.toLowerCase()
      );
    }

    const suggestions = filteredFaqs
      .slice(0, 6)
      .map((faq) => faq.question);

    return apiSuccess({ suggestions });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve suggestions",
      500
    );
  }
}
