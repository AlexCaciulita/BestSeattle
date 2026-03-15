export type Zone = {
  slug: string;
  label: string;
  searchTerms: string[];
  image: string;
  centerLat: number;
  centerLng: number;
};

export const zones: Zone[] = [
  {
    slug: "downtown",
    label: "Downtown / Belltown / SLU",
    searchTerms: ["Downtown", "Belltown", "SLU", "South Lake Union", "Pioneer Square", "Waterfront"],
    image: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6062,
    centerLng: -122.3321,
  },
  {
    slug: "capitol-hill",
    label: "Capitol Hill / Central District",
    searchTerms: ["Capitol Hill", "Central District"],
    image: "https://images.unsplash.com/photo-1569959220744-ff553533f492?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6145,
    centerLng: -122.3185,
  },
  {
    slug: "ballard",
    label: "Ballard / Fremont / Wallingford",
    searchTerms: ["Ballard", "Fremont", "Wallingford"],
    image: "https://images.unsplash.com/photo-1544621436-24e2cc35b6f7?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6677,
    centerLng: -122.3840,
  },
  {
    slug: "queen-anne",
    label: "Queen Anne / Magnolia",
    searchTerms: ["Queen Anne", "Magnolia", "Seattle Center"],
    image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6372,
    centerLng: -122.3571,
  },
  {
    slug: "u-district",
    label: "U District / Green Lake",
    searchTerms: ["U District", "University District", "Green Lake", "Roosevelt"],
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6614,
    centerLng: -122.3131,
  },
  {
    slug: "west-seattle",
    label: "West Seattle",
    searchTerms: ["West Seattle"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.5665,
    centerLng: -122.3876,
  },
  {
    slug: "bellevue",
    label: "Bellevue",
    searchTerms: ["Bellevue"],
    image: "https://images.unsplash.com/photo-1582407947092-89db752819a0?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6101,
    centerLng: -122.2015,
  },
  {
    slug: "redmond",
    label: "Redmond",
    searchTerms: ["Redmond"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6740,
    centerLng: -122.1215,
  },
  {
    slug: "kirkland",
    label: "Kirkland",
    searchTerms: ["Kirkland"],
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.6815,
    centerLng: -122.2087,
  },
  {
    slug: "tacoma",
    label: "Tacoma",
    searchTerms: ["Tacoma"],
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.2529,
    centerLng: -122.4443,
  },
  {
    slug: "everett",
    label: "Everett",
    searchTerms: ["Everett"],
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    centerLat: 47.9790,
    centerLng: -122.2021,
  },
];

/** Top 6 zones shown on the homepage */
export const featuredZones = zones.slice(0, 6);

/** Look up a zone by slug, with fallback */
export function getZoneBySlug(slug: string): Zone {
  return (
    zones.find((z) => z.slug === slug) ?? {
      slug,
      label: slug.replaceAll("-", " "),
      searchTerms: [slug.replaceAll("-", " ")],
      image: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=800&q=80",
      centerLat: 47.6062,
      centerLng: -122.3321,
    }
  );
}
