import { spawnSync } from "node:child_process";

export const browserServices = ["db", "kong", "auth", "rest", "storage", "inbucket"];
export const browserCliStartTimeoutMs = 300_000;
const healthCheckedServices = new Set(["db", "kong", "auth", "storage", "inbucket"]);

/** Fixed observations only: captured CLI text may contain provider credentials. */
export function summarizeBrowserSupabaseStartFailure(result) {
  const codes = new Set(["ENOENT", "EACCES", "EPERM", "ETIMEDOUT", "ENOBUFS", "ENOMEM", "E2BIG", "EAGAIN"]);
  const signals = new Set(["SIGTERM", "SIGKILL", "SIGINT", "SIGHUP", "SIGQUIT", "SIGABRT", "SIGSEGV", "SIGBUS", "SIGPIPE"]);
  const bounded = value => {
    const captured = typeof value === "string" || Buffer.isBuffer(value) ? value : "";
    // Preserve a late error after pull progress; never scan the unbounded middle.
    const sampled = captured.length <= 8192 ? captured.toString()
      : captured.slice(0, 2048).toString() + "\n" + captured.slice(-6143).toString();
    return sampled.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
  };
  const text = bounded(result?.stdout) + "\n" + bounded(result?.stderr);
  const patterns = [
    ["docker_unavailable", /cannot connect to (?:the )?docker daemon|docker(?: desktop| daemon)? is not running|is (?:the )?docker daemon running/i],
    ["docker_api_incompatible", /client version[^\n]{0,80}too old|minimum supported api version/i],
    ["image_pull_or_registry", /failed to pull|error pulling|pull access denied|manifest unknown|(?:image|repository)[^\n]{0,100}(?:not found|does not exist)|(?:registry|ghcr|docker hub)[^\n]{0,100}(?:denied|unauthorized|timeout|connection|error)|toomanyrequests/i],
    ["network_failure", /network is unreachable|(?:connection|connect)[^\n]{0,60}(?:refused|timed out|reset)|(?:i\/o|tls handshake|dial tcp)[^\n]{0,60}timeout|temporary failure in name resolution|no such host|\b(?:ENOTFOUND|ECONNREFUSED|ECONNRESET|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT)\b/i],
    ["port_conflict", /address already in use|port[^\n]{0,40}already (?:in use|allocated)|\bEADDRINUSE\b/i],
    ["invalid_configuration", /invalid (?:config|configuration)|failed to (?:parse|load)[^\n]{0,60}(?:config|toml)|(?:config|configuration)[^\n]{0,60}validation[^\n]{0,30}failed|toml[^\n]{0,40}(?:parse|syntax|error)/i],
    ["unsupported_cli_option", /unknown (?:shorthand )?flag|flag provided but not defined|unrecognized (?:option|argument)|unknown (?:config|configuration) (?:key|field)/i],
    ["permission_denied", /permission denied|operation not permitted|\b(?:EACCES|EPERM)\b/i],
    ["resource_exhaustion", /no space left on device|not enough (?:disk|memory)|out of memory|cannot allocate memory|disk quota exceeded|\b(?:ENOSPC|ENOMEM)\b/i],
    ["container_health", /unhealthy|health check[^\n]{0,60}(?:failed|timed out)|container[^\n]{0,60}(?:exited|not running)/i],
    ["database_bootstrap", /database[^\n]{0,60}(?:failed|bootstrap|initialization error)|(?:failed|error)[^\n]{0,60}(?:database|postgres|migration)|postgres[^\n]{0,40}(?:fatal|error)/i],
  ];
  const observedIndicators = patterns.filter(([, pattern]) => pattern.test(text)).map(([indicator]) => indicator);
  return {
    status: Number.isInteger(result?.status) && result.status >= 0 && result.status <= 255 ? result.status : null,
    systemErrorCode: codes.has(result?.error?.code) ? result.error.code : null,
    signal: signals.has(result?.signal) ? result.signal : null,
    observedIndicators: observedIndicators.length ? observedIndicators : ["unknown"],
  };
}

/** Select only an unprivileged loopback port family for the disposable project. */
export function browserSupabasePorts(environment = process.env) {
  const raw = environment.SUQPAGE_BROWSER_SUPABASE_API_PORT;
  const api = raw === undefined ? 56321 : /^\d{4,5}$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(api) || api < 1025 || api > 65527) {
    throw new Error("Browser acceptance requires a valid unprivileged local Supabase API port.");
  }
  return { api, db: api + 1, shadow: api - 1, smtp: api + 3, pooler: api + 8, analytics: api + 6 };
}

/** One pass prevents a selected port from being rewritten as another source port. */
export function remapBrowserSupabaseConfigPorts(config, ports) {
  const sourcePorts = {
    54321: ports.api, 54322: ports.db, 54320: ports.shadow,
    54324: ports.smtp, 54329: ports.pooler, 54327: ports.analytics,
  };
  return config.replace(/\b(?:54321|54322|54320|54324|54329|54327)\b/g,
    (sourcePort) => String(sourcePorts[sourcePort]));
}

function assertBrowserTarget(projectId, apiPort, environment) {
  if (!/^suqpage-browser-[0-9]+$/.test(projectId) || apiPort !== browserSupabasePorts(environment).api) {
    throw new Error("Browser acceptance requires its disposable Supabase project and API port.");
  }
}

/** Docker output contains only project label, lifecycle state, and health state. */
export function inspectBrowserServices(projectId, command = spawnSync) {
  const names = browserServices.map((service) => `supabase_${service}_${projectId}`);
  const result = command("docker", [
    "inspect", "--type", "container", "--format",
    '{{index .Config.Labels "com.supabase.cli.project"}}|{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}',
    ...names,
  ], { encoding: "utf8", timeout: 5_000, maxBuffer: 16_384 });
  if (result.status !== 0) return null;
  const rows = result.stdout.trim().split(/\r?\n/);
  if (rows.length !== browserServices.length) return null;
  return Object.fromEntries(browserServices.map((service, index) => {
    const [label, status, health, extra] = rows[index].split("|");
    return [service, extra === undefined ? { label, status, health } : null];
  }));
}

export function browserServicesReady(projectId, services) {
  if (!services) return false;
  return browserServices.every((service) => {
    const state = services[service];
    return state?.label === projectId && state.status === "running" &&
      (healthCheckedServices.has(service) ? state.health === "healthy" : ["none", "healthy"].includes(state.health));
  });
}

export async function probeBrowserEndpoints(apiPort, request = fetch) {
  const urls = ["/auth/v1/health", "/storage/v1/status"]
    .map((pathname) => `http://127.0.0.1:${apiPort}${pathname}`);
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const response = await request(url, { signal: AbortSignal.timeout(2_000) });
      const ready = response.ok;
      await response.body?.cancel();
      return ready;
    } catch { return false; }
  }));
  return results.every(Boolean);
}

/** The CLI bypass never counts as readiness; both Docker and HTTP must agree. */
export async function waitForBrowserSupabaseReady({
  projectId, apiPort, inspect = inspectBrowserServices, probe = probeBrowserEndpoints,
  now = Date.now, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  timeoutMs = 300_000, pollMs = 2_000, environment = process.env,
}) {
  assertBrowserTarget(projectId, apiPort, environment);
  const deadline = now() + timeoutMs;
  while (now() < deadline) {
    if (browserServicesReady(projectId, await inspect(projectId)) && await probe(apiPort)) {
      if (now() < deadline) return;
    }
    const remaining = deadline - now();
    if (remaining > 0) await sleep(Math.min(pollMs, remaining));
  }
  throw new Error("Disposable browser Supabase was not healthy within five minutes; check its local Storage/API services.");
}
