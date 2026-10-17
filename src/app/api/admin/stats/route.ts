import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { forbidden, handleRouteError, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Administrator access required.");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      suspendedUsers,
      newUsers30d,
      newUsers7d,
      totalPrograms,
      livePrograms,
      upcomingPrograms,
      internshipCount,
      workshopCount,
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      withdrawnApplications,
      newApplications30d,
      certificatesIssued,
      documentsUploaded,
      totalComponents,
      recentApplications,
      applicationsByType,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
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
      prisma.application.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.certificate.count(),
      prisma.document.count(),
      prisma.droneComponent.count(),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { id: true, name: true, email: true } },
          program: { select: { id: true, title: true, type: true } }
        }
      }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
      })
    ]);

    const approvalRate =
      approvedApplications + rejectedApplications > 0
        ? Math.round((approvedApplications / (approvedApplications + rejectedApplications)) * 1000) / 10
        : 0;

    // 6-month enrolment trend for the admin cohort chart.
    const trend: { month: string; applications: number; signups: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const [applications, signups] = await Promise.all([
        prisma.application.count({ where: { createdAt: { gte: start, lt: end } } }),
        prisma.user.count({ where: { createdAt: { gte: start, lt: end } } })
      ]);
      trend.push({
        month: start.toLocaleDateString("en-US", { month: "short" }),
        applications,
        signups
      });
    }

    return ok({
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalAdmins,
        suspended: suspendedUsers,
        newLast30Days: newUsers30d,
        newLast7Days: newUsers7d
      },
      programs: {
        total: totalPrograms,
        live: livePrograms,
        upcoming: upcomingPrograms,
        internships: internshipCount,
        workshops: workshopCount
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        underReview: underReviewApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        withdrawn: withdrawnApplications,
        newLast30Days: newApplications30d,
        approvalRate,
        byStatus: applicationsByType.map((g) => ({ status: g.status, count: g._count._all }))
      },
      engagement: {
        certificatesIssued,
        documentsUploaded,
        componentsCatalogued: totalComponents
      },
      trend,
      recentApplications,
      recentUsers
    });
  } catch (error) {
    return handleRouteError(error, "admin/stats");
  }
}
