import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";
import { ApplicationsManager, type AdminApplication } from "@/components/admin/applications-manager";
import { adminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Applications — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const user = await requireAdmin();

  const rows = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      program: { select: { id: true, title: true, type: true } },
      user: { select: { id: true, name: true, email: true, institution: true, phone: true } }
    }
  });

  const initial: AdminApplication[] = rows.map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    coverNote: r.coverNote,
    reviewNote: r.reviewNote,
    score: r.score,
    resumeUrl: r.resumeUrl, // <-- Idu application table nalli iruva resumeUrl field
    user: r.user,
    program: r.program
  }));

  return (
    <DashboardShell
      nav={adminNav}
      user={{ name: user.name, email: user.email, role: user.role }}
      title="Applications"
      subtitle="Review, score and decide on every student submission."
    >
      <ApplicationsManager initial={initial} />
    </DashboardShell>
  );
}