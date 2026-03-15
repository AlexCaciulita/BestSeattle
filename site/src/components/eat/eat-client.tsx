"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import type { RestaurantItem, GroupedEatResults, SectionFilter } from "@/lib/eat-types";
import { useEatFilters } from "@/hooks/use-eat-filters";
import { useGeolocation } from "@/hooks/use-geolocation";
import CuisineFilterBar from "./cuisine-filter-bar";
import EatSortBar from "./eat-sort-bar";
import EatFeed from "./eat-feed";
import EatMapView from "./eat-map-view";
import EatMobileControls from "./eat-mobile-controls";

const EMPTY_GROUPED: GroupedEatResults = {
  restaurants: [],
  coffee: [],
  bars: [],
};

const SECTION_OPTIONS: { value: SectionFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "restaurants", label: "Restaurants" },
  { value: "coffee", label: "Coffee" },
  { value: "bars", label: "Bars" },
];

function SectionToggle({
  active,
  onChange,
}: {
  active: SectionFilter;
  onChange: (s: SectionFilter) => void;
}) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-5 py-3 md:px-0">
      {SECTION_OPTIONS.map((opt) => (
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

function EatClientInner() {
  const { filters, setCuisine, setSort, setView, setSection, setLocation } = useEatFilters();
  const geo = useGeolocation();
  const [grouped, setGrouped] = useState<GroupedEatResults>(EMPTY_GROUPED);
  const [loading, setLoading] = useState(true);
  const [geoRequested, setGeoRequested] = useState(false);

  // Request geolocation once
  useEffect(() => {
    if (!geoRequested && geo.status === "idle") {
      setGeoRequested(true);
      geo.request();
    }
  }, [geo, geoRequested]);

  // Update location from geolocation
  useEffect(() => {
    if (geo.status === "granted" && geo.lat && geo.lng) {
      setLocation(geo.lat, geo.lng);
    }
  }, [geo.status, geo.lat, geo.lng, setLocation]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: String(filters.lat),
        lng: String(filters.lng),
        radius: String(filters.radius),
        cuisine: filters.cuisine,
        sort: filters.sort,
        limit: "20",
      });
      const res = await fetch(`/api/eat/search?${params}`);
      const data = await res.json();
      if (data.ok) {
        setGrouped({
          restaurants: data.restaurants ?? [],
          coffee: data.coffee ?? [],
          bars: data.bars ?? [],
        });
      }
    } catch (err) {
      console.error("[eat] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.lat, filters.lng, filters.radius, filters.cuisine, filters.sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const locationLabel =
    geo.status === "granted" ? "Near You" : "Seattle Downtown";

  const showRestaurants = filters.section === "all" || filters.section === "restaurants";
  const showCoffee = filters.section === "all" || filters.section === "coffee";
  const showBars = filters.section === "all" || filters.section === "bars";

  // Items for map view respect the section filter
  const mapItems: RestaurantItem[] = [
    ...(showRestaurants ? grouped.restaurants : []),
    ...(showCoffee ? grouped.coffee : []),
    ...(showBars ? grouped.bars : []),
  ];

  const visibleHasResults =
    (showRestaurants && grouped.restaurants.length > 0) ||
    (showCoffee && grouped.coffee.length > 0) ||
    (showBars && grouped.bars.length > 0);

  // Only show cuisine chips when restaurants section is visible
  const showCuisineChips = showRestaurants;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-40 pt-4 sm:px-6 md:pb-28 md:pt-6 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="app-chip mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 md:mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
            {locationLabel}
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
          Going Out
        </h1>
      </div>

      <div className="mb-2 md:mb-4">
        <SectionToggle active={filters.section} onChange={setSection} />
      </div>

      <div className="md:hidden">
        <EatMobileControls
          cuisine={filters.cuisine}
          sort={filters.sort}
          view={filters.view}
          showCuisine={showCuisineChips}
          onCuisineChange={setCuisine}
          onSortChange={setSort}
          onViewChange={setView}
        />
      </div>

      <div className="hidden md:block">
        {showCuisineChips && (
          <div className="mb-4">
            <CuisineFilterBar active={filters.cuisine} onChange={setCuisine} />
          </div>
        )}

        <div className="mb-6">
          <EatSortBar
            sort={filters.sort}
            view={filters.view}
            onSortChange={setSort}
            onViewChange={setView}
          />
        </div>
      </div>

      {/* Content */}
      <div>
        {filters.view === "feed" ? (
          <div className="space-y-8 md:space-y-12">
            {loading ? (
              <EatFeed restaurants={[]} loading={true} />
            ) : !visibleHasResults ? (
              <EatFeed restaurants={[]} loading={false} />
            ) : (
              <>
                {showRestaurants && grouped.restaurants.length > 0 && (
                  <section>
                    {filters.section === "all" && (
                      <h2 className="mb-4 px-5 text-xl font-bold tracking-tight text-foreground md:mb-5 md:px-0 md:text-2xl">
                        Restaurants
                      </h2>
                    )}
                    <EatFeed restaurants={grouped.restaurants} loading={false} />
                  </section>
                )}
                {showCoffee && grouped.coffee.length > 0 && (
                  <section>
                    {filters.section === "all" && (
                      <h2 className="mb-4 px-5 text-xl font-bold tracking-tight text-foreground md:mb-5 md:px-0 md:text-2xl">
                        Coffee
                      </h2>
                    )}
                    <EatFeed restaurants={grouped.coffee} loading={false} />
                  </section>
                )}
                {showBars && grouped.bars.length > 0 && (
                  <section>
                    {filters.section === "all" && (
                      <h2 className="mb-4 px-5 text-xl font-bold tracking-tight text-foreground md:mb-5 md:px-0 md:text-2xl">
                        Bars
                      </h2>
                    )}
                    <EatFeed restaurants={grouped.bars} loading={false} />
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          <EatMapView
            restaurants={mapItems}
            userLat={filters.lat}
            userLng={filters.lng}
          />
        )}
      </div>
    </div>
  );
}

export default function EatClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        </div>
      }
    >
      <EatClientInner />
    </Suspense>
  );
}
