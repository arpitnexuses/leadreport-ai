import { NextResponse } from "next/server";
import { NEXUSES_LOGO_DARK_URL } from "@/lib/brand";

export async function GET() {
  try {
    const response = await fetch(NEXUSES_LOGO_DARK_URL, { cache: "force-cache" });
    if (!response.ok) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load logo" }, { status: 500 });
  }
}
