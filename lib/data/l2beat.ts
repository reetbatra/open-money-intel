import type { L2Project, ActivityPoint } from "../types";
import { ecosystemOf } from "./ecosystems";

const BASE = "https://l2beat.com/api";

// Cache for 1h; the digest cron forces a fresh fetch.
const REVALIDATE = 60 * 60;

interface SummaryProject {
  id: string;
  name: string;
  slug: string;
  type: string;
  hostChain: string;
  category: string;
  providers?: string[];
  purposes?: string[];
  isArchived?: boolean;
  isUnderReview?: boolean;
  stage?: string;
  badges?: Array<{ name: string }>;
  tvs?: {
    breakdown?: {
      total?: number;
      native?: number;
      canonical?: number;
      external?: number;
      ether?: number;
      stablecoin?: number;
      btc?: number;
      other?: number;
    };
    change7d?: number;
  };
}

interface SummaryResponse {
  chart?: { types: string[]; data: number[][] };
  projects: Record<string, SummaryProject>;
}

interface ActivityResponse {
  success: boolean;
  data?: { chart?: { types: string[]; data: number[][] } };
}

export async function fetchScalingSummary(range = "30d"): Promise<L2Project[]> {
  const res = await fetch(`${BASE}/scaling/summary?range=${range}`, {
    next: { revalidate: REVALIDATE, tags: ["l2beat-summary"] },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`L2Beat summary ${res.status}`);
  const json = (await res.json()) as SummaryResponse;
  const projects: L2Project[] = [];
  for (const p of Object.values(json.projects || {})) {
    if (p.isArchived) continue;
    if (p.type !== "layer2" && p.type !== "layer3") continue;
    const b = p.tvs?.breakdown ?? {};
    projects.push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      stage: p.stage ?? "Not applicable",
      hostChain: p.hostChain ?? "Ethereum",
      providers: p.providers ?? [],
      purposes: p.purposes ?? [],
      tvsTotal: b.total ?? 0,
      tvsNative: b.native ?? 0,
      tvsCanonical: b.canonical ?? 0,
      tvsExternal: b.external ?? 0,
      tvsEther: b.ether ?? 0,
      tvsStablecoin: b.stablecoin ?? 0,
      tvsBtc: b.btc ?? 0,
      tvsOther: b.other ?? 0,
      change7d: p.tvs?.change7d ?? null,
      badges: (p.badges ?? []).map((bg) => bg.name),
      ecosystem: ecosystemOf(p.slug),
      isUnderReview: p.isUnderReview ?? false,
      isArchived: p.isArchived ?? false,
    });
  }
  return projects.sort((a, b) => b.tvsTotal - a.tvsTotal);
}

export async function fetchTvsChart(range = "90d"): Promise<Array<{ timestamp: number; total: number }>> {
  const res = await fetch(`${BASE}/scaling/summary?range=${range}`, {
    next: { revalidate: REVALIDATE, tags: ["l2beat-summary"] },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`L2Beat summary chart ${res.status}`);
  const json = (await res.json()) as SummaryResponse;
  const rows = json.chart?.data ?? [];
  // types: timestamp, native, canonical, external, ethPrice
  return rows.map(([ts, native, canonical, external]) => ({
    timestamp: ts * 1000,
    total: (native ?? 0) + (canonical ?? 0) + (external ?? 0),
  }));
}

export async function fetchAggregateActivity(range = "90d"): Promise<ActivityPoint[]> {
  const res = await fetch(`${BASE}/scaling/activity?range=${range}`, {
    next: { revalidate: REVALIDATE, tags: ["l2beat-activity"] },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`L2Beat activity ${res.status}`);
  const json = (await res.json()) as ActivityResponse;
  const rows = json.data?.chart?.data ?? [];
  return rows.map(([ts, count, uops]) => ({
    timestamp: ts * 1000,
    count: count ?? 0,
    uopsCount: uops ?? count ?? 0,
  }));
}
