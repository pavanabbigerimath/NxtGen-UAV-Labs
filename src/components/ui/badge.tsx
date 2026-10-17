import { cn } from "@/lib/utils";

type Tone = "live" | "upcoming" | "neutral" | "cyan" | "danger" | "amber";

const tones: Record<Tone, string> = {
  live: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
  upcoming: "border-electric-500/40 bg-electric-500/10 text-electric-400",
  neutral: "border-white/15 bg-white/5 text-coolgray",
  cyan: "border-cyan-400/35 bg-cyan-400/10 text-cyan-300",
  danger: "border-rose-400/35 bg-rose-400/10 text-rose-300",
  amber: "border-amber-400/35 bg-amber-400/10 text-amber-300"
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "LIVE":
    case "APPROVED":
    case "ACTIVE":
      return "live";
    case "UPCOMING":
    case "UNDER_REVIEW":
      return "upcoming";
    case "PENDING":
      return "amber";
    case "REJECTED":
    case "SUSPENDED":
    case "WITHDRAWN":
      return "danger";
    default:
      return "neutral";
  }
}
