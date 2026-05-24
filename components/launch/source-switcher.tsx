"use client";

import Link from "next/link";

interface SourceOption {
  id: string;
  label: string;
  blurb: string;
}

export function SourceSwitcher({
  sources,
  activeId,
}: {
  sources: SourceOption[];
  activeId: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-1.5 flex flex-col sm:flex-row gap-1.5">
      {sources.map((s) => {
        const active = s.id === activeId;
        return (
          <Link
            key={s.id}
            href={s.id === sources[0].id ? "/launch" : `/launch?source=${s.id}`}
            className={`flex-1 rounded-xl px-4 py-3 text-left transition ${
              active ? "bg-violet-500/15 ring-1 ring-violet-400/30" : "hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-violet-300" : "bg-zinc-600"}`} />
              <span className={`text-xs font-medium tracking-wide uppercase ${active ? "text-violet-200" : "text-zinc-400"}`}>
                {s.label}
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-500 leading-relaxed">{s.blurb}</div>
          </Link>
        );
      })}
    </div>
  );
}
