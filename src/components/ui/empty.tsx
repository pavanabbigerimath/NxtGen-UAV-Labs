export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric-500/30 bg-electric-500/10">
        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {hint && <p className="max-w-md text-xs leading-relaxed text-coolgray">{hint}</p>}
      {action}
    </div>
  );
}
