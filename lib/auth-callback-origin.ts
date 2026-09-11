type AuthOriginEnvironment = Readonly<Record<string, string | undefined>>;

function isLoopbackHostname(hostname: string) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname.toLowerCase());
}

export function googleAuthCallbackOrigin(
  requestHost: string | null,
  environment: AuthOriginEnvironment = process.env,
) {
  const configured = new URL(environment.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  if (environment.NODE_ENV === "production" || !requestHost) return configured.origin;

  try {
    const initiating = new URL(`http://${requestHost}`);
    if (!isLoopbackHostname(initiating.hostname) || initiating.port !== configured.port) {
      return configured.origin;
    }
    return initiating.origin;
  } catch {
    return configured.origin;
  }
}
