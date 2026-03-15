"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RestaurantItem } from "@/lib/eat-types";
import RestaurantCard from "./restaurant-card";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7b8794" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1f2937" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#10151d" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1b2430" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b0f14" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#243041" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#111827" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a2238" }] },
];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

function isInBounds(lat: number, lng: number, bounds: Bounds): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export default function EatMapView({
  restaurants,
  userLat,
  userLng,
}: {
  restaurants: RestaurantItem[];
  userLat: number;
  userLng: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const boundsListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleBounds, setVisibleBounds] = useState<Bounds | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const updateBounds = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    const ne = b.getNorthEast();
    const sw = b.getSouthWest();
    setVisibleBounds({
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    });
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
    if (!apiKey) {
      fetch("/api/eat/maps-key")
        .then((r) => r.json())
        .then((d) => {
          if (d.key) return loadGoogleMaps(d.key);
          throw new Error("Missing Google Maps browser key");
        })
        .then(() => setLoaded(true))
        .catch((err) => {
          console.error("[eat-map] Google Maps failed to load", err);
          setLoadError("Set NEXT_PUBLIC_GOOGLE_MAPS_KEY or GOOGLE_MAPS_BROWSER_KEY with Maps JavaScript API enabled.");
        });
      return;
    }
    loadGoogleMaps(apiKey)
      .then(() => setLoaded(true))
      .catch((err) => {
        console.error("[eat-map] Google Maps failed to load", err);
        setLoadError("Google Maps could not load. Check your Maps JavaScript API key.");
      });
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google?.maps) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: userLat, lng: userLng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        styles: DARK_MAP_STYLE,
      });
      infoWindowRef.current = new google.maps.InfoWindow();

      // Listen for bounds changes (zoom, pan)
      boundsListenerRef.current = mapInstance.current.addListener("idle", updateBounds);
    } else {
      mapInstance.current.setCenter({ lat: userLat, lng: userLng });
    }

    const map = mapInstance.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // User location
    const userMarker = new google.maps.Marker({
      map,
      position: { lat: userLat, lng: userLng },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#ffffff",
        fillOpacity: 1,
        strokeColor: "#60a5fa",
        strokeWeight: 3,
      },
      zIndex: 1000,
    });
    markersRef.current.push(userMarker);

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLat, lng: userLng });

    restaurants.forEach((r) => {
      const color = r.isOpen === false ? "#ef4444" : "#10b981";

      const marker = new google.maps.Marker({
        map,
        position: { lat: r.lat, lng: r.lng },
        title: r.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setHighlightedId(r.id);
        const ratingStr = r.rating ? `${r.rating.toFixed(1)} ★` : "";
        const priceStr = r.priceLevel || "";
        const openStr =
          r.isOpen === true
            ? '<span style="color:#22c55e;font-weight:600">Open</span>'
            : r.isOpen === false
              ? '<span style="color:#ef4444;font-weight:600">Closed</span>'
              : "";

        infoWindowRef.current?.setContent(
          `<div style="font-family:Inter,system-ui;font-size:12px;line-height:1.5;padding:4px 0">
            <strong style="font-size:14px;color:#0f172a">${r.name}</strong><br/>
            <span style="color:#64748b">${r.cuisine}</span>
            ${ratingStr ? ` · ${ratingStr}` : ""}
            ${priceStr ? ` · ${priceStr}` : ""}
            ${openStr ? `<br/>${openStr}` : ""}
          </div>`,
        );
        infoWindowRef.current?.open(map, marker);
      });

      bounds.extend({ lat: r.lat, lng: r.lng });
      markersRef.current.push(marker);
    });

    if (restaurants.length > 0) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [loaded, restaurants, userLat, userLng, updateBounds]);

  // Clean up bounds listener
  useEffect(() => {
    return () => {
      boundsListenerRef.current?.remove();
    };
  }, []);

  const visibleRestaurants = visibleBounds
    ? restaurants.filter((r) => isInBounds(r.lat, r.lng, visibleBounds))
    : restaurants;

  if (!loaded) {
    return (
      <div className="app-panel mx-5 flex h-[60vh] items-center justify-center rounded-[32px] md:mx-0 md:h-[70vh]">
        {loadError ? (
          <div className="px-6 text-center">
            <p className="text-sm font-semibold text-foreground">Google Maps unavailable</p>
            <p className="mt-2 max-w-sm text-sm text-muted">{loadError}</p>
          </div>
        ) : (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        )}
      </div>
    );
  }

  return (
    <div className="mx-5 flex flex-col gap-4 md:mx-0 lg:flex-row lg:gap-0">
      {/* Map */}
      <div className="overflow-hidden rounded-[32px] border border-white/10 shadow-[var(--panel-shadow)] lg:flex-1">
        <div ref={mapRef} className="h-[50vh] w-full lg:h-[75vh]" />
      </div>

      {/* Side list */}
      <div className="hide-scrollbar flex flex-col gap-4 lg:ml-4 lg:h-[75vh] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-white/50">
            {visibleRestaurants.length} place{visibleRestaurants.length !== 1 ? "s" : ""} in view
          </span>
        </div>

        {visibleRestaurants.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.03] py-16 text-center">
            <p className="text-sm font-medium text-white/40">
              Zoom out or pan to see places
            </p>
          </div>
        ) : (
          visibleRestaurants.map((r) => (
            <div
              key={r.id}
              className={`transition-all duration-300 ${
                highlightedId === r.id
                  ? "ring-2 ring-white/30 rounded-[32px]"
                  : ""
              }`}
            >
              <RestaurantCard restaurant={r} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
