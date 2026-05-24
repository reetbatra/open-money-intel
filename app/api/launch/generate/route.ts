import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateLaunchBundle } from "@/lib/launch/generate";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { saveBundle, latestBundle } from "@/lib/launch/store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const fallback = url.searchParams.get("fallback") === "1";

  const cached = latestBundle();
  if (cached && !force) {
    return NextResponse.json({ ok: true, bundle: cached, cached: true });
  }

  try {
    const bundle = fallback ? buildFallbackBundle() : await generateLaunchBundle();
    saveBundle(bundle);
    revalidatePath("/launch");
    return NextResponse.json({ ok: true, bundle, cached: false, mode: fallback ? "fallback" : "ai" });
  } catch (err) {
    console.warn("launch generation failed, using fallback", err);
    const bundle = buildFallbackBundle();
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

export async function GET() {
  const cached = latestBundle();
  if (cached) return NextResponse.json({ ok: true, bundle: cached, cached: true });
  // Eager fallback so GET always returns something
  const bundle = buildFallbackBundle();
  saveBundle(bundle);
  return NextResponse.json({ ok: true, bundle, cached: false, mode: "fallback" });
}
