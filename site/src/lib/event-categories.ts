/**
 * Canonical event category taxonomy — single source of truth.
 *
 * Every imported event gets mapped to one of these canonical categories.
 * Used by the normalization pipeline, filter UI, and DB queries.
 */

export type EventCategory = {
  slug: string;
  label: string;
  /** Keywords used for title/description fallback classification */
  keywords: string[];
  /** High-quality fallback image URL (Unsplash) */
  fallbackImage: string;
  /** Emoji icon for category pills */
  emoji: string;
};

export const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=1200&q=80";

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    slug: "concerts",
    label: "Concerts",
    keywords: ["concert", "live music", "tour", "album release", "band", "gig", "dj set"],
    fallbackImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎵",
  },
  {
    slug: "theatre",
    label: "Theatre",
    keywords: ["theatre", "theater", "play", "musical", "broadway", "opera", "ballet", "performing arts"],
    fallbackImage: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎭",
  },
  {
    slug: "sports",
    label: "Sports",
    keywords: ["game", "match", "vs.", "tournament", "championship", "league", "ballpark", "stadium"],
    fallbackImage: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=80",
    emoji: "🏟",
  },
  {
    slug: "comedy",
    label: "Comedy",
    keywords: ["comedy", "stand-up", "standup", "comedian", "improv", "open mic comedy", "roast"],
    fallbackImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
    emoji: "😂",
  },
  {
    slug: "festivals",
    label: "Festivals",
    keywords: ["festival", "fest", "fair", "block party", "carnival"],
    fallbackImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎪",
  },
  {
    slug: "family",
    label: "Family",
    keywords: ["family", "kids", "children", "all ages", "storytime", "puppet"],
    fallbackImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    emoji: "👨‍👩‍👧",
  },
  {
    slug: "nightlife",
    label: "Nightlife",
    keywords: ["nightlife", "club night", "rave", "dance party", "dj", "after dark", "21+", "21 and over"],
    fallbackImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80",
    emoji: "✨",
  },
  {
    slug: "arts",
    label: "Arts & Culture",
    keywords: ["art", "gallery", "exhibit", "museum", "sculpture", "painting", "photography", "installation"],
    fallbackImage: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎨",
  },
  {
    slug: "community",
    label: "Community",
    keywords: ["community", "meetup", "networking", "volunteer", "fundraiser", "charity", "social"],
    fallbackImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    emoji: "🤝",
  },
  {
    slug: "food-drink",
    label: "Food & Drink",
    keywords: ["food", "drink", "wine", "beer", "tasting", "brunch", "dinner", "cocktail", "culinary"],
    fallbackImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    emoji: "🍽",
  },
  {
    slug: "film",
    label: "Film",
    keywords: ["film", "movie", "screening", "cinema", "premiere", "documentary"],
    fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎬",
  },
  {
    slug: "conferences",
    label: "Conferences",
    keywords: ["conference", "summit", "symposium", "expo", "convention", "trade show"],
    fallbackImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    emoji: "💼",
  },
  {
    slug: "workshops",
    label: "Workshops",
    keywords: ["workshop", "class", "lesson", "seminar", "masterclass", "training", "bootcamp", "tutorial"],
    fallbackImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    emoji: "🛠",
  },
  {
    slug: "wellness",
    label: "Wellness",
    keywords: ["wellness", "yoga", "meditation", "fitness", "health", "mindfulness", "retreat"],
    fallbackImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    emoji: "🧘",
  },
  {
    slug: "seasonal",
    label: "Seasonal",
    keywords: ["holiday", "christmas", "halloween", "new year", "valentine", "easter", "4th of july", "thanksgiving"],
    fallbackImage: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1200&q=80",
    emoji: "🎄",
  },
  {
    slug: "other",
    label: "Other",
    keywords: [],
    fallbackImage: DEFAULT_FALLBACK_IMAGE,
    emoji: "📌",
  },
];

/** Quick lookup: slug -> category */
export const CATEGORY_BY_SLUG = new Map(EVENT_CATEGORIES.map((c) => [c.slug, c]));

/** Quick lookup: label -> category */
export const CATEGORY_BY_LABEL = new Map(EVENT_CATEGORIES.map((c) => [c.label, c]));

/** All valid slugs (useful for validation) */
export const VALID_SLUGS = new Set(EVENT_CATEGORIES.map((c) => c.slug));

/**
 * Ticketmaster segment/genre -> canonical slug mapping table.
 *
 * Keys are lowercased TM segment or genre names.
 * This is intentionally exhaustive; unknown values fall through to keyword matching.
 */
export const TM_SEGMENT_MAP: Record<string, string> = {
  // Segments
  music: "concerts",
  sports: "sports",
  "arts & theatre": "theatre",
  film: "film",
  miscellaneous: "other",

  // Genres — Music
  rock: "concerts",
  pop: "concerts",
  "r&b": "concerts",
  "hip-hop": "concerts",
  "hip hop": "concerts",
  country: "concerts",
  jazz: "concerts",
  folk: "concerts",
  alternative: "concerts",
  metal: "concerts",
  blues: "concerts",
  classical: "concerts",
  "dance/electronic": "nightlife",
  reggae: "concerts",
  latin: "concerts",
  world: "concerts",
  religious: "community",
  "new age": "concerts",
  other: "other",

  // Genres — Sports
  hockey: "sports",
  baseball: "sports",
  basketball: "sports",
  football: "sports",
  soccer: "sports",
  wrestling: "sports",
  boxing: "sports",
  mma: "sports",
  tennis: "sports",
  golf: "sports",
  "fighting & martial arts": "sports",
  "swimming & water sports": "sports",
  "ice shows": "sports",

  // Genres — Arts
  comedy: "comedy",
  theatre: "theatre",
  dance: "theatre",
  "literary arts": "arts",
  "fine art": "arts",
  "drawing & painting": "arts",

  // Genres — Misc
  "hobby/special interest expos": "conferences",
  family: "family",
  undefined: "other",
};

/**
 * Ticketmaster genre -> subcategory slug.
 * Only set when the genre provides meaningful sub-classification.
 */
export const TM_SUBCATEGORY_MAP: Record<string, string> = {
  rock: "rock",
  pop: "pop",
  "r&b": "rnb",
  "hip-hop": "hip-hop",
  country: "country",
  jazz: "jazz",
  folk: "folk",
  alternative: "alternative",
  metal: "metal",
  blues: "blues",
  classical: "classical",
  "dance/electronic": "electronic",
  reggae: "reggae",
  latin: "latin",
  hockey: "hockey",
  baseball: "baseball",
  basketball: "basketball",
  football: "football",
  soccer: "soccer",
  wrestling: "wrestling",
  comedy: "standup",
  theatre: "stage",
  dance: "dance",
};
