export type VenueKind = "restaurant" | "coffee" | "bar";

export type CuisineFilter =
  | "all"
  | "italian"
  | "japanese"
  | "thai"
  | "mexican"
  | "indian"
  | "chinese"
  | "korean"
  | "seafood"
  | "american"
  | "mediterranean"
  | "vegan";

export type EatSortOption = "rating" | "distance" | "price_asc" | "price_desc";

export type SectionFilter = "all" | "restaurants" | "coffee" | "bars";

export type RestaurantItem = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: string;
  cuisine: string;
  photoRef: string;
  isOpen: boolean | null;
  googleMapsUrl: string;
  websiteUrl: string | null;
  distanceKm: number | null;
  types: string[];
  venueKind: VenueKind;
};

export type GroupedEatResults = {
  restaurants: RestaurantItem[];
  coffee: RestaurantItem[];
  bars: RestaurantItem[];
};

export const CUISINE_OPTIONS: { value: CuisineFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "thai", label: "Thai" },
  { value: "mexican", label: "Mexican" },
  { value: "indian", label: "Indian" },
  { value: "chinese", label: "Chinese" },
  { value: "korean", label: "Korean" },
  { value: "seafood", label: "Seafood" },
  { value: "american", label: "American" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "vegan", label: "Vegan" },
];

export const CUISINE_TO_GOOGLE_TYPES: Record<CuisineFilter, string[]> = {
  all: ["restaurant"],
  italian: ["italian_restaurant"],
  japanese: ["japanese_restaurant"],
  thai: ["thai_restaurant"],
  mexican: ["mexican_restaurant"],
  indian: ["indian_restaurant"],
  chinese: ["chinese_restaurant"],
  korean: ["korean_restaurant"],
  seafood: ["seafood_restaurant"],
  american: ["american_restaurant"],
  mediterranean: ["mediterranean_restaurant"],
  vegan: ["vegan_restaurant"],
};

export const COFFEE_GOOGLE_TYPES = ["cafe", "coffee_shop"];
export const BAR_GOOGLE_TYPES = ["bar", "night_club"];
export const RESTAURANT_GOOGLE_TYPES = ["restaurant"];
