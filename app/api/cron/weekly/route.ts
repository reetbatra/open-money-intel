import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateBriefing } from "@/lib/intel/generate";
import { renderDigestHtml, renderDigestText } from "@/lib/email/render";
import { listActiveSubscribers, saveDigest, markDigestSent } from "@/lib/db/client";
import { sendDigestEmail } from "@/lib/email/send";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev — allow
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  return handle(req, false);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dispatch = url.searchParams.get("send") === "1";
  return handle(req, dispatch);
}

async function handle(req: Request, dispatch: boolean) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const siteUrl = `${url.protocol}//${url.host}`;

  const payload = await generateBriefing();
  const html = renderDigestHtml(payload, { siteUrl });
  const text = renderDigestText(payload, { siteUrl });

  const digest = await saveDigest({
    payload,
    htmlBody: html,
    textBody: text,
    rangeStart: new Date(payload.rangeStart),
    rangeEnd: new Date(payload.rangeEnd),
  });

  revalidatePath("/briefing");

  let sent = 0;
  let failed = 0;
  if (dispatch) {
    const subscribers = await listActiveSubscribers();
    const subject = `L2 Intel · week of ${new Date(payload.rangeEnd).toDateString()}`;
    for (const s of subscribers) {
      if (s.unsubscribedAt) continue;
      const personalizedHtml = html.replace(/\{\{email\}\}/g, encodeURIComponent(s.email));
      const result = await sendDigestEmail({
        to: s.email,
        subject,
        html: personalizedHtml,
        text,
      });
      if (result.ok) sent++;
      else {
        failed++;
        console.warn(`failed to send to ${s.email}: ${result.error}`);
      }
    }
    await markDigestSent(digest.id);
  }

  return NextResponse.json({
    ok: true,
    digestId: digest.id,
    dispatched: dispatch,
    sent,
    failed,
    generatedAt: payload.generatedAt,
  });
}
