import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, Download, FileCheck2, GraduationCap, LayoutDashboard, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";
import { ApplicationsList, type StudentApplication } from "@/components/dashboard/applications-list";
import { DocumentUploader, type DocRow } from "@/components/dashboard/document-uploader";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { Stat } from "@/components/ui/stat";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Student Dashboard" };
export const dynamic = "force-dynamic";

const RESOURCES = [
  { name: "Flight Log Template (CSV)", size: "18 KB", kind: "Template" },
  { name: "Pre-Flight Checklist Rev. 4", size: "210 KB", kind: "PDF" },
  { name: "PX4 Tuning Quick Reference", size: "1.2 MB", kind: "PDF" },
  { name: "Lab Safety & Airspace Brief", size: "640 KB", kind: "PDF" }
];

export default async function StudentDashboardPage() {
  const session = await requireStudent();

  const [user, applications, documents, certificates] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.id } }),
    prisma.application.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: { program: { select: { id: true, title: true, type: true, duration: true, status: true } } }
    }),
    prisma.document.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.certificate.findMany({ where: { userId: session.id }, orderBy: { issuedOn: "desc" } })
  ]);

  const apps: StudentApplication[] = applications.map((a) => ({
    id: a.id,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    coverNote: a.coverNote,
    reviewNote: a.reviewNote,
    program: a.program
  }));

  const docs: DocRow[] = documents.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    url: d.url,
    size: d.size,
    createdAt: d.createdAt.toISOString()
  }));

  const active = applications.filter((a) => a.status === "APPROVED").length;
  const inReview = applications.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW").length;

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, role: user.role }}
      title={`Welcome back, ${user.name.split(" ")[0]}.`}
      subtitle="Track your applications, upload documents and collect your certificates."
      nav={[
        { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: "/programs", label: "Browse Programs", icon: <BookOpen className="h-4 w-4" /> }
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Applications" value={applications.length} icon={<FileCheck2 className="h-4 w-4" />} hint={`${inReview} awaiting decision`} />
        <Stat label="Active enrolments" value={active} tone="emerald" icon={<GraduationCap className="h-4 w-4" />} hint="Accepted programs" />
        <Stat label="Certificates" value={certificates.length} tone="cyan" icon={<Award className="h-4 w-4" />} hint="Issued by the lab" />
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-coolgray">
          Application tracker
        </h2>
        <ApplicationsList initial={apps} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentUploader initial={docs} />
        <ProfileEditor
          initial={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            city: user.city ?? "",
            institution: user.institution ?? "",
            bio: user.bio ?? ""
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* certificates */}
        <section className="panel p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Award className="h-4 w-4 text-cyan-400" /> Certificates
          </h2>
          <div className="mt-4 space-y-2.5">
            {certificates.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-xs text-coolgray">
                Certificates appear here once a program is completed and approved.
              </p>
            )}
            {certificates.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                  <Award className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{c.title}</p>
                  <p className="mt-0.5 text-[11px] text-coolgray">
                    Serial {c.serial} · issued {formatDate(c.issuedOn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* resources */}
        <section className="panel p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-electric-400" /> Resources
          </h2>
          <p className="mt-1 text-xs text-coolgray">Lab-standard templates and references for enrolled students.</p>
          <div className="mt-4 space-y-2.5">
            {RESOURCES.map((r) => (
              <div key={r.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-electric-500/30 bg-electric-500/10 text-electric-400">
                  <Download className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{r.name}</p>
                  <p className="mt-0.5 text-[11px] text-coolgray">
                    {r.kind} · {r.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
