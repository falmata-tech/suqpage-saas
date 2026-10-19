import assert from "node:assert/strict";
import test from "node:test";
import {
  browserCliStartTimeoutMs, browserServices, browserServicesReady, browserSupabasePorts, remapBrowserSupabaseConfigPorts, inspectBrowserServices, probeBrowserEndpoints,
  waitForBrowserSupabaseReady,
} from "./acceptance-supabase-readiness.mjs";

const projectId = "suqpage-browser-12345";
const apiPort = 56321;
const healthyServices = () => Object.fromEntries(browserServices.map((name) => [
  name, { label: projectId, status: "running", health: name === "rest" ? "none" : "healthy" },
]));

test("DEP-027 CLI startup has its own five-minute bound before independent readiness", () => {
  assert.equal(browserCliStartTimeoutMs, 300_000);
});

test("DEP-027 disposable Supabase port override stays in one valid loopback family", () => {
  assert.deepEqual(browserSupabasePorts({}), {
    api: 56321, db: 56322, shadow: 56320, smtp: 56324, pooler: 56329, analytics: 56327,
  });
  assert.deepEqual(browserSupabasePorts({ SUQPAGE_BROWSER_SUPABASE_API_PORT: "54321" }), {
    api: 54321, db: 54322, shadow: 54320, smtp: 54324, pooler: 54329, analytics: 54327,
  });
  for (const value of ["", "54321x", "443", "65530", "56321.5", "-1"]) {
    assert.throws(() => browserSupabasePorts({ SUQPAGE_BROWSER_SUPABASE_API_PORT: value }), /valid unprivileged/);
  }
});

test("DEP-027 config remap is one pass even when a destination equals an original port", () => {
  const ports = browserSupabasePorts({ SUQPAGE_BROWSER_SUPABASE_API_PORT: "54322" });
  const source = "api=54321 db=54322 shadow=54320 smtp=54324 pooler=54329 analytics=54327";
  assert.equal(remapBrowserSupabaseConfigPorts(source, ports),
    "api=54322 db=54323 shadow=54321 smtp=54325 pooler=54330 analytics=54328");
});

test("DEP-027 Docker inspection is scoped to six disposable project containers", () => {
  const expected = browserServices.map((service) => `supabase_${service}_${projectId}`);
  const command = (file, args, options) => {
    assert.equal(file, "docker");
    assert.deepEqual(args.slice(0, 4), ["inspect", "--type", "container", "--format"]);
    assert.deepEqual(args.slice(5), expected);
    assert.equal(options.timeout, 5_000);
    return { status: 0, stdout: browserServices.map((name) => `${projectId}|running|${name === "rest" ? "none" : "healthy"}`).join("\n") };
  };
  assert.equal(browserServicesReady(projectId, inspectBrowserServices(projectId, command)), true);
  assert.equal(inspectBrowserServices(projectId, () => ({ status: 1, stdout: "" })), null);
});

test("DEP-027 requires all six exact project services, including healthy Storage", () => {
  assert.equal(browserServicesReady(projectId, healthyServices()), true);
  for (const service of browserServices) {
    const missing = healthyServices();
    delete missing[service];
    assert.equal(browserServicesReady(projectId, missing), false, `${service} missing`);
    const foreign = healthyServices();
    foreign[service].label = "another-project";
    assert.equal(browserServicesReady(projectId, foreign), false, `${service} foreign`);
    const stopped = healthyServices();
    stopped[service].status = "exited";
    assert.equal(browserServicesReady(projectId, stopped), false, `${service} stopped`);
    const starting = healthyServices();
    starting[service].health = "starting";
    assert.equal(browserServicesReady(projectId, starting), false, `${service} not healthy`);
  }
  assert.equal(browserServicesReady(projectId, null), false);
});

test("DEP-027 probes both real loopback API and Storage paths", async () => {
  const paths = [];
  const request = async (url, options) => {
    paths.push(new URL(url).pathname);
    assert.equal(new URL(url).hostname, "127.0.0.1");
    assert.equal(new URL(url).port, String(apiPort));
    assert.ok(options.signal);
    return { ok: true };
  };
  assert.equal(await probeBrowserEndpoints(apiPort, request), true);
  assert.deepEqual(paths, ["/auth/v1/health", "/storage/v1/status"]);
  assert.equal(await probeBrowserEndpoints(apiPort, async (url) => ({ ok: !url.includes("/storage/") })), false);
  assert.equal(await probeBrowserEndpoints(apiPort, async (url) => ({ ok: !url.includes("/auth/") })), false);
  assert.equal(await probeBrowserEndpoints(apiPort, async () => { throw Error("network down"); }), false);
});

test("DEP-027 delayed Storage starts setup only after Docker and HTTP are ready", async () => {
  let clock = 0;
  let inspections = 0;
  let probes = 0;
  await waitForBrowserSupabaseReady({
    projectId, apiPort, timeoutMs: 300_000, pollMs: 60_000,
    now: () => clock, sleep: async (ms) => { clock += ms; },
    inspect: async () => {
      inspections += 1;
      const services = healthyServices();
      if (inspections < 4) services.storage.health = "starting";
      return services;
    },
    probe: async () => { probes += 1; return true; },
  });
  assert.equal(clock, 180_000);
  assert.equal(inspections, 4);
  assert.equal(probes, 1);
});

test("DEP-027 missing service and endpoint failure time out closed", async () => {
  for (const failure of ["missing", "api-or-storage"]) {
    let clock = 0;
    let probes = 0;
    await assert.rejects(waitForBrowserSupabaseReady({
      projectId, apiPort, timeoutMs: 5_000, pollMs: 2_000,
      now: () => clock, sleep: async (ms) => { clock += ms; },
      inspect: async () => {
        const services = healthyServices();
        if (failure === "missing") delete services.storage;
        return services;
      },
      probe: async () => { probes += 1; return false; },
    }), /not healthy within five minutes/);
    assert.equal(clock, 5_000);
    assert.equal(probes, failure === "missing" ? 0 : 3);
  }
});

test("DEP-027 rejects non-disposable projects and ports before probing", async () => {
  for (const [name, port] of [["mirtpage", apiPort], [projectId, 54321]]) {
    await assert.rejects(waitForBrowserSupabaseReady({
      projectId: name, apiPort: port,
      inspect: () => { throw Error("inspected unrelated stack"); },
      probe: () => { throw Error("probed unrelated stack"); },
    }), /disposable Supabase project and API port/);
  }
  await waitForBrowserSupabaseReady({
    projectId, apiPort: 54321,
    environment: { SUQPAGE_BROWSER_SUPABASE_API_PORT: "54321" },
    inspect: () => healthyServices(), probe: () => true,
  });
});
