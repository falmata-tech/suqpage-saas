export type TransportLauncherPlatform = "web" | "native";
export type TransportLauncherPlacement = "shell" | "market" | null;

/** Presentation policy only; this never grants account or conversation access. */
export function publicTransportPlacement(
  pathname: string,
  platform: TransportLauncherPlatform,
): TransportLauncherPlacement {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return platform === "native" ? "market" : "shell";
  if (["/featured", "/about"].includes(path)) return "shell";
  if (platform === "web") {
    return path === "/tracking" || /^\/tracking\/[^/]+$/.test(path) || ["/discover", "/privacy", "/terms", "/contact-success"].includes(path)
      || /^\/@[^/]+$/.test(path) ? "shell" : null;
  }
  return ["/product", "/inquiry"].includes(path)
    || /^\/shop\/[^/]+$/.test(path) ? "shell" : null;
}
