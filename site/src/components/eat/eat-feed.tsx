"use client";

import type { RestaurantItem } from "@/lib/eat-types";
import RestaurantCard from "./restaurant-card";

function Skeleton() {
  return (
    <div className="app-panel animate-pulse rounded-[32px] p-2">
      <div className="aspect-[16/9] rounded-[24px] bg-white/[0.06]" />
      <div className="space-y-3 p-5">
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-full bg-white/[0.06]" />
          <div className="h-7 w-12 rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-4 w-32 rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default function EatFeed({
  restaurants,
  loading,
}: {
  restaurants: RestaurantItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 px-5 md:grid-cols-2 md:px-0 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="app-panel mx-5 rounded-[32px] py-20 text-center md:mx-0">
        <svg className="mx-auto h-10 w-10 text-white/20" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <h3 className="mb-2 mt-4 text-xl font-bold text-foreground">No restaurants found</h3>
        <p className="font-medium text-muted">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-5 md:grid-cols-2 md:px-0 lg:grid-cols-3">
      {restaurants.map((r, i) => (
        <RestaurantCard key={r.id} restaurant={r} priority={i < 2} />
      ))}
    </div>
  );
}
