import Link from "next/link";

interface VideoEmbedProps {
  url?: string;
  title?: string;
  subtitle?: string;
  emptyHint?: string;
}

function toEmbedUrl(url: string): { src: string; provider: "youtube" | "loom" | "other" } | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, provider: "youtube" };
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id) return { src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, provider: "youtube" };
      }
      if (u.pathname.startsWith("/embed/")) return { src: url, provider: "youtube" };
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        if (id) return { src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, provider: "youtube" };
      }
    }
    // Loom
    if (u.hostname.endsWith("loom.com")) {
      if (u.pathname.startsWith("/share/")) {
        const id = u.pathname.split("/")[2];
        if (id) return { src: `https://www.loom.com/embed/${id}`, provider: "loom" };
      }
      if (u.pathname.startsWith("/embed/")) return { src: url, provider: "loom" };
    }
    return { src: url, provider: "other" };
  } catch {
    return null;
  }
}

export function VideoEmbed({
  url,
  title = "Three-minute walkthrough",
  subtitle = "What this is, how it's wired, and the loop the JD asks for.",
  emptyHint,
}: VideoEmbedProps) {
  const embed = url ? toEmbedUrl(url) : null;

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-fuchsia-500/[0.04] p-1.5 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-violet-300/80">Walkthrough</div>
          <div className="mt-0.5 text-sm font-medium text-zinc-100">{title}</div>
          <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
        {embed && url && (
          <Link
            href={url}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-300 hover:bg-white/5 transition"
          >
            Open in {embed.provider === "youtube" ? "YouTube" : embed.provider === "loom" ? "Loom" : "new tab"} →
          </Link>
        )}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/60 border border-white/5">
        {embed ? (
          <iframe
            src={embed.src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center px-8">
              <div className="mx-auto h-12 w-12 rounded-full border border-white/10 grid place-items-center text-zinc-500 text-lg">▶</div>
              <div className="mt-3 text-sm text-zinc-300">Walkthrough video lands here.</div>
              <div className="mt-1 text-[11px] text-zinc-500 max-w-sm leading-relaxed">
                {emptyHint ?? "Set NEXT_PUBLIC_LOOM_URL (YouTube or Loom share link) and redeploy. The embed picks the provider automatically."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
