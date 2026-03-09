"use client";

import { useState, useCallback, useEffect } from "react";

export type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

type GeoState = {
  lat: number | null;
  lng: number | null;
  status: GeoStatus;
  error: string | null;
};

const STORAGE_KEY = "bis_geo";

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    status: "idle",
    error: null,
  });

  // Restore cached coordinates on mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { lat, lng } = JSON.parse(cached);
        if (typeof lat === "number" && typeof lng === "number") {
          setState({ lat, lng, status: "granted", error: null });
        }
      }
    } catch {}
  }, []);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: "unavailable", error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
        setState({ lat, lng, status: "granted", error: null });
      },
      (err) => {
        const status: GeoStatus = err.code === 1 ? "denied" : "unavailable";
        setState((s) => ({ ...s, status, error: err.message }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const setManual = useCallback((lat: number, lng: number) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
    setState({ lat, lng, status: "granted", error: null });
  }, []);

  return { ...state, request, setManual };
}
