import { prisma } from "@/lib/prisma";
import { apiUser } from "@/lib/session";
import { forbidden, handleRouteError, notFound, ok, unauthorized } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await apiUser();
    if (!user) return unauthorized();

    const document = await prisma.document.findUnique({ where: { id: params.id } });
    if (!document) return notFound("Document");
    if (document.userId !== user.id && user.role !== "ADMIN") return forbidden();

    await prisma.document.delete({ where: { id: params.id } });
    await audit({ actorId: user.id, action: "document.delete", target: params.id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error, "documents/[id]:DELETE");
  }
}
