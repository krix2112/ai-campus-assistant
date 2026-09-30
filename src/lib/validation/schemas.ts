import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  label: z.string().min(1, "Category label is required"),
  icon: z.string().min(1, "Icon name is required"),
});

export const FAQSchema = z.object({
  id: z.string().min(1, "FAQ ID is required"),
  category: z.string().min(1, "Category is required"),
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  keywords: z
    .array(z.string().min(1))
    .min(4, "Each FAQ must have at least 4 keywords")
    .max(6, "Each FAQ can have at most 6 keywords"),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
});

export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  createdAt: z.string(),
  sources: z.array(z.string()).optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long"),
  history: z.array(ChatMessageSchema).optional(),
});

export const ChatResponseSchema = z.object({
  reply: z.string().min(1),
  category: z.string().optional(),
  sources: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export const FaqQuerySchema = z.object({
  category: z.string().trim().optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
export type FAQInput = z.infer<typeof FAQSchema>;
export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
export type ChatResponseInput = z.infer<typeof ChatResponseSchema>;
