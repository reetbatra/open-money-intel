import { z } from "zod";
import { parse as parseYaml } from "yaml";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const competitorSchema = z.object({
  name: z.string(),
  positioning_vs: z.string().min(20).describe("How we position against this competitor in one or two lines."),
});

export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  one_liner: z.string().max(160),
  category: z.string(),
  status: z.enum(["ga", "beta", "private-beta", "coming-soon"]).default("ga"),
  job_to_be_done: z.string(),
  icps: z.array(z.string()).min(1),
  differentiators: z.array(z.string()).min(2),
  competitors: z.array(competitorSchema).min(1),
  proof_points: z.array(z.string()).min(1),
  primary_metric: z.string().optional(),
});

export const platformSchema = z.object({
  name: z.string(),
  one_liner: z.string(),
  category: z.string(),
  positioning_statement: z.string(),
  bundled_value_prop: z.string(),
  icp_segments: z.array(z.object({ id: z.string(), label: z.string(), description: z.string() })).min(1),
  tone: z
    .object({
      voice: z.array(z.string()).default([]),
      forbidden_words: z.array(z.string()).default([]),
      reference_voice: z.string().optional(),
    })
    .default({ voice: [], forbidden_words: [] }),
});

export const positioningSourceSchema = z.object({
  meta: z
    .object({
      version: z.string().default("1"),
      author: z.string().optional(),
      updated: z.string().optional(),
    })
    .default({ version: "1" }),
  platform: platformSchema,
  products: z.array(productSchema).min(1),
});

export type PositioningSource = z.infer<typeof positioningSourceSchema>;
export type ProductPositioning = z.infer<typeof productSchema>;

export interface SourceDescriptor {
  id: string;
  label: string;
  file: string;
  blurb: string;
}

export const SOURCES: SourceDescriptor[] = [
  {
    id: "polygon",
    label: "Polygon Open Money Stack",
    file: "positioning/open-money-stack.yml",
    blurb: "The product. Four-product platform, multi-asset, multi-chain.",
  },
  {
    id: "circle",
    label: "Circle Stablecoin Network",
    file: "positioning/circle-stablecoin-network.yml",
    blurb: "Competitor lens. Same buyer, single-issuer shape.",
  },
];

export const DEFAULT_SOURCE_ID = SOURCES[0].id;

export function getSourceDescriptor(id?: string | null): SourceDescriptor {
  if (!id) return SOURCES[0];
  return SOURCES.find((s) => s.id === id) ?? SOURCES[0];
}

export function loadPositioningSource(sourceId?: string | null): PositioningSource {
  const desc = getSourceDescriptor(sourceId);
  const path = resolve(process.cwd(), desc.file);
  const raw = readFileSync(path, "utf8");
  const parsed = parseYaml(raw);
  return positioningSourceSchema.parse(parsed);
}

export function loadPositioningSourceText(sourceId?: string | null): { id: string; path: string; text: string; descriptor: SourceDescriptor } {
  const desc = getSourceDescriptor(sourceId);
  const path = resolve(process.cwd(), desc.file);
  const text = readFileSync(path, "utf8");
  return { id: desc.id, path, text, descriptor: desc };
}
