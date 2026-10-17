import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function certificateSerial(seed?: string): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const tail = seed ? seed.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() : "UAVL";
  return `UAVL-${year}-${tail}-${rand}`;
}

export function absoluteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
