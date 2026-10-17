"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, Shield, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/drone-technology", label: "Drone Technology" },
  { href: "/rd-labs", label: "R&D Labs" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About Us" }
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="NxtGenUAV Labs home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-electric-500/40 bg-gradient-to-br from-electric-600/30 to-cyan-500/20 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M12 3v18M3 12h18" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <circle cx="12" cy="12" r="3.2" fill="#3b82f6" />
          <circle cx="5" cy="5" r="1.7" fill="#22d3ee" />
          <circle cx="19" cy="5" r="1.7" fill="#22d3ee" />
          <circle cx="5" cy="19" r="1.7" fill="#22d3ee" />
          <circle cx="19" cy="19" r="1.7" fill="#22d3ee" />
          <path d="M6.4 6.4 9.6 9.6M17.6 6.4 14.4 9.6M6.4 17.6 9.6 14.4M17.6 17.6 14.4 14.4" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-white">NxtGenUAV Labs</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-coolgray">
            Drone Technology &amp; R&amp;D Labs
          </span>
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const user = session?.user;
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-space-950/85 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="container-x flex h-[68px] items-center justify-between gap-6">
        <Logo />

        {/* Desktop links - Hidden on medium/mobile screens */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "text-white"
                  : "text-coolgray hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop User profile / Login button */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <span className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <Link href={dashboardHref} className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 transition hover:border-electric-500/50">
              <Avatar name={user.name ?? "User"} size={30} />
              <span className="leading-tight">
                <span className="block text-xs font-semibold text-white">{user.name}</span>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-cyan-400">
                  {user.role === "ADMIN" ? <Shield className="h-2.5 w-2.5" /> : <LayoutDashboard className="h-2.5 w-2.5" />}
                  {user.role === "ADMIN" ? "Mission Control" : "Dashboard"}
                </span>
              </span>
            </Link>
          ) : (
            <Link href="/login" className="btn-primary btn-sm">
              <LogIn className="h-3.5 w-3.5" /> Login / Signup
            </Link>
          )}
        </div>

        {/* Mobile menu toggle button - Visible on mobile & tablet (md:hidden) */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/12 p-2 text-white md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden border-t border-white/10 bg-space-950/97 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-sm text-coolgray hover:bg-white/5 hover:text-white">
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-white/10 pt-3">
                {user ? (
                  <Link href={dashboardHref} className="btn-primary w-full text-center">
                    {user.role === "ADMIN" ? "Mission Control" : "My Dashboard"}
                  </Link>
                ) : (
                  <Link href="/login" className="btn-primary w-full justify-center">
                    <LogIn className="h-4 w-4" /> Login / Signup
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}