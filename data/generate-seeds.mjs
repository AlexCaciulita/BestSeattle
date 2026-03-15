/**
 * Generate seed data with dates relative to NOW
 * so the homepage always has events in every time bucket.
 * Run: node data/generate-seeds.mjs
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString();
}

const events = [
  // Happening NOW (started 1-2 hours ago)
  {
    title: "Fleet Foxes at The Paramount",
    source: "Ticketmaster",
    category: "Concerts",
    zone: "Downtown",
    timeframe: "tonight",
    est_price: 65,
    starts_at: hoursFromNow(-1),
    thumbnail_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sonics vs Lakers — Climate Pledge Arena",
    source: "SeatGeek",
    category: "Sports",
    zone: "Queen Anne",
    timeframe: "tonight",
    est_price: 120,
    starts_at: hoursFromNow(-0.5),
    thumbnail_url: "https://images.unsplash.com/photo-1504450758481-7338bbe75005?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Stand-Up Showcase at Comedy Underground",
    source: "Eventbrite",
    category: "Comedy",
    zone: "Capitol Hill",
    timeframe: "tonight",
    est_price: 25,
    starts_at: hoursFromNow(-0.3),
    thumbnail_url: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80",
  },

  // Starting SOON (within 2 hours)
  {
    title: "DJ Set at Neumos — Phoebe Bridgers Afterparty",
    source: "RA",
    category: "Nightlife",
    zone: "Capitol Hill",
    timeframe: "tonight",
    est_price: 20,
    starts_at: hoursFromNow(0.75),
    thumbnail_url: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Late Night Food Tour — Pike Place After Dark",
    source: "Airbnb Experiences",
    category: "Food & Drink",
    zone: "Downtown",
    timeframe: "tonight",
    est_price: 45,
    starts_at: hoursFromNow(1.2),
    thumbnail_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  },

  // Later tonight (today, 3-6 hours)
  {
    title: "Immersive Van Gogh — Last Weekend",
    source: "Fever",
    category: "Arts",
    zone: "SoDo",
    timeframe: "tonight",
    est_price: 40,
    starts_at: hoursFromNow(3.5),
    thumbnail_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hamilton — 5th Avenue Theatre",
    source: "Broadway in Seattle",
    category: "Theater",
    zone: "Downtown",
    timeframe: "tonight",
    est_price: 89,
    starts_at: hoursFromNow(4),
    thumbnail_url: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
  },

  // Tomorrow
  {
    title: "Seattle Farmers Market — Ballard",
    source: "Visit Seattle",
    category: "Markets",
    zone: "Ballard",
    timeframe: "weekend",
    est_price: 0,
    starts_at: hoursFromNow(18),
    thumbnail_url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Brunch & Drag Show — Capitol Hill",
    source: "Eventbrite",
    category: "Family",
    zone: "Capitol Hill",
    timeframe: "weekend",
    est_price: 35,
    starts_at: hoursFromNow(20),
    thumbnail_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Sounders FC vs Portland Timbers",
    source: "MLS",
    category: "Sports",
    zone: "SoDo",
    timeframe: "weekend",
    est_price: 55,
    starts_at: hoursFromNow(22),
    thumbnail_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
  },

  // Weekend
  {
    title: "Wine Walk — Woodinville",
    source: "Visit Seattle",
    category: "Food & Drink",
    zone: "Eastside",
    timeframe: "weekend",
    est_price: 60,
    starts_at: hoursFromNow(44),
    thumbnail_url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Kayaking on Lake Union — Sunset Tour",
    source: "Airbnb Experiences",
    category: "Outdoors",
    zone: "South Lake Union",
    timeframe: "weekend",
    est_price: 75,
    starts_at: hoursFromNow(46),
    thumbnail_url: "https://images.unsplash.com/photo-1472745433479-4556f22e32c2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Museum of Pop Culture — David Bowie Exhibit",
    source: "MoPOP",
    category: "Arts",
    zone: "Queen Anne",
    timeframe: "weekend",
    est_price: 30,
    starts_at: hoursFromNow(48),
    thumbnail_url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
  },

  // This week
  {
    title: "Trivia Night — Optimism Brewing",
    source: "Eventbrite",
    category: "Nightlife",
    zone: "Capitol Hill",
    timeframe: "week",
    est_price: 0,
    starts_at: hoursFromNow(72),
    thumbnail_url: "https://images.unsplash.com/photo-1575037614876-c38a4ca44f4f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Open Mic Night — The Crocodile",
    source: "The Crocodile",
    category: "Concerts",
    zone: "Belltown",
    timeframe: "week",
    est_price: 10,
    starts_at: hoursFromNow(96),
    thumbnail_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Seattle Art Walk — First Thursday",
    source: "Visit Seattle",
    category: "Arts",
    zone: "Pioneer Square",
    timeframe: "week",
    est_price: 0,
    starts_at: hoursFromNow(120),
    thumbnail_url: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?auto=format&fit=crop&w=1200&q=80",
  },
];

const restaurants = [
  { name: "Canlis", editorial_source: "The Infatuation", editorial_score_raw: 9.4, zone_hint: "Queen Anne", cuisine: "Fine Dining" },
  { name: "Bateau", editorial_source: "Eater Seattle", editorial_score_raw: 9.1, zone_hint: "Capitol Hill", cuisine: "American" },
  { name: "Kedai Makan", editorial_source: "The Infatuation", editorial_score_raw: 9.0, zone_hint: "Capitol Hill", cuisine: "Malaysian" },
  { name: "Wataru", editorial_source: "Seattle Met", editorial_score_raw: 8.9, zone_hint: "Wallingford", cuisine: "Japanese Omakase" },
  { name: "The Walrus and the Carpenter", editorial_source: "Eater Seattle", editorial_score_raw: 8.8, zone_hint: "Ballard", cuisine: "Seafood / Raw Bar" },
  { name: "Archipelago", editorial_source: "The Infatuation", editorial_score_raw: 8.7, zone_hint: "Hillman City", cuisine: "Filipino" },
  { name: "Eden Hill", editorial_source: "Seattle Met", editorial_score_raw: 8.6, zone_hint: "Queen Anne", cuisine: "Tasting Menu" },
  { name: "Altura", editorial_source: "Eater Seattle", editorial_score_raw: 8.5, zone_hint: "Capitol Hill", cuisine: "Italian" },
];

const outDir = resolve(__dirname);
writeFileSync(resolve(outDir, "seed_events.json"), JSON.stringify(events, null, 2));
writeFileSync(resolve(outDir, "seed_restaurants.json"), JSON.stringify(restaurants, null, 2));

console.log(`Generated ${events.length} events and ${restaurants.length} restaurants`);
console.log("Events time buckets:");
events.forEach(e => {
  const diff = (new Date(e.starts_at) - Date.now()) / 3600000;
  console.log(`  ${diff > 0 ? "+" : ""}${diff.toFixed(1)}h  ${e.title}`);
});
