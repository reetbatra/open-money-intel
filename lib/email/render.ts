import type { DigestPayload } from "@/lib/types";
import { formatUsd, formatPct } from "@/lib/utils";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export function renderDigestHtml(d: DigestPayload, opts: { siteUrl: string }): string {
  const { siteUrl } = opts;
  const polygon = d.railComparison.find((r) => r.isPolygonStack);
  const tron = d.railComparison.find((r) => r.id === "tron");

  const moversRows = d.movers
    .map(
      (m) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">
          <span style="color:#7c3aed;font-weight:600;">${esc(m.name)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-variant-numeric:tabular-nums;text-align:right;">${esc(formatUsd(m.supply))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-variant-numeric:tabular-nums;text-align:right;color:${m.change7d >= 0 ? "#10b981" : "#f43f5e"};">${esc(formatPct(m.change7d))}</td>
      </tr>
      <tr><td colspan="3" style="padding:0 12px 12px;color:#555;font-size:13px;line-height:1.5;">${esc(m.reason)}</td></tr>`,
    )
    .join("");

  const battlecards = d.battlecards
    .map(
      (b) => `
      <div style="margin:18px 0;padding:14px 16px;background:#f8f8fb;border-left:3px solid #7c3aed;border-radius:6px;">
        <div style="font-weight:600;color:#111;">${esc(b.question)}</div>
        <div style="margin-top:6px;color:#333;font-size:14px;line-height:1.6;">${esc(b.answer)}</div>
      </div>`,
    )
    .join("");

  const dateLabel = new Date(d.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open Money Intel — ${esc(dateLabel)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;">
<div style="max-width:640px;margin:0 auto;background:#ffffff;">
  <div style="padding:28px 28px 0;">
    <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#f3eaff;color:#7c3aed;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Open Money Intel · weekly</div>
    <h1 style="margin:12px 0 4px;font-size:26px;line-height:1.2;">${esc(dateLabel)}</h1>
    <div style="color:#666;font-size:13px;">
      Onchain stablecoin supply: <strong style="color:#111;">${esc(formatUsd(d.totalStablecoinSupply))}</strong>
      ${polygon ? ` · Polygon Stack: <strong style="color:#111;">${esc(formatUsd(polygon.supply))}</strong>` : ""}
      ${tron ? ` · Tron: <strong style="color:#111;">${esc(formatUsd(tron.supply))}</strong>` : ""}
    </div>
  </div>

  <div style="padding:24px 28px;">
    <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:0.06em;color:#444;margin:0 0 10px;">Payments narrative shift</h2>
    <p style="margin:0;color:#222;font-size:15px;line-height:1.65;white-space:pre-line;">${esc(d.narrative)}</p>
  </div>

  <div style="padding:0 28px 24px;">
    <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:0.06em;color:#444;margin:0 0 10px;">Open Money Stack angle</h2>
    <div style="padding:16px 18px;background:linear-gradient(135deg,#f5edff,#ffffff);border-radius:10px;border:1px solid #ece4ff;color:#222;font-size:15px;line-height:1.65;">${esc(d.openMoneyAngle)}</div>
  </div>

  <div style="padding:0 28px 24px;">
    <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:0.06em;color:#444;margin:0 0 10px;">Rail movers · 7d</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#fafafa;text-align:left;">
          <th style="padding:8px 12px;color:#555;font-weight:600;">Rail</th>
          <th style="padding:8px 12px;color:#555;font-weight:600;text-align:right;">Supply</th>
          <th style="padding:8px 12px;color:#555;font-weight:600;text-align:right;">7d</th>
        </tr>
      </thead>
      <tbody>${moversRows}</tbody>
    </table>
  </div>

  <div style="padding:0 28px 24px;">
    <h2 style="font-size:16px;text-transform:uppercase;letter-spacing:0.06em;color:#444;margin:0 0 4px;">Battlecards</h2>
    ${battlecards}
  </div>

  <div style="padding:0 28px 32px;">
    <a href="${siteUrl}" style="display:inline-block;padding:11px 18px;background:#111;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">Open the live dashboard →</a>
  </div>

  <div style="padding:18px 28px;border-top:1px solid #eee;color:#999;font-size:12px;">
    Sent because you subscribed to Open Money Intel. <a href="${siteUrl}/unsubscribe?email={{email}}" style="color:#999;">Unsubscribe</a>. Data via DefiLlama Stablecoins, L2Beat. Independent demo. Not financial advice.
  </div>
</div>
</body></html>`;
}

export function renderDigestText(d: DigestPayload, opts: { siteUrl: string }): string {
  const lines: string[] = [];
  lines.push(`Open Money Intel — ${new Date(d.generatedAt).toDateString()}`);
  lines.push(`Total stablecoin supply: ${formatUsd(d.totalStablecoinSupply)}`);
  lines.push("");
  lines.push("== Payments narrative shift ==");
  lines.push(d.narrative);
  lines.push("");
  lines.push("== Open Money Stack angle ==");
  lines.push(d.openMoneyAngle);
  lines.push("");
  lines.push("== Rail movers ==");
  for (const m of d.movers) {
    lines.push(`- ${m.name} | ${formatUsd(m.supply)} | ${formatPct(m.change7d)}`);
    lines.push(`  ${m.reason}`);
  }
  lines.push("");
  lines.push("== Battlecards ==");
  for (const b of d.battlecards) {
    lines.push(`Q: ${b.question}`);
    lines.push(`A: ${b.answer}`);
    lines.push("");
  }
  lines.push(`Open: ${opts.siteUrl}`);
  return lines.join("\n");
}
