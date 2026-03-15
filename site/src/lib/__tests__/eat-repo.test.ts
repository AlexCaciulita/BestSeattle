import { describe, expect, it } from "vitest";
import { getCacheKey } from "../eat-cache";
import { MIN_TOP_RATED_REVIEWS, sortRestaurants, classifyVenueKind } from "../eat-repo";
import type { RestaurantItem, VenueKind } from "../eat-types";

function makeRestaurant(overrides: Partial<RestaurantItem>): RestaurantItem {
  return {
    id: overrides.id ?? "restaurant",
    name: overrides.name ?? "Restaurant",
    address: overrides.address ?? "Seattle",
    lat: overrides.lat ?? 47.6062,
    lng: overrides.lng ?? -122.3321,
    rating: overrides.rating ?? 4.5,
    reviewCount: overrides.reviewCount ?? 100,
    priceLevel: overrides.priceLevel ?? "$$",
    cuisine: overrides.cuisine ?? "Restaurant",
    photoRef: overrides.photoRef ?? "",
    isOpen: overrides.isOpen ?? true,
    googleMapsUrl: overrides.googleMapsUrl ?? "",
    websiteUrl: overrides.websiteUrl ?? null,
    distanceKm: overrides.distanceKm ?? 1,
    types: overrides.types ?? ["restaurant"],
    venueKind: overrides.venueKind ?? "restaurant",
  };
}

describe("classifyVenueKind", () => {
  it("classifies a cafe-only place as coffee", () => {
    expect(classifyVenueKind(["cafe", "food"], "cafe")).toBe("coffee");
  });

  it("classifies a coffee_shop as coffee", () => {
    expect(classifyVenueKind(["coffee_shop", "store"], "coffee_shop")).toBe("coffee");
  });

  it("classifies a bar as bar", () => {
    expect(classifyVenueKind(["bar", "food"], "bar")).toBe("bar");
  });

  it("classifies a night_club as bar", () => {
    expect(classifyVenueKind(["night_club"], "night_club")).toBe("bar");
  });

  it("classifies a pub as bar", () => {
    expect(classifyVenueKind(["pub", "restaurant"], "pub")).toBe("bar");
  });

  it("classifies a restaurant as restaurant", () => {
    expect(classifyVenueKind(["restaurant", "food"], "restaurant")).toBe("restaurant");
  });

  it("classifies an italian_restaurant as restaurant", () => {
    expect(classifyVenueKind(["italian_restaurant", "restaurant"], "italian_restaurant")).toBe("restaurant");
  });

  it("uses bar > coffee > restaurant priority for hybrid bar+cafe", () => {
    // A place that has both bar and cafe types — bar wins
    expect(classifyVenueKind(["bar", "cafe"], "bar")).toBe("bar");
  });

  it("uses bar > coffee > restaurant priority for hybrid bar+restaurant", () => {
    expect(classifyVenueKind(["bar", "restaurant"], "bar")).toBe("bar");
  });

  it("uses coffee > restaurant priority for hybrid cafe+restaurant", () => {
    expect(classifyVenueKind(["cafe", "restaurant"], "cafe")).toBe("coffee");
  });

  it("falls back to types array when primaryType is absent", () => {
    expect(classifyVenueKind(["bar", "food"])).toBe("bar");
    expect(classifyVenueKind(["cafe", "food"])).toBe("coffee");
    expect(classifyVenueKind(["restaurant", "food"])).toBe("restaurant");
  });

  it("defaults to restaurant for unknown types", () => {
    expect(classifyVenueKind(["store", "point_of_interest"])).toBe("restaurant");
  });
});

describe("sortRestaurants", () => {
  it(`keeps places with fewer than ${MIN_TOP_RATED_REVIEWS} reviews below qualified top-rated results`, () => {
    const restaurants = [
      makeRestaurant({
        id: "one-review-perfect",
        rating: 5,
        reviewCount: 1,
        distanceKm: 0.2,
      }),
      makeRestaurant({
        id: "qualified-best",
        rating: 4.9,
        reviewCount: 140,
        distanceKm: 1.4,
      }),
      makeRestaurant({
        id: "qualified-second",
        rating: 4.8,
        reviewCount: 85,
        distanceKm: 0.8,
      }),
    ];

    const sorted = sortRestaurants(restaurants, "rating");

    expect(sorted.map((item) => item.id)).toEqual([
      "qualified-best",
      "qualified-second",
      "one-review-perfect",
    ]);
  });

  it("sorts nearest differently from top rated", () => {
    const restaurants = [
      makeRestaurant({
        id: "closest",
        rating: 4.2,
        reviewCount: 120,
        distanceKm: 0.2,
      }),
      makeRestaurant({
        id: "best-rated",
        rating: 4.9,
        reviewCount: 300,
        distanceKm: 3.5,
      }),
    ];

    expect(sortRestaurants(restaurants, "distance").map((item) => item.id)).toEqual([
      "closest",
      "best-rated",
    ]);

    expect(sortRestaurants(restaurants, "rating").map((item) => item.id)).toEqual([
      "best-rated",
      "closest",
    ]);
  });
});

describe("getCacheKey", () => {
  it("changes when the radius changes", () => {
    expect(getCacheKey(47.6062, -122.3321, "all", 5000)).not.toBe(
      getCacheKey(47.6062, -122.3321, "all", 10000),
    );
  });
});
