import { describe, it, expect } from "vitest";
import { normalizeEventCategory, type RawCategoryPayload } from "../normalize-category";

describe("normalizeEventCategory", () => {
  describe("Ticketmaster segment/genre mapping", () => {
    it("maps Music/Rock to concerts with rock subcategory", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Music", genre: "Rock" },
        "The Strumbellas: Into Dust Tour",
      );
      expect(result.category_slug).toBe("concerts");
      expect(result.category_label).toBe("Concerts");
      expect(result.subcategory_slug).toBe("rock");
      expect(result.confidence).toBe("high");
    });

    it("maps Sports/Hockey to sports with hockey subcategory", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Sports", genre: "Hockey" },
        "Seattle Kraken vs. Nashville Predators",
      );
      expect(result.category_slug).toBe("sports");
      expect(result.subcategory_slug).toBe("hockey");
      expect(result.confidence).toBe("high");
    });

    it("maps Arts & Theatre/Comedy to comedy", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Arts & Theatre", genre: "Comedy" },
        "Morgan Jay: The Goofy Guy Tour",
      );
      expect(result.category_slug).toBe("comedy");
      expect(result.subcategory_slug).toBe("standup");
      expect(result.confidence).toBe("high");
    });

    it("maps Arts & Theatre/Theatre to theatre", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Arts & Theatre", genre: "Theatre" },
        "Tacoma Arts Live Presents Clue The Movie",
      );
      expect(result.category_slug).toBe("theatre");
      expect(result.confidence).toBe("high");
    });

    it("maps Music/Dance/Electronic to nightlife", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Music", genre: "Dance/Electronic" },
        "Flammable",
      );
      expect(result.category_slug).toBe("nightlife");
      expect(result.subcategory_slug).toBe("electronic");
      expect(result.confidence).toBe("high");
    });

    it("maps Film segment to film", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Film" },
        "Some Movie Screening",
      );
      expect(result.category_slug).toBe("film");
      expect(result.confidence).toBe("medium");
    });

    it("maps Sports/Baseball to sports", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Sports", genre: "Baseball" },
        "Tacoma Rainiers vs. El Paso Chihuahuas",
      );
      expect(result.category_slug).toBe("sports");
      expect(result.subcategory_slug).toBe("baseball");
    });
  });

  describe("Keyword fallback", () => {
    it("detects comedy from title when source has no genre", () => {
      const result = normalizeEventCategory(
        { source: "eventbrite" },
        "Stand-up Comedy Night at the Laughing Lounge",
      );
      expect(result.category_slug).toBe("comedy");
      expect(result.confidence).toBe("medium");
    });

    it("detects festivals from title keywords", () => {
      const result = normalizeEventCategory(
        { source: "eventbrite" },
        "Seattle Summer Music Festival 2026",
      );
      expect(result.category_slug).toBe("festivals");
    });

    it("detects wellness from title", () => {
      const result = normalizeEventCategory(
        { source: "meetup" },
        "Morning Yoga in the Park",
      );
      expect(result.category_slug).toBe("wellness");
    });

    it("detects nightlife from 21+ in title when no source mapping", () => {
      const result = normalizeEventCategory(
        { source: "eventbrite" },
        "Peaches (21 and Over)",
      );
      expect(result.category_slug).toBe("nightlife");
    });

    it("prefers source mapping over keyword when source has medium+ confidence", () => {
      // TM segment=Music with genre=Other -> concerts (medium)
      // Even though "21 and Over" keyword matches nightlife, source mapping wins
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Music", genre: "Other" },
        "Peaches (21 and Over)",
      );
      expect(result.category_slug).toBe("concerts");
    });

    it("detects food-drink from title", () => {
      const result = normalizeEventCategory(
        { source: "eventbrite" },
        "Wine Tasting & Cheese Pairing Evening",
      );
      expect(result.category_slug).toBe("food-drink");
    });
  });

  describe("Low confidence -> other", () => {
    it("falls back to other with low confidence for unknown categories", () => {
      const result = normalizeEventCategory(
        { source: "ticketmaster", segment: "Miscellaneous", genre: "Undefined" },
        "Random Gathering With No Obvious Type",
      );
      expect(result.category_slug).toBe("other");
      expect(result.confidence).toBe("low");
    });

    it("falls back to other for empty payload", () => {
      const result = normalizeEventCategory(
        { source: "unknown" },
        "Untitled Event",
      );
      expect(result.category_slug).toBe("other");
      expect(result.confidence).toBe("low");
    });
  });

  describe("Source category raw preservation", () => {
    it("preserves the raw payload in source_category_raw", () => {
      const raw: RawCategoryPayload = {
        source: "ticketmaster",
        segment: "Music",
        genre: "Rock",
        subGenre: "Alternative Rock",
      };
      const result = normalizeEventCategory(raw, "Some Band");
      expect(result.source_category_raw).toEqual(raw);
    });
  });

  describe("Ticketmaster normalizeEvent integration", () => {
    it("produces non-null category_slug for all common TM segments", () => {
      const segments = [
        { segment: "Music", genre: "Rock" },
        { segment: "Sports", genre: "Hockey" },
        { segment: "Arts & Theatre", genre: "Comedy" },
        { segment: "Film" },
        { segment: "Music", genre: "Jazz" },
        { segment: "Sports", genre: "Baseball" },
        { segment: "Music", genre: "Country" },
        { segment: "Arts & Theatre", genre: "Theatre" },
      ];

      for (const s of segments) {
        const result = normalizeEventCategory(
          { source: "ticketmaster", ...s },
          "Test Event",
        );
        expect(result.category_slug).not.toBeNull();
        expect(result.category_slug).toBeTruthy();
        expect(result.category_slug).not.toBe("other");
      }
    });
  });
});
