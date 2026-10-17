"use client";

import { useCallback, useState } from "react";
import type { ToastMsg } from "@/components/ui/toast";

/** Minimal toast queue shared by the dashboard + admin surfaces. */
export function useToasts() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  const push = useCallback((kind: ToastMsg["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { items, push, dismiss };
}

/** Small JSON fetch helper with a consistent error shape. */
export async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...(init?.headers ?? {}) }
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error ?? `Request failed (${res.status})` };
    return { ok: true, data: json.data as T };
  } catch (error) {
    return { ok: false, error: String((error as Error)?.message ?? error) };
  }
}
