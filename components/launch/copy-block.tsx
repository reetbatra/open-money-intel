"use client";

import { useState } from "react";

export function CopyBlock({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="text-[11px] rounded-md border border-white/10 px-2 py-1 text-zinc-400 hover:text-white hover:bg-white/5 transition"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
