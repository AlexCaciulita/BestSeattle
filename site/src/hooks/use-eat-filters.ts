"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { CuisineFilter, EatSortOption, SectionFilter } from "@/lib/eat-types";

export type EatFilters = {
  lat: number;
  lng: number;
  cuisine: CuisineFilter;
  sort: EatSortOption;
  view: "feed" | "map";
  radius: number;
  section: SectionFilter;
};

const DEFAULTS: EatFilters = {
  lat: 47.6062,
  lng: -122.3321,
  cuisine: "all",
  sort: "rating",
  view: "feed",
  radius: 10000,
  section: "all",
};

export function useEatFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: EatFilters = {
    lat: parseFloat(searchParams.get("lat") ?? "") || DEFAULTS.lat,
    lng: parseFloat(searchParams.get("lng") ?? "") || DEFAULTS.lng,
    cuisine: (searchParams.get("cuisine") as CuisineFilter) || DEFAULTS.cuisine,
    sort: (searchParams.get("sort") as EatSortOption) || DEFAULTS.sort,
    view: (searchParams.get("view") as "feed" | "map") || DEFAULTS.view,
    radius: parseInt(searchParams.get("radius") ?? "", 10) || DEFAULTS.radius,
    section: (searchParams.get("section") as SectionFilter) || DEFAULTS.section,
  };

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === String((DEFAULTS as Record<string, unknown>)[key])) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const setCuisine = useCallback(
    (c: CuisineFilter) => setFilter("cuisine", c),
    [setFilter],
  );
  const setSort = useCallback(
    (s: EatSortOption) => setFilter("sort", s),
    [setFilter],
  );
  const setView = useCallback(
    (v: "feed" | "map") => setFilter("view", v),
    [setFilter],
  );
  const setSection = useCallback(
    (s: SectionFilter) => setFilter("section", s),
    [setFilter],
  );
  const setLocation = useCallback(
    (lat: number, lng: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", lat.toFixed(6));
      params.set("lng", lng.toFixed(6));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return { filters, setCuisine, setSort, setView, setSection, setLocation };
}
