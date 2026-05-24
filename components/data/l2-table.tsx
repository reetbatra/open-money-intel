import Link from "next/link";
import type { L2Project } from "@/lib/types";
import { formatUsd, formatPct, changeColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function L2Table({ projects, limit, highlight }: { projects: L2Project[]; limit?: number; highlight?: "agglayer" }) {
  const rows = limit ? projects.slice(0, limit) : projects;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full text-sm tabular">
        <thead className="bg-white/[0.02] text-zinc-400">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Chain</th>
            <th className="px-4 py-3 font-medium">Ecosystem</th>
            <th className="px-4 py-3 font-medium">Stage</th>
            <th className="px-4 py-3 font-medium text-right">TVS</th>
            <th className="px-4 py-3 font-medium text-right">7d Δ</th>
            <th className="px-4 py-3 font-medium text-right">Stablecoins</th>
            <th className="px-4 py-3 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const isHighlight = highlight === "agglayer" && p.ecosystem === "agglayer";
            return (
              <tr
                key={p.slug}
                className={`border-t border-white/5 hover:bg-white/[0.03] transition ${isHighlight ? "bg-violet-500/[0.04]" : ""}`}
              >
                <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/chains/${p.slug}`} className="font-medium text-zinc-100 hover:text-white">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.ecosystem === "other" ? "ghost" : p.ecosystem}>
                    {ecosystemLabel(p.ecosystem)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.stage}</td>
                <td className="px-4 py-3 text-right">{formatUsd(p.tvsTotal)}</td>
                <td className={`px-4 py-3 text-right ${changeColor(p.change7d)}`}>
                  {formatPct(p.change7d)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-400">{formatUsd(p.tvsStablecoin)}</td>
                <td className="px-4 py-3 text-zinc-400">{p.category}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ecosystemLabel(id: L2Project["ecosystem"]): string {
  switch (id) {
    case "agglayer":
      return "AggLayer";
    case "superchain":
      return "Superchain";
    case "orbit":
      return "Orbit";
    case "zk-stack":
      return "ZK Stack";
    case "independent":
      return "Independent";
    default:
      return "—";
  }
}
