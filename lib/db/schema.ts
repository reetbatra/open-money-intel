import { pgTable, text, timestamp, uuid, boolean, jsonb, varchar } from "drizzle-orm/pg-core";

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("web"),
  verified: boolean("verified").default(true),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const digests = pgTable("digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  rangeStart: timestamp("range_start").notNull(),
  rangeEnd: timestamp("range_end").notNull(),
  payload: jsonb("payload").$type<unknown>().notNull(),
  htmlBody: text("html_body"),
  textBody: text("text_body"),
  sentAt: timestamp("sent_at"),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type Digest = typeof digests.$inferSelect;
export type NewDigest = typeof digests.$inferInsert;
