export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-zinc-500">
        <div>
          <span className="text-zinc-300 font-medium">Open Money Intel</span>
          <span className="mx-2">·</span>
          Data: DefiLlama Stablecoins, L2Beat
          <span className="mx-2">·</span>
          Independent demo · not affiliated with Polygon Labs
        </div>
        <div className="flex items-center gap-4">
          <a className="hover:text-white" href="https://polygon.technology" target="_blank" rel="noreferrer">
            Polygon
          </a>
          <a className="hover:text-white" href="https://defillama.com/stablecoins" target="_blank" rel="noreferrer">
            DefiLlama Stables
          </a>
          <span className="text-zinc-600">v0.2</span>
        </div>
      </div>
    </footer>
  );
}
