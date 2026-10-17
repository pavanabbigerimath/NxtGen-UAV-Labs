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

    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
        applications: { select: { status: true } }
      }
    });

    const enriched = programs.map((p) => ({
      ...p,
      applications: undefined,
      approvedCount: p.applications.filter((a) => a.status === "APPROVED").length,
      pendingCount: p.applications.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW").length,
      seatsFilled: p.applications.filter((a) => a.status === "APPROVED").length
    }));

    return ok({ items: enriched, total: enriched.length });
  } catch (error) {
    return handleRouteError(error, "admin/programs:GET");
  }
}
