import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Submitted", "Under Review", "Decision"] as const;

/**
 * Application progress: Submitted → Under Review → Accepted / Active.
 * Rejected and Withdrawn resolve the final step negatively.
 */
export function ProgressTracker({ status }: { status: string }) {
  const stage =
    status === "PENDING" ? 0 : status === "UNDER_REVIEW" ? 1 : 2;
  const terminal =
    status === "APPROVED" ? "accepted" : status === "REJECTED" ? "rejected" : status === "WITHDRAWN" ? "withdrawn" : null;

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((label, i) => {
        const complete = i < stage || (i === stage && stage === 2 && terminal === "accepted");
        const active = i === stage && !terminal;
        const failed = i === 2 && (terminal === "rejected" || terminal === "withdrawn");

        return (
          <div key={label} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold transition",
                  failed
                    ? "border-rose-400/50 bg-rose-500/15 text-rose-300"
                    : complete
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                      : active
                        ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-300"
                        : "border-white/15 bg-white/5 text-coolgray"
                )}
              >
                {failed ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : complete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : active ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[9px] uppercase tracking-wider",
                  complete || active || failed ? "text-white" : "text-coolgray"
                )}
              >
                {i === 2 && terminal ? terminal : label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mt-[-14px] h-px flex-1",
                  i < stage ? "bg-gradient-to-r from-emerald-400/60 to-cyan-400/40" : "bg-white/12"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
