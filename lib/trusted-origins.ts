type OriginEnvironment = Readonly<Record<string, string | undefined>>;

const DEVELOPMENT_PORTS = [3000, 3001] as const;
const HOSTNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

function exactHttpOrigin(value: string, fallbackProtocol: "http:" | "https:") {
  const candidate = value.trim();
  if (!candidate || candidate.includes("*")) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) ? candidate : `${fallbackProtocol}//${candidate}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      return null;
    }
    return { host: url.host, origin: url.origin };
  } catch {
    return null;
  }
}

function codespaceHosts(environment: OriginEnvironment) {
  const name = environment.CODESPACE_NAME?.trim();
  const domain = environment.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN?.trim();
  if (!name || !domain || !HOSTNAME.test(name) || !HOSTNAME.test(domain)) return [];
  return DEVELOPMENT_PORTS.map((port) => `${name}-${port}.${domain}`.toLowerCase());
}

export function trustedOriginPolicy(environment: OriginEnvironment = process.env) {
  const development = environment.NODE_ENV !== "production";
  const serverActionHosts = new Set<string>();
  const mutationOrigins = new Set<string>();
  const add = (value: string, fallbackProtocol: "http:" | "https:") => {
    const parsed = exactHttpOrigin(value, fallbackProtocol);
    if (!parsed) return;
    serverActionHosts.add(parsed.host);
    mutationOrigins.add(parsed.origin);
  };

  const canonical = environment.NEXT_PUBLIC_APP_URL?.trim();
  if (canonical) add(canonical, "https:");
  for (const configured of (environment.MIRTPAGE_SERVER_ACTION_ORIGINS || "").split(",")) {
    add(configured, development ? "http:" : "https:");
  }

  if (development) {
    for (const host of ["localhost:3000", "localhost:3001", "127.0.0.1:3000", "127.0.0.1:3001"]) {
      add(host, "http:");
    }
    for (const host of codespaceHosts(environment)) add(host, "https:");
  }

  return {
    serverActionHosts: [...serverActionHosts],
    mutationOrigins: [...mutationOrigins],
  };
}
