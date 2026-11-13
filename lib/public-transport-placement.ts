export type InquiryDockPlatform = "web" | "native";
export type InquiryDockPlacement = "shell" | null;

/** Saved product selections only; transport is a private business task. */
export function publicInquiryPlacement(pathname: string, platform: InquiryDockPlatform): InquiryDockPlacement {
  const path = pathname.replace(/\/+$/, "") || "/";
  return (platform === "web" ? /^\/@[^/]+$/.test(path) : path === "/product" || /^\/shop\/[^/]+$/.test(path)) ? "shell" : null;
}
