import type { EcosystemId, EcosystemSummary, L2Project } from "../types";
import { ECOSYSTEMS, ecosystemMeta } from "./ecosystems";
import { fetchScalingSummary, fetchTvsChart, fetchAggregateActivity } from "./l2beat";
import { fetchChainTvls } from "./defillama";
import { loadPaymentRailSnapshots, fetchTotalStablecoinHistory, type PaymentRailSnapshot } from "./payments";

export interface DashboardData {
  projects: L2Project[];
  ecosystems: EcosystemSummary[];
  totalTvs: number;
  tvsHistory: Array<{ timestamp: number; total: number }>;
  activityHistory: Array<{ timestamp: number; count: number; uopsCount: number }>;
  defiLlamaChains: Awaited<ReturnType<typeof fetchChainTvls>>;
  rails: PaymentRailSnapshot[];
  totalStablecoinSupply: number;
  stablecoinHistory: Array<{ timestamp: number; supply: number }>;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [projects, tvsHistory, activityHistory, defiLlamaChains, rails, stablecoinHistory] = await Promise.all([
    fetchScalingSummary("30d"),
    fetchTvsChart("90d"),
    fetchAggregateActivity("90d"),
    fetchChainTvls().catch(() => []),
    loadPaymentRailSnapshots().catch((e) => {
      console.warn("rails load failed", e);
      return [] as PaymentRailSnapshot[];
    }),
    fetchTotalStablecoinHistory().catch(() => [] as Array<{ timestamp: number; supply: number }>),
  ]);

  const ecosystems = buildEcosystemSummaries(projects);
  const totalTvs = projects.reduce((s, p) => s + p.tvsTotal, 0);
  const totalStablecoinSupply = stablecoinHistory.at(-1)?.supply ?? rails.reduce((s, r) => s + r.stablecoinSupply, 0);

  return {
    projects,
    ecosystems,
    totalTvs,
    tvsHistory,
    activityHistory,
    defiLlamaChains,
    rails,
    totalStablecoinSupply,
    stablecoinHistory: stablecoinHistory.slice(-180),
  };
}

function buildEcosystemSummaries(projects: L2Project[]): EcosystemSummary[] {
  const ids: EcosystemId[] = ["agglayer", "superchain", "orbit", "zk-stack", "independent"];
  return ids.map((id) => {
    const meta = ecosystemMeta(id);
    const chains = projects.filter((p) => p.ecosystem === id);
    const totalTvs = chains.reduce((s, c) => s + c.tvsTotal, 0);
    const weightedChange =
      totalTvs > 0 ? chains.reduce((s, c) => s + (c.change7d ?? 0) * c.tvsTotal, 0) / totalTvs : 0;
    return {
      id,
      name: meta.name,
      description: meta.description,
      chains,
      totalTvs,
      avgChange7d: weightedChange,
      chainCount: chains.length,
    };
  });
}

export function topMovers(projects: L2Project[], n = 5): L2Project[] {
  return [...projects]
    .filter((p) => p.tvsTotal > 50_000_000 && p.change7d != null)
    .sort((a, b) => Math.abs(b.change7d ?? 0) - Math.abs(a.change7d ?? 0))
    .slice(0, n);
}

export function topByTvs(projects: L2Project[], n = 15): L2Project[] {
  return [...projects].sort((a, b) => b.tvsTotal - a.tvsTotal).slice(0, n);
}

export function topRailMovers(rails: PaymentRailSnapshot[], n = 5): PaymentRailSnapshot[] {
  return [...rails]
    .filter((r) => r.change7d != null && r.stablecoinSupply > 100_000_000)
    .sort((a, b) => Math.abs(b.change7d ?? 0) - Math.abs(a.change7d ?? 0))
    .slice(0, n);
}

export { ECOSYSTEMS };
