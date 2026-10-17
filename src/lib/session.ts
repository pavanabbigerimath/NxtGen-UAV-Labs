import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  status: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "Operator",
    email: session.user.email ?? "",
    role: session.user.role,
    status: session.user.status
  };
}

/** Full user record for server components that need profile fields. */
export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id } });
}

export async function requireUser(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`${redirectTo}?callbackUrl=/dashboard`);
  if (user.status === "SUSPENDED") redirect("/login?error=ACCOUNT_SUSPENDED");
  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "STUDENT") redirect("/admin");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

/** Route-handler variant: returns null instead of redirecting. */
export async function apiUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (session.user.status === "SUSPENDED") return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "Operator",
    email: session.user.email ?? "",
    role: session.user.role,
    status: session.user.status
  };
}
