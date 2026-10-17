import Link from "next/link";
import { Github, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/navbar";

const socials = [
  { href: "https://instagram.com/uavlabs", label: "Instagram", icon: Instagram },
  { href: "https://linkedin.com/company/uavlabs", label: "LinkedIn", icon: Linkedin },
  { href: "https://github.com/uavlabs", label: "GitHub", icon: Github }
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-space-900/40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-500/60 to-transparent" aria-hidden />
      <div className="container-x grid gap-10 py-14 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-coolgray">
            NextGen UAV Labs is a drone technology and R&amp;D lab building autonomous aerial systems —
            embedded avionics, flight autonomy, computer vision and precision payloads — validated in
            the field and taught through our internship and workshop programs.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-xl border border-white/12 bg-white/[0.03] p-2.5 text-coolgray transition hover:border-cyan-400/50 hover:text-cyan-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-coolgray">
            {[
              { href: "/drone-technology", label: "Drone Technology" },
              { href: "/rd-labs", label: "R&D Labs" },
              { href: "/programs", label: "Internships & Workshops" },
              { href: "/about", label: "About Us" },
              { href: "/login", label: "Student Portal" }
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-cyan-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-coolgray">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
              <a href="mailto:hello@uavlabs.io" className="transition hover:text-cyan-400">
                hello@uavlabs.io
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
              <a href="tel:+918041020300" className="transition hover:text-cyan-400">
                +91 80 4102 0300
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" />
              <span>
                Bengaluru R&amp;D Campus
                <br />
                Aerospace Park, Karnataka, India
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-coolgray sm:flex-row">
          <p>© {new Date().getFullYear()} NextGen UAV Labs. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
