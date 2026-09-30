"use client";

import React from "react";
import { GraduationCap, ArrowRight, HelpCircle } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center max-w-xl mx-auto my-auto animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <GraduationCap className="w-7 h-7" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Welcome to Campus Life!
      </h2>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md">
        Ask anything about college academics, central library, societies, gate timings, mess schedules, or health center.
      </p>

      <div className="mt-6 w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
            <span>Popular in {selectedCategoryName}</span>
          </span>
        </div>

        {isLoadingSuggestions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100/80 animate-pulse border border-slate-200/60"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectSuggestion(suggestion)}
                className="group p-3 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-200/90 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-start justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-left"
              >
                <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900 leading-snug">
                  {suggestion}
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5"
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
