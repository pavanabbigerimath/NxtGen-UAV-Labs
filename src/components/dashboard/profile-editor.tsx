"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch, useToasts } from "@/lib/hooks";
import { ToastStack } from "@/components/ui/toast";

export function ProfileEditor({
  initial
}: {
  initial: { name: string; email: string; phone: string; city: string; institution: string; bio: string };
}) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(form) });
    push(res.ok ? "ok" : "error", res.ok ? "Profile updated." : res.error);
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="panel p-6">
      <ToastStack items={items} onDismiss={dismiss} />
      <h2 className="text-sm font-semibold text-white">Profile</h2>
      <p className="mt-1 text-xs text-coolgray">
        Your profile details are attached to every application you submit.
      </p>

      <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="p-name">Full name</label>
          <input id="p-name" className="field" value={form.name} onChange={set("name")} required minLength={2} />
        </div>
        <div>
          <label className="label" htmlFor="p-email">Email</label>
          <input id="p-email" className="field opacity-60" value={form.email} disabled />
        </div>
        <div>
          <label className="label" htmlFor="p-phone">Phone</label>
          <input id="p-phone" className="field" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="label" htmlFor="p-city">City</label>
          <input id="p-city" className="field" value={form.city} onChange={set("city")} placeholder="Pune" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="p-inst">Institution</label>
          <input id="p-inst" className="field" value={form.institution} onChange={set("institution")} placeholder="IIT Bombay" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="p-bio">Short bio</label>
          <textarea id="p-bio" rows={3} className="field resize-none" value={form.bio} onChange={set("bio")} maxLength={600} />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={busy} className="btn-primary btn-sm">
            {busy ? <Spinner /> : <Save className="h-3.5 w-3.5" />}
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
