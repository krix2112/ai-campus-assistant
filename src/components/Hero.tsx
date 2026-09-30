"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, MessageSquare, Sparkles } from "lucide-react";

export const Hero: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  // Mock auto-typing animation in hero preview card
  const mockQueries = [
    {
      q: "Where is Central Library and what are borrowing limits?",
      a: "Central Library is located in Block B. Undergraduate students can borrow up to 4 books for 14 days using their student ID card.",
      cat: "LIBRARY",
      src: "LIB-001",
    },
    {
      q: "What are the hostel in-out timings and gate curfew?",
      a: "Hostel gates close at 9:30 PM on weekdays. Late entry requires digital permission from the Hostel Warden on the student portal.",
      cat: "TIMINGS",
      src: "TIME-003",
    },
    {
      q: "How can first-year students join technical clubs?",
      a: "Clubs conduct their annual recruitment during Orientation Week in August at the Student Activity Centre (SAC).",
      cat: "CLUBS",
      src: "CLUB-001",
    },
  ];

  const [mockIndex, setMockIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMockIndex((prev) => (prev + 1) % mockQueries.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [mockQueries.length]);

  const currentMock = mockQueries[mockIndex];

  const scrollToChat = () => {
    document.getElementById("assistant")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    document.getElementById("students")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Headline and Call-to-actions */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Top mono badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-surface border-[1.5px] border-ink rounded-full mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink font-bold">
              Campus Intelligence Engine • 2026
            </span>
          </motion.div>

          {/* Huge Display Headline with Staggered Mask Reveal */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: prefersReducedMotion ? 0 : 80, opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em] text-ink"
            >
              Your campus, <br />
              <span className="relative inline-block text-accent">
                answered.
                {/* Hand-drawn SVG underline with stroke animation */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-4 overflow-visible"
                  viewBox="0 0 280 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M3 13.5C65 4.5 190 -2 277 10"
                    stroke="#FF4B1F"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
                  />
                </svg>
              </span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-ink/80 max-w-xl font-normal leading-relaxed"
          >
            One place for timings, clubs, library rules, events and everything a new student is too shy to ask. Grounded in verified university records.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={scrollToChat}
              className="btn-press px-6 py-3.5 bg-accent text-ink text-sm font-mono uppercase tracking-wider font-bold rounded-full border-[1.5px] border-ink shadow-hard hover:bg-accent-hover transition-all flex items-center gap-2"
            >
              <span>Ask a question</span>
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={scrollToFeatures}
              className="btn-press px-6 py-3.5 bg-paper text-ink text-sm font-mono uppercase tracking-wider font-bold rounded-full border-[1.5px] border-ink shadow-hard hover:bg-surface transition-all"
            >
              See what&apos;s coming
            </button>
          </motion.div>
        </div>

        {/* Right Column: Live Interactive Mockup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="lg:col-span-5 w-full"
        >
          <div className="relative w-full bg-surface/90 border-[1.5px] border-ink rounded-card p-5 shadow-hard-lg">
            {/* Header bar of mini mockup */}
            <div className="flex items-center justify-between pb-3.5 border-b-[1.5px] border-ink mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent border-[1px] border-ink" />
                <span className="w-3 h-3 rounded-full bg-paper border-[1px] border-ink" />
                <span className="w-3 h-3 rounded-full bg-ink border-[1px] border-ink" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-ink/70 font-semibold">
                <span>SIMULATED RUNTIME</span>
              </div>
            </div>

            {/* Mock Chat Conversation with Key Frame Transitions */}
            <div className="flex flex-col gap-3.5 min-h-[220px]">
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="bg-ink text-paper text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-2xl rounded-br-none max-w-[90%] border-[1.5px] border-ink shadow-hard-sm">
                  <p>{currentMock.q}</p>
                </div>
              </div>

              {/* Assistant answer bubble */}
              <div className="flex justify-start">
                <div className="bg-paper text-ink text-xs sm:text-sm px-3.5 py-3 rounded-2xl rounded-tl-none max-w-[95%] border-[1.5px] border-ink shadow-hard-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-accent text-ink rounded border-[1px] border-ink">
                      {currentMock.cat}
                    </span>
                    <span className="text-[10px] font-mono text-ink/60 font-semibold">
                      REF: {currentMock.src}
                    </span>
                  </div>
                  <p className="leading-relaxed">{currentMock.a}</p>
                </div>
              </div>
            </div>

            {/* Footer ticker info */}
            <div className="mt-3 pt-3 border-t-[1.5px] border-ink/40 flex items-center justify-between text-[10px] font-mono text-ink/60 uppercase">
              <span>Grounding: 100% Strict</span>
              <span>Model: Gemini 3.8 Flash</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
