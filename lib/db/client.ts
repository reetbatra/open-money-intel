import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import * as schema from "./schema";
import type { DigestPayload } from "../types";

const DATABASE_URL = process.env.DATABASE_URL;

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;
function db(): DB | null {
  if (!DATABASE_URL) return null;
  if (_db) return _db;
  _db = drizzle(neon(DATABASE_URL), { schema });
  return _db;
}

// In-memory fallback so local dev works without a database.
// Stored on globalThis so it survives module re-imports across Next.js workers.
const g = globalThis as unknown as {
  __l2IntelSubs?: Map<string, schema.Subscriber>;
  __l2IntelDigests?: schema.Digest[];
};
const memSubscribers: Map<string, schema.Subscriber> = (g.__l2IntelSubs ??= new Map());
const memDigests: schema.Digest[] = (g.__l2IntelDigests ??= []);

export async function addSubscriber(email: string, source = "web"): Promise<{ ok: true; created: boolean }> {
  const normalized = email.trim().toLowerCase();
  const conn = db();
  if (!conn) {
    if (memSubscribers.has(normalized)) return { ok: true, created: false };
    memSubscribers.set(normalized, {
      id: crypto.randomUUID(),
      email: normalized,
      source,
      verified: true,
      unsubscribedAt: null,
      createdAt: new Date(),
    });
    return { ok: true, created: true };
  }
  const existing = await conn.select().from(schema.subscribers).where(eq(schema.subscribers.email, normalized)).limit(1);
  if (existing[0]) return { ok: true, created: false };
  await conn.insert(schema.subscribers).values({ email: normalized, source });
  return { ok: true, created: true };
}

export async function listActiveSubscribers(): Promise<schema.Subscriber[]> {
  const conn = db();
  if (!conn) return Array.from(memSubscribers.values()).filter((s) => !s.unsubscribedAt);
  return conn
    .select()
    .from(schema.subscribers)
    .where(eq(schema.subscribers.verified, true));
}

export async function unsubscribe(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const conn = db();
  if (!conn) {
    const s = memSubscribers.get(normalized);
    if (!s) return false;
    s.unsubscribedAt = new Date();
    return true;
  }
  await conn
    .update(schema.subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(schema.subscribers.email, normalized));
  return true;
}

export async function saveDigest(d: {
  payload: DigestPayload;
  htmlBody: string;
  textBody: string;
  rangeStart: Date;
  rangeEnd: Date;
}): Promise<schema.Digest> {
  const conn = db();
  if (!conn) {
    const row: schema.Digest = {
      id: crypto.randomUUID(),
      generatedAt: new Date(),
      rangeStart: d.rangeStart,
      rangeEnd: d.rangeEnd,
      payload: d.payload,
      htmlBody: d.htmlBody,
      textBody: d.textBody,
      sentAt: null,
    };
    memDigests.unshift(row);
    return row;
  }
  const [row] = await conn
    .insert(schema.digests)
    .values({
      payload: d.payload,
      htmlBody: d.htmlBody,
      textBody: d.textBody,
      rangeStart: d.rangeStart,
      rangeEnd: d.rangeEnd,
    })
    .returning();
  return row;
}

export async function getLatestDigest(): Promise<schema.Digest | null> {
  const conn = db();
  if (!conn) return memDigests[0] ?? null;
  const [row] = await conn.select().from(schema.digests).orderBy(desc(schema.digests.generatedAt)).limit(1);
  return row ?? null;
}

export async function markDigestSent(id: string): Promise<void> {
  const conn = db();
  if (!conn) {
    const d = memDigests.find((x) => x.id === id);
    if (d) d.sentAt = new Date();
    return;
  }
  await conn.update(schema.digests).set({ sentAt: new Date() }).where(eq(schema.digests.id, id));
}

export function isDbConfigured(): boolean {
  return Boolean(DATABASE_URL);
}
