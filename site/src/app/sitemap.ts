import type { MetadataRoute } from "next";

const BASE = "https://bestinseattle.com";

const zones = [
  "capitol-hill", "ballard", "fremont", "queen-anne", "west-seattle",
  "bellevue", "redmond", "kirkland", "tacoma", "everett", "downtown",
];

const bestOf = ["restaurants", "coffee", "date-night", "family", "nightlife", "outdoors"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/tonight`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${BASE}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/zones`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/best-of`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/plans`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const zonePages: MetadataRoute.Sitemap = zones.map((z) => ({
    url: `${BASE}/zones/${z}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  const bestOfPages: MetadataRoute.Sitemap = bestOf.map((c) => ({
    url: `${BASE}/best-of/${c}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticPages, ...zonePages, ...bestOfPages];
}
