import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { showroomStatusLookupUrl } from "../lib/showroom-status-origin";
import { proxy } from "../proxy";

assert.equal(showroomStatusLookupUrl("http://127.0.0.1:3102/@sample", { NODE_ENV: "production" }).href,
  "http://127.0.0.1:3102/api/public/showroom-status");
assert.equal(showroomStatusLookupUrl("http://192.168.1.9:3102/@sample", { NODE_ENV: "development" }).href,
  "http://192.168.1.9:3102/api/public/showroom-status");
assert.equal(showroomStatusLookupUrl("https://untrusted.example/@sample?token=private", {
  NODE_ENV: "production", NETLIFY: "true", NEXT_PUBLIC_APP_URL: "https://mirtpage.com",
}).href, "https://mirtpage.com/api/public/showroom-status");
assert.equal(showroomStatusLookupUrl("https://untrusted.example/@sample?token=private", {
  NODE_ENV: "production", NETLIFY: "true", NEXT_PUBLIC_APP_URL: "https://africmade.com",
}).href, "https://africmade.com/api/public/showroom-status");
assert.throws(() => showroomStatusLookupUrl("https://untrusted.example/@sample", {
  NODE_ENV: "production", NETLIFY: "true", NEXT_PUBLIC_APP_URL: "https://untrusted.example",
}));
assert.throws(() => showroomStatusLookupUrl("https://mirtpage.com/@sample", {
  NODE_ENV: "production", NETLIFY: "true", NEXT_PUBLIC_APP_URL: "http://127.0.0.1:8080",
}));

async function main() {
const previousFetch = globalThis.fetch;
const previousDriver = process.env.SUQPAGE_AUTH_DRIVER;
const previousNetlify = process.env.NETLIFY;
const previousLocale = process.env.NEXT_PUBLIC_APP_URL;
try {
  process.env.SUQPAGE_AUTH_DRIVER = "local";
  delete process.env.NETLIFY;
  process.env.NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3102";
  const calls: Array<{ url: URL; options: RequestInit | undefined }> = [];
  let lookupStatus = 204;
  globalThis.fetch = async (input, options) => {
    calls.push({ url: new URL(String(input)), options });
    return new Response(null, { status: lookupStatus });
  };
  const request = (path: string, headers?: HeadersInit) => new NextRequest(`http://127.0.0.1:3102${path}`, { headers });
  assert.equal((await proxy(request("/@Known-Handle"))).status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/public/showroom-status");
  assert.equal(calls[0].url.searchParams.get("handle"), "Known-Handle");
  assert.equal(calls[0].url.port, "3102");
  assert.equal(calls[0].options?.credentials, "omit");
  assert.equal(calls[0].options?.cache, "no-store");
  lookupStatus = 404;
  const missing = await proxy(request("/@missing", { cookie: "suqpage-language=am" }));
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /ገጹ አልተገኘም።/);
  lookupStatus = 503;
  const unavailable = await proxy(request("/@missing"));
  assert.equal(unavailable.status, 503);
  assert.match(unavailable.headers.get("retry-after") || "", /30/);
  const beforeInvalid = calls.length;
  assert.equal((await proxy(request(`/@${"a".repeat(129)}`))).status, 404);
  assert.equal((await proxy(request("/@missing", { rsc: "1" }))).status, 200);
  assert.equal(calls.length, beforeInvalid, "Invalid handles and RSC navigation avoid the status request");
  globalThis.fetch = async () => { throw new Error("provider unavailable"); };
  assert.equal((await proxy(request("/@missing"))).status, 503);
  console.log("showroom status origin and Edge proxy: passed");
} finally {
  globalThis.fetch = previousFetch;
  if (previousDriver === undefined) delete process.env.SUQPAGE_AUTH_DRIVER;
  else process.env.SUQPAGE_AUTH_DRIVER = previousDriver;
  if (previousNetlify === undefined) delete process.env.NETLIFY;
  else process.env.NETLIFY = previousNetlify;
  if (previousLocale === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = previousLocale;
}
}
main().catch(error => { console.error(error); process.exitCode = 1; });
