"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/items-repo";

export type FilterConfig = {
  showType?: boolean;
  showCuisine?: boolean;
  cuisineLabel?: string;
  showPrice?: boolean;
  showRating?: boolean;
  showZone?: boolean;
  /** Use canonical category_slug chips instead of raw category checkboxes */
  showCategoryChips?: boolean;
};

type Props = {
  items: Item[];
  config: FilterConfig;
  onFilter: (filtered: Item[]) => void;
  /** Pre-selected category slug from URL params */
  initialCategory?: string;
};

function priceBand(price: number | undefined): string {
  if (price == null) return "Any";
  if (price < 20) return "$";
  if (price < 50) return "$$";
  if (price < 100) return "$$$";
  return "$$$$";
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (options.length === 0) return null;

  return (
    <fieldset className="border-b border-border pb-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </legend>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={selected.has(opt)}
              onChange={() => {
                const next = new Set(selected);
                if (next.has(opt)) next.delete(opt);
                else next.add(opt);
                onChange(next);
              }}
              className="h-4 w-4 rounded border-border accent-accent"
              aria-label={opt}
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Pill-style category chips for canonical event categories */
function CategoryChips({
  categories,
  selected,
  onChange,
}: {
  categories: { slug: string; label: string; count: number }[];
  selected: string | null;
  onChange: (slug: string | null) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <fieldset className="border-b border-border pb-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        Category
      </legend>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selected === null
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onChange(selected === cat.slug ? null : cat.slug)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected === cat.slug
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {cat.label}
            <span className="ml-1 opacity-60">{cat.count}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function FilterSidebar({ items, config, onFilter, initialCategory }: Props) {
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [cuisines, setCuisines] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<string>("any");
  const [zones, setZones] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const uniqueTypes = useMemo(() => [...new Set(items.map((i) => i.item_type))].sort(), [items]);
  const uniqueCuisines = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(),
    [items],
  );
  const uniqueZones = useMemo(
    () => [...new Set(items.map((i) => i.zone).filter(Boolean))].sort(),
    [items],
  );

  // Build canonical category chips with counts
  const categoryChips = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
      const slug = item.category_slug ?? "other";
      const label = item.category_slug
        ? item.category_slug.charAt(0).toUpperCase() + item.category_slug.slice(1).replace(/-/g, " ")
        : "Other";
      const existing = counts.get(slug);
      if (existing) {
        existing.count++;
      } else {
        counts.set(slug, { label, count: 1 });
      }
    }
    return [...counts.entries()]
      .map(([slug, { label, count }]) => ({ slug, label, count }))
      .filter((c) => c.slug !== "other" || c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const priceOptions = ["$", "$$", "$$$", "$$$$"];
  const ratingOptions = ["7+", "8+", "9+"];

  useMemo(() => {
    let filtered = items;

    if (types.size > 0) {
      filtered = filtered.filter((i) => types.has(i.item_type));
    }
    if (selectedCategory) {
      filtered = filtered.filter((i) => i.category_slug === selectedCategory);
    }
    if (cuisines.size > 0) {
      filtered = filtered.filter((i) => cuisines.has(i.category));
    }
    if (prices.size > 0) {
      filtered = filtered.filter((i) => prices.has(priceBand(i.metadata?.est_price)));
    }
    if (ratings !== "any") {
      const min = parseInt(ratings);
      filtered = filtered.filter((i) => i.score != null && i.score >= min);
    }
    if (zones.size > 0) {
      filtered = filtered.filter((i) => zones.has(i.zone));
    }

    onFilter(filtered);
  }, [items, types, cuisines, prices, ratings, zones, selectedCategory, onFilter]);

  const content = (
    <div className="space-y-4">
      {config.showType && (
        <CheckboxGroup
          label="Type"
          options={uniqueTypes}
          selected={types}
          onChange={setTypes}
        />
      )}
      {config.showCategoryChips && (
        <CategoryChips
          categories={categoryChips}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}
      {config.showCuisine && !config.showCategoryChips && (
        <CheckboxGroup
          label={config.cuisineLabel ?? "Category"}
          options={uniqueCuisines}
          selected={cuisines}
          onChange={setCuisines}
        />
      )}
      {config.showPrice && (
        <CheckboxGroup
          label="Price Range"
          options={priceOptions}
          selected={prices}
          onChange={setPrices}
        />
      )}
      {config.showRating && (
        <fieldset className="border-b border-border pb-4">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Minimum Rating
          </legend>
          <div className="flex gap-2">
            {["any", ...ratingOptions].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRatings(opt === "any" ? "any" : opt.replace("+", ""))}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  (opt === "any" && ratings === "any") || opt.replace("+", "") === ratings
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-foreground"
                }`}
                aria-label={`Minimum rating ${opt}`}
              >
                {opt === "any" ? "All" : opt}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {config.showZone && (
        <CheckboxGroup
          label="Neighborhood"
          options={uniqueZones}
          selected={zones}
          onChange={setZones}
        />
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground lg:hidden"
        aria-label="Toggle filters"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="4" x2="15" y2="4" />
          <line x1="3" y1="8" x2="13" y2="8" />
          <line x1="5" y1="12" x2="11" y2="12" />
        </svg>
        Filters
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-4 lg:hidden">
          {content}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 lg:block">
        <div className="sticky top-24">{content}</div>
      </aside>
    </>
  );
}
