"use client";

import { EVENT_CATEGORIES } from "@/lib/event-categories";
import type { NearbyFilters } from "@/hooks/use-nearby-filters";

type Props = {
  filters: NearbyFilters;
  facets: Record<string, number>;
  onFilterChange: (key: keyof NearbyFilters, value: unknown) => void;
  onReset: () => void;
};

const RADIUS_OPTIONS = [
  { label: "1 mi", km: 1.6 },
  { label: "3 mi", km: 4.8 },
  { label: "5 mi", km: 8 },
  { label: "10 mi", km: 16 },
  { label: "20 mi", km: 32 },
];

const SORT_OPTIONS: { label: string; value: NearbyFilters["sort"] }[] = [
  { label: "Distance", value: "distance" },
  { label: "Date", value: "date" },
  { label: "Rating", value: "rating" },
  { label: "Relevance", value: "relevance" },
];

export default function NearbyFilterBar({ filters, facets, onFilterChange, onReset }: Props) {
  const activeCategories = new Set(filters.categories);

  const toggleCategory = (slug: string) => {
    const next = new Set(activeCategories);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onFilterChange("categories", [...next]);
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.priceMax !== null || filters.sort !== "distance";

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Top row: radius + sort + reset */}
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-2 no-scrollbar">
        {/* Radius */}
        <div className="flex shrink-0 items-center gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.km}
              onClick={() => onFilterChange("radius", r.km)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                Math.abs(filters.radius - r.km) < 0.5
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px shrink-0 bg-border" />

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange("sort", e.target.value)}
          className="shrink-0 rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="shrink-0 text-xs text-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2 no-scrollbar">
        <button
          onClick={() => onFilterChange("categories", [])}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategories.size === 0
              ? "bg-accent text-white"
              : "bg-surface text-muted hover:bg-surface-hover"
          }`}
        >
          All
        </button>
        {EVENT_CATEGORIES.filter((c) => c.slug !== "other").map((cat) => {
          const count = facets[cat.slug] ?? 0;
          return (
            <button
              key={cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategories.has(cat.slug)
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {cat.label}
              {count > 0 && (
                <span className="ml-1 opacity-60">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
