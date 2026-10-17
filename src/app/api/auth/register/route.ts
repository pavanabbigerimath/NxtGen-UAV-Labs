import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { created, fail, guardRateLimit, handleRouteError, parseBody } from "@/lib/api";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const limited = await guardRateLimit("auth", req);
    if (limited) return limited;

    const parsed = await parseBody(req, registerSchema);
    if (!parsed.ok) return parsed.response;
    const { name, email, password, institution, city, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("An account with this email already exists.", 409, "email_taken");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        institution: institution || null,
        city: city || null,
        phone: phone || null
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    await audit({ actorId: user.id, action: "user.register", target: user.email });

    return created({ user });
  } catch (error) {
    return handleRouteError(error, "auth/register");
  }
}
