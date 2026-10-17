import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 * In development, Next.js hot-reload would otherwise create a new pool on every
 * module re-evaluation and exhaust Postgres connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
