import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { programCreateSchema } from "@/lib/validations";
import { created, forbidden, getPagination, handleRouteError, ok, parseBody, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, limit, skip, take } = getPagination(url, 24, 100);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.trim();

    const where: Prisma.ProgramWhereInput = {};
    if (type === "INTERNSHIP" || type === "WORKSHOP") where.type = type;
    if (status === "LIVE" || status === "UPCOMING" || status === "ARCHIVED") where.status = status;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take,
        include: { _count: { select: { applications: true } } }
      }),
      prisma.program.count({ where })
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return handleRouteError(error, "programs:GET");
  }
}

export async function POST(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only administrators can create programs.");

    const parsed = await parseBody(req, programCreateSchema);
    if (!parsed.ok) return parsed.response;
    const p = parsed.data;

    const program = await prisma.program.create({
      data: {
        title: p.title,
        type: p.type,
        description: p.description,
        duration: p.duration,
        status: p.status,
        summary: p.summary || null,
        image: p.image || null,
        curriculum: p.curriculum ?? [],
        outcomes: p.outcomes ?? [],
        seats: p.seats ?? 30,
        stipend: p.stipend || null,
        mode: p.mode || "Hybrid",
        location: p.location || null,
        startDate: p.startDate ? new Date(p.startDate) : null,
        endDate: p.endDate ? new Date(p.endDate) : null,
        published: p.published ?? true
      }
    });

    await audit({ actorId: user.id, action: "program.create", target: program.id, metadata: { title: program.title } });

    return created({ program });
  } catch (error) {
    return handleRouteError(error, "programs:POST");
  }
}
