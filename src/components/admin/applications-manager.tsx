"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, Trash2, X, FileText, ExternalLink, Mail, Phone, Building } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { ToastStack } from "@/components/ui/toast";
import { apiFetch, useToasts } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export type AdminApplication = {
  id: string;
  status: string;
  createdAt: string;
  coverNote: string | null;
  reviewNote: string | null;
  score: number | null;
  resumeUrl?: string | null;
  user: { id: string; name: string; email: string; institution: string | null; phone?: string | null };
  program: { id: string; title: string; type: string };
};

const STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"];

export function ApplicationsManager({ initial }: { initial: AdminApplication[] }) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminApplication | null>(null);
  const [note, setNote] = useState("");
  const [score, setScore] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const statusOk = filter === "ALL" || r.status === filter;
      const textOk =
        !needle ||
        r.user.name.toLowerCase().includes(needle) ||
        r.user.email.toLowerCase().includes(needle) ||
        r.program.title.toLowerCase().includes(needle);
      return statusOk && textOk;
    });
  }, [rows, filter, q]);

  async function review(id: string, status: string, reviewNote?: string, reviewScore?: number) {
    setBusy(true);
    const res = await apiFetch<{ application: AdminApplication }>(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(reviewNote !== undefined ? { reviewNote } : {}),
        ...(reviewScore !== undefined ? { score: reviewScore } : {})
      })
    });
    setBusy(false);
    if (!res.ok) return push("error", res.error);

    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, reviewNote: reviewNote ?? r.reviewNote, score: reviewScore ?? r.score } : r
      )
    );
    push("ok", `Application marked ${status.replace("_", " ").toLowerCase()}.`);
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await apiFetch(`/api/applications/${id}`, { method: "DELETE" });
    if (!res.ok) return push("error", res.error);
    setRows((prev) => prev.filter((r) => r.id !== id));
    push("ok", "Application deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <ToastStack items={items} onDismiss={dismiss} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray" />
          <input className="field pl-10" placeholder="Search by student, email or program…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                filter === s
                  ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                  : "border-white/12 bg-white/[0.03] text-coolgray hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-coolgray">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Applied</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-coolgray">
                    No applications match this filter.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-white">{r.user.name}</p>
                    <p className="text-[11px] text-coolgray">{r.user.email}</p>
                    {r.user.institution && <p className="text-[11px] text-coolgray">{r.user.institution}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-white">{r.program.title}</p>
                    <Badge tone={r.program.type === "INTERNSHIP" ? "upcoming" : "cyan"} className="mt-1">
                      {r.program.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-coolgray">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={statusTone(r.status)} dot>
                      {r.status.replace("_", " ")}
                    </Badge>
                    {r.score !== null && <p className="mt-1 text-[11px] text-cyan-400">Score {r.score}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => review(r.id, "APPROVED")}
                        className="rounded-lg border border-emerald-400/30 p-2 text-emerald-300 transition hover:bg-emerald-500/15"
                        aria-label="Approve"
                        title="Approve"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => review(r.id, "REJECTED")}
                        className="rounded-lg border border-rose-400/30 p-2 text-rose-300 transition hover:bg-rose-500/15"
                        aria-label="Reject"
                        title="Reject"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(r);
                          setNote(r.reviewNote ?? "");
                          setScore(r.score !== null ? String(r.score) : "");
                        }}
                        className="rounded-lg border border-white/12 px-2.5 py-2 text-[11px] text-coolgray transition hover:border-electric-500/50 hover:text-white"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-rose-400/50 hover:text-rose-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Candidate Application Details"
        subtitle={editing ? `${editing.user.name} — Applied for ${editing.program.title}` : ""}
      >
        {editing && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            
            {/* Student Info Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">Student Registration Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-white/90">
                  <span className="text-coolgray">Name:</span> 
                  <span className="font-medium">{editing.user.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="text-coolgray">Email:</span> 
                  <span className="truncate">{editing.user.email}</span>
                </div>

                {editing.user.phone && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="text-coolgray">Phone:</span> 
                    <span>{editing.user.phone}</span>
                  </div>
                )}

                {editing.user.institution && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Building className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="text-coolgray">Branch / Institution:</span> 
                    <span className="truncate">{editing.user.institution}</span>
                  </div>
                )}
              </div>

              {/* Program & Resume Download/View */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-coolgray uppercase tracking-wider">Applied Program</p>
                  <p className="text-sm font-medium text-white">{editing.program.title}</p>
                </div>

                {editing.resumeUrl ? (
                  <a
                    href={editing.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium transition shadow-lg"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-rose-400 italic font-medium bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    No resume uploaded
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Cover Note */}
            {editing.coverNote && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wider text-coolgray font-medium">Candidate cover note</p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{editing.coverNote}</p>
              </div>
            )}

            {/* Review Notes & Score */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div>
                <label className="label" htmlFor="reviewNote">Reviewer note</label>
                <textarea id="reviewNote" rows={3} className="field resize-none" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="Add feedback or notes for this applicant..." />
              </div>

              <div>
                <label className="label" htmlFor="score">Score (0–100, optional)</label>
                <input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  className="field"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="78"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-white/10">
              <button onClick={() => review(editing.id, "UNDER_REVIEW", note || undefined)} disabled={busy} className="btn-ghost btn-sm">
                {busy && <Spinner />} Mark under review
              </button>
              <button
                onClick={() => review(editing.id, "APPROVED", note || undefined, score ? Number(score) : undefined)}
                disabled={busy}
                className="btn-primary btn-sm"
              >
                {busy && <Spinner />} Approve
              </button>
              <button
                onClick={() => review(editing.id, "REJECTED", note || undefined, score ? Number(score) : undefined)}
                disabled={busy}
                className="btn-outline btn-sm"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}