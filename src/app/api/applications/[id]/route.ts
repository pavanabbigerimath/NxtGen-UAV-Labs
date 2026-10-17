import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { applicationUpdateSchema } from "@/lib/validations";
import { certificateSerial } from "@/lib/utils";
import { fail, forbidden, handleRouteError, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { program: true, user: { select: { id: true, name: true, email: true } } }
    });
    if (!application) return notFound("Application");
    if (user.role !== "ADMIN" && application.userId !== user.id) return forbidden();

    return ok({ application });
  } catch (error) {
    return handleRouteError(error, "applications/[id]:GET");
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const existing = await prisma.application.findUnique({
      where: { id: params.id },
      include: { user: true, program: true }
    });
    if (!existing) return notFound("Application");

    const isOwner = existing.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) return forbidden();

    const parsed = await parseBody(req, applicationUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const { status, reviewNote, score } = parsed.data;

    // Students may only withdraw their own application — never self-approve.
    if (!isAdmin) {
      if (status && status !== "WITHDRAWN") {
        return forbidden("Students can only withdraw an application.");
      }
      if (reviewNote !== undefined || score !== undefined) {
        return forbidden("Only administrators can leave review notes or scores.");
      }
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(reviewNote !== undefined ? { reviewNote: reviewNote || null } : {}),
        ...(score !== undefined ? { score } : {}),
        ...(isAdmin && status ? { reviewedAt: new Date() } : {})
      },
      include: { program: true }
    });

    // Approving a program issues the student's completion certificate record.
    if (isAdmin && status === "APPROVED") {
      const already = await prisma.certificate.findFirst({
        where: { userId: existing.userId, programName: existing.program.title }
      });
      if (!already) {
        await prisma.certificate.create({
          data: {
            userId: existing.userId,
            title: `${existing.program.title} — ${existing.program.type === "INTERNSHIP" ? "Internship" : "Workshop"} Completion`,
            programName: existing.program.title,
            serial: certificateSerial(existing.user.name)
          }
        });
      }
    }

    await audit({
      actorId: user.id,
      action: isAdmin ? "application.review" : "application.withdraw",
      target: application.id,
      metadata: { status: application.status }
    });

    return ok({ application });
  } catch (error) {
    return handleRouteError(error, "applications/[id]:PATCH");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Only administrators can delete applications.");

    const existing = await prisma.application.findUnique({ where: { id: params.id } });
    if (!existing) return notFound("Application");

    await prisma.application.delete({ where: { id: params.id } });
    await audit({ actorId: user.id, action: "application.delete", target: params.id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error, "applications/[id]:DELETE");
  }
}
