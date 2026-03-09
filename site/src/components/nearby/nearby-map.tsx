"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const eventIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#e11d48"/>
      <circle cx="14" cy="13" r="5" fill="white"/>
    </svg>
  `),
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

const activeIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#f59e0b"/>
      <circle cx="16" cy="15" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

const sponsoredIcon = new L.Icon({
  iconUrl: "data:image/svg+xml," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#8b5cf6"/>
      <circle cx="14" cy="13" r="5" fill="white"/>
    </svg>
  `),
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

function FitBounds({ items, userLat, userLng }: { items: NearbyResult[]; userLat: number; userLng: number }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (items.length === 0 || fitted.current) return;
    const bounds = L.latLngBounds([[userLat, userLng]]);
    items.forEach((item) => {
      if (item.lat != null && item.lng != null) {
        bounds.extend([item.lat, item.lng]);
      }
    });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    fitted.current = true;
  }, [items, userLat, userLng, map]);

  // Reset fitted flag when items change significantly
  useEffect(() => {
    fitted.current = false;
  }, [items.length]);

  return null;
}

export default function NearbyMap({ items, userLat, userLng, activeId, onMarkerClick, onMarkerHover }: Props) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds items={items} userLat={userLat} userLng={userLng} />

      {/* User location marker */}
      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Item markers */}
      {items.map((item) => {
        if (item.lat == null || item.lng == null) return null;

        const isActive = item.id === activeId;
        const icon = isActive
          ? activeIcon
          : item.sponsored
            ? sponsoredIcon
            : eventIcon;

        return (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick(item.id),
              mouseover: () => onMarkerHover(item.id),
              mouseout: () => onMarkerHover(null),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.venue_name && (
                  <p className="text-xs text-gray-500">{item.venue_name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formatDistance(item.distance_km)}
                  {item.category_slug && item.category_slug !== "other" && (
                    <> &middot; {item.category_slug.replace(/-/g, " ")}</>
                  )}
                </p>
                {item.price_min != null && (
                  <p className="mt-1 text-xs font-medium">
                    {item.price_min === 0 ? "Free" : `From $${item.price_min}`}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
