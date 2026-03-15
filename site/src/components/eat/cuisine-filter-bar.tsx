"use client";

import { CUISINE_OPTIONS, type CuisineFilter } from "@/lib/eat-types";

export default function CuisineFilterBar({
  active,
  onChange,
}: {
  active: CuisineFilter;
  onChange: (c: CuisineFilter) => void;
}) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-5 py-3 md:px-0">
      {CUISINE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${
            active === opt.value
              ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
              : "border border-white/8 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
