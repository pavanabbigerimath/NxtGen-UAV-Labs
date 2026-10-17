"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/navbar";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ShellNav = { href: string; label: string; icon: React.ReactNode }[];

export function DashboardShell({
  nav,
  user,
  title,
  subtitle,
  children
}: {
  nav: ShellNav;
  user: { name: string; email: string; role: string };
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const active = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active
                ? "border border-electric-500/40 bg-electric-500/12 text-white"
                : "text-coolgray hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={active ? "text-cyan-400" : ""}>{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-space-950">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-space-950/85 backdrop-blur-xl">
        <div className="container-x flex h-[68px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-white/12 p-2 text-white lg:hidden" aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-cyan-400">
                {user.role === "ADMIN" ? "Administrator" : "Student"}
              </p>
            </div>
            <Avatar name={user.name} size={34} />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg border border-white/12 p-2 text-coolgray transition hover:border-rose-400/50 hover:text-rose-400"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="container-x flex gap-8 py-8">
        {/* sidebar */}
        <aside className={cn("w-64 shrink-0 lg:block", open ? "block" : "hidden")}>
          <div className="panel sticky top-24 p-3.5">{links}</div>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1">
          <div className={cn("mb-7", open ? "hidden lg:block" : "block")}>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm text-coolgray">{subtitle}</p>
          </div>
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
