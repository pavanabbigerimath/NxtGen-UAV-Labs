import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { ProgramsSection, type ProgramCard } from "@/components/sections/programs-section";

export const metadata: Metadata = {
  title: "Programs",
  description: "Internships and workshops at NextGen UAV Labs — curriculum, duration, live status and registration."
};
export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await prisma.program
    .findMany({ where: { published: true }, orderBy: [{ status: "asc" }, { createdAt: "desc" }] })
    .catch(() => []);

  const cards: ProgramCard[] = programs.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    status: p.status,
    duration: p.duration,
    summary: p.summary,
    description: p.description,
    image: p.image,
    seats: p.seats,
    mode: p.mode,
    location: p.location,
    startDate: p.startDate,
    curriculum: p.curriculum,
    outcomes: p.outcomes
  }));

  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="container-x">
          <SectionHeading
            eyebrow="Programs"
            title="Internships & Workshops"
            description="Guided workshops for hands-on skills, research internships for real subsystem ownership. Select any program to review the full curriculum and register."
          />
        </section>

        {cards.length > 0 ? (
          <ProgramsSection programs={cards} />
        ) : (
          <section className="container-x py-16">
            <div className="panel p-8 text-sm text-coolgray">
              No programs are published yet. Sign in as an administrator and create one from Mission
              Control, or run <code className="text-cyan-400">npm run db:seed</code>.
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
