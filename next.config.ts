import type { NextConfig } from "next";
import { trustedOriginPolicy } from "./lib/trusted-origins";

const isDev = process.env.NODE_ENV !== "production";
const distDir = process.env.MIRTPAGE_NEXT_DIST_DIR || ".next";
if (distDir !== ".next" && !/^\.next-acceptance\/mirtpage-acceptance-[A-Za-z0-9_-]+$/.test(distDir)) {
  throw new Error("MIRTPAGE_NEXT_DIST_DIR must identify a generated MirtPage acceptance directory");
}
const tsconfigPath = process.env.MIRTPAGE_NEXT_TSCONFIG || "tsconfig.json";
if (tsconfigPath !== "tsconfig.json" && !/^\.acceptance-tsconfig-mirtpage-acceptance-[A-Za-z0-9_-]+\.json$/.test(tsconfigPath)) {
  throw new Error("MIRTPAGE_NEXT_TSCONFIG must identify a generated MirtPage acceptance config");
}
const serverActionOrigins = trustedOriginPolicy(process.env).serverActionHosts;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' https://www.youtube-nocookie.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir,
  typescript: { tsconfigPath },
  allowedDevOrigins: serverActionOrigins,
  experimental: { serverActions: { bodySizeLimit: "6mb", allowedOrigins: serverActionOrigins } },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/next/dist/server/lib/source-maps.js"],
  },
  outputFileTracingExcludes: {
    "/*": [
      "./.env*",
      "./.git/**/*",
      "./.local/**/*",
      "./backups/**/*",
      "./data/**/*",
      "./public/uploads/runtime/**/*",
      "./test-results/**/*",
      "./playwright-report/**/*",
      "./app/**/*",
      "./docs/**/*",
      "./lib/**/*",
      "./scripts/**/*",
      "./showroom-sdk/**/*",
      "./specs/**/*",
      "./public/**/*",
      "./*.md",
      "./Dockerfile",
      "./docker-compose.yml",
      "./package-lock.json",
    ],
  },
  async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; },
};
export default nextConfig;
