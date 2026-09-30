"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

export const BuiltForBothSides: React.FC = () => {
  const studentFeatures = [
    { title: "Instant Verified Answers", desc: "No more scrolling unverified WhatsApp groups or outdated PDFs.", isLive: true },
    { title: "Attendance Threshold Tracker", desc: "Monitor course-by-course 75% requirements with alert thresholds.", isLive: false },
    { title: "Campus Lost & Found Desk", desc: "Report and claim lost ID cards, calculators, and notebooks.", isLive: false },
    { title: "Student Opportunities Board", desc: "Hackathons, club orientations, and research assistant openings.", isLive: false },
  ];

  const facultyFeatures = [
    { title: "Automated FAQ Resolution", desc: "Deflect 80%+ of repetitive student emails regarding schedules and syllabus.", isLive: true },
    { title: "One-Click Broadcast Updates", desc: "Push urgent exam date changes or room reallocations directly to students.", isLive: false },
    { title: "Tap-to-Mark Attendance", desc: "Digital verification with immediate condonation logging for deans.", isLive: false },
    { title: "Exam Cell Integration", desc: "Re-evaluation and supplementary forms automated with audit trails.", isLive: false },
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 border-t-[1.5px] border-ink bg-paper">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border-[1.5px] border-ink rounded-full mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink font-bold">
              Product Scope
            </span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Built for both sides of campus.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink/70 max-w-xl">
            Designed to bridge the communication gap between newly admitted students and university administration.
          </p>
        </div>

        {/* 2 Large Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Students */}
          <div
            id="students"
            className="group relative bg-surface border-[1.5px] border-ink rounded-card p-6 sm:p-8 shadow-hard-lg hover:shadow-hard-xl hover:-translate-y-1 hover:-rotate-1 transition-all duration-200"
          >
            <div className="flex items-start justify-between border-b-[1.5px] border-ink pb-4 mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-ink/60 tracking-wider">
                  01 / AUDIENCE
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  For Students
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-accent text-ink rounded-full border-[1.5px] border-ink">
                LIVE IN V1
              </span>
            </div>

            <div className="space-y-4">
              {studentFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-paper rounded-[12px] border-[1.5px] border-ink flex items-start justify-between gap-3 shadow-hard-sm"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                      {feat.isLive ? (
                        <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                      ) : (
                        <Clock className="w-4 h-4 text-ink/40" aria-hidden="true" />
                      )}
                      <span>{feat.title}</span>
                    </h4>
                    <p className="text-xs text-ink/70 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border-[1px] ${
                      feat.isLive
                        ? "bg-success-light text-success border-success"
                        : "bg-surface text-ink/60 border-ink/40"
                    }`}
                  >
                    {feat.isLive ? "LIVE" : "SOON"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: For Faculty */}
          <div
            id="faculty"
            className="group relative bg-surface border-[1.5px] border-ink rounded-card p-6 sm:p-8 shadow-hard-lg hover:shadow-hard-xl hover:-translate-y-1 hover:rotate-1 transition-all duration-200"
          >
            <div className="flex items-start justify-between border-b-[1.5px] border-ink pb-4 mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-ink/60 tracking-wider">
                  02 / AUDIENCE
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  For Faculty & Admin
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase bg-paper text-ink rounded-full border-[1.5px] border-ink">
                PHASE 2
              </span>
            </div>

            <div className="space-y-4">
              {facultyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-paper rounded-[12px] border-[1.5px] border-ink flex items-start justify-between gap-3 shadow-hard-sm"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                      {feat.isLive ? (
                        <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                      ) : (
                        <Clock className="w-4 h-4 text-ink/40" aria-hidden="true" />
                      )}
                      <span>{feat.title}</span>
                    </h4>
                    <p className="text-xs text-ink/70 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border-[1px] ${
                      feat.isLive
                        ? "bg-success-light text-success border-success"
                        : "bg-surface text-ink/60 border-ink/40"
                    }`}
                  >
                    {feat.isLive ? "LIVE" : "SOON"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
