import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[100svh] pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden />
        <div className="container-x relative flex justify-center">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </main>
    </>
  );
}
