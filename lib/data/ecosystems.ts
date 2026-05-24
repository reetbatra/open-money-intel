import type { EcosystemId } from "../types";

// Curated ecosystem membership. Slugs match L2Beat ids where possible.
// AggLayer is the spotlight — chains officially connected or in active integration.
export const ECOSYSTEMS: Record<EcosystemId, { name: string; description: string; slugs: string[] }> = {
  agglayer: {
    name: "AggLayer",
    description:
      "Polygon's interop protocol unifying liquidity, state, and users across connected chains. Built on the CDK and pessimistic proof system.",
    slugs: [
      "polygon-zkevm",
      "xlayer",
      "astar",
      "wirexpaychain",
      "silicon",
      "haust",
      "lumiamainnet",
      "katana",
      "ternoa",
    ],
  },
  superchain: {
    name: "Superchain (OP Stack)",
    description:
      "Optimism's Superchain — chains sharing a fault proof system and sequencer layer. Closest competitor in the unified-L2 narrative.",
    slugs: [
      "optimism",
      "base",
      "mode",
      "zora",
      "worldchain",
      "ink",
      "soneium",
      "lisk",
      "fraxtal",
      "redstone",
      "unichain",
      "swell",
      "mintchain",
    ],
  },
  orbit: {
    name: "Arbitrum Orbit",
    description: "Arbitrum's L3-and-beyond program — sovereign chains settling to Arbitrum One or Nova.",
    slugs: ["arbitrum", "arbitrumnova", "xai", "apechain", "kinto", "rari", "sanko", "deri", "cyber", "proofofplay"],
  },
  "zk-stack": {
    name: "ZK Stack (Elastic Network)",
    description: "Matter Labs' ZK Stack — Elastic Network chains sharing zkSync's proving and bridging.",
    slugs: ["zksync-era", "abstract", "sophon", "cronoszkevm", "treasure", "lens", "wondernetwork"],
  },
  independent: {
    name: "Independent",
    description: "Major L2s not aligned with a unified ecosystem program.",
    slugs: ["starknet", "linea", "scroll", "mantle", "blast", "taiko", "manta", "metis"],
  },
  other: { name: "Other", description: "Everything else.", slugs: [] },
};

export function ecosystemOf(slug: string): EcosystemId {
  for (const [id, eco] of Object.entries(ECOSYSTEMS) as [EcosystemId, typeof ECOSYSTEMS.agglayer][]) {
    if (eco.slugs.includes(slug)) return id;
  }
  return "other";
}

export function ecosystemMeta(id: EcosystemId) {
  return ECOSYSTEMS[id];
}
