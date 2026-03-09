"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { zones } from "@/lib/zones";

type Props = {
  onSelect: (lat: number, lng: number) => void;
  isDefault: boolean;
  currentLabel?: string;
};

type Suggestion = {
  type: "zone" | "google";
  label: string;
  secondary?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

export default function LocationInput({ onSelect, isDefault, currentLabel }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateSuggestions = useCallback((q: string) => {
    const trimmed = q.trim().toLowerCase();

    // Always include matching zones
    const zoneResults: Suggestion[] = trimmed
      ? zones
          .filter(
            (z) =>
              z.label.toLowerCase().includes(trimmed) ||
              z.searchTerms.some((t) => t.toLowerCase().includes(trimmed)),
          )
          .map((z) => ({
            type: "zone" as const,
            label: z.label,
            lat: z.centerLat,
            lng: z.centerLng,
          }))
      : zones.map((z) => ({
          type: "zone" as const,
          label: z.label,
          lat: z.centerLat,
          lng: z.centerLng,
        }));

    if (!trimmed || trimmed.length < 3) {
      setSuggestions(zoneResults);
      return;
    }

    // Fetch Google autocomplete (debounced)
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nearby/autocomplete?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        const googleResults: Suggestion[] = (data.results ?? []).map(
          (r: { placeId: string; text: string; secondaryText: string }) => ({
            type: "google" as const,
            label: r.text,
            secondary: r.secondaryText,
            placeId: r.placeId,
          }),
        );

        setSuggestions([...zoneResults, ...googleResults]);
      } catch {
        setSuggestions(zoneResults);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = async (suggestion: Suggestion) => {
    setQuery(suggestion.label);
    setOpen(false);

    if (suggestion.lat != null && suggestion.lng != null) {
      onSelect(suggestion.lat, suggestion.lng);
      return;
    }

    // For Google results, fetch place details to get lat/lng
    if (suggestion.placeId) {
      try {
        const res = await fetch(`/api/nearby/place?id=${suggestion.placeId}`);
        const data = await res.json();
        if (data.ok) {
          onSelect(data.lat, data.lng);
        }
      } catch {
        console.error("Failed to fetch place details");
      }
    }
  };

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-accent">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            updateSuggestions(e.target.value);
          }}
          onFocus={() => {
            setOpen(true);
            updateSuggestions(query);
          }}
          placeholder={currentLabel ?? "Search a location..."}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          aria-label="Location search"
        />
        {loading && (
          <svg className="h-4 w-4 shrink-0 animate-spin text-muted" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
              setSuggestions([]);
            }}
            className="shrink-0 text-muted hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.placeId ?? s.label}-${i}`}
              onClick={() => handleSelect(s)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-hover"
            >
              {s.type === "zone" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-foreground">{s.label}</p>
                {s.secondary && (
                  <p className="truncate text-xs text-muted">{s.secondary}</p>
                )}
              </div>
              {s.type === "zone" && (
                <span className="shrink-0 text-[10px] text-muted">Zone</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
