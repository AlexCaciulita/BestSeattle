import { NextRequest, NextResponse } from "next/server";
import { createCurationItem, listCurationItems } from "@/lib/curation-repo";

export async function GET() {
  try {
    const data = await listCurationItems();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.item_type || !body?.title) {
      return NextResponse.json(
        { ok: false, error: "item_type and title are required" },
        { status: 400 },
      );
    }

    const item = await createCurationItem({
      item_type: body.item_type,
      title: body.title,
      source: body.source,
      zone: body.zone,
      category: body.category,
      score: body.score,
      sponsored: body.sponsored,
      status: body.status,
    });

    return NextResponse.json({ ok: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
