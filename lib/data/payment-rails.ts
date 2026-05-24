import type { PaymentRailId } from "../types";

export interface PaymentRailDef {
  id: PaymentRailId;
  name: string;
  description: string;
  isPolygonStack?: boolean;
  /** DefiLlama chain names that compose this rail's stablecoin footprint. */
  dlChains: string[];
  notableProducts: string[];
}

export const PAYMENT_RAILS: PaymentRailDef[] = [
  {
    id: "polygon-stack",
    name: "Polygon Open Money Stack",
    description:
      "Polygon's API-driven money-movement stack — PoS for liquidity depth, AggLayer for cross-chain unification, CDK for issuer chains, zkEVM for verifiable settlement.",
    isPolygonStack: true,
    dlChains: ["Polygon", "Polygon zkEVM"],
    notableProducts: ["Polygon PoS", "AggLayer", "Polygon CDK", "Polygon zkEVM", "Polygon Miden"],
  },
  {
    id: "tron",
    name: "Tron",
    description:
      "The pragmatic incumbent. Dominates USDT settlement in emerging markets via low fees and remittance corridors. Polygon's biggest competitor for global stablecoin payments by volume.",
    dlChains: ["Tron"],
    notableProducts: ["TRC-20 USDT", "JustLend"],
  },
  {
    id: "solana-pay",
    name: "Solana Pay",
    description:
      "Visa-aligned payments narrative. High-throughput, low-fee chain with a growing fintech and merchant integration story — the platform competitor to convert.",
    dlChains: ["Solana"],
    notableProducts: ["Solana Pay", "Phantom Pay", "Helio"],
  },
  {
    id: "base-pay",
    name: "Base / Coinbase Payments",
    description:
      "Coinbase's distribution into onchain payments. Strong consumer wallet funnel; ICP overlap on US-fintech buyers but weak outside US/EU.",
    dlChains: ["Base"],
    notableProducts: ["Base", "Coinbase Onchain Payments", "Smart Wallet"],
  },
  {
    id: "circle",
    name: "Circle (USDC + CCTP)",
    description:
      "The issuer-led narrative. Owns the regulated dollar and the cross-chain transport. Competes upstream — Polygon needs to be Circle's best home, not its replacement.",
    dlChains: ["Ethereum", "Avalanche", "Arbitrum"],
    notableProducts: ["USDC", "EURC", "CCTP v2", "Programmable Wallets", "Bridge.xyz (Stripe)"],
  },
  {
    id: "ton",
    name: "TON",
    description:
      "Telegram-distributed payments. Consumer-first, in-app, growing fast. Different ICP than Polygon today — but the playbook for embedded crypto money movement to watch.",
    dlChains: ["TON"],
    notableProducts: ["Wallet in Telegram", "Toncoin", "USDT on TON"],
  },
  {
    id: "bsc",
    name: "BSC",
    description:
      "Quietly persistent. Largest USDT chain after Tron and the default rail for parts of APAC retail. Often missed in US-centric competitor maps.",
    dlChains: ["BSC"],
    notableProducts: ["Binance Pay", "BUSD legacy"],
  },
];

export function railById(id: PaymentRailId): PaymentRailDef | undefined {
  return PAYMENT_RAILS.find((r) => r.id === id);
}
