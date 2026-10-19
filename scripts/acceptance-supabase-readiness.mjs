import { spawnSync } from "node:child_process";

export const browserServices = ["db", "kong", "auth", "rest", "storage", "inbucket"];
const healthCheckedServices = new Set(["db", "kong", "auth", "storage", "inbucket"]);

function assertBrowserTarget(projectId, apiPort) {
  if (!/^suqpage-browser-[0-9]+$/.test(projectId) || apiPort !== 56321) {
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
  timeoutMs = 300_000, pollMs = 2_000,
}) {
  assertBrowserTarget(projectId, apiPort);
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
