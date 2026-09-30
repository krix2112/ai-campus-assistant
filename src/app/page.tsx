"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { CategoryChips } from "@/components/CategoryChips";
import { ChatMessageItem, ExtendedChatMessage } from "@/components/ChatMessageItem";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { ChatInput } from "@/components/ChatInput";
import { FAQ, ChatResponse, Category } from "@/types";
import categoriesData from "@/data/categories.json";
import faqsData from "@/data/faqs.json";
import { Bot } from "lucide-react";

const categories: Category[] = categoriesData as Category[];
const initialFaqs: FAQ[] = faqsData as FAQ[];

export default function HomePage() {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);

  // Map of FAQ ID -> FAQ object for quick source title lookup
  const [faqsMap, setFaqsMap] = useState<Record<string, FAQ>>(() => {
    const map: Record<string, FAQ> = {};
    initialFaqs.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Fetch updated FAQs from API for sync
  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data: FAQ[] = await res.json();
          const map: Record<string, FAQ> = {};
          data.forEach((f) => {
            map[f.id] = f;
          });
          setFaqsMap(map);
        }
      } catch {
        // Fallback to static faqsData already in state
      }
    }
    loadFaqs();
  }, []);

  // Fetch suggestions when category changes
  useEffect(() => {
    async function loadSuggestions() {
      setIsLoadingSuggestions(true);
      try {
        const url =
          selectedCategory === "all"
            ? "/api/suggestions"
            : `/api/suggestions?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // Fallback default suggestions
        setSuggestions([
          "What are the Central Library operating hours?",
          "What are the hostel in-time and gate closure rules?",
          "How do I join technical and cultural clubs?",
          "What is the minimum attendance requirement for exams?",
        ]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
    loadSuggestions();
  }, [selectedCategory]);

  // Handle rate limit countdown timer
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  // Handle message submission
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading || rateLimitSeconds > 0) return;

    const userMessage: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };

    // Add user message to state and clear input
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInput("");
    }
    setIsLoading(true);

    try {
      // Send last 6 messages from history
      const historyToSend = messages.slice(-6).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          history: historyToSend,
        }),
      });

      if (response.status === 429) {
        const retryHeader = response.headers.get("Retry-After");
        const seconds = retryHeader ? parseInt(retryHeader, 10) || 60 : 60;
        setRateLimitSeconds(seconds);

        const rateLimitMessage: ExtendedChatMessage = {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: `Too many requests. Please wait ${seconds} seconds before trying again.`,
          createdAt: new Date().toISOString(),
          isError: true,
          rawFailedMessage: query,
        };
        setMessages((prev) => [...prev, rateLimitMessage]);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server error (${response.status})`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ExtendedChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
        sources: data.sources,
        suggestions: data.suggestions,
        degraded: data.degraded,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ExtendedChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          err instanceof Error
            ? `Could not complete request: ${err.message}`
            : "Network error occurred while fetching answer.",
        createdAt: new Date().toISOString(),
        isError: true,
        rawFailedMessage: query,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "All Campus"
      : categories.find((c) => c.id === selectedCategory)?.label || "Campus";

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/60 text-slate-900">
      {/* Pinned Top Header */}
      <Header onClearChat={handleClearChat} hasMessages={messages.length > 0} />

      {/* Horizontally Scrollable Category Bar */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        disabled={isLoading}
      />

      {/* Main Chat Scroll Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
        {messages.length === 0 ? (
          <ChatEmptyState
            suggestions={suggestions}
            selectedCategoryName={selectedCategoryLabel}
            onSelectSuggestion={(q) => handleSendMessage(q)}
            isLoadingSuggestions={isLoadingSuggestions}
          />
        ) : (
          <div
            className="flex-1 flex flex-col space-y-2"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Chat messages history"
          >
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                faqsMap={faqsMap}
                onSelectSuggestion={(q) => handleSendMessage(q)}
                onRetry={(rawMsg) => handleSendMessage(rawMsg)}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 mb-4 max-w-[85%]">
                <div
                  className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                  aria-hidden="true"
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="sr-only">Campus Assistant is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Pinned Bottom Input */}
      <ChatInput
        input={input}
        onChange={setInput}
        onSend={() => handleSendMessage()}
        isLoading={isLoading}
        rateLimitSeconds={rateLimitSeconds}
      />
    </div>
  );
}
