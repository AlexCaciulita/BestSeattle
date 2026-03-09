"use client";

import { useCallback, useMemo, useState } from "react";
import type { Item } from "@/lib/items-repo";
import type { BreadcrumbSegment } from "./breadcrumbs";
import type { FilterConfig } from "./filter-sidebar";
import Breadcrumbs from "./breadcrumbs";
import ItemCountHeader from "./item-count-header";
import ViewToggle from "./view-toggle";
import FilterSidebar from "./filter-sidebar";
import SearchBar from "./search-bar";
import ItemCard from "./item-card";

type Props = {
  items: Item[];
  breadcrumbs: BreadcrumbSegment[];
  label: string;
  filterConfig: FilterConfig;
  searchPlaceholder?: string;
  initialCategory?: string | null;
};

export default function ListingLayout({
  items,
  breadcrumbs,
  label,
  filterConfig,
  searchPlaceholder,
  initialCategory,
}: Props) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>(items);

  const handleFilter = useCallback((filtered: Item[]) => {
    setFilteredItems(filtered);
  }, []);

  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredItems;
    const q = searchQuery.toLowerCase();
    return filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.zone.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q),
    );
  }, [filteredItems, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Breadcrumbs segments={breadcrumbs} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ItemCountHeader count={displayItems.length} label={label} />
        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchBar
              placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}...`}
              onSearch={setSearchQuery}
            />
          </div>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <FilterSidebar items={items} config={filterConfig} onFilter={handleFilter} initialCategory={initialCategory ?? undefined} />

        <div className="min-w-0 flex-1">
          {displayItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {displayItems.map((item) => (
                <ItemCard key={item.id} item={item} variant={viewMode} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
              No picks match your filters. Try broadening your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
