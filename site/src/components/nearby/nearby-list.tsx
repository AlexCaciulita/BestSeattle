"use client";

import Link from "next/link";
import Image from "next/image";
import type { NearbyResult } from "@/lib/nearby-repo";
import { formatDistance } from "@/lib/nearby-repo";
import ImagePlaceholder from "@/components/image-placeholder";

type Props = {
  items: NearbyResult[];
  activeId: number | null;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  loading: boolean;
};

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-20 w-20 shrink-0 rounded-lg bg-placeholder-bg" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 rounded bg-placeholder-bg" />
            <div className="h-3 w-1/2 rounded bg-placeholder-bg" />
            <div className="h-3 w-1/3 rounded bg-placeholder-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NearbyList({ items, activeId, onHover, onClick, loading }: Props) {
  if (loading) return <Skeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-muted/40">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p className="mb-1 text-lg font-semibold text-foreground">No results found</p>
        <p className="text-sm text-muted">Try expanding the radius or adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => {
        const thumb = item.metadata?.thumbnail_url;
        const startsAt = item.metadata?.starts_at;
        const timeStr = startsAt
          ? new Date(startsAt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : null;

        return (
          <div
            key={item.id}
            className={`flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-surface-hover ${
              activeId === item.id ? "bg-accent/5" : ""
            }`}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick(item.id)}
          >
            {/* Thumbnail */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-placeholder-bg">
              {thumb ? (
                <Image
                  src={thumb}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              ) : (
                <ImagePlaceholder itemType={item.item_type} className="rounded-lg" />
              )}
              {item.sponsored && (
                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 py-0.5 text-[8px] font-medium text-white">
                  Sponsored
                </span>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <span className="shrink-0 text-xs font-medium text-accent">
                  {formatDistance(item.distance_km)}
                </span>
              </div>

              {item.venue_name && (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.venue_name}</p>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                {item.category_slug && item.category_slug !== "other" && (
                  <span className="rounded-full bg-surface px-2 py-0.5 capitalize">
                    {item.category_slug.replace(/-/g, " ")}
                  </span>
                )}
                {timeStr && <span>{timeStr}</span>}
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                {item.price_min != null && (
                  <span className="text-xs font-medium text-foreground">
                    {item.price_min === 0
                      ? "Free"
                      : `$${item.price_min}${item.price_max && item.price_max !== item.price_min ? `–$${item.price_max}` : ""}`}
                  </span>
                )}
                {item.metadata?.booking_url && (
                  <Link
                    href={item.metadata.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-accent/90"
                  >
                    {item.item_type === "event" ? "Get Tickets" : "View"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
