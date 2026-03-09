/**
 * Backfill script: assigns category_slug to existing events.
 *
 * Usage:
 *   npx tsx scripts/backfill-categories.ts          # dry-run (default)
 *   npx tsx scripts/backfill-categories.ts --apply   # write to DB
 */

import { createClient } from "@supabase/supabase-js";
import { normalizeEventCategory, type RawCategoryPayload } from "../src/lib/normalize-category";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const dryRun = !process.argv.includes("--apply");

async function main() {
  console.log(`\n=== Category Backfill ${dryRun ? "(DRY RUN)" : "(APPLYING)"} ===\n`);

  // Fetch all events missing category_slug or with category_slug = 'other'
  const { data: events, error } = await supabase
    .from("items_curated")
    .select("id, title, category, source, metadata, source_category_raw, category_slug")
    .eq("item_type", "event")
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to fetch events:", error.message);
    process.exit(1);
  }

  const total = events.length;
  let updated = 0;
  let skipped = 0;
  let unresolved = 0;
  const catCounts = new Map<string, number>();

  for (const ev of events) {
    // Build raw category payload from existing data
    const raw: RawCategoryPayload = ev.source_category_raw as RawCategoryPayload ?? {
      source: (ev.source ?? "unknown").toLowerCase(),
      // Try to reconstruct from the category field
      segment: ev.metadata?.content_type ?? undefined,
      genre: ev.category !== "events" ? ev.category : undefined,
    };

    // Ensure source field is set
    if (!raw.source) {
      raw.source = (ev.source ?? "unknown").toLowerCase();
    }

    const result = normalizeEventCategory(raw, ev.title);

    catCounts.set(result.category_slug, (catCounts.get(result.category_slug) ?? 0) + 1);

    // Skip if already correctly categorized
    if (ev.category_slug && ev.category_slug === result.category_slug && ev.category_slug !== "other") {
      skipped++;
      continue;
    }

    // Skip if we'd just set it to "other" and it's already "other"
    if (result.category_slug === "other" && ev.category_slug === "other") {
      unresolved++;
      skipped++;
      continue;
    }

    if (result.category_slug === "other") {
      unresolved++;
    }

    const before = ev.category_slug ?? "(null)";
    const after = result.category_slug;

    if (dryRun) {
      console.log(`  [${before} -> ${after}] "${ev.title}" (${result.confidence})`);
    } else {
      const { error: updateErr } = await supabase
        .from("items_curated")
        .update({
          category: result.category_label,
          category_slug: result.category_slug,
          subcategory_slug: result.subcategory_slug,
          source_category_raw: result.source_category_raw,
        })
        .eq("id", ev.id);

      if (updateErr) {
        console.error(`  Failed to update id=${ev.id}: ${updateErr.message}`);
      } else {
        console.log(`  Updated id=${ev.id}: ${before} -> ${after} "${ev.title}"`);
        updated++;
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total scanned:  ${total}`);
  console.log(`Updated:        ${dryRun ? "(dry run)" : updated}`);
  console.log(`Skipped:        ${skipped}`);
  console.log(`Unresolved:     ${unresolved} (still "other")`);
  console.log("\nPer-category counts:");
  const sorted = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [slug, count] of sorted) {
    console.log(`  ${slug.padEnd(16)} ${count}`);
  }

  if (dryRun) {
    console.log("\nRe-run with --apply to write changes to the database.");
  }
}

main().catch(console.error);
