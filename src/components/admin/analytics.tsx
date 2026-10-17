import { Activity, CheckCircle2, Clock } from "lucide-react";

export type Stats = {
  users: { total: number; students: number; admins: number; suspended: number; newLast30Days: number; newLast7Days: number };
  programs: { total: number; live: number; upcoming: number; internships: number; workshops: number };
  applications: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    withdrawn: number;
    newLast30Days: number;
    approvalRate: number;
    byStatus: { status: string; count: number }[];
  };
  engagement: { certificatesIssued: number; documentsUploaded: number; componentsCatalogued: number };
  trend: { month: string; applications: number; signups: number }[];
};

/** Lightweight dependency-free bar chart for the cohort trend. */
export function TrendChart({ trend }: { trend: Stats["trend"] }) {
  const max = Math.max(1, ...trend.map((t) => Math.max(t.applications, t.signups)));

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Activity className="h-4 w-4 text-electric-400" /> Cohort trend · last 6 months
        </h3>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-coolgray">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-electric-500" /> Applications</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-cyan-400" /> Signups</span>
        </div>
      </div>

      <div className="mt-6 flex h-[180px] items-end gap-4">
        {trend.map((t) => (
          <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/3 rounded-t bg-gradient-to-t from-electric-700 to-electric-500 transition-all"
                style={{ height: `${Math.max(3, (t.applications / max) * 100)}%` }}
                title={`${t.applications} applications`}
              />
              <div
                className="w-1/3 rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all"
                style={{ height: `${Math.max(3, (t.signups / max) * 100)}%` }}
                title={`${t.signups} signups`}
              />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-coolgray">{t.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Application pipeline funnel with per-stage counts. */
export function PipelineBreakdown({ stats }: { stats: Stats }) {
  const stages = [
    { label: "Pending", value: stats.applications.pending, tone: "bg-amber-400" },
    { label: "Under review", value: stats.applications.underReview, tone: "bg-electric-500" },
    { label: "Approved", value: stats.applications.approved, tone: "bg-emerald-400" },
    { label: "Rejected", value: stats.applications.rejected, tone: "bg-rose-400" },
    { label: "Withdrawn", value: stats.applications.withdrawn, tone: "bg-white/30" }
  ];
  const total = Math.max(1, stats.applications.total);

  return (
    <div className="panel p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Application pipeline
      </h3>
      <p className="mt-1 text-xs text-coolgray">
        Approval rate <span className="font-semibold text-cyan-400">{stats.applications.approvalRate}%</span> across{" "}
        {stats.applications.total} submissions
      </p>

      <div className="mt-5 space-y-3.5">
        {stages.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-[11px] text-coolgray">
              <span className="uppercase tracking-wider">{s.label}</span>
              <span className="text-white">{s.value}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${s.tone}`} style={{ width: `${(s.value / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        {[
          { k: "Certificates", v: stats.engagement.certificatesIssued },
          { k: "Documents", v: stats.engagement.documentsUploaded },
          { k: "Components", v: stats.engagement.componentsCatalogued }
        ].map((x) => (
          <div key={x.k}>
            <dt className="text-[10px] uppercase tracking-wider text-coolgray">{x.k}</dt>
            <dd className="mt-1 text-lg font-semibold text-cyan-400">{x.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RecentActivity({
  applications,
  users
}: {
  applications: { id: string; status: string; createdAt: Date | string; user: { name: string }; program: { title: string } }[];
  users: { id: string; name: string; role: string; createdAt: Date | string }[];
}) {
  return (
    <div className="panel p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Clock className="h-4 w-4 text-electric-400" /> Recent activity
      </h3>
      <ul className="mt-4 space-y-3">
        {applications.slice(0, 4).map((a) => (
          <li key={a.id} className="flex items-start gap-3 border-b border-white/8 pb-3 text-xs last:border-0">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span className="text-coolgray">
              <span className="text-white">{a.user.name}</span> applied to{" "}
              <span className="text-white">{a.program.title}</span>
            </span>
          </li>
        ))}
        {users.slice(0, 3).map((u) => (
          <li key={u.id} className="flex items-start gap-3 border-b border-white/8 pb-3 text-xs last:border-0">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-500" />
            <span className="text-coolgray">
              New {u.role.toLowerCase()} <span className="text-white">{u.name}</span> joined the platform
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
