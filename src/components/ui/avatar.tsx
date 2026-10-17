import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 36,
  className
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-electric-500/40 bg-gradient-to-br from-electric-600/40 to-cyan-500/30 font-semibold text-white",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name || "UAV")
      )}
    </span>
  );
}
