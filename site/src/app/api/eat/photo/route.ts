import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ref = sp.get("ref");
  const w = parseInt(sp.get("w") ?? "800", 10);

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${w}&key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Photo fetch failed" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo proxy error" }, { status: 500 });
  }
}
