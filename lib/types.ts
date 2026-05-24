export type EcosystemId = "agglayer" | "superchain" | "orbit" | "zk-stack" | "independent" | "other";
export type PaymentRailId = "polygon-stack" | "tron" | "solana-pay" | "base-pay" | "circle" | "ton" | "bsc";

export type Stage = "Stage 0" | "Stage 1" | "Stage 2" | "Not applicable" | "Under review" | string;

export type Category =
  | "Optimistic Rollup"
  | "ZK Rollup"
  | "Validium"
  | "Optimium"
  | "Plasma"
  | "Other"
  | string;

export interface L2Project {
  slug: string;
  name: string;
  category: Category;
  stage: Stage;
  hostChain: string;
  providers: string[];
  purposes: string[];
  tvsTotal: number;
  tvsNative: number;
  tvsCanonical: number;
  tvsExternal: number;
  tvsEther: number;
  tvsStablecoin: number;
  tvsBtc: number;
  tvsOther: number;
  change7d: number | null;
  badges: string[];
  ecosystem: EcosystemId;
  isUnderReview: boolean;
  isArchived: boolean;
}

export interface ChainTvl {
  name: string;
  tvl: number;
  tokenSymbol: string | null;
  chainId: number | string | null;
  geckoId: string | null;
}

export interface ActivityPoint {
  timestamp: number;
  count: number;
  uopsCount: number;
}

export interface EcosystemSummary {
  id: EcosystemId;
  name: string;
  description: string;
  chains: L2Project[];
  totalTvs: number;
  avgChange7d: number;
  chainCount: number;
}

export interface DigestPayload {
  generatedAt: string;
  rangeStart: string;
  rangeEnd: string;
  movers: Array<{ id: string; name: string; change7d: number; supply: number; reason: string }>;
  railComparison: Array<{
    id: PaymentRailId;
    name: string;
    supply: number;
    change7d: number | null;
    isPolygonStack: boolean;
  }>;
  openMoneyAngle: string;
  narrative: string;
  battlecards: Array<{ question: string; answer: string }>;
  totalStablecoinSupply: number;
  stablecoinTrend: Array<{ timestamp: number; supply: number }>;
}
