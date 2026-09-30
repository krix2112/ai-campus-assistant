"use client";

import React from "react";

const MARQUEE_ITEMS = [
  "When does the Central Library open?",
  "What is the minimum attendance for semester exams?",
  "How do I join technical and cultural clubs?",
  "Where is the campus health centre located?",
  "What are the hostel in-out timings and curfew?",
  "How do I access IEEE and digital journals off-campus?",
  "What are the library overdue fines?",
  "Where can student clubs book practice rooms?",
  "What are the mess and dining hall timings?",
];

export const Marquee: React.FC = () => {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      className="w-full bg-ink text-paper py-3.5 border-y-[1.5px] border-ink overflow-hidden select-none"
      role="region"
      aria-label="Popular campus questions ticker"
    >
      <div className="animate-marquee flex items-center gap-6">
        {repeated.map((item, index) => (
          <div key={index} className="flex items-center gap-6 flex-shrink-0">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold">
              {item}
            </span>
            <span className="text-accent text-lg font-bold" aria-hidden="true">
              /
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
