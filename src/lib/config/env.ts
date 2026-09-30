import { z } from "zod";

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for Gemini AI operations"),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
  RATE_LIMIT_PER_MINUTE: z
    .string()
    .default("60")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  GLOBAL_RATE_LIMIT_PER_HOUR: z
    .string()
    .default("300")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
});

export type Env = z.infer<typeof EnvSchema>;

let validatedEnv: Env | null = null;

export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");

    if (process.env.NODE_ENV === "test" || !process.env.GEMINI_API_KEY) {
      return {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "mock-key-stage-1",
        GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
        RATE_LIMIT_PER_MINUTE: 60,
        GLOBAL_RATE_LIMIT_PER_HOUR: 300,
      };
    }

    throw new Error(
      `\n❌ Invalid or missing environment configuration:\n${formattedErrors}\nPlease check your .env or .env.local file.\n`
    );
  }

  validatedEnv = result.data;
  return validatedEnv;
}
