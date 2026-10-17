import { prisma } from "./prisma";

/** Fire-and-forget audit trail. Never blocks or fails the originating request. */
export async function audit(params: {
  actorId?: string | null;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        target: params.target ?? null,
        metadata: (params.metadata ?? {}) as object
      }
    });
  } catch (error) {
    console.warn("[audit] failed to record entry:", error);
  }
}
