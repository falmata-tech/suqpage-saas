import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Business } from "../lib/types";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-adapter-test-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "test.db");
  process.env.RESEND_API_KEY = "test-key";
  process.env.NOTIFICATION_FROM_EMAIL = "test@example.com";

  const { consumeRateLimit, resetRateLimit } = await import("../lib/rate-limit");
  const { notifyNewInquiry } = await import("../lib/notifications");
  const { closeDbForTests } = await import("../lib/db");

  const key = "login:test:user@example.com";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal(consumeRateLimit(key, 5, 60_000).allowed, true);
    resetRateLimit(key);
  }
  assert.equal(consumeRateLimit(key, 5, 60_000).remaining, 4);

  const business = {
    name: "Test tenant",
    contact_email: "owner@example.com",
  } as Business;
  const failed = await notifyNewInquiry(business, 1, "Customer", {
    send: async () => new Response(null, { status: 503 }),
  });
  assert.equal(failed, "failed");
  const sent = await notifyNewInquiry(business, 2, "Customer", {
    send: async () => new Response(null, { status: 202 }),
  });
  assert.equal(sent, "sent");
  const timedOut = await notifyNewInquiry(business, 3, "Customer", {
    timeoutMs: 10,
    send: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        const guard = setTimeout(() => reject(new Error("timeout signal was not delivered")), 1_000);
        init?.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(guard);
            reject(new Error("aborted"));
          },
          { once: true },
        );
      }),
  });
  assert.equal(timedOut, "failed");

  closeDbForTests();
  fs.rmSync(root, { recursive: true, force: true });
  console.log("Adapter boundary tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
