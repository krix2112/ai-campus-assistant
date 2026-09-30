import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateGroundedAnswer } from "@/lib/ai/client";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import { FAQ } from "@/types";

const mockFaqs: FAQ[] = [
  {
    id: "lib-001",
    category: "library",
    question: "What are the Central Library operating hours and entry rules?",
    answer: "The Central Library (Block B) is open Monday to Saturday from 8:00 AM to 10:00 PM.",
    keywords: ["library timings", "central library", "block b"],
    updatedAt: "2026-09-01T00:00:00Z",
  },
];

describe("Chat API Fallback Path (Gemini Mocked / Degraded)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the top matched FAQ answer verbatim with degraded: true when Gemini fails", async () => {
    // Calling generateGroundedAnswer with no valid API key (or failed call)
    const result = await generateGroundedAnswer({
      query: "What time is the library open?",
      contextFaqs: mockFaqs,
    });

    expect(result.degraded).toBe(true);
    expect(result.reply).toBe(mockFaqs[0].answer);
    expect(result.sources).toEqual(["lib-001"]);
  });

  it("should return standard campus office guidance when no FAQs match and generation is degraded", async () => {
    const result = await generateGroundedAnswer({
      query: "How to fix a bicycle puncture?",
      contextFaqs: [],
    });

    expect(result.degraded).toBe(true);
    expect(result.reply).toContain("Campus Administrative Office");
    expect(result.sources).toEqual([]);
  });

  it("should return a successful 200 HTTP response with degraded: true through POST /api/chat route", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.100",
      },
      body: JSON.stringify({
        message: "What are the Central Library hours?",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.degraded).toBe(true);
    expect(data.sources).toContain("lib-001");
    expect(data.reply).toBeTruthy();
    expect(Array.isArray(data.suggestions)).toBe(true);
  });
});
