import { NextResponse } from "next/server";

export async function GET() {
  const key =
    process.env.GOOGLE_MAPS_BROWSER_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ??
    "";
  if (!key) {
    return NextResponse.json({ key: "" }, { status: 404 });
  }
  return NextResponse.json({ key });
}
