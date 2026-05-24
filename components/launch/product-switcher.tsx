"use client";

import { useState } from "react";
import type { LaunchBundle } from "@/lib/launch/types";
import { ProductAssetsView } from "./product-assets-view";

export function ProductSwitcher({ bundle }: { bundle: LaunchBundle }) {
  const [activeId, setActiveId] = useState(bundle.products[0]?.productId);
  const active = bundle.products.find((p) => p.productId === activeId) ?? bundle.products[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {bundle.products.map((p) => {
          const isActive = p.productId === active.productId;
          return (
            <button
              key={p.productId}
              onClick={() => setActiveId(p.productId)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition border ${
                isActive
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-violet-500/20"
                  : "border-white/10 text-zinc-300 hover:bg-white/5"
              }`}
            >
              {p.productName}
            </button>
          );
        })}
      </div>
      <ProductAssetsView assets={active} />
    </div>
  );
}
