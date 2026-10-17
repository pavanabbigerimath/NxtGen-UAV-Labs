import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protection.
 * - /dashboard/**  → any authenticated, non-suspended user
 * - /admin/**      → ADMIN role only (students are bounced to /dashboard)
 * The role check runs inside the Edge middleware using the JWT payload, so an
 * unauthorised request never reaches the page or its data loaders.
 */
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (token?.status === "SUSPENDED") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "ACCOUNT_SUSPENDED");
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", "admin");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token)
    },
    pages: { signIn: "/login" }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
};
