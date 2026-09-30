"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export const Nav: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-paper/95 backdrop-blur-md border-b-[1.5px] border-ink">
      {/* Scroll Progress Bar */}
      <div
        className="h-[3px] bg-accent transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Monogram Logo + Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus-visible:outline-none"
          aria-label="Unio Home"
        >
          <div className="w-9 h-9 rounded-[10px] bg-accent border-[1.5px] border-ink shadow-hard-sm flex items-center justify-center group-hover:rotate-3 transition-transform">
            <span className="font-display font-extrabold text-xl text-ink leading-none select-none">
              U
            </span>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-ink">
            Unio
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <button
            type="button"
            onClick={() => scrollToSection("assistant")}
            className="text-xs font-mono uppercase tracking-wider text-ink/80 hover:text-accent font-semibold transition-colors"
          >
            Assistant
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("students")}
            className="text-xs font-mono uppercase tracking-wider text-ink/80 hover:text-accent font-semibold transition-colors"
          >
            For Students
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("faculty")}
            className="text-xs font-mono uppercase tracking-wider text-ink/80 hover:text-accent font-semibold transition-colors"
          >
            For Faculty
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("roadmap")}
            className="text-xs font-mono uppercase tracking-wider text-ink/80 hover:text-accent font-semibold transition-colors flex items-center gap-1"
          >
            <span>Roadmap</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-surface border-[1px] border-ink rounded-full">
              4 STAGES
            </span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => scrollToSection("assistant")}
          className="btn-press px-4 py-2 bg-ink text-paper text-xs font-mono uppercase tracking-wider font-bold rounded-full border-[1.5px] border-ink shadow-hard-sm hover:bg-accent hover:text-ink hover:border-ink transition-all flex items-center gap-1.5"
        >
          <span>Ask now</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
