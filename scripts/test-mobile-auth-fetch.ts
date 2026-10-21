import assert from "node:assert/strict";
import { test } from "node:test";
import { getEventListeners } from "node:events";
import { createClient } from "@supabase/supabase-js";
import { boundedAuthFetch, type AuthFetchPort } from "../apps/mobile/src/auth-fetch";

const origin = "https://auth.example.invalid";
const clientFor = (send: AuthFetchPort, timeoutMs = 25) => createClient(origin, "public-test-key", {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: boundedAuthFetch(send, timeoutMs) },
});
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test("BE-044 Auth deadline bounds a stalled connection without retrying or exposing transport details", async () => {
  let calls = 0, signal: AbortSignal | null | undefined;
  const send: AuthFetchPort = async (_input, init) => {
    calls++; signal = init?.signal;
    return new Promise(() => {});
  };
  await assert.rejects(boundedAuthFetch(send, 5)(origin), /^Error: Unable to connect\. Please try again\.$/);
  assert.equal(calls, 1); assert.equal(signal?.aborted, true);
});

test("BE-044 Auth response-body stalls are aborted and their stream is cancelled", async () => {
  let cancelled = false;
  const send: AuthFetchPort = async () => new Response(new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } }));
  await assert.rejects(boundedAuthFetch(send, 5)(origin), /^Error: Unable to connect/);
  assert.equal(cancelled, true);
});

test("BE-044 caller cancellation is preserved before sending and during body reads", async () => {
  const before = new AbortController(), beforeReason = new Error("caller cancelled"); before.abort(beforeReason);
  let calls = 0;
  await assert.rejects(boundedAuthFetch(async () => { calls++; return new Response(); })(origin, { signal: before.signal }), error => error === beforeReason);
  assert.equal(calls, 0);

  const caller = new AbortController(), reason = new Error("caller stopped reading");
  let started!: () => void; const reading = new Promise<void>(resolve => { started = resolve; });
  const send: AuthFetchPort = async () => new Response(new ReadableStream<Uint8Array>({ pull() { started(); } }));
  const pending = boundedAuthFetch(send)(new Request(origin, { signal: caller.signal }));
  await reading; caller.abort(reason); await assert.rejects(pending, error => error === reason);
  assert.equal(getEventListeners(caller.signal, "abort").length, 0);
});

test("BE-044 successful Auth responses preserve bytes/status/headers and remove deadline/listener state", async () => {
  const caller = new AbortController(); let signal: AbortSignal | null | undefined;
  const send: AuthFetchPort = async (_input, init) => {
    signal = init?.signal;
    return new Response('{"user":"ሰላም · Soomaali · Afaan Oromoo"}', { status: 201, statusText: "Created", headers: { "x-auth-fixture": "preserved", "content-type": "application/json" } });
  };
  const response = await boundedAuthFetch(send, 20)(origin, { signal: caller.signal });
  assert.equal(response.status, 201); assert.equal(response.statusText, "Created");
  assert.equal(response.headers.get("x-auth-fixture"), "preserved"); assert.equal(await response.text(), '{"user":"ሰላም · Soomaali · Afaan Oromoo"}');
  assert.equal(getEventListeners(caller.signal, "abort").length, 0);
  await delay(30); assert.equal(signal?.aborted, false, "A completed request must not retain its deadline timer");
  for (const status of [204, 205, 304]) {
    const empty = await boundedAuthFetch(async () => new Response(null, { status }))(origin);
    assert.equal(empty.status, status); assert.equal(empty.body, null); assert.equal(await empty.text(), "");
  }
});

test("BE-044 oversized Auth bodies fail safely before they enter SDK session data", async () => {
  const declared: AuthFetchPort = async () => new Response("small", { headers: { "content-length": String(2 * 1024 * 1024 + 1) } });
  await assert.rejects(boundedAuthFetch(declared)(origin), /^Error: Unable to connect/);
  let cancelled = false;
  const streamed: AuthFetchPort = async () => new Response(new ReadableStream<Uint8Array>({ start(stream) { stream.enqueue(new Uint8Array(2 * 1024 * 1024 + 1)); }, cancel() { cancelled = true; } }));
  await assert.rejects(boundedAuthFetch(streamed)(origin), /^Error: Unable to connect/); assert.equal(cancelled, true);
});

test("BE-044 installed SDK acknowledges OTP and returns the normal timeout error without another OTP", async () => {
  let calls = 0;
  const successful = clientFor(async (input, init) => {
    calls++; assert.equal(new URL(String(input)).pathname, "/auth/v1/otp"); assert.equal(init?.method, "POST");
    assert.ok(init.signal instanceof AbortSignal); return Response.json({});
  });
  const acknowledged = await successful.auth.signInWithOtp({ email: "local-fixture@example.test" });
  assert.equal(acknowledged.error, null); assert.equal(calls, 1);
  calls = 0;
  const stalled = clientFor(async () => { calls++; return new Promise(() => {}); }, 5);
  const timeout = await stalled.auth.signInWithOtp({ email: "local-fixture@example.test" });
  assert.equal(timeout.error?.name, "AuthRetryableFetchError");
  assert.equal(timeout.error?.message, "Unable to connect. Please try again."); assert.equal(calls, 1);
});

test("BE-044 installed SDK receives unchanged 401 refresh failure and successful refresh session", async () => {
  let calls = 0;
  const denied = clientFor(async () => { calls++; return Response.json({ code: "refresh_token_not_found", msg: "Refresh token not found" }, { status: 401 }); });
  const invalid = await denied.auth.refreshSession({ refresh_token: "local-expired-fixture" });
  assert.equal(invalid.error?.status, 401); assert.equal(invalid.data.session, null); assert.equal(calls, 1);

  const encode = (data: unknown) => Buffer.from(JSON.stringify(data)).toString("base64url");
  const token = [encode({ alg: "HS256", typ: "JWT" }), encode({ sub: "00000000-0000-4000-8000-000000000001", exp: Math.floor(Date.now() / 1000) + 3600 }), "local_signature_fixture"].join(".");
  const refreshed = clientFor(async () => Response.json({ access_token: token, refresh_token: "local-refreshed-fixture", token_type: "bearer", expires_in: 3600, user: { id: "00000000-0000-4000-8000-000000000001", email: "local-fixture@example.test" } }));
  const valid = await refreshed.auth.refreshSession({ refresh_token: "local-valid-fixture" });
  assert.equal(valid.error, null); assert.equal(valid.data.session?.refresh_token, "local-refreshed-fixture");
});
