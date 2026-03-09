import { NextResponse } from "next/server";
import { seedFromJsonIfEmpty } from "@/lib/curation-repo";

export async function POST() {
  try {
    const result = await seedFromJsonIfEmpty();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
