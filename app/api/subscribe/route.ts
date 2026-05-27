import { NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber, getLatestDigest } from "@/lib/db/client";
import { renderDigestHtml, renderDigestText } from "@/lib/email/render";
import { sendDigestEmail } from "@/lib/email/send";

export const runtime = "nodejs";

const body = z.object({
  email: z.string().email().max(320),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const result = await addSubscriber(parsed.email, parsed.source ?? "web");
    if (!result.created) {
      return NextResponse.json({ ok: true, message: "You're already on the list." });
    }

    const latest = await getLatestDigest();
    if (!latest) {
      return NextResponse.json({
        ok: true,
        message: "Subscribed. The first briefing lands Monday.",
      });
    }

    const url = new URL(req.url);
    const siteUrl = `${url.protocol}//${url.host}`;
    const html = renderDigestHtml(latest.payload as never, { siteUrl }).replace(
      /\{\{email\}\}/g,
      encodeURIComponent(parsed.email),
    );
    const text = renderDigestText(latest.payload as never, { siteUrl });
    const subject = `L2 Intel · week of ${new Date(latest.generatedAt).toDateString()}`;

    const sent = await sendDigestEmail({ to: parsed.email, subject, html, text });
    if (!sent.ok) console.warn(`welcome send failed to ${parsed.email}: ${sent.error}`);

    return NextResponse.json({
      ok: true,
      message: sent.ok
        ? "Subscribed. The latest briefing is on its way to your inbox."
        : "Subscribed. The next briefing lands Monday.",
    });
  } catch (err) {
    console.error("subscribe error", err);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
