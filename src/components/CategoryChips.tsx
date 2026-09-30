"use client";

import React from "react";
import { motion } from "framer-motion";
import categoriesData from "@/data/categories.json";
import { Category } from "@/types";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building2,
  Layers,
  LucideIcon,
} from "lucide-react";

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building2,
};

const categories: Category[] = categoriesData as Category[];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  disabled = false,
}) => {
  const allChips = [
    { id: "all", label: "All Questions", icon: "Layers" },
    ...categories,
  ];

  return (
    <div
      className="w-full overflow-x-auto no-scrollbar py-3 px-3 sm:px-4 bg-surface/80 border-b-[1.5px] border-ink"
      role="tablist"
      aria-label="Filter campus categories"
    >
      <div className="flex items-center gap-1.5 min-w-max">
        {allChips.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = cat.icon === "Layers" ? Layers : ICON_MAP[cat.icon] || Layers;

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(cat.id)}
              aria-selected={isSelected}
              aria-label={`Category: ${cat.label}`}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? "text-paper"
                  : "text-ink/80 hover:text-ink hover:bg-surface-muted/60"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-ink rounded-full border-[1.5px] border-ink shadow-hard-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <IconComponent
                  className={`w-3.5 h-3.5 ${isSelected ? "text-accent" : "text-ink/70"}`}
                  aria-hidden="true"
                />
                <span>{cat.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
