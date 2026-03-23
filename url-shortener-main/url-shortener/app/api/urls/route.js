import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueShortCode } from "@/lib/short-code";
import { isValidUrl, normalizeUrl } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const urls = await prisma.url.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(urls);
  } catch (err) {
    console.error("GET /api/urls error:", err);
    return NextResponse.json({ error: "Failed to fetch URLs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!isValidUrl(rawUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid URL (e.g. https://example.com)" },
        { status: 400 }
      );
    }

    const originalUrl = normalizeUrl(rawUrl);

    const shortCode = await generateUniqueShortCode(async (code) => {
      const existing = await prisma.url.findUnique({ where: { shortCode: code } });
      return !!existing;
    });

    const url = await prisma.url.create({
      data: { originalUrl, shortCode },
    });

    return NextResponse.json(url);
  } catch (err) {
    console.error("POST /api/urls error:", err);
    return NextResponse.json({ error: "Failed to create short URL" }, { status: 500 });
  }
}
