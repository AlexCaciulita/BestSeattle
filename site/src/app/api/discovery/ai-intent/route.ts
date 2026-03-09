import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "@/lib/discovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    if (!query) return NextResponse.json({ ok: false, error: "query is required" }, { status: 400 });

    const intent = parseIntent(query);
    return NextResponse.json({ ok: true, intent });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
