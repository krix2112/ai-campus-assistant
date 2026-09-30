"use client";

import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";

interface ChatEmptyStateProps {
  suggestions: string[];
  selectedCategoryName: string;
  onSelectSuggestion: (question: string) => void;
  isLoadingSuggestions?: boolean;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  suggestions,
  selectedCategoryName,
  onSelectSuggestion,
  isLoadingSuggestions = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-2 sm:px-4 text-center max-w-xl mx-auto my-auto">
      {/* Editorial Monogram Badge */}
      <div className="w-12 h-12 rounded-[12px] bg-accent border-[1.5px] border-ink shadow-hard flex items-center justify-center mb-4">
        <span className="font-display font-extrabold text-2xl text-ink select-none">
          U
        </span>
      </div>

      <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
        Ask anything campus-related.
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-ink/70 max-w-md font-normal leading-relaxed">
        From hostel curfews and mess timings to club recruitments and library journal access—grounded in official records.
      </p>

      {/* Suggested Prompt Tiles */}
      <div className="mt-7 w-full text-left">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <HelpCircle className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/70">
            PROMPTS IN {selectedCategoryName}
          </span>
        </div>

        {isLoadingSuggestions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-[12px] bg-surface/70 border-[1.5px] border-ink animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectSuggestion(suggestion)}
                className="group p-3.5 rounded-[12px] bg-paper hover:bg-surface border-[1.5px] border-ink shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all duration-150 flex items-start justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="text-xs sm:text-sm font-medium text-ink leading-snug group-hover:text-accent transition-colors">
                  {suggestion}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-ink group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
