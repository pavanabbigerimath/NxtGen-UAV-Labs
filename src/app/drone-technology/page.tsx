import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { TechnologySection } from "@/components/sections/technology-section";

export const metadata: Metadata = {
  title: "Drone Technology",
  description:
    "A modern UAV is a sophisticated cyber-physical ecosystem. By fusing advanced embedded hardware, precision telemetry, edge AI, and robust mechanical engineering, our systems achieve true autonomous intelligence in complex real-world missions"
};

export default function DroneTechnologyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="container-x">
          <SectionHeading
            title="The engineering behind autonomous flight"
            description="                                                  "
            align="left"
          />
        </section>
        <TechnologySection />
      </main>
      <Footer />
    </>
  );
}