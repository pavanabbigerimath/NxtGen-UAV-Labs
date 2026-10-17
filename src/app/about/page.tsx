import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VisionSection } from "@/components/sections/vision-section";

export const metadata: Metadata = {
  title: "About Us",
  description: "The vision, mission and mission-control contacts behind NextGen UAV Labs."
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px]">
        <VisionSection />
      </main>
      <Footer />
    </>
  );
}
