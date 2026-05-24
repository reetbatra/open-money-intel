import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-[10px] font-bold text-white shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition">
            $→
          </div>
          <span className="font-semibold tracking-tight">
            Open Money <span className="text-zinc-500">Intel</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/rails">Rails</NavLink>
          <NavLink href="/launch">Launch</NavLink>
          <NavLink href="/positioning">Diff</NavLink>
          <NavLink href="/telemetry">Telemetry</NavLink>
          <NavLink href="/briefing">Briefing</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/#subscribe"
            className="rounded-full bg-white text-black text-sm font-medium px-4 py-1.5 hover:bg-white/90 transition"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}
