import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  FileMediaObjectStore,
  MediaStorageError,
  SupabaseMediaObjectStore,
} from "../lib/media-storage";

const key = "product-00000000-0000-4000-8000-000000000001.webp";
const requestKey = "00000000-0000-4000-8000-000000000002.png";
const supportKey = "support-00000000-0000-4000-8000-000000000003.pdf";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-media-store-"));
  process.env.MIRTPAGE_MEDIA_ROOT = root;
  try {
    const local = new FileMediaObjectStore();
    await local.put("public", key, Buffer.from("public-image"), "image/webp");
    await local.put("requests", requestKey, Buffer.from("private-image"), "image/png");
    await local.put("support", supportKey, Buffer.from("%PDF-1.7\n%%EOF"), "application/pdf");
    assert.equal((await local.read("public", key, "image/webp"))?.bytes.toString(), "public-image");
    assert.equal((await local.read("requests", requestKey, "image/png"))?.bytes.toString(), "private-image");
    assert.equal((await local.read("support", supportKey, "application/pdf"))?.bytes.toString(), "%PDF-1.7\n%%EOF");
    await local.remove("public", [key]);
    assert.equal(await local.read("public", key, "image/webp"), null);
    await assert.rejects(
      () => local.put("public", "../escape.png", Buffer.from("x"), "image/png"),
      (error: unknown) => error instanceof MediaStorageError && error.code === "invalid_key",
    );

    const objects = new Map<string, Uint8Array>();
    const calls: Array<{ url: string; method: string; authorization: string }> = [];
    const secret = "service-role-test-secret-value";
    const fakeFetch: typeof fetch = async (input, init = {}) => {
      const url = String(input);
      const method = init.method || "GET";
      calls.push({
        url,
        method,
        authorization: new Headers(init.headers).get("authorization") || "",
      });
      const objectMatch = url.match(/\/storage\/v1\/object\/(?:authenticated\/)?test-bucket\/(.+)$/);
      if (method === "POST" && objectMatch) {
        objects.set(objectMatch[1], new Uint8Array(init.body as Uint8Array));
        return new Response("{}", { status: 200 });
      }
      if (method === "GET" && objectMatch) {
        const bytes = objects.get(objectMatch[1]);
        return bytes
          ? new Response(Uint8Array.from(bytes).buffer, { status: 200, headers: { "content-type": "image/webp" } })
          : new Response("", { status: 404 });
      }
      if (method === "DELETE") {
        const payload = JSON.parse(String(init.body)) as { prefixes: string[] };
        payload.prefixes.forEach((prefix) =>
          objects.delete(prefix.split("/").map(encodeURIComponent).join("/")),
        );
        return new Response("[]", { status: 200 });
      }
      return new Response("", { status: 500 });
    };
    const remote = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, fakeFetch);
    await remote.put("public", key, Buffer.from("remote-image"), "image/webp");
    await remote.put("support", supportKey, Buffer.from("remote-pdf"), "application/pdf");
    assert.equal((await remote.read("public", key, "image/webp"))?.bytes.toString(), "remote-image");
    assert.equal((await remote.read("support", supportKey, "application/pdf"))?.bytes.toString(), "remote-pdf");
    await remote.remove("public", [key]);
    assert.equal(await remote.read("public", key, "image/webp"), null);
    assert.ok(calls.every((call) => call.authorization === `Bearer ${secret}`));
    assert.ok(calls.some((call) => call.url.includes("/storage/v1/object/test-bucket/public/")));
    assert.ok(calls.some((call) => call.url.includes("/storage/v1/object/authenticated/test-bucket/public/")));
    assert.ok(calls.some((call) => call.url.includes("/storage/v1/object/test-bucket/support/")));

    const localMissing = new SupabaseMediaObjectStore({
      url: "http://127.0.0.1:54321",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, async () => new Response(JSON.stringify({
      statusCode: "404",
      code: "NoSuchKey",
      message: "Object not found",
    }), { status: 400, headers: { "content-type": "application/json" } }));
    assert.equal(await localMissing.read("public", key, "image/webp"), null);

    const malformedMissing = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, async () => new Response(JSON.stringify({ statusCode: "400", code: "BadRequest" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    }));
    await assert.rejects(
      () => malformedMissing.read("public", key, "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError && error.code === "provider_read_failed",
    );

    const denied = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, async () => new Response(`provider leaked ${secret}`, { status: 503 }));
    await assert.rejects(
      () => denied.put("public", key, Buffer.from("x"), "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError &&
        error.code === "provider_write_failed" &&
        !error.message.includes(secret),
    );

    const hanging = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
      requestTimeoutMs: 20,
    }, async (_input, init = {}) => new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    }));
    const started = Date.now();
    await assert.rejects(
      () => hanging.read("public", key, "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError && error.code === "provider_read_failed",
    );
    assert.ok(Date.now() - started < 1_000, "provider timeout is bounded");

    const oversized = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, async () => new Response("x", {
      status: 200,
      headers: { "content-length": String(5 * 1024 * 1024 + 1) },
    }));
    await assert.rejects(
      () => oversized.read("public", key, "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError && error.code === "provider_response_invalid",
    );

    const chunkedOversized = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
    }, async () => new Response(new Uint8Array(5 * 1024 * 1024 + 1)));
    await assert.rejects(
      () => chunkedOversized.read("public", key, "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError && error.code === "provider_response_invalid",
    );

    const stalledBody = new SupabaseMediaObjectStore({
      url: "https://project.supabase.co",
      serviceRoleKey: secret,
      bucket: "test-bucket",
      requestTimeoutMs: 20,
    }, async (_input, init = {}) => new Response(new ReadableStream({
      start(controller) {
        init.signal?.addEventListener("abort", () => controller.error(new Error("aborted")), { once: true });
      },
    })));
    await assert.rejects(
      () => stalledBody.read("public", key, "image/webp"),
      (error: unknown) =>
        error instanceof MediaStorageError && error.code === "provider_read_failed",
    );

    console.log("Filesystem and Supabase media storage adapter parity, traversal denial, immutable paths, full-response deadlines, streaming response bounds, and safe provider failures passed.");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
