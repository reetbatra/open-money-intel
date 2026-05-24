export interface AssetMeta {
  generatedAt: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export interface OnePagerAsset {
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  features: Array<{ name: string; body: string }>;
  proof: string[];
  cta: { primary: string; secondary: string };
}

export interface LandingBlock {
  hero: { headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string };
  features: Array<{ title: string; body: string }>;
  socialProof: string;
  faq: Array<{ question: string; answer: string }>;
}

export interface EmailNurture {
  sequence: Array<{
    day: number;
    subject: string;
    preheader: string;
    body: string;
  }>;
}

export interface LinkedInAds {
  variants: Array<{
    angle: string;
    headline: string;
    intro: string;
    cta: string;
  }>;
}

export interface BattlecardSet {
  cards: Array<{
    competitor: string;
    short_take: string;
    why_we_win: string;
    where_they_win: string;
    objection_handling: Array<{ question: string; response: string }>;
  }>;
}

export interface BdTalkTrack {
  opener: string;
  qualifying_questions: string[];
  talking_points: string[];
  common_objections: Array<{ objection: string; response: string }>;
  close: string;
}

export interface ProductAssets {
  productId: string;
  productName: string;
  one_pager: OnePagerAsset;
  landing_block: LandingBlock;
  email_nurture: EmailNurture;
  linkedin_ads: LinkedInAds;
  battlecards: BattlecardSet;
  bd_talk_track: BdTalkTrack;
  meta: AssetMeta;
}

export interface PlatformAssets {
  master_narrative: string;
  bundled_pitch: string;
  icp_to_product_map: Array<{ icp_id: string; recommended_products: string[]; positioning: string }>;
  cross_product_table: Array<{
    product_id: string;
    product_name: string;
    primary_icp: string;
    when_to_lead_with_it: string;
    primary_competitor: string;
  }>;
  meta: AssetMeta;
}

export interface LaunchBundle {
  generatedAt: string;
  sourceId: string;
  sourceLabel: string;
  sourcePath: string;
  sourceHash: string;
  platform: PlatformAssets;
  products: ProductAssets[];
  totals: {
    totalLatencyMs: number;
    totalTokens: number;
    totalCostUsd: number;
    callCount: number;
  };
  prompts?: BundlePrompts;
}

export interface CallTrace {
  asset: string;
  productId?: string;
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
}

export interface BundlePrompts {
  platform: CallTrace;
  products: Array<{ productId: string; productName: string; calls: CallTrace[] }>;
}
