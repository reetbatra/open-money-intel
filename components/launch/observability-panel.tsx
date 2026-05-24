import type { LaunchBundle } from "@/lib/launch/types";

export function ObservabilityPanel({ bundle }: { bundle: LaunchBundle }) {
  const isFallback = bundle.products[0]?.meta.model === "fallback";
  const totalCallCount = bundle.totals.callCount;
  const totalLatencySec = bundle.totals.totalLatencyMs / 1000;
  const totalAssets = 1 + bundle.products.length * 6;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Pipeline observability</div>
        {isFallback ? (
          <span className="rounded-full bg-zinc-700/40 text-zinc-300 px-2 py-0.5 text-[10px]">Template mode</span>
        ) : (
          <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-0.5 text-[10px]">Live model</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3 tabular">
        <Metric label="Assets generated" value={totalAssets.toString()} sub={`${bundle.products.length} products × 6 + platform`} />
        <Metric label="Claude calls" value={totalCallCount.toString()} sub={isFallback ? "n/a (template)" : "parallel where safe"} />
        <Metric label="Total latency" value={`${totalLatencySec.toFixed(1)}s`} sub="wall time" />
        <Metric label="Total tokens" value={bundle.totals.totalTokens.toLocaleString()} sub="input + output" />
        <Metric label="Est. cost" value={`$${bundle.totals.totalCostUsd.toFixed(3)}`} sub="at Sonnet 4.6 rates" />
      </div>
      <div className="mt-4 text-[11px] text-zinc-500">
        Source: <code className="text-zinc-400">{bundle.sourcePath.split("/").slice(-2).join("/")}</code>
        {" · "}hash <code className="text-zinc-400">{bundle.sourceHash}</code>
        {" · "}generated <code className="text-zinc-400">{new Date(bundle.generatedAt).toLocaleString()}</code>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {sub && <div className="text-[10px] text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}
