"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-ink text-paper pt-14 pb-0 overflow-hidden border-t-[1.5px] border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top footer row with info and links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-paper/20">
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-accent border-[1px] border-paper flex items-center justify-center">
                <span className="font-display font-extrabold text-sm text-ink leading-none">
                  U
                </span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-paper">
                Unio
              </span>
            </div>
            <p className="text-xs text-paper/70 max-w-sm leading-relaxed">
              The verified intelligence layer for modern campuses. Built to eliminate onboarding friction and empower student autonomy.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-bold block mb-1">
              CAMPUS HUBS
            </span>
            <ul className="space-y-1.5 text-xs text-paper/80 font-mono">
              <li><a href="#assistant" className="hover:text-accent transition-colors">Academic Cell</a></li>
              <li><a href="#assistant" className="hover:text-accent transition-colors">Central Library</a></li>
              <li><a href="#assistant" className="hover:text-accent transition-colors">Student Welfare (DSW)</a></li>
              <li><a href="#assistant" className="hover:text-accent transition-colors">Campus Dispensary</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-bold block mb-1">
              SYSTEM
            </span>
            <ul className="space-y-1.5 text-xs text-paper/80 font-mono">
              <li><span className="text-paper/60">Version: 1.0.0 (Production)</span></li>
              <li><span className="text-paper/60">Engine: Gemini 3.8 Flash RAG</span></li>
              <li><span className="text-paper/60">Strict Grounding: Active</span></li>
              <li><span className="text-paper/60">License: MIT Standard</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright subline */}
        <div className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-paper/50 gap-2">
          <span>© 2026 UNIO PLATFORM • ALL CAMPUS DATA GROUNDED & VERIFIED</span>
          <span>CAMPUS COMPASS INC.</span>
        </div>
      </div>

      {/* Giant Cropped Editorial Wordmark */}
      <div className="w-full select-none pointer-events-none mt-2 flex justify-center overflow-hidden">
        <span className="font-display font-extrabold text-[22vw] leading-[0.78] tracking-[-0.05em] text-paper/10 text-center uppercase whitespace-nowrap">
          UNIO
        </span>
      </div>
    </footer>
  );
};
