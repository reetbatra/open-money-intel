import type { PaymentRailId } from "../types";
import { PAYMENT_RAILS } from "./payment-rails";

const REVALIDATE = 60 * 60;

export interface ChainStablecoin {
  name: string;
  supply: number;
  change7d: number | null;
  change30d: number | null;
  history?: Array<{ timestamp: number; supply: number }>;
}

interface StableChainsRow {
  name: string;
  totalCirculatingUSD?: { peggedUSD?: number };
}

interface StableChartRow {
  date: string;
  totalCirculatingUSD?: { peggedUSD?: number };
}

export async function fetchStablecoinChains(): Promise<ChainStablecoin[]> {
  const res = await fetch("https://stablecoins.llama.fi/stablecoinchains", {
    next: { revalidate: REVALIDATE, tags: ["dl-stablecoinchains"] },
  });
  if (!res.ok) throw new Error(`stablecoinchains ${res.status}`);
  const rows = (await res.json()) as StableChainsRow[];
  return rows
    .filter((r) => (r.totalCirculatingUSD?.peggedUSD ?? 0) > 0)
    .map((r) => ({
      name: r.name,
      supply: r.totalCirculatingUSD?.peggedUSD ?? 0,
      change7d: null,
      change30d: null,
    }))
    .sort((a, b) => b.supply - a.supply);
}

export async function fetchChainStablecoinHistory(chain: string): Promise<Array<{ timestamp: number; supply: number }>> {
  const res = await fetch(`https://stablecoins.llama.fi/stablecoincharts/${encodeURIComponent(chain)}`, {
    next: { revalidate: REVALIDATE, tags: [`dl-stablecoinchart-${chain}`] },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as StableChartRow[];
  return rows.map((r) => ({
    timestamp: Number(r.date) * 1000,
    supply: r.totalCirculatingUSD?.peggedUSD ?? 0,
  }));
}

export async function fetchTotalStablecoinHistory(): Promise<Array<{ timestamp: number; supply: number }>> {
  const res = await fetch("https://stablecoins.llama.fi/stablecoincharts/all", {
    next: { revalidate: REVALIDATE, tags: ["dl-stablecoinchart-all"] },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as StableChartRow[];
  return rows.map((r) => ({
    timestamp: Number(r.date) * 1000,
    supply: r.totalCirculatingUSD?.peggedUSD ?? 0,
  }));
}

export interface PaymentRailSnapshot {
  id: PaymentRailId;
  name: string;
  description: string;
  isPolygonStack: boolean;
  stablecoinSupply: number;
  change7d: number | null;
  change30d: number | null;
  chains: string[];
  history: Array<{ timestamp: number; supply: number }>;
}

function changeOver(history: Array<{ timestamp: number; supply: number }>, days: number): number | null {
  if (history.length < days + 1) return null;
  const last = history[history.length - 1].supply;
  const prev = history[history.length - 1 - days].supply;
  if (!prev) return null;
  return (last - prev) / prev;
}

function sumHistories(
  histories: Array<Array<{ timestamp: number; supply: number }>>,
): Array<{ timestamp: number; supply: number }> {
  const map = new Map<number, number>();
  for (const h of histories) {
    for (const p of h) map.set(p.timestamp, (map.get(p.timestamp) ?? 0) + p.supply);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([timestamp, supply]) => ({ timestamp, supply }));
}

export async function loadPaymentRailSnapshots(): Promise<PaymentRailSnapshot[]> {
  const results: PaymentRailSnapshot[] = [];
  for (const rail of PAYMENT_RAILS) {
    const histories = await Promise.all(rail.dlChains.map((c) => fetchChainStablecoinHistory(c)));
    const totalHistory = sumHistories(histories);
    const supply = totalHistory.at(-1)?.supply ?? 0;
    results.push({
      id: rail.id,
      name: rail.name,
      description: rail.description,
      isPolygonStack: rail.isPolygonStack ?? false,
      stablecoinSupply: supply,
      change7d: changeOver(totalHistory, 7),
      change30d: changeOver(totalHistory, 30),
      chains: rail.dlChains,
      history: totalHistory.slice(-90),
    });
  }
  return results.sort((a, b) => (b.isPolygonStack ? 1 : 0) - (a.isPolygonStack ? 1 : 0) || b.stablecoinSupply - a.stablecoinSupply);
}
