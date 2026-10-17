import type { Metadata } from "next";
import { BookOpen, FileText, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Stat } from "@/components/ui/stat";
import { PipelineBreakdown, RecentActivity, TrendChart, type Stats } from "@/components/admin/analytics";
import { adminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "Admin Console" };
export const dynamic = "force-dynamic";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminOverviewPage() {
  const user = await requireAdmin();

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    userTotal, students, admins, suspended, newLast30Days, newLast7Days,
    programTotal, live, upcoming, internships, workshops,
    appTotal, pending, underReview, approved, rejected, withdrawn, newApps30,
    certificatesIssued, documentsUploaded, componentsCatalogued,
    trendApps, trendUsers, recentApplications, recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.user.count({ where: { createdAt: { gte: since7 } } }),
    prisma.program.count(),
    prisma.program.count({ where: { status: "LIVE" } }),
    prisma.program.count({ where: { status: "UPCOMING" } }),
    prisma.program.count({ where: { type: "INTERNSHIP" } }),
    prisma.program.count({ where: { type: "WORKSHOP" } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.application.count({ where: { status: "WITHDRAWN" } }),
    prisma.application.count({ where: { createdAt: { gte: since30 } } }),
    prisma.certificate.count(),
    prisma.document.count(),
    prisma.droneComponent.count(),
    prisma.application.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, status: true, createdAt: true, user: { select: { name: true } }, program: { select: { title: true } } }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, role: true, createdAt: true }
    })
  ]);

  // Build a 6-point month series for the cohort trend chart.
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({ key: monthKey(d), label: d.toLocaleString("en-US", { month: "short" }) });
  }

  const trend = months.map((m) => ({
    month: m.label,
    applications: trendApps.filter((a) => monthKey(new Date(a.createdAt)) === m.key).length,
    signups: trendUsers.filter((u) => monthKey(new Date(u.createdAt)) === m.key).length
  }));

  const decided = approved + rejected;
  const stats: Stats = {
    users: { total: userTotal, students, admins, suspended, newLast30Days, newLast7Days },
    programs: { total: programTotal, live, upcoming, internships, workshops },
    applications: {
      total: appTotal, pending, underReview, approved, rejected, withdrawn,
      newLast30Days: newApps30,
      approvalRate: decided ? Math.round((approved / decided) * 1000) / 10 : 0,
      byStatus: [
        { status: "PENDING", count: pending },
        { status: "UNDER_REVIEW", count: underReview },
        { status: "APPROVED", count: approved },
        { status: "REJECTED", count: rejected },
        { status: "WITHDRAWN", count: withdrawn }
      ]
    },
    engagement: { certificatesIssued, documentsUploaded, componentsCatalogued },
    trend
  };

  return (
    <DashboardShell
      nav={adminNav}
      user={{ name: user.name, email: user.email, role: user.role }}
      title="Mission control"
      subtitle="Live overview of cohorts, programs and application throughput."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total users" value={stats.users.total} hint={`${stats.users.newLast7Days} joined this week`} icon={<Users className="h-5 w-5" />} />
        <Stat label="Programs" value={stats.programs.total} hint={`${stats.programs.live} live · ${stats.programs.upcoming} upcoming`} icon={<BookOpen className="h-5 w-5" />} />
        <Stat label="Applications" value={stats.applications.total} hint={`${stats.applications.newLast30Days} in last 30 days`} icon={<FileText className="h-5 w-5" />} />
        <Stat label="Certificates issued" value={stats.engagement.certificatesIssued} hint={`${stats.engagement.documentsUploaded} documents stored`} icon={<ShieldCheck className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart trend={stats.trend} /></div>
        <PipelineBreakdown stats={stats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity applications={recentApplications} users={recentUsers} />
        <div className="panel p-6">
          <h3 className="text-sm font-semibold text-white">Cohort pulse</h3>
          <p className="mt-1 text-xs text-coolgray">Students vs. administrators, and account health.</p>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            {[
              { k: "Students", v: stats.users.students },
              { k: "Administrators", v: stats.users.admins },
              { k: "New (30 days)", v: stats.users.newLast30Days },
              { k: "Suspended", v: stats.users.suspended },
              { k: "Internships", v: stats.programs.internships },
              { k: "Workshops", v: stats.programs.workshops },
              { k: "Approved apps", v: stats.applications.approved },
              { k: "Approval rate", v: `${stats.applications.approvalRate}%` }
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <dt className="text-[10px] uppercase tracking-wider text-coolgray">{x.k}</dt>
                <dd className="mt-1 text-lg font-semibold text-cyan-400">{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </DashboardShell>
  );
}
