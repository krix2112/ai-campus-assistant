"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChatMessage, FAQ } from "@/types";
import { ArrowRight, RotateCcw, AlertCircle, FileText, Zap } from "lucide-react";

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
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="bg-ink text-paper rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed border-[1.5px] border-ink shadow-hard-sm">
            <p className="whitespace-pre-wrap break-words font-medium">{message.content}</p>
          </div>
          <div className="text-[10px] font-mono uppercase text-ink/50 text-right mt-1 px-1">
            YOU
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant Message
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-start mb-6 max-w-[95%] sm:max-w-[85%]"
    >
      <div className="w-full">
        {/* Assistant Bubble */}
        <div
          className={`rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed border-[1.5px] border-ink shadow-hard-sm ${
            message.isError
              ? "bg-accent/10 border-accent text-ink"
              : "bg-paper text-ink"
          }`}
        >
          {/* Top metadata tags */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-ink text-paper rounded border-[1px] border-ink">
              UNIO ASSISTANT
            </span>

            {message.degraded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-surface text-ink border-[1px] border-ink rounded">
                <Zap className="w-2.5 h-2.5 text-accent" aria-hidden="true" />
                <span>QUICK MODE</span>
              </span>
            )}
          </div>

          {/* Reply Text */}
          <p className="whitespace-pre-wrap break-words text-ink leading-relaxed font-normal">
            {message.content}
          </p>

          {/* Error & Retry Row */}
          {message.isError && onRetry && message.rawFailedMessage && (
            <div className="mt-3 pt-2.5 border-t-[1.5px] border-accent/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-accent font-semibold font-mono">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>REQUEST FAILED</span>
              </div>
              <button
                type="button"
                onClick={() => onRetry(message.rawFailedMessage!)}
                aria-label="Retry failed question"
                className="btn-press px-3 py-1 bg-ink text-paper text-xs font-mono uppercase font-bold rounded-full border-[1.5px] border-ink shadow-hard-sm hover:bg-accent hover:text-ink transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3.5 pt-2.5 border-t-[1.5px] border-ink/20">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-ink/70 mb-1.5">
                <FileText className="w-3 h-3 text-accent" aria-hidden="true" />
                <span>VERIFIED CAMPUS SOURCES:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((srcId) => {
                  const faq = faqsMap[srcId];
                  const label = faq ? faq.question : srcId;
                  return (
                    <span
                      key={srcId}
                      title={faq?.answer || label}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-surface border-[1px] border-ink text-ink font-medium max-w-full"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="truncate max-w-[320px]">{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Follow-up Question Suggestion Tiles */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 pl-1 w-full">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/60 block mb-1.5">
              RELATED FOLLOW-UPS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(sug)}
                  className="group p-2.5 bg-surface hover:bg-paper border-[1.5px] border-ink rounded-[10px] shadow-hard-sm hover:shadow-hard transition-all duration-150 flex items-start justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="text-xs font-medium text-ink leading-snug group-hover:text-accent transition-colors">
                    {sug}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-ink group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
