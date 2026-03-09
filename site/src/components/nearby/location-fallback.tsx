"use client";

import { zones } from "@/lib/zones";

type Props = {
  onSelect: (lat: number, lng: number, label: string) => void;
  onBack: () => void;
};

export default function LocationFallback({ onSelect, onBack }: Props) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h2 className="mb-1 text-xl font-bold text-foreground">
          Choose a Neighborhood
        </h2>
        <p className="mb-6 text-sm text-muted">
          Select a neighborhood to see what&apos;s happening nearby.
        </p>

        <div className="grid grid-cols-1 gap-2">
          {zones.map((zone) => (
            <button
              key={zone.slug}
              onClick={() => onSelect(zone.centerLat, zone.centerLng, zone.label)}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-surface-hover"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
              </svg>
              <span className="font-medium text-foreground">{zone.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
