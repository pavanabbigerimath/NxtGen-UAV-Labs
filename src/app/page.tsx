import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { LabsSection } from "@/components/sections/labs-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { ProgramsSection, type ProgramCard } from "@/components/sections/programs-section";
import { VisionSection } from "@/components/sections/vision-section";
import { MentorsSection } from "@/components/sections/mentors-section"; // Import madabeku

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [components, programs] = await Promise.all([
    prisma.droneComponent.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }).catch(() => []),
    prisma.program
      .findMany({ where: { published: true }, orderBy: [{ status: "asc" }, { createdAt: "desc" }] })
      .catch(() => [])
  ]);

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
      <main>
        <Hero />
        <TechnologySection />
        
        <LabsSection
          components={components.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            category: c.category,
            specs: c.specs,
            imageUrl: c.imageUrl
          }))}
        />
        
        <ProgramsSection programs={cards} />
        
        {/* Illi Programs mattu Vision naduve Mentors Section add madidre tumba nannagi kanisutte */}
        <MentorsSection />
        
        <VisionSection />
      </main>
      <Footer />
    </>
  );
}