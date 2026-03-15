"use client";

import { useEffect, useRef, useState } from "react";
import type { NearbyResult } from "@/lib/nearby-repo";
import { formatDistance } from "@/lib/nearby-repo";

type Props = {
  items: NearbyResult[];
  userLat: number;
  userLng: number;
  activeId: number | null;
  onMarkerClick: (id: number) => void;
  onMarkerHover: (id: number | null) => void;
};

type MarkerEntry = {
  marker: google.maps.Marker;
  item: NearbyResult;
};

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
    if ((window as unknown as { google?: typeof google }).google?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
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

function escapeHtml(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildInfoContent(item: NearbyResult): string {
  const title = escapeHtml(item.title);
  const venue = escapeHtml(item.venue_name);
  const category =
    item.category_slug && item.category_slug !== "other"
      ? escapeHtml(item.category_slug.replace(/-/g, " "))
      : "";
  const price =
    item.price_min == null
      ? ""
      : item.price_min === 0
        ? "Free"
        : `$${item.price_min}${item.price_max && item.price_max !== item.price_min ? `–$${item.price_max}` : ""}`;

  return `<div style="min-width:180px;font-family:Inter,system-ui,sans-serif;font-size:12px;line-height:1.5;padding:4px 0">
    <strong style="display:block;font-size:14px;color:#0f172a">${title}</strong>
    ${venue ? `<span style="color:#64748b">${venue}</span><br/>` : ""}
    <span style="color:#64748b">${formatDistance(item.distance_km)}${category ? ` · ${category}` : ""}</span>
    ${price ? `<div style="margin-top:4px;font-weight:600;color:#0f172a">${escapeHtml(price)}</div>` : ""}
  </div>`;
}

function createUserIcon(google: typeof globalThis.google): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: "#ffffff",
    fillOpacity: 1,
    strokeColor: "#60a5fa",
    strokeWeight: 3,
  };
}

function createItemIcon(google: typeof globalThis.google, variant: "default" | "sponsored" | "active"): google.maps.Symbol {
  if (variant === "active") {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#f5f5f7",
      fillOpacity: 1,
      strokeColor: "#0b0f14",
      strokeWeight: 3,
    };
  }

  if (variant === "sponsored") {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#8b5cf6",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: "#e11d48",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };
}

export default function NearbyMap({
  items,
  userLat,
  userLng,
  activeId,
  onMarkerClick,
  onMarkerHover,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, MarkerEntry>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

    if (apiKey) {
      loadGoogleMaps(apiKey)
        .then(() => setLoaded(true))
        .catch((err) => {
          console.error("[nearby-map] Google Maps failed to load", err);
          setLoadError("Google Maps could not load. Check your Maps JavaScript API key.");
        });
      return;
    }

    fetch("/api/nearby/maps-key")
      .then((r) => r.json())
      .then((data) => {
        if (data.key) return loadGoogleMaps(data.key);
        throw new Error("Missing Google Maps browser key");
      })
      .then(() => setLoaded(true))
      .catch((err) => {
        console.error("[nearby-map] Google Maps failed to load", err);
        setLoadError("Set NEXT_PUBLIC_GOOGLE_MAPS_KEY or GOOGLE_MAPS_BROWSER_KEY with Maps JavaScript API enabled.");
      });
  }, []);

  useEffect(() => {
    const google = (window as unknown as { google?: typeof globalThis.google }).google;

    if (!loaded || !mapRef.current || !google?.maps || mapInstance.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: userLat, lng: userLng },
      zoom: 12,
      backgroundColor: "#0b0f14",
      disableDefaultUI: true,
      clickableIcons: false,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      styles: DARK_MAP_STYLE,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [loaded, userLat, userLng]);

  useEffect(() => {
    const google = (window as unknown as { google?: typeof globalThis.google }).google;
    const map = mapInstance.current;

    if (!loaded || !google?.maps || !map) return;

    infoWindowRef.current?.close();

    if (userMarkerRef.current) {
      google.maps.event.clearInstanceListeners(userMarkerRef.current);
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    markersRef.current.forEach(({ marker }) => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current.clear();

    userMarkerRef.current = new google.maps.Marker({
      map,
      position: { lat: userLat, lng: userLng },
      title: "You are here",
      icon: createUserIcon(google),
      zIndex: 1000,
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLat, lng: userLng });

    items.forEach((item) => {
      if (item.lat == null || item.lng == null) return;

      const variant = item.sponsored ? "sponsored" : "default";
      const marker = new google.maps.Marker({
        map,
        position: { lat: item.lat, lng: item.lng },
        title: item.title,
        icon: createItemIcon(google, variant),
        zIndex: item.sponsored ? 150 : 100,
      });

      const content = buildInfoContent(item);

      marker.addListener("click", () => {
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(map, marker);
        onMarkerClick(item.id);
      });

      marker.addListener("mouseover", () => {
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(map, marker);
        onMarkerHover(item.id);
      });

      marker.addListener("mouseout", () => {
        infoWindowRef.current?.close();
        onMarkerHover(null);
      });

      markersRef.current.set(item.id, { marker, item });
      bounds.extend({ lat: item.lat, lng: item.lng });
    });

    if (items.length > 0) {
      map.fitBounds(bounds, 56);
    } else {
      map.setCenter({ lat: userLat, lng: userLng });
      map.setZoom(13);
    }
  }, [loaded, items, userLat, userLng, onMarkerClick, onMarkerHover]);

  useEffect(() => {
    const google = (window as unknown as { google?: typeof globalThis.google }).google;
    const map = mapInstance.current;

    if (!loaded || !google?.maps || !map) return;

    markersRef.current.forEach(({ marker, item }) => {
      const variant = item.id === activeId ? "active" : item.sponsored ? "sponsored" : "default";
      marker.setIcon(createItemIcon(google, variant));
      marker.setZIndex(item.id === activeId ? 200 : item.sponsored ? 150 : 100);
    });

    if (activeId == null) {
      infoWindowRef.current?.close();
      return;
    }

    const activeMarker = markersRef.current.get(activeId);
    if (activeMarker) {
      infoWindowRef.current?.setContent(buildInfoContent(activeMarker.item));
      infoWindowRef.current?.open(map, activeMarker.marker);
    }
  }, [loaded, activeId]);

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-placeholder-bg px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-foreground">Google Maps unavailable</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-full w-full bg-placeholder-bg" />;
}
