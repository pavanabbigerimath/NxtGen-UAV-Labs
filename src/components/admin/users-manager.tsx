"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Shield, Trash2, UserCheck, UserX } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { ToastStack } from "@/components/ui/toast";
import { apiFetch, useToasts } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  city: string | null;
  institution: string | null;
  documents?: { id: string; name: string; type: string; url: string }[];
  lastLoginAt: string | null;
  createdAt: string;
  _count: { applications: number; documents: number; certificates: number };
};

export function UsersManager({ initial, currentUserId }: { initial: AdminUser[]; currentUserId: string }) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const roleOk = roleFilter === "ALL" || r.role === roleFilter;
      const textOk =
        !needle ||
        r.name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle) ||
        (r.phone ?? "").toLowerCase().includes(needle) ||
        (r.city ?? "").toLowerCase().includes(needle) ||
        (r.institution ?? "").toLowerCase().includes(needle);
      return roleOk && textOk;
    });
  }, [rows, q, roleFilter]);

  async function patch(id: string, body: Record<string, unknown>, label: string) {
    const res = await apiFetch<{ user: AdminUser }>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    if (!res.ok) return push("error", res.error);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...res.data.user } : r)));
    push("ok", label);
    router.refresh();
  }

  async function remove(id: string, name: string) {
    const res = await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) return push("error", res.error);
    setRows((prev) => prev.filter((r) => r.id !== id));
    push("ok", `Deleted ${name}.`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <ToastStack items={items} onDismiss={dismiss} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray" />
          <input className="field pl-10" placeholder="Search users by name, email, phone, city..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "STUDENT", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                roleFilter === r
                  ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                  : "border-white/12 bg-white/[0.03] text-coolgray hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-coolgray">
              <tr>
                <th className="px-4 py-3 font-medium">User Profile</th>
                <th className="px-4 py-3 font-medium">Contact & Location</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Resumes / Documents</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 text-right font-medium">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filtered.map((u) => {
                const self = u.id === currentUserId;
                return (
                  <tr key={u.id} className="transition hover:bg-white/[0.03]">
                    {/* Name, Email & Profession/Institution */}
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">
                        {u.name} {self && <span className="text-[10px] text-cyan-400">(you)</span>}
                      </p>
                      <p className="text-[11px] text-coolgray">{u.email}</p>
                      {u.institution && <p className="text-[11px] text-cyan-300 font-medium mt-0.5">💼 {u.institution}</p>}
                    </td>

                    {/* Phone Number & City */}
                    <td className="px-4 py-3.5 text-[11px] text-coolgray">
                      <p className="text-white">📞 {u.phone || "No Phone"}</p>
                      <p className="mt-0.5">📍 {u.city || "No City specified"}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge tone={u.role === "ADMIN" ? "cyan" : "neutral"}>{u.role}</Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge tone={statusTone(u.status)} dot>{u.status}</Badge>
                    </td>

                    {/* Resumes / Documents Review */}
                    <td className="px-4 py-3.5">
                      {u.documents && u.documents.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {u.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs bg-electric-500/10 text-electric-400 border border-electric-500/30 px-2.5 py-1 rounded-md hover:bg-electric-500/20 w-fit"
                              title={`View ${doc.type}: ${doc.name}`}
                            >
                              <FileText className="h-3 w-3" />
                              <span>{doc.type.replace("_", " ")}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-rose-400 font-medium">No Resume Uploaded</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-[11px] text-coolgray">
                      {u._count.applications} apps · {u._count.documents} docs · {u._count.certificates} certs
                      <br />
                      Last login {u.lastLoginAt ? formatDate(u.lastLoginAt) : "never"}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          onClick={() => patch(u.id, { role: u.role === "ADMIN" ? "STUDENT" : "ADMIN" }, `Role changed for ${u.name}.`)}
                          disabled={self}
                          className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-cyan-400/50 hover:text-cyan-400 disabled:opacity-40"
                          aria-label="Toggle role"
                          title="Toggle role"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                        {u.status === "SUSPENDED" ? (
                          <button
                            onClick={() => patch(u.id, { status: "ACTIVE" }, `${u.name} reactivated.`)}
                            disabled={self}
                            className="rounded-lg border border-emerald-400/30 p-2 text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-40"
                            aria-label="Activate"
                            title="Activate"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => patch(u.id, { status: "SUSPENDED" }, `${u.name} suspended.`)}
                            disabled={self}
                            className="rounded-lg border border-amber-400/30 p-2 text-amber-300 transition hover:bg-amber-500/15 disabled:opacity-40"
                            aria-label="Suspend"
                            title="Suspend"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => remove(u.id, u.name)}
                          disabled={self}
                          className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-rose-400/50 hover:text-rose-400 disabled:opacity-40"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}