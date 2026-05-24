import { cn } from "@/lib/utils";

type Variant = "default" | "agglayer" | "superchain" | "orbit" | "zk-stack" | "independent" | "ghost";

const variantClass: Record<Variant, string> = {
  default: "bg-white/5 text-zinc-300 border border-white/10",
  ghost: "bg-transparent text-zinc-400 border border-white/10",
  agglayer: "bg-violet-500/15 text-violet-300 border border-violet-400/20",
  superchain: "bg-rose-500/15 text-rose-300 border border-rose-400/20",
  orbit: "bg-sky-500/15 text-sky-300 border border-sky-400/20",
  "zk-stack": "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
  independent: "bg-amber-500/15 text-amber-300 border border-amber-400/20",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
