"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Mentor {
  name: string;
  role: string;
  bio: string;
  imagePath: string;
}

const mentors: Mentor[] = [
  {
    name: "Maharaj M Bahadhoor Desai",
    role: "Founder & Lead UAV Architect",
    bio: "Guiding autonomous drone flight dynamics, computer vision integration, and core R&D systems.",
    imagePath: "/image/founder.png",
  },
  {
    name: "Shrinivas A M",
    role: "Co-Founder & Tech Lead",
    bio: "Specializing in embedded electronics, flight controllers, and secure backend infrastructure.",
    imagePath: "/image/image34.png",
  },
  {
    name: "Pavanakumar K A",
    role: "Operations & Training Head",
    bio: "Directing student internship workflows, software scripting, and rigorous technical assessments.",
    imagePath: "/image/image4.png",
  },
];

export function MentorsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Prati sari section view ge bandaga true agutte, horage hodaaga false agutte
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white text-slate-950 relative overflow-hidden border-t border-slate-200 perspective-1000"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================= MEET THE FOUNDER (Repeated 3D Motion) ================= */}
        <div className="max-w-6xl mx-auto mb-28">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            
            {/* Left Side: 3D Rotated & Zoomed Image from Left Angle */}
            <div
              className={`relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 shrink-0 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-slate-100 ring-4 ring-indigo-500/20 transition-all duration-1000 ease-out transform ${
                isVisible
                  ? "translate-x-0 translate-y-0 opacity-100 rotate-0 scale-100"
                  : "-translate-x-32 translate-y-12 opacity-0 -rotate-45 scale-75"
              }`}
            >
              <Image
                src="/image/founder3.png"
                alt="Maharaj M Bahadhoor Desai"
                fill
                sizes="(max-width: 768px) 100vw, 35vw"
                className="object-cover object-top hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Right Side: 3D Slide-in from Right Corner */}
            <div
              className={`text-center lg:text-left space-y-4 max-w-2xl transition-all duration-1000 delay-200 ease-out transform ${
                isVisible
                  ? "translate-x-0 translate-y-0 opacity-100 rotate-0"
                  : "translate-x-32 -translate-y-8 opacity-0 rotate-6"
              }`}
            >
              <div>
                <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full uppercase tracking-widest border border-indigo-200">
                  Leadership
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mt-3">
                  Meet The <span className="text-indigo-600">Founder</span>
                </h2>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-wide">
                  Maharaj.M.Bahadhoor Desai
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-1 tracking-wider uppercase">
                  Founder & Lead UAV Architect, NxtGen UAV Labs
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Pavanakumar is a dedicated drone technologist driven by a mission to make advanced autonomous aerial systems accessible, reliable, and impactful for next-generation R&D and student innovation.
              </p>
            </div>

          </div>
        </div>

        {/* ================= OUR MENTORS & LEADERSHIP ================= */}
        <div
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 delay-300 ease-out transform ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-20 opacity-0 scale-90"
          }`}
        >
          <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full uppercase tracking-widest border border-indigo-200">
            Guidance & Expertise
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 mt-3">
            Our Mentors & Leadership
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Meet the expert mentors driving innovation in next-generation autonomous drone technology and research.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              style={{ transitionDelay: `${400 + index * 150}ms` }}
              className={`flex flex-col items-center text-center group hover:-translate-y-3 transition-all duration-700 ease-out transform ${
                isVisible
                  ? "translate-y-0 opacity-100 rotate-0 scale-100"
                  : "translate-y-24 opacity-0 rotate-12 scale-80"
              }`}
            >
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-xl border-4 border-white bg-slate-100 mb-6 group-hover:scale-110 group-hover:shadow-indigo-500/20 transition-all duration-500 ring-2 ring-indigo-500/20">
                <Image
                  src={mentor.imagePath}
                  alt={mentor.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top"
                />
              </div>

              <div className="px-2">
                <h3 className="text-xl font-bold text-slate-950 tracking-wide uppercase">
                  {mentor.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 mt-1 tracking-wider uppercase">
                  {mentor.role}
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {mentor.bio}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}