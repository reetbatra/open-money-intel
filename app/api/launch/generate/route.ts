import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateLaunchBundle } from "@/lib/launch/generate";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { saveBundle, latestBundle } from "@/lib/launch/store";
import { getSourceDescriptor } from "@/lib/launch/source";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const fallback = url.searchParams.get("fallback") === "1";
  const sourceId = getSourceDescriptor(url.searchParams.get("source")).id;

  const cached = latestBundle(sourceId);
  if (cached && !force) {
    return NextResponse.json({ ok: true, bundle: cached, cached: true });
  }

  try {
    const bundle = fallback ? buildFallbackBundle(sourceId) : await generateLaunchBundle(sourceId);
    saveBundle(bundle);
    revalidatePath("/launch");
    return NextResponse.json({ ok: true, bundle, cached: false, mode: fallback ? "fallback" : "ai" });
  } catch (err) {
    console.warn("launch generation failed, using fallback", err);
    const bundle = buildFallbackBundle(sourceId);
    saveBundle(bundle);
    revalidatePath("/launch");
    return NextResponse.json({
      ok: true,
      bundle,
      cached: false,
      mode: "fallback",
      warning: err instanceof Error ? err.message : "ai generation failed",
    });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sourceId = getSourceDescriptor(url.searchParams.get("source")).id;
  const cached = latestBundle(sourceId);
  if (cached) return NextResponse.json({ ok: true, bundle: cached, cached: true });
  const bundle = buildFallbackBundle(sourceId);
  saveBundle(bundle);
  return NextResponse.json({ ok: true, bundle, cached: false, mode: "fallback" });
}
