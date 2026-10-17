import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";
import { ProgramsManager, type AdminProgram } from "@/components/admin/programs-manager";
import { adminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Programs — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const user = await requireAdmin();

  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
      applications: { select: { status: true } }
    }
  });

  const initial: AdminProgram[] = programs.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    status: p.status,
    duration: p.duration,
    description: p.description,
    summary: p.summary,
    image: p.image,
    seats: p.seats,
    mode: p.mode,
    location: p.location,
    stipend: p.stipend,
    curriculum: p.curriculum,
    outcomes: p.outcomes,
    _count: { applications: p._count.applications },
    approvedCount: p.applications.filter((a) => a.status === "APPROVED").length,
    pendingCount: p.applications.filter((a) => a.status === "PENDING").length
  }));

  return (
    <DashboardShell
      nav={adminNav}
      user={{ name: user.name, email: user.email, role: user.role }}
      title="Programs"
      subtitle="Create, edit and retire internship & workshop offerings."
    >
      <ProgramsManager initial={initial} />
    </DashboardShell>
  );
}
