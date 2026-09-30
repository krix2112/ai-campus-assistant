import { NextRequest, NextResponse } from "next/server";
import { ChatResponse, ApiError, FAQ } from "@/types";
import { ChatRequestSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/utils";
import { searchFaqs } from "@/lib/retrieval/matcher";
import { generateGroundedAnswer } from "@/lib/ai/client";
import { getEnv } from "@/lib/config/env";
import faqsData from "@/data/faqs.json";

// In-memory sliding rate limiter per IP
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkIpRateLimit(ip: string, limitPerMinute: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const entry = rateLimitMap.get(ip);

  // Cleanup stale entries
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= limitPerMinute) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

// Global request cap per hour across all clients
let globalRequestCount = 0;
let globalResetTime = Date.now() + 60 * 60 * 1000;

function checkGlobalRateLimit(limitPerHour: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;

  if (now > globalResetTime) {
    globalRequestCount = 0;
    globalResetTime = now + windowMs;
  }

  if (globalRequestCount >= limitPerHour) {
    const retryAfter = Math.max(1, Math.ceil((globalResetTime - now) / 1000));
    return { allowed: false, retryAfter };
  }

  globalRequestCount += 1;
  return { allowed: true, retryAfter: 0 };
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

function getRelatedSuggestions(matchedFaqs: FAQ[], allFaqs: FAQ[], requestedCategory?: string): string[] {
  const matchedIds = new Set(matchedFaqs.map((f) => f.id));
  const primaryCategory = matchedFaqs[0]?.category || requestedCategory;

  const sameCategoryQuestions: string[] = [];
  if (primaryCategory) {
    sameCategoryQuestions.push(
      ...allFaqs
        .filter((f) => f.category.toLowerCase() === primaryCategory.toLowerCase() && !matchedIds.has(f.id))
        .map((f) => f.question)
    );
  }

  const otherQuestions = allFaqs
    .filter((f) => !matchedIds.has(f.id) && !sameCategoryQuestions.includes(f.question))
    .map((f) => f.question);

  return [...sameCategoryQuestions, ...otherQuestions].slice(0, 4);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse | ApiError>> {
  try {
    const env = getEnv();

    // 1. Global hourly rate limit check
    const globalLimit = checkGlobalRateLimit(env.GLOBAL_RATE_LIMIT_PER_HOUR || 300);
    if (!globalLimit.allowed) {
      return NextResponse.json(
        {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please wait ${globalLimit.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(globalLimit.retryAfter),
          },
        }
      );
    }

    // 2. Per-IP rate limit check
    const clientIp = getClientIp(request);
    const ipLimit = checkIpRateLimit(clientIp, env.RATE_LIMIT_PER_MINUTE || 60);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Please wait ${ipLimit.retryAfter} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipLimit.retryAfter),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
    }

    const validation = ChatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid chat request format";
      return apiError("VALIDATION_ERROR", errorMessage, 400);
    }

    const { message, history, category } = validation.data;
    const allFaqs = faqsData as FAQ[];

    // 3. Retrieve top matching FAQs with optional category boost
    const matchedFaqs = searchFaqs(message, {
      category: category && category !== "all" ? category : undefined,
      limit: 3,
      minScore: 15,
    });

    // 4. Generate grounded answer
    const result = await generateGroundedAnswer({
      query: message,
      contextFaqs: matchedFaqs,
      history,
    });

    // 5. Build related suggestions (same category first, then others)
    const suggestions = getRelatedSuggestions(matchedFaqs, allFaqs, category);

    const responsePayload: ChatResponse = {
      reply: result.reply,
      category: matchedFaqs[0]?.category || category,
      sources: result.sources,
      suggestions,
      degraded: result.degraded,
      ai: result.ai,
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
