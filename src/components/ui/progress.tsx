import { cn, clamp } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-electric-600 via-electric-500 to-cyan-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
