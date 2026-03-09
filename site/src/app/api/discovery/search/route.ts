import { NextRequest, NextResponse } from "next/server";
import { getTonightBoard } from "@/lib/tonight-repo";
import { parseIntent, scoreItem } from "@/lib/discovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    if (!query) return NextResponse.json({ ok: false, error: "query is required" }, { status: 400 });

    const intent = parseIntent(query);
    const board = await getTonightBoard();
    const all = [...board.now, ...board.dateNight, ...board.family].filter(
      (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx,
    );

    const picks = all
      .map((item) => ({ item, score: scoreItem(item, intent) }))
      .filter((x) => x.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.item);

    return NextResponse.json({ ok: true, intent, picks });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
