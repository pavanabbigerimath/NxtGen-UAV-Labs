import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { forbidden, getPagination, handleRouteError, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Administrator access required.");

    const url = new URL(req.url);
    const { page, limit, skip, take } = getPagination(url, 20, 100);
    const role = url.searchParams.get("role");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.trim();

    const where: Prisma.UserWhereInput = {};
    if (role === "STUDENT" || role === "ADMIN") where.role = role;
    if (status === "ACTIVE" || status === "PENDING" || status === "SUSPENDED") where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { institution: { contains: q, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          city: true,
          institution: true,
          lastLoginAt: true,
          createdAt: true,
          documents: {        
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              createdAt: true
            }
          },
          _count: { select: { applications: true, documents: true, certificates: true } }
        }
      }),
      prisma.user.count({ where })
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return handleRouteError(error, "admin/users:GET");
  }
}
