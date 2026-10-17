import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { applicationCreateSchema } from "@/lib/validations";
import { created, fail, forbidden, getPagination, handleRouteError, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const url = new URL(req.url);
    const { page, limit, skip, take } = getPagination(url, 20, 100);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const programId = url.searchParams.get("programId");

    const where: Prisma.ApplicationWhereInput = {};
    // Students only ever see their own records; admins see the whole queue.
    if (user.role !== "ADMIN") where.userId = user.id;
    if (status && ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"].includes(status)) {
      where.status = status as Prisma.ApplicationWhereInput["status"];
    }
    if (programId) where.programId = programId;
    if (type === "INTERNSHIP" || type === "WORKSHOP") where.program = { type };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          program: true,
          user: { select: { id: true, name: true, email: true, institution: true, city: true } }
        }
      }),
      prisma.application.count({ where })
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return handleRouteError(error, "applications:GET");
  }
}

export async function POST(req: Request) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const parsed = await parseBody(req, applicationCreateSchema);
    if (!parsed.ok) return parsed.response;
    const { programId, coverNote, resumeUrl } = parsed.data;

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) return notFound("Program");

    const existing = await prisma.application.findUnique({
      where: { userId_programId: { userId: user.id, programId } }
    });
    if (existing) {
      return fail("You have already applied to this program.", 409, "duplicate_application");
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        programId,
        coverNote: coverNote || null,
        resumeUrl: resumeUrl || null,
        status: "PENDING"
      },
      include: { program: true }
    });

    await audit({
      actorId: user.id,
      action: "application.create",
      target: application.id,
      metadata: { programId, program: program.title }
    });

    return created({ application });
  } catch (error) {
    return handleRouteError(error, "applications:POST");
  }
}
