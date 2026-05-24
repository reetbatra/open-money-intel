import type { ChainTvl } from "../types";

const REVALIDATE = 60 * 60;

export async function fetchChainTvls(): Promise<ChainTvl[]> {
  const res = await fetch("https://api.llama.fi/v2/chains", {
    next: { revalidate: REVALIDATE, tags: ["defillama-chains"] },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DefiLlama chains ${res.status}`);
  type Row = {
    name: string;
    tvl: number;
    tokenSymbol: string | null;
    chainId: number | string | null;
    gecko_id: string | null;
  };
  const rows = (await res.json()) as Row[];
  return rows.map((r) => ({
    name: r.name,
    tvl: r.tvl ?? 0,
    tokenSymbol: r.tokenSymbol,
    chainId: r.chainId,
    geckoId: r.gecko_id,
  }));
}

export async function fetchStablesMarketCap(): Promise<{ totalMcap: number; tvlOnL2s: number } | null> {
  try {
    const res = await fetch("https://stablecoins.llama.fi/stablecoinchains", {
      next: { revalidate: REVALIDATE, tags: ["defillama-stables"] },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    type Row = { name: string; totalCirculatingUSD?: { peggedUSD?: number } };
    const rows = (await res.json()) as Row[];
    let total = 0;
    let onL2 = 0;
    const l2Names = new Set([
      "Arbitrum",
      "Base",
      "Optimism",
      "Polygon",
      "Polygon zkEVM",
      "zkSync Era",
      "Linea",
      "Scroll",
      "Mantle",
      "Blast",
      "Starknet",
      "Manta",
      "Mode",
      "Taiko",
    ]);
    for (const row of rows) {
      const v = row.totalCirculatingUSD?.peggedUSD ?? 0;
      total += v;
      if (l2Names.has(row.name)) onL2 += v;
    }
    return { totalMcap: total, tvlOnL2s: onL2 };
  } catch {
    return null;
  }
}
