import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "NextGen UAV Labs — Drone Technology & R&D Labs",
    template: "%s · UAV Labs"
  },
  description:
    "NextGen UAV Labs is a drone technology and R&D lab. Explore the technology behind modern drones, our R&D sub-teams, and our internship & workshop programs.",
  keywords: [
    "drone technology",
    "UAV",
    "R&D lab",
    "flight controller",
    "computer vision",
    "embedded systems",
    "drone internship",
    "drone workshop"
  ],
  authors: [{ name: "NextGen UAV Labs" }],
  openGraph: {
    title: "NextGen UAV Labs — Drone Technology & R&D Labs",
    description:
      "Explore the technology behind modern drones. Research, build and trust — autonomous aerial systems engineered and flight-tested.",
    type: "website",
    siteName: "NextGen UAV Labs"
  },
  twitter: {
    card: "summary_large_image",
    title: "NextGen UAV Labs",
    description: "Explore the technology behind modern drones."
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
