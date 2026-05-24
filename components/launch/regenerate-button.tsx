"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ hasCached }: { hasCached: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"ai" | "fallback" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function regen(mode: "ai" | "fallback") {
    setBusy(mode);
    setMsg(null);
    try {
      const res = await fetch(`/api/launch/generate?force=1${mode === "fallback" ? "&fallback=1" : ""}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Generation failed");
      if (data.warning) setMsg(`Used fallback: ${data.warning}`);
      else setMsg(`Generated in ${(data.bundle.totals.totalLatencyMs / 1000).toFixed(1)}s · $${data.bundle.totals.totalCostUsd.toFixed(3)}`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => regen("ai")}
          disabled={busy != null}
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition disabled:opacity-50"
        >
          {busy === "ai" ? "Generating with Claude…" : hasCached ? "Regenerate with Claude" : "Generate with Claude"}
        </button>
        <button
          onClick={() => regen("fallback")}
          disabled={busy != null}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5 transition disabled:opacity-50"
        >
          {busy === "fallback" ? "Building…" : "Use template (no AI)"}
        </button>
      </div>
      {msg && <span className="text-xs text-zinc-400">{msg}</span>}
    </div>
  );
}
