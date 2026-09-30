export interface Category {
  id: string;
  label: string;
  icon: string; // lucide-react icon name string
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: string[];
}

export interface ChatRequest {
  message: string;
  category?: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  category?: string;
  sources: string[];
  suggestions: string[];
  degraded?: boolean;
  ai?: "gemini" | "fallback";
}

export interface ApiError {
  code: string;
  message: string;
}
