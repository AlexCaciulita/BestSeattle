import { NextRequest, NextResponse } from "next/server";
import { updateCurationStatus } from "@/lib/curation-repo";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    if (!body?.status) {
      return NextResponse.json({ ok: false, error: "status is required" }, { status: 400 });
    }

    const data = await updateCurationStatus(numericId, body.status);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
