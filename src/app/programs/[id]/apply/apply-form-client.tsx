"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ApplyFormClientProps {
  programId: string;
  programTitle: string;
  defaultPhone?: string;
  defaultCollege?: string;
}

export function ApplyFormClient({
  programId,
  programTitle,
  defaultPhone = "",
  defaultCollege = "",
}: ApplyFormClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    phone: defaultPhone,
    college: defaultCollege,
    department: "",
    year: "",
    skills: "",
    coverNote: "",
    resumeUrl: "",
    resumeName: "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      setForm((prev) => ({ ...prev, resumeName: "Uploading..." }));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setForm((prev) => ({
        ...prev,
        resumeName: file.name,
        resumeUrl: data.upload.url,
      }));
    } catch (err: any) {
      setError(err.message || "File upload failed");
      setForm((prev) => ({ ...prev, resumeName: "", resumeUrl: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        programId,
        phone: form.phone,
        college: form.college,
        department: form.department,
        year: form.year,
        skills: form.skills,
        coverNote: form.coverNote,
        resumeUrl: form.resumeUrl,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      router.push("/dashboard?applied=true");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-slate-900 rounded-xl border border-slate-800 text-white">
      <div>
        <h2 className="text-xl font-bold">Apply for {programTitle}</h2>
        <p className="text-sm text-slate-400">Fill in the details below to submit your application.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="text"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 9876543210"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">College / Institution</label>
          <input
            type="text"
            required
            value={form.college}
            onChange={(e) => setForm({ ...form, college: e.target.value })}
            placeholder="Your College Name"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department / Branch</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g. Computer Science"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year / Semester</label>
          <input
            type="text"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            placeholder="e.g. Final Year / 6th Sem"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Key Skills</label>
        <input
          type="text"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="Python, React, Django, etc."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
        />
        {form.resumeName && (
          <p className="text-xs text-indigo-400 mt-1">Selected: {form.resumeName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Note / Why should we select you?</label>
        <textarea
          rows={4}
          value={form.coverNote}
          onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
          placeholder="Write a short note..."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting Application..." : "Submit Application"}
      </button>
    </form>
  );
}