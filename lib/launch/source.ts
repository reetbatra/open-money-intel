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

const SOURCE_FILE = process.env.POSITIONING_SOURCE ?? "positioning/open-money-stack.yml";

export function loadPositioningSource(): PositioningSource {
  const path = resolve(process.cwd(), SOURCE_FILE);
  const raw = readFileSync(path, "utf8");
  const parsed = parseYaml(raw);
  return positioningSourceSchema.parse(parsed);
}

export function loadPositioningSourceText(): { path: string; text: string } {
  const path = resolve(process.cwd(), SOURCE_FILE);
  const text = readFileSync(path, "utf8");
  return { path, text };
}
