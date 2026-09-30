"use client";

import React from "react";
import { Sparkles, Trash2 } from "lucide-react";

interface HeaderProps {
  onClearChat: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat, hasMessages }) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-20 py-3 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Campus FAQ Assistant
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Freshers 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              Instant AI guidance for academics, library, facilities, events & timings
            </p>
          </div>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={onClearChat}
            aria-label="Clear chat conversation history"
            title="Clear chat"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Clear chat</span>
          </button>
        )}
      </div>
    </header>
  );
};
