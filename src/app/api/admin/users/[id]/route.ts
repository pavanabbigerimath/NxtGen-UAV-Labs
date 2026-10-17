import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { userUpdateSchema } from "@/lib/validations";
import { fail, forbidden, handleRouteError, notFound, ok, parseBody, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Administrator access required.");

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return notFound("User");

    const parsed = await parseBody(req, userUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const { role, status, name } = parsed.data;

    // Guard: an admin must not lock themselves out of Mission Control.
    if (target.id === user.id) {
      if (role === "STUDENT") return fail("You cannot demote your own account.", 409, "self_demote_blocked");
      if (status && status !== "ACTIVE") {
        return fail("You cannot suspend your own account.", 409, "self_suspend_blocked");
      }
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(name ? { name } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
        _count: { select: { applications: true, documents: true, certificates: true } }
      }
    });

    await audit({
      actorId: user.id,
      action: "user.update",
      target: updated.id,
      metadata: { role: updated.role, status: updated.status }
    });

    return ok({ user: updated });
  } catch (error) {
    return handleRouteError(error, "admin/users/[id]:PATCH");
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Administrator access required.");
    if (user.id === params.id) return fail("You cannot delete your own account.", 409, "self_delete_blocked");

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return notFound("User");

    await prisma.user.delete({ where: { id: params.id } });
    await audit({ actorId: user.id, action: "user.delete", target: params.id, metadata: { email: target.email } });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error, "admin/users/[id]:DELETE");
  }
}
