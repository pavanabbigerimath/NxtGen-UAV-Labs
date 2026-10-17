import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";
import { UsersManager, type AdminUser } from "@/components/admin/users-manager";
import { adminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Users — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      documents: true, // 👈 Include student uploaded documents/resumes
      _count: { select: { applications: true, documents: true, certificates: true } } 
    }
  });

  const initial: AdminUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone, // 👈 Phone number mapping
    role: u.role,
    status: u.status,
    city: u.city,
    institution: u.institution,
    documents: u.documents.map(d => ({ // 👈 Resume / Document details mapping
      id: d.id,
      name: d.name,
      type: d.type,
      url: d.url
    })),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    _count: u._count
  }));

  return (
    <DashboardShell
      nav={adminNav}
      user={{ name: admin.name, email: admin.email, role: admin.role }}
      title="Users"
      subtitle="Manage roles, suspend accounts and audit platform activity."
    >
      <UsersManager initial={initial} currentUserId={admin.id} />
    </DashboardShell>
  );
}