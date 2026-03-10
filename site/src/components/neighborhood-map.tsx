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
        style={{ filter: "drop-shadow(0 0 40px rgba(212,175,55,0.05))" }}
      >
        {/* Water / Puget Sound */}
        <ellipse
          cx="60"
          cy="250"
          rx="80"
          ry="200"
          fill="#0a1628"
          opacity="0.5"
        />

        {/* Lake Union */}
        <ellipse cx="260" cy="130" rx="40" ry="25" fill="#0a1628" opacity="0.4" />

        {/* Zones */}
        {Object.entries(ZONE_POSITIONS).map(([slug, pos]) => {
          const zone = zoneMap.get(slug);
          const isHovered = hoveredZone === slug;
          const count = zone?.eventCount ?? 0;

          return (
            <Link key={slug} href={`/zones/${slug}`}>
              <g
                onMouseEnter={() => setHoveredZone(slug)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
              >
                {/* Glow pulse on hover */}
                {isHovered && (
                  <ellipse
                    cx={pos.x}
                    cy={pos.y}
                    rx={pos.rx + 8}
                    ry={pos.ry + 6}
                    fill="#d4af37"
                    opacity="0.08"
                    className="animate-pulse"
                  />
                )}

                {/* Zone shape */}
                <ellipse
                  cx={pos.x}
                  cy={pos.y}
                  rx={pos.rx}
                  ry={pos.ry}
                  fill={isHovered ? "#d4af37" : "#1a1a1a"}
                  fillOpacity={isHovered ? 0.2 : 0.6}
                  stroke={isHovered ? "#d4af37" : "#333"}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  className="transition-all duration-300"
                />

                {/* Zone label */}
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  fill={isHovered ? "#d4af37" : "#888"}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Sora, sans-serif"
                  className="transition-all duration-300 pointer-events-none select-none"
                >
                  {zone?.label.split(" /")[0] ?? slug}
                </text>

                {/* Event count badge */}
                {count > 0 && (
                  <>
                    <rect
                      x={pos.x - 12}
                      y={pos.y + 8}
                      width="24"
                      height="14"
                      rx="7"
                      fill={isHovered ? "#d4af37" : "#222"}
                      className="transition-all duration-300"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 18}
                      textAnchor="middle"
                      fill={isHovered ? "#000" : "#888"}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="Sora, sans-serif"
                      className="pointer-events-none select-none"
                    >
                      {count}
                    </text>
                  </>
                )}
              </g>
            </Link>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredZone && zoneMap.get(hoveredZone) && (
        <div className="pointer-events-none absolute left-1/2 bottom-4 -translate-x-1/2 rounded-lg border border-[#d4af37]/30 bg-[#111]/95 px-4 py-2 backdrop-blur-md">
          <p className="text-[12px] font-semibold text-[#d4af37]">
            {zoneMap.get(hoveredZone)!.label}
          </p>
          <p className="text-[11px] text-[#888]">
            {zoneMap.get(hoveredZone)!.eventCount} events this week
          </p>
        </div>
      )}
    </div>
  );
}
