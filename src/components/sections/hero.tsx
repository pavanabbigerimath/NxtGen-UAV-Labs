"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BrainCircuit, ShieldCheck, Wrench } from "lucide-react";

const pillars = [
  { label: "Research", icon: BrainCircuit },
  { label: "Build", icon: Wrench },
  { label: "Trust", icon: ShieldCheck }
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[85vh] lg:min-h-[90vh] w-full overflow-hidden flex items-center pt-32 pb-20 sm:pt-36 sm:pb-24">
      
      {/* Background Video with Smart Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover scale-105"
        >
          <source src="/drone.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Top gradient for Navbar visibility */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/95 via-black/70 to-transparent" />

        {/* Left-heavy dark gradient for text clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 lg:via-black/50 to-transparent" />
      </div>

      {/* atmosphere layers */}
      <div className="pointer-events-none absolute inset-0 bg-radial-fade z-[1]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-15 z-[1]" aria-hidden />

      <div className="container-x relative z-10 grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-6 w-full px-4 sm:px-6 lg:px-8">
        
        {/* Left side text content */}
        <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-xl">
          
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]"
          >
            Explore the technology
            <br />
            behind <span className="text-gradient font-extrabold">modern drones.</span>
          </motion.h1>

          {/* Horizontal 3 Core Pillars (Research, Build, Trust) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 flex flex-row items-center gap-2.5 sm:gap-3 w-full"
          >
            {pillars.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/85 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-xl transition hover:border-cyan-400/60 hover:bg-black whitespace-nowrap"
              >
                <Icon className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <Link href="/programs" className="btn-primary shadow-xl font-semibold text-sm py-3 px-6">
              Explore Programs <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/rd-labs" className="btn-ghost bg-black/85 backdrop-blur-md border border-white/20 font-semibold text-white text-sm py-3 px-6">
              Inside the Lab
            </Link>
          </motion.div>
        </motion.div>

        {/* Right side video showcase view */}
        <div className="hidden lg:block relative h-full">
          <div className="absolute bottom-[-10px] right-0 left-0 flex justify-center gap-6 text-[10px] uppercase tracking-[0.22em] text-gray-200 z-10 font-bold drop-shadow-md">
            <span>Gyro-stabilised</span>
            <span className="text-electric-500">•</span>
            <span>Autonomous GNC</span>
          </div>
        </div>
      </div>
    </section>
  );
}