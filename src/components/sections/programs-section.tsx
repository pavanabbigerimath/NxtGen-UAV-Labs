"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, CalendarDays, GraduationCap, MapPin, Users, Wrench, ArrowUpRight } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export type ProgramCard = {
  id: string;
  title: string;
  type: string;
  status: string;
  duration: string;
  summary: string | null;
  description: string;
  image: string | null;
  seats: number;
  mode: string | null;
  location: string | null;
  startDate: string | Date | null;
  curriculum: string[];
  outcomes: string[];
};

function HorizontalMarqueeRow({
  heading,
  icon: Icon,
  items,
  accent
}: {
  heading: string;
  icon: typeof Wrench;
  items: ProgramCard[];
  accent: "electric" | "cyan";
}) {
  const [paused, setPaused] = useState(false);

  if (!items.length) return null;

  // Duplicate items array to ensure seamless infinite marquee loop
  const displayItems = items.length < 3 ? [...items, ...items, ...items] : [...items, ...items];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              accent === "electric"
                ? "border-electric-500/40 bg-electric-500/10 text-electric-400"
                : "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{heading}</h3>
            <p className="text-[11px] uppercase tracking-[0.16em] text-coolgray">
              {items.length} {items.length === 1 ? "program" : "programs"} active in database
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Continuous Moving Marquee Track */}
      <div 
        className="relative w-full overflow-hidden py-3 mask-fade-x"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div 
          className="flex w-max gap-6 animate-marquee"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {displayItems.map((p, i) => {
            const isWorkshop = p.type.toUpperCase() === "WORKSHOP";

            return (
              <motion.article
                key={`${p.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-space-900/90 backdrop-blur-xl overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all duration-300 w-[320px] sm:w-[360px] shrink-0"
              >
                <div>
                  {/* Card Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-space-950">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="360px"
                        className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-space-800 to-space-950 flex items-center justify-center">
                        {isWorkshop ? <Wrench className="h-8 w-8 text-cyan-400/30" /> : <GraduationCap className="h-8 w-8 text-electric-400/30" />}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/30 to-transparent" />
                    
                    {/* Status & Type Badges */}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
                      <Badge tone={statusTone(p.status)} dot>
                        {p.status}
                      </Badge>
                      <Badge tone={accent === "electric" ? "upcoming" : "cyan"}>
                        {p.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex flex-col gap-3">
                    <h4 className="text-base font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-coolgray line-clamp-2 min-h-[2rem]">
                      {p.summary ?? p.description}
                    </p>

                    {/* Specs Metadata Grid */}
                    <dl className="mt-2 grid grid-cols-2 gap-2.5 text-[11px] text-coolgray border-t border-white/10 pt-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{p.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{p.seats} seats</span>
                      </div>
                      {p.mode && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{p.mode}</span>
                        </div>
                      )}
                      {p.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 flex items-center justify-between gap-3 border-t border-white/5 bg-black/20">
                  <span className="text-[11px] font-medium text-coolgray">
                    Starts {formatDate(p.startDate)}
                  </span>
                  <Link
                    href={`/programs/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-white text-xs font-medium transition-all shadow-md group/btn shrink-0"
                  >
                    Register Now
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Programs — Continuous horizontal moving rows for Internships (top) and Workshops (bottom). */
export function ProgramsSection({ programs }: { programs: ProgramCard[] }) {
  const internships = programs.filter((p) => p.type.toUpperCase() === "INTERNSHIP");
  const workshops = programs.filter((p) => p.type.toUpperCase() === "WORKSHOP");

  return (
    <section id="programs" className="relative py-24 sm:py-32 overflow-hidden bg-space-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="container-x relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-16">
          <div>
            <span className="eyebrow">
              <Award className="h-3 w-3 text-cyan-400" /> Internships &amp; Workshops
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Train inside a working R&amp;D lab
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-coolgray">
              Every program is run by the engineers who build our aircraft. Pick a guided workshop for
              hands-on skills or an internship to own a real subsystem from simulation to flight test.
            </p>
          </div>
          <Link href="/programs" className="btn-ghost btn-sm shrink-0">
            View all programs
          </Link>
        </div>

        {/* Dynamic Continuous Horizontal Rows: Internships on Top, Workshops on Bottom */}
        <div className="flex flex-col gap-16">
          <HorizontalMarqueeRow heading="Internships" icon={GraduationCap} items={internships} accent="electric" />
          <HorizontalMarqueeRow heading="Workshops" icon={Wrench} items={workshops} accent="cyan" />
        </div>

      </div>
    </section>
  );
}