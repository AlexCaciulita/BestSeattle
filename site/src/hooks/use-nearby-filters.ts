"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export type NearbyFilters = {
  lat: number | null;
  lng: number | null;
  radius: number;
  categories: string[];
  types: string[];
  priceMax: number | null;
  sort: "distance" | "date" | "rating" | "relevance";
  view: "list" | "map" | "split";
};

const DEFAULTS: Omit<NearbyFilters, "lat" | "lng"> = {
  radius: 10,
  categories: [],
  types: [],
  priceMax: null,
  sort: "distance",
  view: "split",
};

export function useNearbyFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: NearbyFilters = useMemo(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    return {
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      radius: parseFloat(searchParams.get("radius") ?? String(DEFAULTS.radius)),
      categories: searchParams.get("categories")?.split(",").filter(Boolean) ?? [],
      types: searchParams.get("types")?.split(",").filter(Boolean) ?? [],
      priceMax: searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : null,
      sort: (searchParams.get("sort") ?? DEFAULTS.sort) as NearbyFilters["sort"],
      view: (searchParams.get("view") ?? DEFAULTS.view) as NearbyFilters["view"],
    };
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof NearbyFilters, value: unknown) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const setLocation = useCallback(
    (lat: number, lng: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", lat.toFixed(4));
      params.set("lng", lng.toFixed(4));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.lat) params.set("lat", String(filters.lat));
    if (filters.lng) params.set("lng", String(filters.lng));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters.lat, filters.lng, router, pathname]);

  return { filters, setFilter, setLocation, resetFilters };
}
