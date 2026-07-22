import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const configuredOrigins = (process.env.SUQPAGE_SERVER_ACTION_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
  .filter(Boolean);
const canonicalOrigin = (() => {
  try { return process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : ""; }
  catch { return ""; }
})();
const codespaceOrigins = process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
  ? [3000, 3001].map((port) => `${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`)
  : [];
const serverActionOrigins = [...new Set([
  ...configuredOrigins,
  ...(canonicalOrigin ? [canonicalOrigin] : []),
  ...(isDev ? ["localhost:3000", "localhost:3001", "127.0.0.1:3000", "127.0.0.1:3001", ...codespaceOrigins] : []),
])];
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
