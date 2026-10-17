import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { programUpdateSchema } from "@/lib/validations";
import { fail, forbidden, handleRouteError, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true } } }
    });
    if (!program) return notFound("Program");
    return ok({ program });
  } catch (error) {
    return handleRouteError(error, "programs/[id]:GET");
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only administrators can edit programs.");

    const parsed = await parseBody(req, programUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const p = parsed.data;

    const exists = await prisma.program.findUnique({ where: { id: params.id } });
    if (!exists) return notFound("Program");

    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...(p.title !== undefined ? { title: p.title } : {}),
        ...(p.type !== undefined ? { type: p.type } : {}),
        ...(p.description !== undefined ? { description: p.description } : {}),
        ...(p.duration !== undefined ? { duration: p.duration } : {}),
        ...(p.status !== undefined ? { status: p.status } : {}),
        ...(p.summary !== undefined ? { summary: p.summary || null } : {}),
        ...(p.image !== undefined ? { image: p.image || null } : {}),
        ...(p.curriculum !== undefined ? { curriculum: p.curriculum } : {}),
        ...(p.outcomes !== undefined ? { outcomes: p.outcomes } : {}),
        ...(p.seats !== undefined ? { seats: p.seats } : {}),
        ...(p.stipend !== undefined ? { stipend: p.stipend || null } : {}),
        ...(p.mode !== undefined ? { mode: p.mode || null } : {}),
        ...(p.location !== undefined ? { location: p.location || null } : {}),
        ...(p.startDate !== undefined ? { startDate: p.startDate ? new Date(p.startDate) : null } : {}),
        ...(p.endDate !== undefined ? { endDate: p.endDate ? new Date(p.endDate) : null } : {}),
        ...(p.published !== undefined ? { published: p.published } : {})
      }
    });

    await audit({ actorId: user.id, action: "program.update", target: program.id });
    return ok({ program });
  } catch (error) {
    return handleRouteError(error, "programs/[id]:PATCH");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only administrators can delete programs.");

    const exists = await prisma.program.findUnique({ where: { id: params.id } });
    if (!exists) return notFound("Program");

    await prisma.program.delete({ where: { id: params.id } });
    await audit({ actorId: user.id, action: "program.delete", target: params.id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error, "programs/[id]:DELETE");
  }
}
