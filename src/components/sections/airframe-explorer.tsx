"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const ComponentViewer3D = dynamic(() => import("@/components/three/component-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-electric-500/30 border-t-cyan-400" />
    </div>
  )
});

export type ExplorerItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  specs: string[];
  imageUrl: string | null;
};

/**
 * Maps catalogue components onto fixed 3D positions on the airframe so hotspots
 * land on physically sensible places (avionics on top, payload underneath).
 */
const POSITIONS: [number, number, number][] = [
  [0, 0.34, -0.16], // flight controller
  [0.3, 0.3, 0.28], // gps / imu
  [0.62, 0.08, 0.62], // esc
  [1.34, 0.3, 0], // motors
  [0, -0.34, -0.2], // battery
  [0, -0.28, 0.34], // camera
  [-0.6, -0.3, 0.5], // spray
  [-0.62, 0.12, -0.6] // telemetry
];

export function AirframeExplorer({ components }: { components: ExplorerItem[] }) {
  const [activeId, setActiveId] = useState(components[0]?.id ?? "");

  if (!components.length) return null;

  const spots = components.map((c, i) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    specs: c.specs,
    position: POSITIONS[i % POSITIONS.length]
  }));

  const active = spots.find((s) => s.id === activeId) ?? spots[0];

  return (
    <section className="container-x mt-12">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="panel relative h-[380px] overflow-hidden sm:h-[520px]">
          <ComponentViewer3D
            spots={spots}
            activeId={activeId}
            onSelect={setActiveId}
            className="h-full w-full"
          />
          <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/12 bg-space-950/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-coolgray backdrop-blur-sm">
            Drag to orbit · scroll to zoom
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {spots.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition",
                  s.id === activeId
                    ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                    : "border-white/12 bg-white/[0.03] text-coolgray hover:border-electric-500/40 hover:text-white"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="panel flex-1 p-6"
          >
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
              <Layers className="h-3 w-3" /> {active.category}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{active.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-coolgray">{active.description}</p>

            {active.specs.length > 0 && (
              <div className="mt-6">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-coolgray">
                  <Gauge className="h-3.5 w-3.5 text-electric-400" /> Specifications
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {active.specs.map((sp) => (
                    <li
                      key={sp}
                      className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/90"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                      {sp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
