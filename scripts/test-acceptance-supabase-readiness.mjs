import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import * as readiness from "./acceptance-supabase-readiness.mjs";
import {
  browserCliStartTimeoutMs, browserServices, browserServicesReady, browserSupabasePorts, remapBrowserSupabaseConfigPorts, inspectBrowserServices, probeBrowserEndpoints,
  waitForBrowserSupabaseReady,
} from "./acceptance-supabase-readiness.mjs";

const projectId = "suqpage-browser-12345";
const apiPort = 56321;
const healthyServices = () => Object.fromEntries(browserServices.map((name) => [
  name, { label: projectId, status: "running", health: name === "rest" ? "none" : "healthy" },
]));

test("DEP-027 S184 startup summary returns only validated metadata and fixed observed indicators", () => {
  const summary = readiness.summarizeBrowserSupabaseStartFailure;
  assert.equal(typeof summary, "function");
  const empty = {status:null,systemErrorCode:null,signal:null,observedIndicators:["unknown"]};
  for (const input of [null,undefined,{},"untrusted",{status:"1",signal:"SIGTERM\nsecret",error:{code:"EACCES\nsecret"},stdout:"unrecognized private text"}]) {
    assert.deepEqual(summary(input),empty);
  }
  assert.deepEqual(summary({status:1,signal:"SIGTERM",error:{code:"ETIMEDOUT",message:"secret/path"}}),{...empty,status:1,systemErrorCode:"ETIMEDOUT",signal:"SIGTERM"});
  for(const status of [-1,256,Infinity,NaN,1.5])assert.equal(summary({status}).status,null);
  const fixtures=[
    ["docker_unavailable","Cannot connect to the Docker daemon. Is the docker daemon running?"],
    ["docker_api_incompatible","client version 1.42 is too old. Minimum supported API version is 1.44"],
    ["image_pull_or_registry","failed to pull image: manifest unknown"],
    ["image_manifest_missing","failed to pull image: manifest unknown"],
    ["image_pull_rate_limited","docker registry rate limit exceeded for image pull"],
    ["image_pull_access_denied","failed to pull image: pull access denied"],
    ["registry_transport_failure","ghcr.io registry connection reset while pulling image"],
    ["network_failure","dial tcp: connection refused"],
    ["port_conflict","Bind failed: address already in use"],
    ["invalid_configuration","failed to parse configuration: invalid config"],
    ["unsupported_cli_option","unknown flag: --secret-option"],
    ["permission_denied","permission denied"],
    ["resource_exhaustion","no space left on device; out of memory"],
    ["container_health","container health check failed"],
    ["database_bootstrap","database bootstrap failed"],
  ];
  for(const[indicator,message]of fixtures){
    const output=summary({status:1,stdout:Buffer.from("SERVICE_ROLE_KEY=fixture-secret-token\nDB_URL=postgres://private-user:private-password@private.invalid/db\n"),stderr:`${message}\n/private/sensitive-fixture https://private.invalid/?token=fixture-secret-token`});
    assert.ok(output.observedIndicators.includes(indicator),indicator);
    assert.ok(output.observedIndicators.every(value=>fixtures.some(([allowed])=>value===allowed)));
    assert.deepEqual(Object.keys(output),["status","systemErrorCode","signal","observedIndicators"]);
    assert.doesNotMatch(JSON.stringify(output),/fixture-secret|private-user|private-password|private\.invalid|sensitive-fixture|secret-option|SERVICE_ROLE_KEY|DB_URL|1\.42|1\.44/);
    assert.ok(JSON.stringify(output).length<512);
  }
  assert.deepEqual(summary({status:1,stdout:"x".repeat(20_000)+"permission denied",stderr:null}).observedIndicators,["permission_denied"],"A late error survives bounded CLI progress sampling");
  assert.deepEqual(summary({status:1,stdout:Buffer.from("x".repeat(20_000)+"minimum supported API version is 1.44")}).observedIndicators,["docker_api_incompatible"],"Late Buffer output follows the same bounded contract");
  assert.deepEqual(summary({status:1,stdout:"x".repeat(3_000)+"permission denied"+"x".repeat(18_000)}).observedIndicators,["unknown"],"An indicator in the excluded middle is not inspected");
});

test("DEP-027 S184 real acceptance runner sanitizes captured startup failure and still cleans up", {timeout:30000}, () => {
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),fixture=fs.mkdtempSync(path.join(os.tmpdir(),"suqpage-startup-summary-test-"));
  fs.chmodSync(fixture,0o700);const bin=path.join(fixture,"bin"),events=path.join(fixture,"events.jsonl"),secret="S184_FIXTURE_SECRET_MUST_NOT_ESCAPE";
  fs.mkdirSync(bin,{mode:0o700});const configBefore=fs.readFileSync(path.join(root,"supabase/config.toml"));
  const executable=`#!/usr/bin/env node\nconst fs=require('node:fs');const command=process.argv[2],args=process.argv.slice(3);fs.appendFileSync(${JSON.stringify(events)},JSON.stringify({command,args})+'\\n',{mode:0o600});if(command==='start'){console.log(${JSON.stringify("SERVICE_ROLE_KEY="+secret+"\nDB_URL=postgres://fixture-user:fixture-password@private.invalid/db")});console.error(${JSON.stringify("Cannot connect to the Docker daemon at unix:///private/s184-secret.sock\n"+secret)});process.exit(1);}if(command==='stop')process.exit(0);process.exit(90);\n`;
  fs.writeFileSync(path.join(bin,"supabase"),executable,{mode:0o700});
  fs.writeFileSync(path.join(bin,"docker"),`#!/usr/bin/env node\nrequire('node:fs').appendFileSync(${JSON.stringify(events)},JSON.stringify({command:'docker'})+'\\n');process.exit(90);\n`,{mode:0o700});
  try{
    const result=spawnSync(process.execPath,[path.join(root,"scripts/acceptance-runner.mjs")],{cwd:root,env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,TMPDIR:fixture,TMP:fixture,TEMP:fixture},encoding:"utf8",timeout:20000,maxBuffer:256*1024});
    assert.equal(result.error,undefined);assert.equal(result.status,1);assert.equal(result.signal,null);
    const output=result.stdout+result.stderr;
    assert.doesNotMatch(output,new RegExp(secret));assert.doesNotMatch(output,/fixture-user|fixture-password|private\.invalid|s184-secret\.sock|SERVICE_ROLE_KEY|DB_URL/);
    const calls=fs.readFileSync(events,"utf8").trim().split("\n").map(line=>JSON.parse(line));assert.deepEqual(calls.map(call=>call.command),["start","stop"],"No Docker, status, build or provider step runs after failed startup");
    const project=calls[0].args[1];assert.ok(project.startsWith(fixture+path.sep));assert.deepEqual(calls[0].args,["--workdir",project,"--ignore-health-check"]);assert.deepEqual(calls[1].args,["--workdir",project,"--no-backup"]);
    const acceptanceRoot=path.dirname(project),runId=path.basename(acceptanceRoot);assert.equal(fs.existsSync(acceptanceRoot),false,"Disposable project is removed after failed start");assert.equal(fs.existsSync(path.join(root,".next-acceptance",runId)),false);assert.equal(fs.existsSync(path.join(root,`.acceptance-tsconfig-${runId}.json`)),false);assert.deepEqual(fs.readFileSync(path.join(root,"supabase/config.toml")),configBefore);
    const match=output.match(/^Error: Supabase startup failed: (\{[^\n]+\})$/m);assert.ok(match,"Actual entry must expose only the JSON-safe startup summary");
    assert.deepEqual(JSON.parse(match[1]),{status:1,systemErrorCode:null,signal:null,observedIndicators:["docker_unavailable"]});assert.ok(!output.includes(project),"Captured CLI paths are not exposed");
  }finally{fs.rmSync(fixture,{recursive:true,force:true});}
});

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
