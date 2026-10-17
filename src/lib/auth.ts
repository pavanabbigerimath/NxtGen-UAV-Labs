import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { env, appUrl } from "./env";
import { loginSchema } from "./validations";
import { checkRateLimit } from "./rate-limit";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24
  },
  jwt: { maxAge: SESSION_MAX_AGE },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  // NextAuth issues and validates a CSRF token for every POST to this route.
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(raw, req) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Brute-force protection: 8 attempts / minute / (ip+email) pair.
        const headerIp =
          req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() ?? "unknown";
        const gate = await checkRateLimit("auth", `auth:${headerIp}:${email}`);
        if (!gate.success) throw new Error("RATE_LIMITED");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          // Constant-ish work on the miss path to blunt user enumeration timing.
          await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.status === "SUSPENDED") throw new Error("ACCOUNT_SUSPENDED");

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.name = user.name;
        token.email = user.email;
      }

      // Refresh role/status from the DB on session update or every ~10 min so
      // an admin's role change takes effect without a re-login.
      const shouldRefresh =
        trigger === "update" || !token.iat || Date.now() / 1000 - (token.iat as number) > 600;

      if (token.id && shouldRefresh) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, name: true }
        });
        if (fresh) {
          token.role = fresh.role;
          token.status = fresh.status;
          token.name = fresh.name;
        }
        if (session?.name) token.name = session.name as string;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.status = token.status;
        if (token.name) session.user.name = token.name;
      }
      return session;
    }
  },
  debug: false,
  logger: {
    error(code, metadata) {
      if (code !== "CLIENT_FETCH_ERROR") console.error("[nextauth]", code, metadata);
    },
    warn(code) {
      console.warn("[nextauth]", code);
    },
    debug() {}
  }
};

export const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  RATE_LIMITED: "Too many sign-in attempts. Please wait a minute and try again.",
  ACCOUNT_SUSPENDED: "This account has been suspended. Contact the lab administrator.",
  SessionRequired: "Please sign in to continue."
};

export { appUrl };
