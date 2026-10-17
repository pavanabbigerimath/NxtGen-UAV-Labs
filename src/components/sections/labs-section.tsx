"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Cpu, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ComponentItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  specs: string[];
  imageUrl: string | null;
};

// 20+ Mixed Videos & Images for Continuous Horizontal Marquee
const INITIAL_RD_OPERATIONS = [
  { id: "op-1", type: "video", url: "/drone1.mp4", title: "Flight Testing Campaign 01" },
  { id: "op-2", type: "image", url: "/image/drone4.png", title: "Agricultural Spraying Setup" },
  { id: "op-3", type: "video", url: "/video1.mp4", title: "Autonomous Navigation Trial" },
  { id: "op-4", type: "image", url: "/image/drone1.png", title: "FPV Drone Assembly" },
  { id: "op-5", type: "video", url: "/drone3.mp4", title: "Heavy Lift Cargo Test" },
  { id: "op-6", type: "image", url: "/image/.png", title: "Surveillance Camera Calibration" },
  { id: "op-7", type: "video", url: "/drone4.mp4", title: "Mapping & Survey Flight" },
  { id: "op-8", type: "image", url: "/image/.png", title: "R&D Lab Research Session" },
  { id: "op-9", type: "video", url: "/drone5.mp4", title: "Wind Tunnel Aerodynamics" },
  { id: "op-10", type: "image", url: "/image/.png", title: "Sensor Fusion Testing" },
  { id: "op-11", type: "video", url: "/drone6.mp4", title: "Long-Range Telemetry Link" },
  { id: "op-12", type: "image", url: "/image/.jpg", title: "Battery Thermal Management" },
  // Neewu illi innu bere videos mattu images-annu op-13, op-14... antha 20+ varaku add madikollabahudu!
];

export function LabsSection({ components: initialComponents }: { components: ComponentItem[] }) {
  const [components, setComponents] = useState<ComponentItem[]>(initialComponents);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const [operations, setOperations] = useState(INITIAL_RD_OPERATIONS);

  useEffect(() => {
    if (paused || components.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % components.length), 4000);
    return () => clearInterval(t);
  }, [paused, components.length]);

  if (!components.length) return null;
  const active = components[index];

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + components.length) % components.length);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, compId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);

    setComponents((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, imageUrl: localUrl } : c))
    );
  };

  const handleOpMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, opId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    const isVideo = file.type.includes("video") || file.name.match(/\.(mp4|webm|ogg|mov)$/i);

    setOperations((prev) =>
      prev.map((op) => (op.id === opId ? { ...op, url: localUrl, type: isVideo ? "video" : "image" } : op))
    );
  };

  return (
    <section id="component-explorer" className="container-x py-20 sm:py-24 overflow-hidden bg-space-950 text-white">
      
      {/* ========================================================= */}
      {/* 1. CONTINUOUS HORIZONTAL MOVING MIXED MEDIA CAROUSEL      */}
      {/* ========================================================= */}
      <div className="mb-24 pb-16 border-b border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <span className="eyebrow">
              <Cpu className="h-3 w-3 text-cyan-400" /> R&D & Field Operations
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Drone Research & Field Footages
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-coolgray">
              Continuous live vertical footage streams and field imagery from our flight testing campaigns.
            </p>
          </div>
        </div>

        <div 
          className="relative w-full overflow-hidden py-4 mask-fade-x"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className={`flex w-max gap-6 ${paused ? "" : "animate-marquee"}`}>
            {/* Double the array mapping to ensure seamless infinite looping effect */}
            {[...operations, ...operations].map((op, i) => (
              <div
                key={`${op.id}-${i}`}
                className="relative w-[280px] sm:w-[300px] h-[480px] rounded-3xl overflow-hidden bg-space-950 border border-white/15 shadow-2xl shrink-0 group flex flex-col justify-end"
              >
                {op.type === "video" ? (
                  <video
                    src={op.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <Image
                    src={op.url}
                    alt={op.title}
                    fill
                    sizes="300px"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-space-950/90 via-space-950/40 to-space-950/30 pointer-events-none" />

                <div className="relative p-5 z-10">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/50">
                    {op.type === "video" ? "Flight Video" : "Field Image"}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-2">{op.title}</h4>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-xs z-20">
                  <label className="cursor-pointer flex flex-col items-center gap-2 p-4 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30 transition shadow-lg">
                    <Upload className="h-6 w-6 animate-bounce" />
                    <span className="text-xs font-semibold">Change Media</span>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      className="hidden"
                      onChange={(e) => handleOpMediaUpload(e, op.id)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ========================================================= */}
      {/* 2. INTERACTIVE COMPONENT EXPLORER SECTION WITH UPLOAD    */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">
            <Cpu className="h-3 w-3" /> Inside the Drone
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Interactive component explorer
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-coolgray">
            Select any module to inspect its role. You can upload custom images directly from your browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} className="btn-ghost btn-sm" aria-label="Previous component">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(1)} className="btn-ghost btn-sm" aria-label="Next component">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* thumbnails */}
      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1">
        {components.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setIndex(i)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition",
              i === index
                ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                : "border-white/12 bg-white/[0.03] text-coolgray hover:border-electric-500/40 hover:text-white"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div
        className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* visual */}
        <div className="panel relative h-[320px] overflow-hidden bg-space-900 sm:h-[420px] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {active.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-85"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-space-800 via-space-900 to-space-950 grid-bg flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/55 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs z-10">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30 transition shadow-lg text-xs font-semibold">
              <Upload className="h-4 w-4" />
              Upload Image for {active.name}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, active.id)}
              />
            </label>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {active.category}
            </span>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{active.name}</h3>
          </div>

          <div className="absolute right-5 top-5 flex gap-1.5">
            {components.map((c, i) => (
              <span
                key={c.id}
                className={cn("h-1 rounded-full transition-all", i === index ? "w-6 bg-cyan-400" : "w-1.5 bg-white/25")}
              />
            ))}
          </div>
        </div>

        {/* detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="panel flex flex-col justify-between p-6 sm:p-7"
          >
            <div>
              <p className="text-sm leading-relaxed text-coolgray">{active.description}</p>
              {active.specs.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coolgray">
                    Key specifications
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {active.specs.map((s) => (
                      <li key={s} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/90">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <p className="mt-6 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.16em] text-coolgray">
              Module {index + 1} of {components.length} · {active.category}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}