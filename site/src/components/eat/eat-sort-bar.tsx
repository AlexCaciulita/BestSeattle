"use client";

import type { EatSortOption } from "@/lib/eat-types";

const SORT_OPTIONS: { value: EatSortOption; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "distance", label: "Nearest" },
  { value: "price_asc", label: "Price $→$$$$" },
];

export default function EatSortBar({
  sort,
  view,
  onSortChange,
  onViewChange,
}: {
  sort: EatSortOption;
  view: "feed" | "map";
  onSortChange: (s: EatSortOption) => void;
  onViewChange: (v: "feed" | "map") => void;
}) {
  return (
    <div className="app-shell mx-5 flex flex-col items-start justify-between gap-4 rounded-[28px] p-3 sm:flex-row sm:items-center md:mx-0">
      <div className="flex items-center gap-2 pl-4">
        <span className="text-sm font-medium text-white/45">Sort by:</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                sort === opt.value
                  ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
                  : "text-white/45 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 pr-2">
        <button
          onClick={() => onViewChange("feed")}
          className={`p-2.5 rounded-full transition-colors ${
            view === "feed"
              ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
              : "text-white/45 hover:text-white"
          }`}
          aria-label="Feed view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onViewChange("map")}
          className={`p-2.5 rounded-full transition-colors ${
            view === "map"
              ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
              : "text-white/45 hover:text-white"
          }`}
          aria-label="Map view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
