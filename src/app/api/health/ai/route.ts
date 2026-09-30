import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/config/env";
import { classifyAiError, AiErrorKind } from "@/lib/ai/client";

interface AiHealthResponse {
  ok: boolean;
  model: string;
  latencyMs: number;
  errorKind?: AiErrorKind;
}

export async function GET(): Promise<NextResponse<AiHealthResponse>> {
  const env = getEnv();
  const model = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey === "development-dummy-key" ||
    apiKey === "your_gemini_api_key_here" ||
    apiKey === "mock-key-stage-1"
  ) {
    return NextResponse.json(
      {
        ok: false,
        model,
        latencyMs: 0,
        errorKind: "auth",
      },
      { status: 503 }
    );
  }

  const startTime = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey });

    // 10s timeout wrapper
    const callPromise = ai.models.generateContent({
      model,
      contents: "Reply with OK",
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Gemini API request timed out")), 10000);
    });

    try {
      await Promise.race([callPromise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }

    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      ok: true,
      model,
      latencyMs,
    });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const { errorKind, status } = classifyAiError(err);

    // Log upstream failures server-side (status and errorKind only)
    console.error(`[AI Health Check Upstream Failure]: status=${status}, errorKind=${errorKind}`);

    return NextResponse.json(
      {
        ok: false,
        model,
        latencyMs,
        errorKind,
      },
      { status: 503 }
    );
  }
}
