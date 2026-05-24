import { latestBundle, saveBundle } from "@/lib/launch/store";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { ObservabilityPanel } from "@/components/launch/observability-panel";
import { PlatformView } from "@/components/launch/platform-view";
import { ProductSwitcher } from "@/components/launch/product-switcher";
import { RegenerateButton } from "@/components/launch/regenerate-button";
import { SourceSwitcher } from "@/components/launch/source-switcher";
import { loadPositioningSourceText, SOURCES, getSourceDescriptor } from "@/lib/launch/source";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  const desc = getSourceDescriptor(params?.source);
  const sourceId = desc.id;

  let bundle = latestBundle(sourceId);
  if (!bundle) {
    bundle = buildFallbackBundle(sourceId);
    saveBundle(bundle);
  }
  const { path, text } = loadPositioningSourceText(sourceId);
  const sourcePreview = text.split("\n").slice(0, 24).join("\n");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200">
          Launch in a Box · positioning → assets in one pass
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Compress positioning into shipped assets.</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          One YAML source of truth → one Claude pipeline → six assets per product plus the platform-level pitch.
          The PMM owns strategic inputs; AI handles production volume.
        </p>
      </header>

      <section className="mb-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-2">Positioning source · switch to prove the system generalizes</div>
        <SourceSwitcher
          sources={SOURCES.map((s) => ({ id: s.id, label: s.label, blurb: s.blurb }))}
          activeId={sourceId}
        />
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Loaded: <code className="text-zinc-400">{path.split("/").slice(-2).join("/")}</code> · hash {bundle.sourceHash}</span>
          <Link href={`/launch/debug?source=${sourceId}`} className="hover:text-violet-300">View prompts + schemas →</Link>
        </div>
      </section>

      <div className="mb-8">
        <RegenerateButton hasCached={bundle.products[0]?.meta.model !== "fallback"} sourceId={sourceId} />
      </div>

      <ObservabilityPanel bundle={bundle} />

      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500">Platform layer</h2>
          <Link href="/how-it-works" className="text-xs text-zinc-500 hover:text-white">
            How this is wired →
          </Link>
        </div>
        <PlatformView platform={bundle.platform} />
      </section>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-4">Per-product asset pack</h2>
        <ProductSwitcher bundle={bundle} />
      </section>

      <section className="mt-12">
        <details className="rounded-2xl border border-white/5 bg-white/[0.02]">
          <summary className="cursor-pointer p-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
            View positioning source (first 24 lines)
          </summary>
          <pre className="px-5 pb-5 text-xs text-zinc-300 overflow-x-auto leading-relaxed">
{sourcePreview}
{"\n...\n"}
          </pre>
        </details>
      </section>
    </div>
  );
}
