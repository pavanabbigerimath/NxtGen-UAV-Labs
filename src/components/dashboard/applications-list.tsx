"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Trash2 } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { ToastStack } from "@/components/ui/toast";
import { apiFetch, useToasts } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export type StudentApplication = {
  id: string;
  status: string;
  createdAt: string;
  coverNote: string | null;
  reviewNote: string | null;
  program: { id: string; title: string; type: string; duration: string; status: string };
};

export function ApplicationsList({ initial }: { initial: StudentApplication[] }) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [apps, setApps] = useState(initial);

  async function withdraw(id: string, title: string) {
    const res = await apiFetch(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "WITHDRAWN" })
    });
    if (!res.ok) return push("error", res.error);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "WITHDRAWN" } : a)));
    push("ok", `Withdrew from ${title}.`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <ToastStack items={items} onDismiss={dismiss} />

      {apps.length === 0 && (
        <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
          <p className="text-sm font-semibold text-white">No applications yet</p>
          <p className="max-w-md text-xs text-coolgray">
            Browse our internships and workshops and submit your first application.
          </p>
          <Link href="/programs" className="btn-primary btn-sm">
            Browse programs
          </Link>
        </div>
      )}

      {apps.map((a) => (
        <article key={a.id} className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.program.type === "INTERNSHIP" ? "upcoming" : "cyan"}>{a.program.type}</Badge>
                <Badge tone={statusTone(a.status)} dot>
                  {a.status.replace("_", " ")}
                </Badge>
              </div>
              <h3 className="mt-2.5 text-base font-semibold tracking-tight text-white">
                <Link href={`/programs/${a.program.id}`} className="transition hover:text-cyan-400">
                  {a.program.title}
                </Link>
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-coolgray">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" /> {a.program.duration}
                </span>
                <span>Applied {formatDate(a.createdAt)}</span>
              </p>
            </div>

            {(a.status === "PENDING" || a.status === "UNDER_REVIEW") && (
              <button
                onClick={() => withdraw(a.id, a.program.title)}
                className="btn-ghost btn-sm text-rose-300 hover:border-rose-400/50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Withdraw
              </button>
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <ProgressTracker status={a.status} />
          </div>

          {a.reviewNote && (
            <p className="mt-4 rounded-xl border border-electric-500/25 bg-electric-500/[0.07] px-4 py-3 text-xs text-white/90">
              <span className="font-semibold text-cyan-400">Reviewer note: </span>
              {a.reviewNote}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
