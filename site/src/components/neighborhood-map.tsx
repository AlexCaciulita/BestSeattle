"use client";

import { useState } from "react";
import Link from "next/link";

type MapZone = {
  slug: string;
  label: string;
  eventCount: number;
};

// Stylized Seattle neighborhood positions (relative to SVG viewBox)
const ZONE_POSITIONS: Record<
  string,
  { x: number; y: number; rx: number; ry: number }
> = {
  "u-district": { x: 320, y: 60, rx: 50, ry: 30 },
  ballard: { x: 160, y: 80, rx: 55, ry: 32 },
  "queen-anne": { x: 230, y: 170, rx: 50, ry: 35 },
  "capitol-hill": { x: 340, y: 200, rx: 52, ry: 30 },
  downtown: { x: 250, y: 270, rx: 60, ry: 38 },
  "west-seattle": { x: 150, y: 360, rx: 55, ry: 32 },
};

export default function NeighborhoodMap({ zones }: { zones: MapZone[] }) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zoneMap = new Map(zones.map((z) => [z.slug, z]));

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <svg
        viewBox="0 0 500 440"
        className="w-full"
        style={{ filter: "drop-shadow(0 0 60px rgba(212,175,55,0.03))" }}
      >
        <defs>
          {/* Glow filter for hovered zones */}
          <filter id="zone-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#d4af37" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse animation for active zones */}
          <filter id="zone-pulse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.15" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Water / Puget Sound */}
        <ellipse
          cx="60"
          cy="250"
          rx="80"
          ry="200"
          fill="#0a1628"
          opacity="0.4"
        />

        {/* Lake Union */}
        <ellipse cx="260" cy="130" rx="40" ry="25" fill="#0a1628" opacity="0.3" />

        {/* Connection lines between neighborhoods */}
        <g opacity="0.08" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="4 4">
          <line x1="250" y1="270" x2="340" y2="200" />
          <line x1="250" y1="270" x2="230" y2="170" />
          <line x1="340" y1="200" x2="320" y2="60" />
          <line x1="230" y1="170" x2="160" y2="80" />
          <line x1="250" y1="270" x2="150" y2="360" />
        </g>

        {/* Zones */}
        {Object.entries(ZONE_POSITIONS).map(([slug, pos]) => {
          const zone = zoneMap.get(slug);
          const isHovered = hoveredZone === slug;
          const count = zone?.eventCount ?? 0;
          const hasEvents = count > 0;

          return (
            <Link key={slug} href={`/zones/${slug}`}>
              <g
                onMouseEnter={() => setHoveredZone(slug)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
                filter={isHovered ? "url(#zone-glow)" : undefined}
              >
                {/* Ambient pulse for zones with events */}
                {hasEvents && !isHovered && (
                  <ellipse
                    cx={pos.x}
                    cy={pos.y}
                    rx={pos.rx + 4}
                    ry={pos.ry + 3}
                    fill="#d4af37"
                    opacity="0.03"
                    className="animate-pulse"
                  />
                )}

                {/* Zone shape */}
                <ellipse
                  cx={pos.x}
                  cy={pos.y}
                  rx={pos.rx}
                  ry={pos.ry}
                  fill={isHovered ? "#d4af37" : hasEvents ? "#151510" : "#111"}
                  fillOpacity={isHovered ? 0.2 : 0.8}
                  stroke={isHovered ? "#d4af37" : hasEvents ? "#2a2510" : "#1a1a1a"}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  className="transition-all duration-500"
                />

                {/* Zone label */}
                <text
                  x={pos.x}
                  y={count > 0 ? pos.y - 6 : pos.y + 1}
                  textAnchor="middle"
                  fill={isHovered ? "#d4af37" : hasEvents ? "#888" : "#555"}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Sora, sans-serif"
                  letterSpacing="0.5"
                  className="pointer-events-none select-none transition-all duration-300"
                >
                  {zone?.label.split(" /")[0] ?? slug}
                </text>

                {/* Event count */}
                {count > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 10}
                    textAnchor="middle"
                    fill={isHovered ? "#d4af37" : "#555"}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {count} {count === 1 ? "event" : "events"}
                  </text>
                )}
              </g>
            </Link>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredZone && zoneMap.get(hoveredZone) && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-[#d4af37]/20 bg-[#0a0a0a]/95 px-4 py-2.5 shadow-xl shadow-black/50 backdrop-blur-xl">
          <p className="text-[12px] font-semibold text-[#d4af37]">
            {zoneMap.get(hoveredZone)!.label}
          </p>
          <p className="font-mono text-[11px] text-[#666]">
            {zoneMap.get(hoveredZone)!.eventCount} events this week
          </p>
        </div>
      )}
    </div>
  );
}
