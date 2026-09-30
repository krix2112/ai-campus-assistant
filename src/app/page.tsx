"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { CategoryChips } from "@/components/CategoryChips";
import { ChatMessageItem, ExtendedChatMessage } from "@/components/ChatMessageItem";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { ChatInput } from "@/components/ChatInput";
import { BuiltForBothSides } from "@/components/BuiltForBothSides";
import { Roadmap } from "@/components/Roadmap";
import { Footer } from "@/components/Footer";
import { FAQ, ChatResponse, Category } from "@/types";
import categoriesData from "@/data/categories.json";
import faqsData from "@/data/faqs.json";
import { Trash2, MessageSquare } from "lucide-react";

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

  // Map of FAQ ID -> FAQ object for instant source lookup
  const [faqsMap, setFaqsMap] = useState<Record<string, FAQ>>(() => {
    const map: Record<string, FAQ> = {};
    initialFaqs.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Sync latest FAQs
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
        // Fallback to static faqsData in state
      }
    }
    loadFaqs();
  }, []);

  // Sync category-specific suggestions
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

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  // Message submission handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading || rateLimitSeconds > 0) return;

    const userMessage: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInput("");
    }
    setIsLoading(true);

    try {
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
            ? `Could not complete query: ${err.message}`
            : "Network error occurred while connecting to campus engine.",
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
    <div className="flex flex-col min-h-screen bg-paper text-ink font-body">
      {/* 1. Sticky Nav */}
      <Nav />

      {/* 2. Editorial Hero Section */}
      <Hero />

      {/* 3. Infinite Marquee Ticker */}
      <Marquee />

      {/* 4. The Assistant Section (Real Working Product) */}
      <section
        id="assistant"
        className="w-full py-16 md:py-24 px-4 sm:px-6 bg-paper scroll-mt-14"
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border-[1.5px] border-ink rounded-full mb-2.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-ink font-bold">
                  LIVE CONCIERGE
                </span>
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                The Campus Assistant
              </h2>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                aria-label="Clear chat conversation"
                title="Clear conversation"
                className="btn-press px-3.5 py-1.5 bg-surface text-ink text-xs font-mono uppercase font-bold rounded-full border-[1.5px] border-ink shadow-hard-sm hover:bg-accent hover:text-ink transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>

          {/* Product Chat Container Card */}
          <div className="w-full bg-paper border-[1.5px] border-ink rounded-card shadow-hard-xl overflow-hidden flex flex-col min-h-[580px] max-h-[780px]">
            {/* Category Segmented Tabs */}
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              disabled={isLoading}
            />

            {/* Scrollable Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label="Conversation with Campus Assistant"
            >
              {messages.length === 0 ? (
                <ChatEmptyState
                  suggestions={suggestions}
                  selectedCategoryName={selectedCategoryLabel}
                  onSelectSuggestion={(q) => handleSendMessage(q)}
                  isLoadingSuggestions={isLoadingSuggestions}
                />
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      faqsMap={faqsMap}
                      onSelectSuggestion={(q) => handleSendMessage(q)}
                      onRetry={(rawMsg) => handleSendMessage(rawMsg)}
                    />
                  ))}

                  {/* Bouncing Three Bars Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-2.5 mb-4 max-w-[85%]">
                      <div className="bg-paper border-[1.5px] border-ink rounded-2xl rounded-tl-none p-3.5 shadow-hard-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-4 bg-ink rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-4 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-4 bg-ink rounded-full animate-bounce" />
                        <span className="sr-only">Unio is searching knowledge base...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Pinned Bottom Input Container */}
            <ChatInput
              input={input}
              onChange={setInput}
              onSend={() => handleSendMessage()}
              isLoading={isLoading}
              rateLimitSeconds={rateLimitSeconds}
            />
          </div>
        </div>
      </section>

      {/* 5. Built for Both Sides (Students vs Faculty) */}
      <BuiltForBothSides />

      {/* 6. Roadmap Section */}
      <Roadmap />

      {/* 7. Editorial Cropped Footer */}
      <Footer />
    </div>
  );
}
