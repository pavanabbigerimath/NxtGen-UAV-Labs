"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatBytes, formatDate } from "@/lib/utils";
import { apiFetch, useToasts } from "@/lib/hooks";
import { ToastStack } from "@/components/ui/toast";

export type DocRow = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number | null;
  createdAt: string;
};

const TYPES = ["RESUME", "ID_PROOF", "TRANSCRIPT", "CERTIFICATE", "OTHER"];

export function DocumentUploader({ initial }: { initial: DocRow[] }) {
  const router = useRouter();
  const { items, push, dismiss } = useToasts();
  const [docs, setDocs] = useState<DocRow[]>(initial);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState("RESUME");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // standard fetch use madi (apiFetch baddige)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const upRes = await res.json();

      if (!res.ok || !upRes.ok || !upRes.upload) {
        push("error", upRes.error || "File upload failed");
        setBusy(false);
        return;
      }

      const uploadData = upRes.upload;

      // 2) Register metadata in /api/documents
      const created = await apiFetch<{ document: DocRow }>("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          type,
          url: uploadData.url,
          size: uploadData.size,
          mimeType: uploadData.mimeType
        })
      });

      if (!created.ok || !created.data?.document) {
        push("error", created.error || "Failed to save document record");
        setBusy(false);
        return;
      }

      setDocs((d) => [created.data.document, ...d]);
      push("ok", `${file.name} uploaded successfully.`);
      setBusy(false);
      router.refresh();
    } catch (err: any) {
      push("error", err.message || "Upload failed");
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    const res = await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) return push("error", res.error);
    setDocs((d) => d.filter((x) => x.id !== id));
    push("ok", `${name} deleted.`);
    router.refresh();
  }

  return (
    <div className="panel p-6">
      <ToastStack items={items} onDismiss={dismiss} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Documents</h2>
          <p className="mt-1 text-xs text-coolgray">
            Upload your resume, ID proof or transcripts. PDF, PNG, JPG, DOCX and TXT up to 8MB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="field w-auto py-2 text-xs">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary btn-sm">
            {busy ? <Spinner /> : <UploadCloud className="h-3.5 w-3.5" />}
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {docs.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-xs text-coolgray">
            No documents yet.
          </p>
        )}
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-electric-500/30 bg-electric-500/10 text-electric-400">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{d.name}</p>
              <p className="mt-0.5 flex items-center gap-2 text-[11px] text-coolgray">
                <Badge tone="neutral">{d.type.replace("_", " ")}</Badge>
                {formatBytes(d.size)} · {formatDate(d.createdAt)}
              </p>
            </div>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-cyan-400/50 hover:text-cyan-400"
              aria-label={`Download ${d.name}`}
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => remove(d.id, d.name)}
              className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-rose-400/50 hover:text-rose-400"
              aria-label={`Delete ${d.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}