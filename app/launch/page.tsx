import { latestBundle, saveBundle } from "@/lib/launch/store";
import { buildFallbackBundle } from "@/lib/launch/fallback";
import { ObservabilityPanel } from "@/components/launch/observability-panel";
import { PlatformView } from "@/components/launch/platform-view";
import { ProductSwitcher } from "@/components/launch/product-switcher";
import { RegenerateButton } from "@/components/launch/regenerate-button";
import { loadPositioningSourceText } from "@/lib/launch/source";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  let bundle = latestBundle();
  if (!bundle) {
    bundle = buildFallbackBundle();
    saveBundle(bundle);
  }
  const { path, text } = loadPositioningSourceText();
  const sourcePreview = text.split("\n").slice(0, 24).join("\n");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200">
          Launch in a Box · positioning → assets in one pass
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Compress positioning into shipped assets.</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          One source of truth (<code className="text-zinc-300">{path.split("/").slice(-2).join("/")}</code>) →
          one Claude pipeline → six assets per product plus the platform-level pitch.
          The PMM owns strategic inputs; AI handles production volume.
        </p>
        <div className="mt-5">
          <RegenerateButton hasCached={bundle.products[0]?.meta.model !== "fallback"} />
        </div>
      </header>

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
