/**
 * Google Places API (New) integration.
 * Server-side only — never expose the API key to the client.
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

export type GooglePlace = {
  id: string;
  displayName: { text: string; languageCode: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types: string[];
  primaryType?: string;
  photos?: { name: string; widthPx: number; heightPx: number }[];
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  websiteUri?: string;
  googleMapsUri?: string;
};

export type NearbyPlacesParams = {
  lat: number;
  lng: number;
  radiusMeters?: number;
  types?: string[];
  maxResults?: number;
};

/**
 * Search for places near a location using Google Places API (New).
 */
export async function searchNearbyPlaces(
  params: NearbyPlacesParams,
): Promise<GooglePlace[]> {
  if (!API_KEY) {
    console.warn("[google-places] No API key configured");
    return [];
  }

  const { lat, lng, radiusMeters = 5000, types, maxResults = 20 } = params;

  const body: Record<string, unknown> = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
    maxResultCount: maxResults,
    rankPreference: "DISTANCE",
  };

  if (types?.length) {
    body.includedTypes = types;
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.types",
    "places.primaryType",
    "places.photos",
    "places.regularOpeningHours",
    "places.websiteUri",
    "places.googleMapsUri",
  ].join(",");

  try {
    const res = await fetch(NEARBY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.error(`[google-places] Nearby search error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error("[google-places]", text);
      return [];
    }

    const data = await res.json();
    return (data.places ?? []) as GooglePlace[];
  } catch (err) {
    console.error("[google-places] Nearby search failed:", err);
    return [];
  }
}

export type AutocompleteResult = {
  placeId: string;
  text: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
};

/**
 * Autocomplete place predictions biased toward Seattle area.
 */
export async function autocompletePlaces(
  input: string,
  lat = 47.6062,
  lng = -122.3321,
): Promise<AutocompleteResult[]> {
  if (!API_KEY || !input.trim()) return [];

  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 50000,
          },
        },
      }),
    });

    if (!res.ok) {
      console.error(`[google-places] Autocomplete error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: Record<string, unknown>) => s.placePrediction)
      .map((s: Record<string, { text: string; placeId: string; structuredFormat: { mainText: { text: string }; secondaryText: { text: string } } }>) => ({
        placeId: s.placePrediction.placeId,
        text: s.placePrediction.structuredFormat.mainText.text,
        secondaryText: s.placePrediction.structuredFormat.secondaryText?.text ?? "",
      }));
  } catch (err) {
    console.error("[google-places] Autocomplete failed:", err);
    return [];
  }
}

/**
 * Get place details (mainly for lat/lng from a placeId).
 */
export async function getPlaceDetails(
  placeId: string,
): Promise<{ lat: number; lng: number; name: string } | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "location,displayName",
        },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    return {
      lat: data.location.latitude,
      lng: data.location.longitude,
      name: data.displayName?.text ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Map Google price level to our dollar signs.
 */
export function priceLevelToSymbol(level?: string): string {
  switch (level) {
    case "PRICE_LEVEL_FREE": return "Free";
    case "PRICE_LEVEL_INEXPENSIVE": return "$";
    case "PRICE_LEVEL_MODERATE": return "$$";
    case "PRICE_LEVEL_EXPENSIVE": return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE": return "$$$$";
    default: return "";
  }
}

/**
 * Map Google place type to our category slug.
 */
export function placeTypeToCategory(types: string[], primaryType?: string): string {
  const t = primaryType?.toLowerCase() ?? "";
  const all = types.map((x) => x.toLowerCase());

  if (t.includes("restaurant") || all.some((x) => x.includes("restaurant"))) return "food-drink";
  if (t.includes("bar") || t.includes("night_club") || all.some((x) => x.includes("bar") || x.includes("night_club"))) return "nightlife";
  if (t.includes("cafe") || t.includes("coffee")) return "food-drink";
  if (t.includes("museum") || t.includes("art_gallery")) return "arts";
  if (t.includes("park") || t.includes("amusement")) return "family";
  if (t.includes("gym") || t.includes("spa") || t.includes("yoga")) return "wellness";
  if (t.includes("movie_theater") || t.includes("cinema")) return "film";
  if (t.includes("stadium") || t.includes("arena")) return "sports";
  if (t.includes("theater") || t.includes("performing_arts")) return "theatre";
  if (t.includes("shopping") || t.includes("store")) return "community";
  return "other";
}

/**
 * Build a photo URL from a Google Places photo reference.
 */
export function getPhotoUrl(photoName: string, maxWidth = 400): string {
  if (!API_KEY || !photoName) return "";
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}
