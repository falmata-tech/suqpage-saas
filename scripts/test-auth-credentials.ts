import assert from "node:assert/strict";
import { test } from "node:test";
import { readCliKeychainToken, resolveAuthCredential, type KeychainCommandPort } from "./auth-credentials";

const token = `sbp_${"a".repeat(40)}`;
test("default env selection never probes saved login; explicit cli rejects ambiguity", async () => {
  let calls = 0;
  const reader = async () => { calls++; return token; };
  await assert.rejects(resolveAuthCredential(undefined, "", reader), /explicit/);
  assert.deepEqual(await resolveAuthCredential("env", token, reader), { source: "env", token });
  await assert.rejects(resolveAuthCredential("cli", token, reader), /Both/);
  await assert.rejects(resolveAuthCredential("automatic", "", reader), /Choose/);
  assert.equal(calls, 0);
  assert.deepEqual(await resolveAuthCredential("cli", "", reader), { source: "cli", token });
  assert.equal(calls, 1);
});
test("Keychain reader uses only fixed commands with bounded private pipes", async () => {
  let calls = 0;
  const execute: KeychainCommandPort = async (command, args, options) => {
    calls++;
    assert.equal(command, "/usr/bin/security");
    assert.deepEqual(args, ["find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"]);
    assert.deepEqual(options, { timeout: 60_000, maxBuffer: 8192, env: { NODE_ENV: "production" } });
    return { status: 0, stdout: token + "\n" };
  };
  assert.equal(await readCliKeychainToken("darwin", execute), token);
  assert.equal(calls, 1);
});
test("only missing or successful empty entry permits legacy lookup and Go-keyring decoding", async () => {
 for (const status of [44, 0]) {
  const accounts: string[] = [];
  const result = await readCliKeychainToken("darwin", async (_command, args) => {
    accounts.push(args[4]);
    return accounts.length === 1 ? { status, stdout: "" }
      : { status: 0, stdout: `go-keyring-base64:${Buffer.from(token).toString("base64")}\n` };
  });
  assert.equal(result, token);
  assert.deepEqual(accounts, ["supabase", "access-token"]);
 }
});
for (const [name, status, stdout] of [
  ["denied", 36, token], ["timeout", -1, token], ["blank-invalid", 0, "\ninvalid\n"],
  ["oversized", 0, "x".repeat(9000)], ["malformed", 0, "not-a-token"],
  ["injected", 0, token + "\nINJECTED"], ["invalid-base64", 0, "go-keyring-base64:%%%"],
] as const) {
  test(`${name} stops without legacy fallback or token disclosure`, async () => {
    let calls = 0;
    await assert.rejects(readCliKeychainToken("darwin", async () => { calls++; return { status, stdout }; }), error => {
      assert.ok(error instanceof Error);
      assert.doesNotMatch(error.message, /sbp_|INJECTED|not-a-token|%%%/);
      return true;
    });
    assert.equal(calls, 1);
  });
}
test("missing entries, unsupported platform and raw process exceptions fail safely", async () => {
  let calls = 0;
  const execute: KeychainCommandPort = async () => { calls++; return { status: 44, stdout: "" }; };
  await assert.rejects(readCliKeychainToken("linux", execute), /macOS/);
  assert.equal(calls, 0);
  await assert.rejects(readCliKeychainToken("darwin", execute), /missing/);
  assert.equal(calls, 2);
  await assert.rejects(resolveAuthCredential("cli", "", async () => { throw new Error(token); }), error => {
    assert.ok(error instanceof Error); assert.ok(!error.message.includes(token)); return true;
  });
  await assert.rejects(readCliKeychainToken("darwin", async () => { throw new Error(token); }), /missing/);
});
