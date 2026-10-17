import Link from "next/link";
import { Compass, Rocket, ShieldCheck, ArrowRight } from "lucide-react";

export function VisionSection() {
  return (
    <section className="py-20 bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-full uppercase tracking-widest border border-indigo-500/20">
                About The Lab
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 leading-tight">
                Engineering flight autonomy you can trust.
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Our Mission</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    To make autonomous aerial systems dependable in the real world — engineered to specification, validated in the field, and documented to a standard that stands up to scrutiny.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 shrink-0">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Our Vision</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Aerial robotics that extend human reach across agriculture, infrastructure, and emergency response — built by engineers trained inside a working research lab.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">How We Work</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Simulation first, then tethered test, then free flight. Every change is logged, every flight is instrumented, and nothing ships without a documented validation campaign.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white rounded-lg border border-slate-800 transition-colors"
              >
                More about the lab <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Metrics Cards Column (Duplicate contact info box is removed!) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
              Lab Performance & Reach
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p className="text-3xl font-extrabold text-indigo-400">12+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">Airframe Platforms</p>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p className="text-3xl font-extrabold text-indigo-400">2.4k+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">Flight Test Hours</p>
              </div>

              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <p className="text-3xl font-extrabold text-indigo-400">18+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">Student Cohorts</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}