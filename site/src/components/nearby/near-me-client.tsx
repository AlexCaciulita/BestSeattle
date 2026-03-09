"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useNearbyFilters } from "@/hooks/use-nearby-filters";
import type { NearbyResult } from "@/lib/nearby-repo";
import NearbyFilterBar from "./nearby-filter-bar";
import NearbyList from "./nearby-list";
import LocationInput from "./location-input";

const NearbyMap = dynamic(() => import("./nearby-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-placeholder-bg">
      <p className="text-sm text-muted">Loading map...</p>
    </div>
  ),
});

// Seattle downtown default
const DEFAULT_LAT = 47.6062;
const DEFAULT_LNG = -122.3321;

function NearMeInner() {
  const geo = useGeolocation();
  const { filters, setFilter, setLocation, resetFilters } = useNearbyFilters();
  const geoRequested = useRef(false);

  const [items, setItems] = useState<NearbyResult[]>([]);
  const [facets, setFacets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");
  const [geoBanner, setGeoBanner] = useState<"asking" | "denied" | null>(null);

  // Effective coordinates: URL params > geo > Seattle default
  const lat = filters.lat ?? geo.lat ?? DEFAULT_LAT;
  const lng = filters.lng ?? geo.lng ?? DEFAULT_LNG;
  const isDefault = filters.lat == null && geo.lat == null;

  // Auto-request geolocation on mount (non-blocking)
  useEffect(() => {
    if (geoRequested.current) return;
    geoRequested.current = true;

    if (geo.status === "idle") {
      setGeoBanner("asking");
      geo.request();
    }
  }, [geo]);

  // Handle geolocation result
  useEffect(() => {
    if (geo.status === "granted" && geo.lat != null && geo.lng != null) {
      setGeoBanner(null);
      if (filters.lat == null) {
        setLocation(geo.lat, geo.lng);
      }
    } else if (geo.status === "denied" || geo.status === "unavailable") {
      setGeoBanner("denied");
    }
  }, [geo.status, geo.lat, geo.lng, filters.lat, setLocation]);

  // Fetch results whenever location or filters change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(filters.radius),
      sort: filters.sort,
      limit: "50",
    });
    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.types.length > 0) {
      params.set("types", filters.types.join(","));
    }
    if (filters.priceMax != null) {
      params.set("priceMax", String(filters.priceMax));
    }

    fetch(`/api/nearby/search?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setItems(data.items);
          setFacets(data.facets);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Nearby search failed:", err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lat, lng, filters.radius, filters.categories, filters.types, filters.priceMax, filters.sort]);

  const handleLocationSelect = useCallback(
    (newLat: number, newLng: number) => {
      geo.setManual(newLat, newLng);
      setLocation(newLat, newLng);
      setGeoBanner(null);
    },
    [geo, setLocation],
  );

  const handleItemClick = useCallback((id: number) => {
    setActiveId(id);
    window.open(`/item/${id}`, "_blank");
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top bar: location input + geo banner */}
      <div className="border-b border-border bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <LocationInput
            onSelect={handleLocationSelect}
            isDefault={isDefault}
            currentLabel={isDefault ? "Seattle Downtown" : undefined}
          />
          {geoBanner === "asking" && (
            <span className="shrink-0 text-xs text-muted animate-pulse">
              Requesting your location...
            </span>
          )}
          {geoBanner === "denied" && (
            <span className="shrink-0 text-xs text-muted">
              Location denied — type a location above
            </span>
          )}
          {!isDefault && (
            <button
              onClick={() => geo.request()}
              className="shrink-0 rounded-md bg-surface px-2 py-1 text-xs text-accent hover:bg-surface-hover"
              title="Use my current location"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-1">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
              My location
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <NearbyFilterBar
        filters={filters}
        facets={facets}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />

      {/* Mobile tab toggle */}
      <div className="flex border-b border-border lg:hidden">
        <button
          onClick={() => setMobileTab("map")}
          className={`flex-1 py-2 text-center text-sm font-medium ${
            mobileTab === "map" ? "border-b-2 border-accent text-accent" : "text-muted"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 text-center text-sm font-medium ${
            mobileTab === "list" ? "border-b-2 border-accent text-accent" : "text-muted"
          }`}
        >
          List ({items.length})
        </button>
      </div>

      {/* Split layout: map LEFT, list RIGHT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map panel (left) */}
        <div
          className={`w-full lg:block lg:w-1/2 ${
            mobileTab === "map" ? "block" : "hidden"
          }`}
        >
          <NearbyMap
            items={items}
            userLat={lat}
            userLng={lng}
            activeId={activeId}
            onMarkerClick={handleItemClick}
            onMarkerHover={setActiveId}
          />
        </div>

        {/* List panel (right) */}
        <div
          className={`w-full overflow-y-auto border-l border-border lg:block lg:w-1/2 ${
            mobileTab === "list" ? "block" : "hidden"
          }`}
        >
          <div className="px-4 py-2 text-xs text-muted">
            {loading ? "Searching..." : `${items.length} results nearby`}
          </div>
          <NearbyList
            items={items}
            activeId={activeId}
            onHover={setActiveId}
            onClick={handleItemClick}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default function NearMeClient() {
  return (
    <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><p className="text-muted">Loading...</p></div>}>
      <NearMeInner />
    </Suspense>
  );
}
