"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { ToastStack } from "@/components/ui/toast";
import { apiFetch, useToasts } from "@/lib/hooks";

export type AdminProgram = {
  id: string;
  title: string;
  type: string;
  status: string;
  duration: string;
  description: string;
  summary: string | null;
  image: string | null;
  seats: number;
  mode: string | null;
  location: string | null;
  stipend: string | null;
  curriculum: string[];
  outcomes: string[];
  _count: { applications: number };
  approvedCount: number;
  pendingCount: number;
};

type FormState = {
  title: string;
  type: "INTERNSHIP" | "WORKSHOP";
  status: "LIVE" | "UPCOMING" | "ARCHIVED";
  duration: string;
  summary: string;
  description: string;
  image: string;
  seats: string;
  mode: string;
  location: string;
  stipend: string;
  curriculum: string;
  outcomes: string;
};

const EMPTY: FormState = {
  title: "",
  type: "INTERNSHIP",
  status: "UPCOMING",
  duration: "8 weeks",
  summary: "",
  description: "",
  image: "",
  seats: "20",
  mode: "Hybrid",
  location: "Bengaluru R&D Campus",
  stipend: "",
  curriculum: "",
  outcomes: ""
};

function splitLines(v: string) {
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function ProgramsManager({ initial }: { initial: AdminProgram[] }) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // File explorer image upload & reader handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setForm((f) => ({ ...f, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  function openCreate() {
    setForm(EMPTY);
    setImagePreview(null);
    setEditingId(null);
    setError(null);
    setOpen(true);
  }

  function openEdit(p: AdminProgram) {
    setForm({
      title: p.title,
      type: p.type as FormState["type"],
      status: p.status as FormState["status"],
      duration: p.duration,
      summary: p.summary ?? "",
      description: p.description,
      image: p.image ?? "",
      seats: String(p.seats),
      mode: p.mode ?? "",
      location: p.location ?? "",
      stipend: p.stipend ?? "",
      curriculum: p.curriculum.join("\n"),
      outcomes: p.outcomes.join("\n")
    });
    setImagePreview(p.image);
    setEditingId(p.id);
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      title: form.title,
      type: form.type,
      status: form.status,
      duration: form.duration,
      summary: form.summary,
      description: form.description,
      image: form.image || null,
      seats: Number(form.seats) || 20,
      mode: form.mode,
      location: form.location,
      stipend: form.stipend,
      curriculum: splitLines(form.curriculum),
      outcomes: splitLines(form.outcomes)
    };

    const res = editingId
      ? await apiFetch<{ program: AdminProgram }>(`/api/programs/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await apiFetch<{ program: AdminProgram }>("/api/programs", { method: "POST", body: JSON.stringify(payload) });

    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    push("ok", editingId ? "Program updated." : "Program created.");
    setOpen(false);
    router.refresh();
    const saved = res.data.program;
    setRows((prev) =>
      editingId
        ? prev.map((r) => (r.id === editingId ? { ...r, ...saved } : r))
        : [{ ...saved, _count: { applications: 0 }, approvedCount: 0, pendingCount: 0 }, ...prev]
    );
  }

  async function remove(id: string, title: string) {
    const res = await apiFetch(`/api/programs/${id}`, { method: "DELETE" });
    if (!res.ok) return push("error", res.error);
    setRows((prev) => prev.filter((r) => r.id !== id));
    push("ok", `Deleted ${title}.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <ToastStack items={items} onDismiss={dismiss} />

      <div className="flex items-center justify-between gap-4 bg-space-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div>
          <h2 className="text-lg font-bold text-white">Programs Catalogue</h2>
          <p className="text-xs text-coolgray mt-0.5">{rows.length} total active & upcoming offerings</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs shadow-lg transition-all">
          <Plus className="h-4 w-4" /> New Program
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rows.map((p) => (
          <article key={p.id} className="panel p-6 rounded-2xl bg-space-900/40 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge tone={statusTone(p.status)} dot>{p.status}</Badge>
                    <Badge tone={p.type === "INTERNSHIP" ? "upcoming" : "cyan"}>{p.type}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white truncate">{p.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-coolgray leading-relaxed">{p.summary ?? p.description}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => openEdit(p)} className="rounded-xl border border-white/12 p-2.5 text-coolgray transition hover:border-cyan-400/50 hover:text-white bg-white/5" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p.id, p.title)} className="rounded-xl border border-white/12 p-2.5 text-coolgray transition hover:border-rose-400/50 hover:text-rose-400 bg-white/5" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-4 gap-2 border-t border-white/10 pt-4 text-center bg-space-950/40 rounded-xl p-3">
              {[
                { k: "Seats", v: p.seats },
                { k: "Total", v: p._count.applications },
                { k: "Pending", v: p.pendingCount },
                { k: "Accepted", v: p.approvedCount }
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[10px] uppercase tracking-wider text-coolgray font-medium">{s.k}</dt>
                  <dd className="mt-1 text-sm font-bold text-cyan-400">{s.v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Program Offering" : "Create New Program"} className="max-w-4xl">
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2 max-h-[75vh] overflow-y-auto pr-2">
          {error && (
            <div className="sm:col-span-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-title">Program Title *</label>
            <input id="f-title" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.title} onChange={set("title")} required minLength={3} placeholder="e.g. Full-Stack AI Engineering Internship" />
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-type">Type *</label>
            <select id="f-type" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.type} onChange={set("type")}>
              <option value="INTERNSHIP">INTERNSHIP</option>
              <option value="WORKSHOP">WORKSHOP</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-status">Status *</label>
            <select id="f-status" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.status} onChange={set("status")}>
              <option value="LIVE">LIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-duration">Duration *</label>
            <input id="f-duration" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.duration} onChange={set("duration")} required placeholder="e.g. 8 weeks" />
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-seats">Available Seats *</label>
            <input id="f-seats" type="number" min={1} max={1000} className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.seats} onChange={set("seats")} />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-summary">Short Summary</label>
            <input id="f-summary" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.summary} onChange={set("summary")} placeholder="One-line tagline shown on catalogue cards" />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-desc">Full Description *</label>
            <textarea id="f-desc" rows={4} className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none resize-none" value={form.description} onChange={set("description")} required minLength={20} placeholder="Detailed overview..." />
          </div>

          {/* File Explorer Upload Option */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block">Program Banner Image (File Explorer)</label>
            <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 rounded-2xl bg-space-950 hover:border-cyan-400/50 transition-all cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Preview" className="h-16 w-24 object-cover rounded-xl border border-white/10" />
                  <span className="text-xs text-cyan-300 font-medium">Image loaded successfully! Click to replace.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-7 w-7 text-coolgray group-hover:text-cyan-400 transition-colors" />
                  <p className="text-xs text-coolgray">Drag & drop your banner image here, or <span className="text-cyan-400 underline">browse files</span></p>
                  <span className="text-[10px] text-coolgray/60">Supports PNG, JPG, WEBP</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-mode">Mode</label>
            <input id="f-mode" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.mode} onChange={set("mode")} placeholder="Hybrid / Remote" />
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-loc">Location</label>
            <input id="f-loc" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.location} onChange={set("location")} placeholder="Bengaluru R&D Campus" />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-stipend">Stipend Details</label>
            <input id="f-stipend" className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none" value={form.stipend} onChange={set("stipend")} placeholder="Paid (e.g. ₹15,000/mo)" />
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-cur">Curriculum (One item per line)</label>
            <textarea id="f-cur" rows={4} className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none resize-none" value={form.curriculum} onChange={set("curriculum")} />
          </div>

          <div>
            <label className="text-xs font-semibold text-coolgray uppercase tracking-wider mb-1.5 block" htmlFor="f-out">Outcomes (One item per line)</label>
            <textarea id="f-out" rows={4} className="w-full px-4 py-3 rounded-xl bg-space-950 border border-white/10 text-white text-xs focus:border-cyan-400 outline-none resize-none" value={form.outcomes} onChange={set("outcomes")} />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all">Cancel</button>
            <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
              {busy && <Spinner />}
              {busy ? "Saving…" : editingId ? "Save Changes" : "Create Program"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}