"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface DroneItem {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
}

const DRONES: DroneItem[] = [
  {
    title: "Hexacopter AgriTech Drone",
    subtitle: "AGRICULTURE & SPRAYING",
    description: "Advanced agricultural drone equipped with precision spraying systems and real-time crop health monitoring sensors for smart farming.",
    imageSrc: "/image/agri.png",
  },
  {
    title: "FPV Drone",
    subtitle: "future of unmanned flight",
    description: "Real-Time First-Person View, Aerial Observation & Agile Flight",
    imageSrc: "/image/fpv.png",
  },
  {
    title: "Surveillance Drone",
    subtitle: "SECURITY & MAPPING",
    description: "Built for security monitoring, thermal imaging, and real-time live aerial patrol. Features HD optical/IR dual cameras, AI object tracking, and long-range video feed..",
    imageSrc: "/image/surveilence.png",
  },
  {
    title: "ArduPilot Drone ",
    subtitle: "SURVEYING & IMAGERY",
    description: "Lightweight, ultra-portable drone perfect for accurate 3D land surveying, topographical mapping, and high-resolution aerial photography.",
    imageSrc: "/image/drone2.png",
  },
];

export function TechnologySection() {
  return (
    <section className="relative py-24 bg-white text-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full uppercase tracking-widest border border-blue-200">
            Drone Fleet Showcase
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            Explore Types of <span className="text-blue-600">Modern Drones</span>
          </h2>
        </div>

        {/* Alternating Layout (No boxes, clean overlay on pure white, repeating 3D motion) */}
        <div className="space-y-32">
          {DRONES.map((drone, index) => {
            const isEven = index % 2 === 1; // Alternating layout (Left/Right swap)
            return (
              <div
                key={drone.title}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  isEven ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image Media Side with 3D Slide-in & Rotation Animation (Repeating on every visit) */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 120 : -120, rotateY: isEven ? 15 : -15, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full lg:w-[55%] relative h-[320px] sm:h-[420px] rounded-2xl overflow-hidden group perspective-1000 bg-transparent"
                >
                  <Image
                    src={drone.imageSrc}
                    alt={drone.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-contain rounded-2xl group-hover:scale-105 transition-transform duration-700 bg-transparent"
                    unoptimized
                  />
                </motion.div>

                {/* Text Details Side with Smooth Slide-up & Fade-in Animation (Repeating on every visit) */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full lg:w-[45%] space-y-4 text-center lg:text-left"
                >
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                    {drone.subtitle}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                    {drone.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {drone.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}