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
};

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    slug: "concerts",
    label: "Concerts",
    keywords: ["concert", "live music", "tour", "album release", "band", "gig", "dj set"],
  },
  {
    slug: "theatre",
    label: "Theatre",
    keywords: ["theatre", "theater", "play", "musical", "broadway", "opera", "ballet", "performing arts"],
  },
  {
    slug: "sports",
    label: "Sports",
    keywords: ["game", "match", "vs.", "tournament", "championship", "league", "ballpark", "stadium"],
  },
  {
    slug: "comedy",
    label: "Comedy",
    keywords: ["comedy", "stand-up", "standup", "comedian", "improv", "open mic comedy", "roast"],
  },
  {
    slug: "festivals",
    label: "Festivals",
    keywords: ["festival", "fest", "fair", "block party", "carnival"],
  },
  {
    slug: "family",
    label: "Family",
    keywords: ["family", "kids", "children", "all ages", "storytime", "puppet"],
  },
  {
    slug: "nightlife",
    label: "Nightlife",
    keywords: ["nightlife", "club night", "rave", "dance party", "dj", "after dark", "21+", "21 and over"],
  },
  {
    slug: "arts",
    label: "Arts & Culture",
    keywords: ["art", "gallery", "exhibit", "museum", "sculpture", "painting", "photography", "installation"],
  },
  {
    slug: "community",
    label: "Community",
    keywords: ["community", "meetup", "networking", "volunteer", "fundraiser", "charity", "social"],
  },
  {
    slug: "food-drink",
    label: "Food & Drink",
    keywords: ["food", "drink", "wine", "beer", "tasting", "brunch", "dinner", "cocktail", "culinary"],
  },
  {
    slug: "film",
    label: "Film",
    keywords: ["film", "movie", "screening", "cinema", "premiere", "documentary"],
  },
  {
    slug: "conferences",
    label: "Conferences",
    keywords: ["conference", "summit", "symposium", "expo", "convention", "trade show"],
  },
  {
    slug: "workshops",
    label: "Workshops",
    keywords: ["workshop", "class", "lesson", "seminar", "masterclass", "training", "bootcamp", "tutorial"],
  },
  {
    slug: "wellness",
    label: "Wellness",
    keywords: ["wellness", "yoga", "meditation", "fitness", "health", "mindfulness", "retreat"],
  },
  {
    slug: "seasonal",
    label: "Seasonal",
    keywords: ["holiday", "christmas", "halloween", "new year", "valentine", "easter", "4th of july", "thanksgiving"],
  },
  {
    slug: "other",
    label: "Other",
    keywords: [],
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
