import type { PlatformAssets } from "@/lib/launch/types";
import { CopyBlock } from "./copy-block";

export function PlatformView({ platform }: { platform: PlatformAssets }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-[0.16em] text-violet-300">Master narrative</h3>
          <CopyBlock text={platform.master_narrative} />
        </div>
        <p className="text-zinc-200 leading-relaxed whitespace-pre-line">{platform.master_narrative}</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-[0.16em] text-zinc-500">Bundled pitch · why the stack &gt; the parts</h3>
          <CopyBlock text={platform.bundled_pitch} />
        </div>
        <p className="text-zinc-200 leading-relaxed whitespace-pre-line">{platform.bundled_pitch}</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-xs uppercase tracking-[0.16em] text-zinc-500 mb-4">ICP → product map</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {platform.icp_to_product_map.map((m) => (
            <div key={m.icp_id} className="rounded-xl border border-white/5 bg-black/30 p-4">
              <div className="text-sm font-medium text-zinc-100">{m.icp_id}</div>
              <div className="mt-1 text-xs text-zinc-500">→ lead with: {m.recommended_products.join(" · ")}</div>
              <div className="mt-2 text-sm text-zinc-300 leading-relaxed">{m.positioning}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 overflow-x-auto">
        <h3 className="text-xs uppercase tracking-[0.16em] text-zinc-500 mb-3">Cross-product positioning table</h3>
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr className="text-left">
              <th className="px-2 py-2 font-medium">Product</th>
              <th className="px-2 py-2 font-medium">Primary ICP</th>
              <th className="px-2 py-2 font-medium">Lead with it when…</th>
              <th className="px-2 py-2 font-medium">Primary competitor</th>
            </tr>
          </thead>
          <tbody>
            {platform.cross_product_table.map((r) => (
              <tr key={r.product_id} className="border-t border-white/5">
                <td className="px-2 py-2 font-medium text-zinc-100">{r.product_name}</td>
                <td className="px-2 py-2 text-zinc-300">{r.primary_icp}</td>
                <td className="px-2 py-2 text-zinc-300">{r.when_to_lead_with_it}</td>
                <td className="px-2 py-2 text-zinc-400">{r.primary_competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
