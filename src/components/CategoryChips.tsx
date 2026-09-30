"use client";

import React from "react";
import categoriesData from "@/data/categories.json";
import { Category } from "@/types";
import {
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building2,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
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
    { id: "all", label: "All Categories", icon: "Sparkles" },
    ...categories,
  ];

  return (
    <div
      className="w-full overflow-x-auto no-scrollbar py-2.5 px-4 sm:px-6 bg-slate-50/80 border-b border-slate-200/60"
      role="region"
      aria-label="Filter campus categories"
    >
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        {allChips.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = ICON_MAP[cat.icon] || HelpCircle;

          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${cat.label}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200/90"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`}
                aria-hidden="true"
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
