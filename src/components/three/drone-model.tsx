"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Procedurally-built quadcopter. No external .glb asset is required — every
 * mesh is generated from primitives, so the scene ships with zero binary
 * dependencies and stays tiny on the wire.
 */

function Rotor({ position, spin = 1 }: { position: [number, number, number]; spin?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 9 * spin;
  });

  return (
    <group position={position}>
      {/* motor bell */}
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* spinning 3-blade propeller */}
      <group ref={ref} position={[0, 0.16, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0.14]} position={[0.27, 0, 0]} castShadow>
            <boxGeometry args={[0.54, 0.012, 0.1]} />
            <meshStandardMaterial
              color="#0f172a"
              metalness={0.5}
              roughness={0.35}
              emissive="#22d3ee"
              emissiveIntensity={0.09}
            />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.045, 16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function Arm({ rotation }: { rotation: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0.62, 0, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.15, 0.05, 0.08]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.62, 0.032, 0]} castShadow>
        <boxGeometry args={[1.05, 0.012, 0.012]} />
        <meshStandardMaterial color="#06b6d4" emissive="#22d3ee" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function DroneBody() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // gentle cinematic hover + yaw drift
    group.current.rotation.z = Math.sin(t * 0.5) * 0.035;
    group.current.rotation.x = Math.cos(t * 0.42) * 0.028;
    group.current.rotation.y = t * 0.13;
  });

  const leds = useMemo(() => [0, 1, 2, 3], []);

  return (
    <group ref={group} scale={1.15}>
      {/* central fuselage */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.19, 0.52]} />
        <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.42]} />
        <meshStandardMaterial color="#0b0f19" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* canopy / flight-controller board */}
      <mesh position={[0, 0.155, -0.06]}>
        <boxGeometry args={[0.42, 0.02, 0.3]} />
        <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.35} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* gimbal camera */}
      <mesh position={[0, -0.15, 0.2]} castShadow>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.15, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.1} />
      </mesh>
      {/* payload / battery pack underneath */}
      <mesh position={[0, -0.16, -0.05]} castShadow>
        <boxGeometry args={[0.46, 0.12, 0.34]} />
        <meshStandardMaterial color="#0f1420" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* arms + rotors */}
      {leds.map((i) => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        return (
          <group key={i}>
            <Arm rotation={angle} />
            <Rotor position={[Math.cos(angle) * 1.12, 0.02, Math.sin(angle) * 1.12]} spin={i % 2 === 0 ? 1 : -1} />
            <pointLight
              position={[Math.cos(angle) * 1.12, -0.06, Math.sin(angle) * 1.12]}
              color={i < 2 ? "#3b82f6" : "#22d3ee"}
              intensity={0.9}
              distance={1.4}
            />
          </group>
        );
      })}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} color="#dbeafe" castShadow />
      <directionalLight position={[-5, 2, -4]} intensity={0.7} color="#22d3ee" />
      <spotLight position={[0, 6, 0]} angle={0.7} penumbra={1} intensity={1.2} color="#3b82f6" />
      <Suspense fallback={null}>
        <Float speed={1.4} rotationIntensity={0.28} floatIntensity={0.85}>
          <DroneBody />
        </Float>
        <ContactShadows position={[0, -1.35, 0]} opacity={0.42} scale={9} blur={2.6} far={3.2} color="#000000" />
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

export default function DroneScene({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [3.4, 2.1, 4.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
