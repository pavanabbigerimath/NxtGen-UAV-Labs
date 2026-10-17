"use client";

import Link from "next/link";
import { LogIn, Send, CheckCircle2 } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";

export function RegisterButton({
  programId,
  isAuthenticated,
  alreadyApplied,
  applicationStatus
}: {
  programId: string;
  isAuthenticated: boolean;
  alreadyApplied: boolean;
  applicationStatus: string | null;
}) {
  if (!isAuthenticated) {
    return (
      <Link href={`/login?callbackUrl=/programs/${programId}/apply`} className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
        <LogIn className="h-4 w-4" /> Register Now
      </Link>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] p-4 text-center">
        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />
        <p className="mt-2 text-sm font-semibold text-white">Application submitted</p>
        <div className="mt-2 flex justify-center">
          <Badge tone={statusTone(applicationStatus ?? "PENDING")} dot>
            {(applicationStatus ?? "PENDING").replace("_", " ")}
          </Badge>
        </div>
        <Link href="/dashboard" className="mt-3 inline-block text-xs font-semibold text-cyan-400 hover:text-cyan-300">
          Track it in your dashboard →
        </Link>
      </div>
    );
  }

  return (
    <Link href={`/programs/${programId}/apply`} className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
      <Send className="h-4 w-4" /> Register Now
    </Link>
  );
}