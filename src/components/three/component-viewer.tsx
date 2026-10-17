"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

export type Hotspot = {
  id: string;
  name: string;
  description: string;
  category: string;
  specs: string[];
  position: [number, number, number];
};

/**
 * Exploded-view component explorer. Each hotspot is an interactive 3D marker
 * mapped onto the airframe; selecting it cross-fades the detail panel.
 */
function HotspotMarker({
  spot,
  active,
  onSelect
}: {
  spot: Hotspot;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const s = active ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.14 : 1;
    ref.current.scale.setScalar(s);
    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 1.1;
      ring.current.scale.setScalar(active ? 1.5 : 1);
    }
  });

  return (
    <group position={spot.position}>
      <mesh ref={ring}>
        <ringGeometry args={[0.13, 0.16, 32]} />
        <meshBasicMaterial color={active ? "#22d3ee" : "#3b82f6"} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(spot.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial
          color={active ? "#22d3ee" : "#3b82f6"}
          emissive={active ? "#22d3ee" : "#2563eb"}
          emissiveIntensity={active ? 1.7 : 0.9}
        />
      </mesh>
      <Html distanceFactor={7} center>
        <button
          onClick={() => onSelect(spot.id)}
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md transition ${
            active
              ? "border-cyan-400/70 bg-cyan-500/25 text-cyan-100"
              : "border-white/20 bg-space-950/70 text-coolgray hover:border-electric-500/60 hover:text-white"
          }`}
        >
          {spot.name}
        </button>
      </Html>
    </group>
  );
}

function Airframe({ spots, activeId, onSelect }: { spots: Hotspot[]; activeId: string; onSelect: (id: string) => void }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (g.current) g.current.rotation.y = state.clock.elapsedTime * 0.22;
  });

  return (
    <group ref={g}>
      {/* fuselage */}
      <mesh castShadow>
        <boxGeometry args={[0.85, 0.22, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.48]} />
        <meshStandardMaterial color="#0b0f19" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* arms */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.72, 0, 0]} castShadow>
              <boxGeometry args={[1.3, 0.055, 0.085]} />
              <meshStandardMaterial color="#0f1420" metalness={0.75} roughness={0.35} />
            </mesh>
            <mesh position={[1.34, 0.03, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.17, 22]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
            </mesh>
            <mesh position={[1.34, 0.2, 0]} rotation={[0, i * 1.2, 0.13]}>
              <boxGeometry args={[0.6, 0.012, 0.11]} />
              <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.12} />
            </mesh>
          </group>
        );
      })}
      {/* payload pod */}
      <mesh position={[0, -0.2, 0.12]} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {spots.map((s) => (
        <HotspotMarker key={s.id} spot={s} active={s.id === activeId} onSelect={onSelect} />
      ))}
    </group>
  );
}

export default function ComponentViewer3D({
  spots,
  activeId,
  onSelect,
  className = ""
}: {
  spots: Hotspot[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  return (
    <div className={className} onPointerDown={() => setReady(true)}>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [3.1, 2.4, 3.6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 4]} intensity={1.35} castShadow color="#dbeafe" />
        <directionalLight position={[-4, 2, -5]} intensity={0.75} color="#22d3ee" />
        <Suspense fallback={null}>
          <Airframe spots={spots} activeId={activeId} onSelect={onSelect} />
          <Environment preset="warehouse" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3.2}
          maxDistance={8}
          autoRotate={!ready}
          autoRotateSpeed={0.55}
          maxPolarAngle={Math.PI / 1.85}
        />
      </Canvas>
    </div>
  );
}
