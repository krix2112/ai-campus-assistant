import { NextRequest, NextResponse } from "next/server";
import { FAQ, ApiError } from "@/types";
import faqsData from "@/data/faqs.json";
import { FaqQuerySchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(
  request: NextRequest
): Promise<NextResponse<FAQ[] | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") || undefined;

    const parsed = FaqQuerySchema.safeParse({ category: categoryParam });
    if (!parsed.success) {
      return apiError(
        "INVALID_QUERY",
        parsed.error.errors[0]?.message || "Invalid category parameter",
        400
      );
    }

    const allFaqs = faqsData as FAQ[];

    if (parsed.data.category) {
      const filtered = allFaqs.filter(
        (faq) => faq.category.toLowerCase() === parsed.data.category?.toLowerCase()
      );
      return apiSuccess<FAQ[]>(filtered);
    }

    return apiSuccess<FAQ[]>(allFaqs);
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Failed to load FAQs",
      500
    );
  }
}
