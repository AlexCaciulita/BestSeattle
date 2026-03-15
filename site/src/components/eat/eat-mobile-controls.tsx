"use client";

import { useEffect, useId, useState } from "react";
import {
  CUISINE_OPTIONS,
  type CuisineFilter,
  type EatSortOption,
} from "@/lib/eat-types";

type MobileSheet = "none" | "cuisine" | "sort";

const SORT_OPTIONS: { value: EatSortOption; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "distance", label: "Nearest" },
  { value: "price_asc", label: "Price" },
];

const SORT_LABELS: Record<EatSortOption, string> = {
  rating: "Top Rated",
  distance: "Nearest",
  price_asc: "Price",
  price_desc: "Price",
};

const CUISINE_LABELS = Object.fromEntries(
  CUISINE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<CuisineFilter, string>;

function UtilityButton({
  title,
  value,
  onClick,
  wide = false,
}: {
  title: string;
  value: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-2 text-left transition-all duration-300 active:scale-[0.98] ${
        wide ? "min-w-0 flex-1" : "shrink-0"
      }`}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {title}
      </span>
      <span className="mt-0.5 block truncate text-[13px] font-semibold text-white">
        {value}
      </span>
    </button>
  );
}

export default function EatMobileControls({
  cuisine,
  sort,
  view,
  showCuisine,
  onCuisineChange,
  onSortChange,
  onViewChange,
}: {
  cuisine: CuisineFilter;
  sort: EatSortOption;
  view: "feed" | "map";
  showCuisine: boolean;
  onCuisineChange: (cuisine: CuisineFilter) => void;
  onSortChange: (sort: EatSortOption) => void;
  onViewChange: (view: "feed" | "map") => void;
}) {
  const [activeSheet, setActiveSheet] = useState<MobileSheet>("none");
  const titleId = useId();
  const effectiveSheet =
    !showCuisine && activeSheet === "cuisine" ? "none" : activeSheet;

  useEffect(() => {
    if (effectiveSheet === "none") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSheet("none");
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [effectiveSheet]);

  const cuisineTitle = showCuisine ? "Restaurant cuisine" : "Cuisine";
  const cuisineValue = cuisine === "all" ? "All cuisines" : CUISINE_LABELS[cuisine];
  const dialogTitle = effectiveSheet === "cuisine" ? cuisineTitle : "Sort";

  return (
    <>
      <div className="sticky top-24 z-30 -mx-4 mb-4 bg-[linear-gradient(180deg,rgba(6,8,11,0.96),rgba(6,8,11,0.86)_68%,rgba(6,8,11,0))] px-4 pb-3 pt-2 md:hidden">
        <div className="app-shell flex items-center gap-2 rounded-[24px] p-2">
          {showCuisine && (
            <UtilityButton
              title={cuisineTitle}
              value={cuisineValue}
              onClick={() => setActiveSheet("cuisine")}
              wide
            />
          )}

          <UtilityButton
            title="Sort"
            value={SORT_LABELS[sort]}
            onClick={() => setActiveSheet("sort")}
            wide
          />

          <div className="flex shrink-0 items-center gap-1 rounded-[18px] border border-white/8 bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => onViewChange("feed")}
              className={`flex h-10 w-10 items-center justify-center rounded-[14px] transition-colors ${
                view === "feed"
                  ? "bg-[#f2f3f7] text-[#0b1020] shadow-[0_10px_24px_rgba(255,255,255,0.14)]"
                  : "text-white/45"
              }`}
              aria-label="Feed view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewChange("map")}
              className={`flex h-10 w-10 items-center justify-center rounded-[14px] transition-colors ${
                view === "map"
                  ? "bg-[#f2f3f7] text-[#0b1020] shadow-[0_10px_24px_rgba(255,255,255,0.14)]"
                  : "text-white/45"
              }`}
              aria-label="Map view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {effectiveSheet !== "none" && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setActiveSheet("none")}
            aria-label="Close filter sheet"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute bottom-0 left-0 right-0 rounded-t-[32px] border border-white/10 bg-[rgba(10,13,18,0.96)] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_60px_rgba(0,0,0,0.4)]"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Going Out
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-bold text-white">
                  {dialogTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet("none")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60"
                aria-label="Close sheet"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {effectiveSheet === "cuisine" ? (
              <div>
                <p className="mb-4 text-sm text-white/50">
                  Applies to restaurant results{showCuisine ? " in the visible feed" : ""}.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onCuisineChange(option.value);
                        setActiveSheet("none");
                      }}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                        cuisine === option.value
                          ? "bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
                          : "border border-white/8 bg-white/[0.04] text-white/65"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortChange(option.value);
                      setActiveSheet("none");
                    }}
                    className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition-all ${
                      sort === option.value
                        ? "border-white/20 bg-white text-slate-950 shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
                        : "border-white/8 bg-white/[0.04] text-white"
                    }`}
                  >
                    <span className="text-base font-semibold">{option.label}</span>
                    {sort === option.value && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
