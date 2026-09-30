"use client";

import React from "react";

export const Roadmap: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Grounded FAQ Concierge",
      status: "LIVE",
      isLive: true,
      desc: "Instant answers for academics, library, facilities & rules via Gemini RAG.",
    },
    {
      num: "02",
      title: "Attendance & Condonation",
      status: "SOON",
      isLive: false,
      desc: "Course-by-course 75% attendance alerts with digital medical leave submissions.",
    },
    {
      num: "03",
      title: "Campus Lost & Found",
      status: "SOON",
      isLive: false,
      desc: "Centralized claim board with photo verification and student ID validation.",
    },
    {
      num: "04",
      title: "Opportunity Board",
      status: "SOON",
      isLive: false,
      desc: "Direct recruitment pipeline for hackathons, technical clubs, and labs.",
    },
  ];

  return (
    <section id="roadmap" className="w-full py-16 md:py-24 px-4 sm:px-6 bg-surface/60 border-t-[1.5px] border-ink">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper border-[1.5px] border-ink rounded-full mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink font-bold">
              Release Trajectory
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            The 2026 Campus Roadmap
          </h2>
        </div>

        {/* 4 Steps Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-card border-[1.5px] border-ink flex flex-col justify-between shadow-hard transition-transform hover:-translate-y-1 ${
                step.isLive ? "bg-paper ring-2 ring-accent" : "bg-paper/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b-[1.5px] border-ink pb-3 mb-3">
                  <span className="font-display font-extrabold text-2xl text-ink">
                    {step.num}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border-[1px] ${
                      step.isLive
                        ? "bg-accent text-ink border-ink"
                        : "bg-surface text-ink/60 border-ink/40"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-ink/70 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t-[1.5px] border-ink/20 text-[10px] font-mono text-ink/50 uppercase">
                {step.isLive ? "Available right now" : `Planned Phase ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
