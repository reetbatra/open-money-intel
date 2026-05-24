"use client";

import { useState } from "react";

export function SubscribeForm({ variant = "card" }: { variant?: "card" | "inline" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Subscription failed");
      setStatus("ok");
      setMessage(data.message ?? "Subscribed.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Subscription failed");
    }
  }

  const wrap =
    variant === "card"
      ? "rounded-2xl border border-white/5 bg-white/[0.02] p-6"
      : "";

  return (
    <div className={wrap} id="subscribe">
      {variant === "card" && (
        <>
          <h3 className="text-lg font-semibold tracking-tight">Weekly intelligence briefing</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Every Monday: ecosystem movers, narrative shifts, AggLayer positioning, and battlecard updates. No noise.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@team.polygon.technology"
          className="flex-1 rounded-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 transition"
          disabled={status === "loading" || status === "ok"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "ok"}
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing…" : status === "ok" ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-rose-400" : "text-emerald-400"}`}>
          {message}
        </p>
      )}
      <p className="mt-3 text-[11px] text-zinc-500">
        Free · unsubscribe anytime · we don&apos;t share emails
      </p>
    </div>
  );
}
