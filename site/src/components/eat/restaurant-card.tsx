import Image from "next/image";
import type { RestaurantItem } from "@/lib/eat-types";

function formatDistance(km: number | null): string {
  if (km == null) return "";
  const mi = km * 0.621371;
  if (mi < 0.1) return "< 0.1 mi";
  return `${mi.toFixed(1)} mi`;
}

export default function RestaurantCard({
  restaurant,
  priority = false,
}: {
  restaurant: RestaurantItem;
  priority?: boolean;
}) {
  const photoUrl = restaurant.photoRef
    ? `/api/eat/photo?ref=${encodeURIComponent(restaurant.photoRef)}&w=800`
    : null;

  const dist = formatDistance(restaurant.distanceKm);

  return (
    <a
      href={restaurant.googleMapsUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-2 shadow-[var(--panel-shadow)] transition-all duration-500 hover:-translate-y-1.5 hover:border-white/16"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-[24px]">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={restaurant.name}
            fill
            unoptimized
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-placeholder-bg">
            <svg className="h-8 w-8 text-white/20" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-transparent" />

        {restaurant.isOpen != null && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 shadow-lg backdrop-blur-xl">
            <span
              className={`h-2 w-2 rounded-full ${
                restaurant.isOpen ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-bold tracking-tight text-white">
              {restaurant.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        )}

        <div className="absolute right-4 top-4 flex items-center gap-3 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-white/55 shadow-lg backdrop-blur-xl">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white leading-tight line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/55">
            {restaurant.address}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-white/75">
              {restaurant.cuisine}
            </span>

            {restaurant.priceLevel && (
              <>
                <span className="text-white/18">&bull;</span>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-white/55">
                  {restaurant.priceLevel}
                </span>
              </>
            )}
          </div>

          {restaurant.rating != null && (
            <div className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-sm font-bold text-slate-950 shadow-[0_8px_20px_rgba(255,255,255,0.12)]">
              {restaurant.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm font-medium text-muted">
          <div className="flex items-center">
            <svg className="mr-1.5 h-4 w-4 shrink-0 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
            </svg>
            {restaurant.reviewCount != null && (
              <span className="text-white/40">{restaurant.reviewCount.toLocaleString()} reviews</span>
            )}
          </div>
          {dist && (
            <span className="text-xs text-white/40">{dist}</span>
          )}
        </div>
      </div>
    </a>
  );
}
