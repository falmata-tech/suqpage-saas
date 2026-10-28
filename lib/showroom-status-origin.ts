type LookupEnvironment = Readonly<Record<string, string | undefined>>;

/** Keep a hosted Edge lookup on our own reviewed site, never the request Host. */
export function showroomStatusLookupUrl(requestUrl: string, environment: LookupEnvironment = process.env): URL {
  const request = new URL(requestUrl);
  const localHost = request.hostname === "localhost" || request.hostname === "127.0.0.1" || request.hostname === "[::1]";
  const localPreview = environment.NETLIFY !== "true" && environment.NETLIFY !== "1"
    && (localHost || environment.NODE_ENV !== "production");
  if (localPreview) return new URL("/api/public/showroom-status", request.origin);

  const configured = new URL(environment.NEXT_PUBLIC_APP_URL || "");
  if (!["https://africmade.com", "https://mirtpage.com"].includes(configured.origin) || configured.pathname !== "/" || configured.search || configured.hash
    || configured.username || configured.password) {
    throw new Error("The hosted showroom status origin is not the reviewed AfricMade site.");
  }
  return new URL("/api/public/showroom-status", configured.origin);
}
