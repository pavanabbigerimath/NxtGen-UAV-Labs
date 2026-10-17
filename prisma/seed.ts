import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  flightController: "https://sspark.genspark.ai/i/KLiQJQ4IhxRbldvE?width=2560",
  esc: "https://sspark.genspark.ai/i/CPoxPiVrMnikWh6h?width=2560",
  motors: "https://sspark.genspark.ai/i/nB5lPCQMTCg1S5jA?width=2560",
  spray: "https://sspark.genspark.ai/i/pB65OZROMdnr65wD?width=2560",
  lidar: "https://sspark.genspark.ai/i/iB8ITBk4ZkQLzm6R?width=2560",
  ground: "https://sspark.genspark.ai/i/lxKXjMAncqO6MxRR?width=2560"
};

const components: Prisma.DroneComponentCreateInput[] = [
  {
    name: "Flight Controller",
    description:
      "The brain of the aircraft: a real-time embedded computer that fuses sensor data and runs the stabilisation loop thousands of times per second.",
    category: "Avionics",
    specs: ["STM32H7 @ 480 MHz", "8 kHz control loop", "PX4 / ArduPilot stack", "Dual IMU redundancy"],
    imageUrl: IMG.flightController,
    order: 1
  },
  {
    name: "GPS & IMU",
    description:
      "GNSS gives absolute position while the inertial measurement unit tracks angular rate and acceleration — together they deliver centimetre-level navigation.",
    category: "Sensors",
    specs: ["RTK GPS, ±1 cm accuracy", "9-axis MEMS IMU", "Barometric altitude hold", "Magnetometer heading"],
    order: 2
  },
  {
    name: "ESC — Electronic Speed Controller",
    description:
      "Converts the flight controller's command into precisely timed three-phase current to each brushless motor, with regenerative braking.",
    category: "Propulsion",
    specs: ["4-in-1 65 A continuous", "2–8S LiPo input", "BLHeli_32 / AM32 firmware", "DShot600 telemetry"],
    imageUrl: IMG.esc,
    order: 3
  },
  {
    name: "Brushless Motors & Propellers",
    description:
      "Outrunner motors convert electrical energy into thrust; propeller diameter and pitch are matched to the airframe's mass and mission profile.",
    category: "Propulsion",
    specs: ["4215-380KV outrunner", "7.1 kg peak thrust", "13–15\" carbon props", "Sealed IP45 bearings"],
    imageUrl: IMG.motors,
    order: 4
  },
  {
    name: "Battery & Power Distribution",
    description:
      "High-density lithium polymer packs feed a regulated power bus that conditions voltage for avionics and delivers burst current to propulsion.",
    category: "Power",
    specs: ["6S 16 000 mAh LiPo", "~45 min endurance", "Smart BMS telemetry", "Redundant 5 V / 12 V rails"],
    order: 5
  },
  {
    name: "Camera & Communication Module",
    description:
      "Gimbal-stabilised imaging paired with a telemetry and video downlink for situational awareness well beyond visual line of sight.",
    category: "Payload",
    specs: ["4K/60 gimbal EO camera", "640×512 thermal option", "LTE + 2.4/5.8 GHz links", "AES-256 encrypted stream"],
    order: 6
  },
  {
    name: "Pump & Spray Systems",
    description:
      "For agricultural and industrial UAVs: precision pump, flow-metered nozzles and downwash-optimised boom geometry for uniform coverage.",
    category: "Payload",
    specs: ["16 L tank / 8 L/min", "PWM flow-metered pumps", "Auto terrain-follow spray", "Anti-drift centrifugal nozzles"],
    imageUrl: IMG.spray,
    order: 7
  },
  {
    name: "Telemetry & Ground Control",
    description:
      "The operator's link to the aircraft: a hardened ground station that handles mission planning, live tracking and failsafe command.",
    category: "Ground Segment",
    specs: ["MAVLink 2 protocol", "10 km telemetry range", "Mission planner + geofencing", "Blackbox flight logging"],
    order: 8
  }
];

const programs: Prisma.ProgramCreateInput[] = [
  {
    title: "Autonomous Flight & Controls Internship",
    type: "INTERNSHIP",
    status: "LIVE",
    duration: "12 weeks · Full-time",
    summary: "Design, tune and flight-test autonomous control loops on our research airframes.",
    description:
      "A research-intensive internship inside the Flight Autonomy lab. Interns own a real subsystem — control-loop tuning, EKF sensor fusion, or failsafe logics — and take it from simulation to tethered and free flight on our instrumented test airframes. You will work alongside flight-test engineers, keep an engineering logbook, and present at the end-of-cohort review.",
    image: IMG.lidar,
    curriculum: [
      "Flight dynamics & coordinate frames",
      "PX4/ArduPilot architecture deep-dive",
      "PID and LQR control-loop tuning",
      "EKF2 sensor fusion & state estimation",
      "Simulation-first workflow (SITL + Gazebo)",
      "Tethered and free-flight test campaigns",
      "Failure-mode analysis & failsafe design",
      "Flight data analysis and reporting"
    ],
    outcomes: [
      "Tuned and flight-validated control loops",
      "Signed flight-test logbook",
      "Internship completion certificate",
      "Reference letter for top performers"
    ],
    seats: 12,
    stipend: "Paid (need-based)",
    mode: "On-site · Bengaluru",
    location: "Bengaluru R&D Campus",
    startDate: new Date("2026-01-12T00:00:00.000Z"),
    endDate: new Date("2026-04-06T00:00:00.000Z")
  },
  {
    title: "Computer Vision for Aerial Autonomy",
    type: "INTERNSHIP",
    status: "UPCOMING",
    duration: "10 weeks · Full-time",
    summary: "Build perception pipelines that let UAVs detect, track and avoid in real time.",
    description:
      "Focused on the perception stack: dataset capture, model training, edge deployment and field evaluation. Interns work with our flight-log imagery to build detectors and trackers that run on embedded compute within a strict power envelope.",
    image: IMG.ground,
    curriculum: [
      "Aerial dataset capture & annotation",
      "Object detection (YOLO family) for UAV",
      "Multi-object tracking & re-identification",
      "Depth estimation and obstacle avoidance",
      "Edge deployment (TensorRT / ONNX)",
      "Latency, power and accuracy trade-offs",
      "Field validation flights"
    ],
    outcomes: [
      "Deployed on-board perception module",
      "Benchmark report",
      "Internship completion certificate"
    ],
    seats: 8,
    stipend: "Paid (need-based)",
    mode: "Hybrid",
    location: "Bengaluru R&D Campus",
    startDate: new Date("2026-02-02T00:00:00.000Z"),
    endDate: new Date("2026-04-13T00:00:00.000Z")
  },
  {
    title: "UAV Hardware Workshop — Build & Fly",
    type: "WORKSHOP",
    status: "LIVE",
    duration: "5 days · Intensive",
    summary: "Assemble, calibrate and fly a complete quadcopter from bare components.",
    description:
      "A hands-on hardware intensive. Every participant builds a full quadcopter from bare frame to first flight: soldering the power train, flashing firmware, calibrating sensors, tuning rates and flying under supervision. All components and tools are provided.",
    image: IMG.motors,
    curriculum: [
      "Airframe assembly & mechanical build",
      "Soldering the power distribution train",
      "ESC calibration & motor direction",
      "Flashing and configuring firmware",
      "Radio, GPS and sensor calibration",
      "First-flight checklist and safety",
      "Live flight session"
    ],
    outcomes: ["Working quadcopter you built", "Pre-flight discipline & safety certificate"],
    seats: 24,
    mode: "On-site · Bengaluru",
    location: "Bengaluru R&D Campus",
    startDate: new Date("2026-01-05T00:00:00.000Z")
  },
  {
    title: "Agri-Drone Spray Systems Workshop",
    type: "WORKSHOP",
    status: "UPCOMING",
    duration: "4 days · Intensive",
    summary: "Master precision spraying, flow calibration and terrain-follow missions.",
    description:
      "Specialist workshop on agricultural UAV payloads: nozzle selection, flow-rate calibration, downwash behaviour, terrain-following mission planning and regulatory compliance for spray operations.",
    image: IMG.spray,
    curriculum: [
      "Payload physics and downwash",
      "Nozzle selection and droplet spectra",
      "Flow-rate calibration and verification",
      "Terrain-follow mission planning",
      "Drift mitigation and buffer zones",
      "Post-flight washdown and maintenance"
    ],
    outcomes: ["Calibrated spray mission plan", "Workshop completion certificate"],
    seats: 20,
    mode: "On-site · Field Station",
    location: "Kolar Field Station",
    startDate: new Date("2026-02-16T00:00:00.000Z")
  }
];

async function main() {
  console.log("🌱 Seeding NextGen UAV Labs…");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@uavlabs.io";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Mission Control";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      status: "ACTIVE",
      city: "Bengaluru",
      institution: "NextGen UAV Labs",
      bio: "Platform administrator for the R&D lab management system."
    }
  });
  console.log(`  ✓ admin  ${admin.email}`);

  const demoEmail = "student@uavlabs.io";
  const student = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Aarav Mehta",
      passwordHash: await bcrypt.hash("Student@12345", 12),
      role: "STUDENT",
      status: "ACTIVE",
      city: "Pune",
      institution: "IIT Bombay",
      bio: "Electronics & controls undergraduate focused on autonomous flight."
    }
  });
  console.log(`  ✓ student ${student.email}`);

  for (const c of components) {
    await prisma.droneComponent.upsert({ where: { name: c.name }, update: c, create: c });
  }
  console.log(`  ✓ ${components.length} drone components`);

  const created: { id: string; title: string }[] = [];
  for (const p of programs) {
    const existing = await prisma.program.findFirst({ where: { title: p.title } });
    if (existing) {
      await prisma.program.update({ where: { id: existing.id }, data: p });
      created.push({ id: existing.id, title: p.title });
    } else {
      const row = await prisma.program.create({ data: p });
      created.push({ id: row.id, title: p.title });
    }
  }
  console.log(`  ✓ ${programs.length} programs`);

  // A demo application so the dashboards are not empty on first run.
  const first = created[0];
  if (first) {
    await prisma.application.upsert({
      where: { userId_programId: { userId: student.id, programId: first.id } },
      update: {},
      create: {
        userId: student.id,
        programId: first.id,
        status: "UNDER_REVIEW",
        coverNote:
          "I have built two custom quadcopters and completed a controls course; I want to work on the EKF and control-loop side of the autonomy stack."
      }
    });
    console.log("  ✓ demo application");
  }

  console.log("\n✅ Seed complete.");
  console.log(`   Admin   → ${adminEmail} / ${adminPassword}`);
  console.log(`   Student → ${demoEmail} / Student@12345`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
