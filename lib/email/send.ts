import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "L2 Intel <briefing@l2-intel.dev>";

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendDigestEmail({ to, subject, html, text }: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] no RESEND_API_KEY — skipping send to ${to}`);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  const resend = new Resend(key);
  try {
    const res = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (res.error) return { ok: false, error: String(res.error.message) };
    return { ok: true, id: res.data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
