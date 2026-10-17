"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const urlError = params.get("error");

  const [form, setForm] = useState({ name: "", email: "", password: "", institution: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "ACCOUNT_SUSPENDED" ? "This account has been suspended. Contact the lab administrator." : null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            institution: form.institution,
            city: form.city
          })
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.code === "validation_error" && json.details) setFieldErrors(json.details);
          setError(json.error ?? "Could not create your account.");
          setBusy(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: callbackUrl ?? undefined
      });

      if (!result || result.error) {
        setError(
          result?.error === "RATE_LIMITED"
            ? "Too many attempts. Please wait a minute and try again."
            : result?.error === "ACCOUNT_SUSPENDED"
              ? "This account has been suspended."
              : "Invalid email or password."
        );
        setBusy(false);
        return;
      }

      // Role-based redirect: ask the server who we are, then route accordingly.
      const me = await fetch("/api/profile").then((r) => (r.ok ? r.json() : null));
      const role = me?.data?.user?.role ?? "STUDENT";
      const target = callbackUrl ?? (role === "ADMIN" ? "/admin" : "/dashboard");
      router.push(target);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="panel w-full max-w-md p-7 sm:p-8"
    >
      <span className="eyebrow">
        <ShieldCheck className="h-3 w-3" /> Secure Access
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {isSignup ? "Create your student account" : "Sign in to the portal"}
      </h1>
      <p className="mt-2 text-sm text-coolgray">
        {isSignup
          ? "Register to apply for internships and workshops, upload documents and track your progress."
          : "Access your dashboard, applications, resources and certificates."}
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {isSignup && (
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray" />
              <input
                id="name"
                className="field pl-10"
                value={form.name}
                onChange={set("name")}
                placeholder="Aarav Mehta"
                required
                minLength={2}
              />
            </div>
            {fieldErrors.name && <p className="mt-1 text-[11px] text-rose-300">{fieldErrors.name[0]}</p>}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field pl-10"
              value={form.email}
              onChange={set("email")}
              placeholder="you@university.edu"
              required
            />
          </div>
          {fieldErrors.email && <p className="mt-1 text-[11px] text-rose-300">{fieldErrors.email[0]}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-coolgray" />
            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="field pl-10"
              value={form.password}
              onChange={set("password")}
              placeholder={isSignup ? "Min 8 characters, 1 number" : "••••••••"}
              required
              minLength={isSignup ? 8 : 1}
            />
          </div>
          {fieldErrors.password && <p className="mt-1 text-[11px] text-rose-300">{fieldErrors.password[0]}</p>}
        </div>

        {isSignup && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="institution">
                Institution
              </label>
              <input
                id="institution"
                className="field"
                value={form.institution}
                onChange={set("institution")}
                placeholder="IIT Bombay"
              />
            </div>
            <div>
              <label className="label" htmlFor="city">
                City
              </label>
              <input id="city" className="field" value={form.city} onChange={set("city")} placeholder="Pune" />
            </div>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-coolgray">
        {isSignup ? "Already registered?" : "New to UAV Labs?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-cyan-400 hover:text-cyan-300">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </motion.div>
  );
}
