import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    db: isDbConfigured() ? "configured" : "in-memory",
    resend: process.env.RESEND_API_KEY ? "configured" : "missing",
    cron: process.env.CRON_SECRET ? "secured" : "open (dev)",
    time: new Date().toISOString(),
  });
}
