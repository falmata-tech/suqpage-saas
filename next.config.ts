import type { NextConfig } from "next";
import { trustedOriginPolicy } from "./lib/trusted-origins";

const isDev = process.env.NODE_ENV !== "production";
const distDir = process.env.SUQPAGE_NEXT_DIST_DIR || ".next";
if (distDir !== ".next" && !/^\.next-acceptance\/suqpage-acceptance-[A-Za-z0-9_-]+$/.test(distDir)) {
  throw new Error("SUQPAGE_NEXT_DIST_DIR must identify a generated SuqPage acceptance directory");
}
const tsconfigPath = process.env.SUQPAGE_NEXT_TSCONFIG || "tsconfig.json";
if (tsconfigPath !== "tsconfig.json" && !/^\.acceptance-tsconfig-suqpage-acceptance-[A-Za-z0-9_-]+\.json$/.test(tsconfigPath)) {
  throw new Error("SUQPAGE_NEXT_TSCONFIG must identify a generated SuqPage acceptance config");
}
const serverActionOrigins = trustedOriginPolicy(process.env).serverActionHosts;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
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
