import {
  searchNearbyPlaces,
  priceLevelToSymbol,
  type GooglePlace,
} from "./google-places";
import type {
  RestaurantItem,
  CuisineFilter,
  EatSortOption,
  VenueKind,
  GroupedEatResults,
} from "./eat-types";
import {
  CUISINE_TO_GOOGLE_TYPES,
  COFFEE_GOOGLE_TYPES,
  BAR_GOOGLE_TYPES,
} from "./eat-types";

export const MIN_TOP_RATED_REVIEWS = 25;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const BAR_INDICATORS = ["bar", "pub", "night_club", "wine_bar", "cocktail_bar"];
const COFFEE_INDICATORS = ["cafe", "coffee_shop", "coffee", "tea_house"];

/**
 * Classify a place into exactly one venue kind.
 * Priority: bar > coffee > restaurant (so hybrid places appear only once).
 */
export function classifyVenueKind(types: string[], primaryType?: string): VenueKind {
  const pt = primaryType?.toLowerCase() ?? "";

  // Check primaryType first (most reliable signal)
  if (BAR_INDICATORS.some((t) => pt.includes(t))) return "bar";
  if (COFFEE_INDICATORS.some((t) => pt.includes(t))) return "coffee";

  // Fallback: check all types
  const allLower = types.map((t) => t.toLowerCase());
  if (allLower.some((t) => BAR_INDICATORS.some((b) => t.includes(b)))) return "bar";
  if (allLower.some((t) => COFFEE_INDICATORS.some((c) => t.includes(c)))) return "coffee";

  return "restaurant";
}

function mapCuisine(types: string[], primaryType?: string): string {
  const t = primaryType?.toLowerCase() ?? "";
  if (t.includes("italian")) return "Italian";
  if (t.includes("japanese") || t.includes("sushi")) return "Japanese";
  if (t.includes("thai")) return "Thai";
  if (t.includes("mexican")) return "Mexican";
  if (t.includes("indian")) return "Indian";
  if (t.includes("chinese")) return "Chinese";
  if (t.includes("korean")) return "Korean";
  if (t.includes("seafood")) return "Seafood";
  if (t.includes("american")) return "American";
  if (t.includes("mediterranean")) return "Mediterranean";
  if (t.includes("vegan") || t.includes("vegetarian")) return "Vegan";
  if (t.includes("cafe") || t.includes("coffee")) return "Coffee";
  if (t.includes("bar") || t.includes("night_club")) return "Bar";

  // Fallback: check all types
  const all = types.join(" ").toLowerCase();
  if (all.includes("pizza") || all.includes("italian")) return "Italian";
  if (all.includes("sushi") || all.includes("japanese")) return "Japanese";
  if (all.includes("bar")) return "Bar";
  if (all.includes("cafe") || all.includes("coffee")) return "Coffee";

  return "Restaurant";
}

function transformPlace(
  place: GooglePlace,
  userLat?: number,
  userLng?: number,
): RestaurantItem {
  const photoRef = place.photos?.[0]?.name ?? "";

  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    lat: place.location.latitude,
    lng: place.location.longitude,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    priceLevel: priceLevelToSymbol(place.priceLevel),
    cuisine: mapCuisine(place.types, place.primaryType),
    photoRef,
    isOpen: place.regularOpeningHours?.openNow ?? null,
    googleMapsUrl: place.googleMapsUri ?? "",
    websiteUrl: place.websiteUri ?? null,
    distanceKm:
      userLat != null && userLng != null
        ? haversine(userLat, userLng, place.location.latitude, place.location.longitude)
        : null,
    types: place.types,
    venueKind: classifyVenueKind(place.types, place.primaryType),
  };
}

export function sortRestaurants(items: RestaurantItem[], sort: EatSortOption): RestaurantItem[] {
  const sorted = [...items];
  switch (sort) {
    case "rating":
      return sorted.sort((a, b) => {
        const aEligible = (a.reviewCount ?? 0) >= MIN_TOP_RATED_REVIEWS;
        const bEligible = (b.reviewCount ?? 0) >= MIN_TOP_RATED_REVIEWS;

        if (aEligible !== bEligible) {
          return aEligible ? -1 : 1;
        }

        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (Math.abs(ratingDiff) > 0.001) {
          return ratingDiff;
        }

        const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        if (reviewDiff !== 0) {
          return reviewDiff;
        }

        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      });
    case "distance":
      return sorted.sort(
        (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
      );
    case "price_asc": {
      const priceOrder = (p: string) =>
        p === "Free" ? 0 : p === "$" ? 1 : p === "$$" ? 2 : p === "$$$" ? 3 : p === "$$$$" ? 4 : 5;
      return sorted.sort((a, b) => priceOrder(a.priceLevel) - priceOrder(b.priceLevel));
    }
    case "price_desc": {
      const priceOrder = (p: string) =>
        p === "Free" ? 0 : p === "$" ? 1 : p === "$$" ? 2 : p === "$$$" ? 3 : p === "$$$$" ? 4 : 5;
      return sorted.sort((a, b) => priceOrder(b.priceLevel) - priceOrder(a.priceLevel));
    }
    default:
      return sorted;
  }
}

export async function searchRestaurants(params: {
  lat: number;
  lng: number;
  radiusMeters?: number;
  cuisine?: CuisineFilter;
  sort?: EatSortOption;
  maxResults?: number;
}): Promise<RestaurantItem[]> {
  const {
    lat,
    lng,
    radiusMeters = 5000,
    cuisine = "all",
    sort = "rating",
    maxResults = 20,
  } = params;

  const types = CUISINE_TO_GOOGLE_TYPES[cuisine] ?? ["restaurant"];

  const places = await searchNearbyPlaces({
    lat,
    lng,
    radiusMeters,
    types,
    maxResults,
  });

  const items = places.map((p) => transformPlace(p, lat, lng));
  return sortRestaurants(items, sort);
}

/**
 * Run three parallel nearby searches (restaurants, coffee, bars) and return grouped results.
 * - Restaurants respect the cuisine filter.
 * - Coffee and bars always use their own type families.
 * - Deduplication: if a place appears in multiple searches, the priority rule (bar > coffee > restaurant) applies.
 */
export async function searchGrouped(params: {
  lat: number;
  lng: number;
  radiusMeters?: number;
  cuisine?: CuisineFilter;
  sort?: EatSortOption;
  maxResults?: number;
}): Promise<GroupedEatResults> {
  const {
    lat,
    lng,
    radiusMeters = 5000,
    cuisine = "all",
    sort = "rating",
    maxResults = 20,
  } = params;

  const restaurantTypes = CUISINE_TO_GOOGLE_TYPES[cuisine] ?? ["restaurant"];

  const [restaurantPlaces, coffeePlaces, barPlaces] = await Promise.all([
    searchNearbyPlaces({ lat, lng, radiusMeters, types: restaurantTypes, maxResults }),
    searchNearbyPlaces({ lat, lng, radiusMeters, types: COFFEE_GOOGLE_TYPES, maxResults }),
    searchNearbyPlaces({ lat, lng, radiusMeters, types: BAR_GOOGLE_TYPES, maxResults }),
  ]);

  const seenIds = new Set<string>();

  // Process bars first (highest priority for hybrid venues)
  const bars = barPlaces
    .map((p) => transformPlace(p, lat, lng))
    .map((item) => ({ ...item, venueKind: "bar" as VenueKind }))
    .filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

  // Coffee second priority
  const coffee = coffeePlaces
    .map((p) => transformPlace(p, lat, lng))
    .map((item) => ({ ...item, venueKind: "coffee" as VenueKind }))
    .filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

  // Restaurants last (lowest priority for dedup)
  const restaurants = restaurantPlaces
    .map((p) => transformPlace(p, lat, lng))
    .map((item) => ({ ...item, venueKind: "restaurant" as VenueKind }))
    .filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

  return {
    restaurants: sortRestaurants(restaurants, sort),
    coffee: sortRestaurants(coffee, sort),
    bars: sortRestaurants(bars, sort),
  };
}
