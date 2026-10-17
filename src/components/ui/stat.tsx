import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "electric",
  className
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "electric" | "cyan" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const tones = {
    electric: "text-electric-400 before:from-electric-500/25",
    cyan: "text-cyan-400 before:from-cyan-500/25",
    emerald: "text-emerald-400 before:from-emerald-500/25",
    amber: "text-amber-400 before:from-amber-500/25",
    rose: "text-rose-400 before:from-rose-500/25"
  };

  return (
    <div className={cn("panel relative overflow-hidden p-5", className)}>
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          tones[tone]
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-coolgray">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-coolgray">{hint}</p>}
        </div>
        {icon && <span className={cn("rounded-xl border border-white/10 bg-white/5 p-2", tones[tone])}>{icon}</span>}
      </div>
    </div>
  );
}
