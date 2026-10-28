/** Search, sharing and sitemap URLs point to the public site, not the API/Auth origin. */
export function publicSiteOrigin(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.NODE_ENV === "production"
    ? "https://africmade.com"
    : (environment.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
