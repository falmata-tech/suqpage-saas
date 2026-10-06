import { endLocalSession } from "../apps/mobile/src/session-lifecycle";
import { inquiryOptions } from "../apps/mobile/src/inquiry-options";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { apiOrigin, publicLink } from "../packages/contracts/src";
import {
  nativeIdentity,
  nativeOwner,
  MobileError,
  boundedBody,
  jsonBody,
  ownerTarget,
  type NativeIdentityPort,
} from "../lib/mobile/http";
import type { SessionUser } from "../lib/types";
import { mapDisplayLocation } from "../lib/map-display-location";
const user: SessionUser = {
  id: 1,
  name: "Owner",
  email: "owner@example.test",
  role: "owner",
  access_role: "client",
  business_id: 1,
  must_change_password: 0,
};
const token = "valid_test_token_1234567890";
assert.deepEqual(inquiryOptions('{"Size":"Large"}'), {Size:'Large'});
for (const raw of ['null', '[]', '42', '{"Size":null}', '{"Size":{}}', '{"__proto__":"bad"}', '{broken', 'x'.repeat(4097)]) assert.deepEqual(inquiryOptions(raw), {});
const port: NativeIdentityPort = {
  verify: async (value) =>
    value === token ? { id: "subject-a", email: user.email } : null,
  linked: async () => 1,
  user: async () => user,
};
const req = (headers: Record<string, string> = {}) =>
  new Request("https://suqpage.com/api/mobile/v1/owner/home", { headers });
async function main() {
  for (const failure of ["provider", "storage"]) {
    const calls: string[] = [];
    await assert.rejects(
      endLocalSession({
        signOut: async () => {
          calls.push("provider");
          if (failure === "provider") throw Error("logout unavailable");
        },
        clearPrivateState: () => {
          calls.push("private state cleared");
        },
        removeStoredSession: async () => {
          calls.push("storage removal attempted");
          if (failure === "storage") throw Error("storage unavailable");
        },
      }),
    );
    assert.deepEqual(calls, [
      "provider",
      "private state cleared",
      "storage removal attempted",
    ]);
  }

  assert.equal(apiOrigin("https://suqpage.com"), "https://suqpage.com");
  assert.equal(apiOrigin("http://127.0.0.1:3102"), "http://127.0.0.1:3102");
  for (const value of [
    "http://evil.test",
    "https://u:password@suqpage.com",
    "https://suqpage.com/path",
    "https://suqpage.com/?secret=1",
    "javascript:alert(1)",
  ])
    assert.throws(() => apiOrigin(value));
  assert.throws(() => publicLink("https://suqpage.com", "https://evil.test/"));
  assert.throws(() => publicLink("https://suqpage.com", "javascript:alert(1)"));
  await assert.rejects(
    nativeOwner(req({ cookie: "session=fake" }), port),
    (e) => e instanceof MobileError && e.status === 401,
  );
  await assert.rejects(
    nativeOwner(req({ Authorization: "Bearer forged_token_123456789" }), port),
    (e) => e instanceof MobileError && e.status === 401,
  );
  assert.equal(
    (await nativeOwner(req({ Authorization: `Bearer ${token}` }), port))
      .business_id,
    1,
  );
  for (const access_role of [
    "platform_admin",
    "team_member",
    "operations_manager",
  ] as const)
    await assert.rejects(
      nativeOwner(req({ Authorization: `Bearer ${token}` }), {
        ...port,
        user: async () => ({ ...user, access_role }),
      }),
      (e) => e instanceof MobileError && e.status === 403,
    );
  await assert.rejects(
    nativeOwner(req({ Authorization: `Bearer ${token}` }), {
      ...port,
      linked: async () => null,
    }),
    (e) => e instanceof MobileError && e.code === "setup_required",
  );
  await assert.rejects(
    nativeIdentity(req({ Authorization: `Bearer ${token}` }), {
      ...port,
      verify: async () => {
        throw Error("provider secret");
      },
    }),
    (e) =>
      e instanceof MobileError &&
      e.status === 503 &&
      !e.message.includes("secret"),
  );
  assert.throws(() => ownerTarget(user, 2));
  assert.doesNotThrow(() => ownerTarget(user, 1));
  await assert.rejects(
    boundedBody(
      new Request("https://suqpage.com", {
        method: "POST",
        body: "x".repeat(20),
      }),
      10,
    ),
    (e) => e instanceof MobileError && e.status === 413,
  );
  await assert.rejects(
    jsonBody(
      new Request("https://suqpage.com", {
        method: "POST",
        body: "[]",
        headers: { "content-type": "application/json" },
      }),
    ),
    MobileError,
  );
  const a = {
    id: 2,
    latitude: 9,
    longitude: 38,
    locationMode: "area" as const,
  };
  assert.notDeepEqual(mapDisplayLocation(a), a);
  assert.deepEqual(mapDisplayLocation({ ...a, locationMode: "storefront" }), {
    ...a,
    locationMode: "storefront",
  });
  const pkg = JSON.parse(fs.readFileSync("apps/mobile/package.json", "utf8"));
  assert.equal(pkg.main, "expo-router/entry");
  assert.ok(
    !Object.keys(pkg.dependencies).some((p) => /sqlite|^pg$|next$/.test(p)),
  );
  for (const path of fs.readdirSync("packages/contracts/src"))
    assert.doesNotMatch(
      fs.readFileSync("packages/contracts/src/" + path, "utf8"),
      /from ['"](?:next|pg|node:|.*lib\/config)/,
    );
  const require = createRequire(import.meta.url);
  const metro = require("../apps/mobile/metro.config.js");
  for (const moduleName of [
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom",
  ]) {
    const resolved = metro.resolver.resolveRequest({}, moduleName, "ios");
    assert.ok(
      resolved.filePath.includes("/apps/mobile/node_modules/"),
      "Every native importer uses the mobile React copy",
    );
  }
  console.log(
    "Mobile contract checks passed: bearer-only access, roles, tenant targets, request limits, origins, map privacy and package boundary.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
