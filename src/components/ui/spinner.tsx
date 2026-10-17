import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-cyan-400",
        className
      )}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-coolgray">
      <Spinner className="h-6 w-6" />
      <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}
