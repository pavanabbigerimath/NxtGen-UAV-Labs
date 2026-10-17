import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { LabsSection, ComponentItem } from "@/components/sections/labs-section";


export const metadata: Metadata = {
  title: "R&D Labs",
  description:
    "Inside the drone: an interactive component explorer covering flight controller, GPS & IMU, ESC, motors, power, camera, and spray systems."
};

export const dynamic = "force-dynamic";

// Manual components data with custom image URLs
const manualComponents: ComponentItem[] = [
  {
    id: "comp-1",
    name: "Flight Controller",
    description: "High performance central processing unit for stabilization, autonomous navigation, and real-time sensor fusion.",
    category: "Avionics",
    specs: ["STM32H7 dual-core processor", "Triple redundant IMU", "RTK-GPS integration ready", "Low-latency telemetry bus"],
    imageUrl: "/image/flight-controller.jpg" // Nimma public folder image path illi haki
  },
  {
    id: "comp-2",
    name: "GPS & IMU",
    description: "High-precision positioning and inertial measurement unit ensuring centimeter-level location accuracy during flights.",
    category: "Navigation",
    specs: ["Multi-constellation GNSS", "High-update rate gyroscope", "Magnetometer calibration", "Vibration-damped housing"],
    imageUrl: "/images/gps-imu.jpg"
  },
  {
    id: "comp-3",
    name: "ESC — Electronic Speed Controller",
    description: "Lightning-fast motor response controllers managing power delivery and RPM synchronization across all rotors.",
    category: "Power Train",
    specs: ["BLHeli_32 firmware", "Up to 60A continuous current", "Active braking enabled", "Thermal overload protection"],
    imageUrl: "/images/esc.jpg"
  },
  {
    id: "comp-4",
    name: "Brushless Motors & Propellers",
    description: "High-efficiency propulsion motors paired with aerodynamic carbon-fiber propellers for maximum thrust and flight time.",
    category: "Propulsion",
    specs: ["High-torque stator design", "Balanced carbon-fiber props", "IP55 dust & water resistance", "Optimized cooling fins"],
    imageUrl: "/images/motors.jpg"
  },
  {
    id: "comp-5",
    name: "Battery & Power Distribution",
    description: "High-density lithium polymer power packs paired with an intelligent power distribution board for safe current routing.",
    category: "Power Systems",
    specs: ["6S LiPo configuration", "Smart BMS telemetry", "Redundant power paths", "Quick-swap locking mechanism"],
    imageUrl: "/images/battery.jpg"
  },
  {
    id: "comp-6",
    name: "Camera & Communication Module",
    description: "Ultra-low latency digital video transmission module coupled with high-resolution gimbal cameras for aerial surveillance.",
    category: "Payload",
    specs: ["4K 60FPS video recording", "Encrypted wireless link", "3-axis mechanical stabilization", "Dual antenna diversity"],
    imageUrl: "/images/camera.jpg"
  },
  {
    id: "comp-7",
    name: "Pump & Spray Systems",
    description: "Precision agricultural pump and flow-metered atomizing nozzles designed for uniform crop protection coverage.",
    category: "Payload",
    specs: ["16L tank capacity", "PWM flow-metered pumps", "Anti-drift centrifugal nozzles", "Auto terrain-follow spray"],
    imageUrl: "/images/pump.jpg"
  }
];

export default async function RdLabsPage() {
  const items = manualComponents;

  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="container-x">
          <SectionHeading
            eyebrow="R&D Labs"
            title="Inside the drone"
            description="Interactive component explorer — select any module to inspect its role in the airframe."
          />
        </section>

        {items.length > 0 ? (
          <LabsSection components={items} />
        ) : (
          <section className="container-x py-16">
            <div className="panel p-8 text-sm text-coolgray">
              The component catalogue is empty.
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}