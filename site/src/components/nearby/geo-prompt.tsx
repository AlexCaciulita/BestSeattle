"use client";

import type { GeoStatus } from "@/hooks/use-geolocation";

type Props = {
  status: GeoStatus;
  onRequest: () => void;
  onFallback: () => void;
};

export default function GeoPrompt({ status, onRequest, onFallback }: Props) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Location icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">
          What&apos;s happening near you?
        </h2>
        <p className="mb-8 text-muted">
          Enable your location to discover events, restaurants, and things to do nearby.
        </p>

        {status === "requesting" ? (
          <div className="flex items-center justify-center gap-2 text-muted">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Getting your location...
          </div>
        ) : status === "denied" ? (
          <div className="space-y-4">
            <p className="text-sm text-error">
              Location access was denied. Choose a neighborhood instead:
            </p>
            <button
              onClick={onFallback}
              className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Choose a Neighborhood
            </button>
          </div>
        ) : status === "unavailable" ? (
          <div className="space-y-4">
            <p className="text-sm text-error">
              Geolocation is not available on this device.
            </p>
            <button
              onClick={onFallback}
              className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Choose a Neighborhood
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onRequest}
              className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Use My Location
            </button>
            <button
              onClick={onFallback}
              className="w-full rounded-xl border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-surface-hover"
            >
              Choose a Neighborhood
            </button>
          </div>
        )}

        <p className="mt-6 text-xs text-muted/60">
          Your location is only used for this search and is never stored.
        </p>
      </div>
    </div>
  );
}
