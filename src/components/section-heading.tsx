import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-relaxed text-coolgray sm:text-base">{description}</p>}
    </div>
  );
}
