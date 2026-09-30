import { NextRequest, NextResponse } from "next/server";
import { ChatResponse, ApiError } from "@/types";
import { ChatRequestSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse | ApiError>> {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
    }

    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        "VALIDATION_ERROR",
        validation.error.errors[0]?.message || "Invalid chat request format",
        400
      );
    }

    const { message } = validation.data;

    // Stage 1 typed mock response stub
    const responsePayload: ChatResponse = {
      reply: `[Stage 1 Mock Response] Received query: "${message}". Real RAG generation with Gemini will be enabled in Stage 2.`,
      category: "general",
      sources: ["src/data/faqs.json"],
      suggestions: [
        "What is the minimum attendance requirement?",
        "Where is the Central Library located?",
        "What are the hostel in-out timings?",
      ],
    };

    return apiSuccess<ChatResponse>(responsePayload, 200);
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Failed to process chat request",
      500
    );
  }
}
