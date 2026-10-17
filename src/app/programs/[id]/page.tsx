import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, CalendarDays, CheckCircle2, GraduationCap, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge, statusTone } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { RegisterButton } from "@/components/dashboard/register-button";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = await prisma.program.findUnique({ where: { id: params.id } }).catch(() => null);
  return {
    title: program?.title ?? "Program",
    description: program?.summary ?? program?.description?.slice(0, 150)
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const program = await prisma.program.findUnique({ where: { id: params.id } }).catch(() => null);
  if (!program) notFound();

  const user = await getSessionUser();
  const existing = user
    ? await prisma.application
        .findUnique({ where: { userId_programId: { userId: user.id, programId: program.id } } })
        .catch(() => null)
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-28">
        <div className="container-x">
          <Link href="/programs" className="inline-flex items-center gap-2 text-xs text-coolgray transition hover:text-cyan-400">
            <ArrowLeft className="h-3.5 w-3.5" /> All programs
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <article>
              <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 sm:h-80">
                {program.image ? (
                  <Image src={program.image} alt={program.title} fill sizes="100vw" className="object-cover opacity-80" unoptimized />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-space-800 to-space-950 grid-bg" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/40 to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <Badge tone={statusTone(program.status)} dot>{program.status}</Badge>
                  <Badge tone={program.type === "INTERNSHIP" ? "upcoming" : "cyan"}>{program.type}</Badge>
                </div>
              </div>

              <h1 className="mt-7 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {program.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-coolgray sm:text-base">{program.description}</p>

              <section className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-coolgray">Curriculum</h2>
                <ol className="mt-4 space-y-2.5">
                  {program.curriculum.map((c, i) => (
                    <li key={c} className="panel flex items-start gap-3 p-3.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-electric-500/40 bg-electric-500/10 text-[10px] font-semibold text-electric-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-white/90">{c}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {program.outcomes.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-coolgray">
                    What you take away
                  </h2>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {program.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3.5 text-sm text-white/90">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>

            {/* registration rail */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="panel p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Award className="h-4 w-4 text-cyan-400" /> Program details
                </h2>
                <dl className="mt-5 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                    <dt className="flex items-center gap-2 text-coolgray"><CalendarDays className="h-4 w-4 text-electric-400" /> Duration</dt>
                    <dd className="text-right text-white">{program.duration}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                    <dt className="flex items-center gap-2 text-coolgray"><Users className="h-4 w-4 text-electric-400" /> Seats</dt>
                    <dd className="text-right text-white">{program.seats}</dd>
                  </div>
                  {program.mode && (
                    <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                      <dt className="flex items-center gap-2 text-coolgray"><GraduationCap className="h-4 w-4 text-electric-400" /> Mode</dt>
                      <dd className="text-right text-white">{program.mode}</dd>
                    </div>
                  )}
                  {program.location && (
                    <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                      <dt className="flex items-center gap-2 text-coolgray"><MapPin className="h-4 w-4 text-electric-400" /> Location</dt>
                      <dd className="text-right text-white">{program.location}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                    <dt className="text-coolgray">Starts</dt>
                    <dd className="text-right text-white">{formatDate(program.startDate)}</dd>
                  </div>
                  {program.stipend && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-coolgray">Stipend</dt>
                      <dd className="text-right text-cyan-400">{program.stipend}</dd>
                    </div>
                  )}
                </dl>

                <RegisterButton
                  programId={program.id}
                  isAuthenticated={Boolean(user)}
                  alreadyApplied={Boolean(existing)}
                  applicationStatus={existing?.status ?? null}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
