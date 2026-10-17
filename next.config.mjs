/** @type {import('next').NextConfig} */

// Security headers (Next.js native replacement for `helmet`, which is Express-only).
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https: blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.pexels.com" }
    ]
  },
  experimental: {
    // three.js ships ESM-only subpaths; transpiling keeps the R3F bundle predictable.
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

export default nextConfig;
