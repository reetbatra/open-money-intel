import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  delta,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/5 bg-white/[0.02] p-5", className)}>
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular tracking-tight">{value}</div>
      {delta != null && <div className="mt-1 text-xs">{delta}</div>}
    </div>
  );
}
