"use client";

import React from "react";
import { ChatMessage, FAQ } from "@/types";
import { Bot, User, Zap, BookOpen, RotateCcw, AlertCircle } from "lucide-react";

export interface ExtendedChatMessage extends ChatMessage {
  degraded?: boolean;
  suggestions?: string[];
  isError?: boolean;
  rawFailedMessage?: string;
}

interface ChatMessageItemProps {
  message: ExtendedChatMessage;
  faqsMap: Record<string, FAQ>;
  onSelectSuggestion: (question: string) => void;
  onRetry?: (messageText: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  faqsMap,
  onSelectSuggestion,
  onRetry,
}) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <div
            className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs mb-0.5"
            aria-hidden="true"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex flex-col items-start mb-6 max-w-[95%] sm:max-w-[88%]">
      <div className="flex items-start gap-2.5 w-full">
        <div
          className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
          aria-hidden="true"
        >
          <Bot className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm border ${
              message.isError
                ? "bg-red-50/90 border-red-200 text-red-900"
                : "bg-white border-slate-200/90 text-slate-800"
            }`}
          >
            {message.degraded && (
              <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md w-fit">
                <Zap className="w-3 h-3 text-amber-600" aria-hidden="true" />
                <span>Quick answer mode</span>
              </div>
            )}

            <p className="whitespace-pre-wrap break-words">{message.content}</p>

            {message.isError && onRetry && message.rawFailedMessage && (
              <div className="mt-3 pt-2 border-t border-red-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-red-700">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Request failed</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRetry(message.rawFailedMessage!)}
                  aria-label="Retry failed request"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded border border-indigo-200 shadow-2xs transition-colors"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Sources Row */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1.5">
                  <BookOpen className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>Verified Campus Sources:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((srcId) => {
                    const faq = faqsMap[srcId];
                    const label = faq ? faq.question : srcId;
                    return (
                      <span
                        key={srcId}
                        title={faq?.answer || label}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 font-normal truncate max-w-full"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-2.5 pl-1">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">
                Suggested follow-ups:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion(sug)}
                    className="text-left text-xs bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-800 font-medium px-2.5 py-1 rounded-full border border-indigo-200/70 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
