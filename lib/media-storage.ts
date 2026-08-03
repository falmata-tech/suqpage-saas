import fs from "node:fs";
import path from "node:path";
import {
  mediaRequestTimeoutMs,
  mediaRoot,
  mediaStorageDriver,
  requestAttachmentRoot,
  supabaseMediaStorageConfig,
} from "./config";

export type MediaNamespace = "public" | "requests";
export type StoredMediaObject = {
  bytes: Buffer;
  contentType: string;
  contentLength: number;
};

export interface MediaObjectStore {
  readonly provider: "filesystem" | "supabase";
  put(
    namespace: MediaNamespace,
    key: string,
    bytes: Buffer,
    contentType: string,
  ): Promise<void>;
  read(
    namespace: MediaNamespace,
    key: string,
    contentType: string,
  ): Promise<StoredMediaObject | null>;
  remove(namespace: MediaNamespace, keys: string[]): Promise<void>;
}

export class MediaStorageError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_configuration"
      | "invalid_key"
      | "provider_read_failed"
      | "provider_write_failed"
      | "provider_delete_failed"
      | "provider_response_invalid",
  ) {
    super(message);
  }
}

const MEDIA_KEY = /^(?:[a-z0-9-]+-)?[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i;

export function assertMediaObjectKey(key: string) {
  if (!MEDIA_KEY.test(key)) {
    throw new MediaStorageError("The media reference is invalid.", "invalid_key");
  }
  return key;
}

function localObjectPath(namespace: MediaNamespace, key: string) {
  assertMediaObjectKey(key);
  const root = namespace === "public" ? mediaRoot() : requestAttachmentRoot();
  const full = path.resolve(/* turbopackIgnore: true */ root, key);
  if (!full.startsWith(`${root}${path.sep}`)) {
    throw new MediaStorageError("The media reference is invalid.", "invalid_key");
  }
  return full;
}

export class FileMediaObjectStore implements MediaObjectStore {
  readonly provider = "filesystem" as const;

  async put(
    namespace: MediaNamespace,
    key: string,
    bytes: Buffer,
    _contentType: string,
  ) {
    const full = localObjectPath(namespace, key);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, bytes, { flag: "wx", mode: 0o640 });
  }

  async read(
    namespace: MediaNamespace,
    key: string,
    contentType: string,
  ): Promise<StoredMediaObject | null> {
    const full = localObjectPath(namespace, key);
    try {
      const bytes = await fs.promises.readFile(full);
      return { bytes, contentType, contentLength: bytes.byteLength };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async remove(namespace: MediaNamespace, keys: string[]) {
    await Promise.all(
      keys.map((key) => fs.promises.rm(localObjectPath(namespace, key), { force: true })),
    );
  }
}

export type SupabaseMediaStorageConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
  requestTimeoutMs?: number;
};

type FetchLike = typeof fetch;
const MAX_MEDIA_RESPONSE_BYTES = 5 * 1024 * 1024;

async function readBoundedResponse(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_MEDIA_RESPONSE_BYTES) {
    throw new MediaStorageError(
      "Media storage returned an invalid object.",
      "provider_response_invalid",
    );
  }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_MEDIA_RESPONSE_BYTES) {
        await reader.cancel();
        throw new MediaStorageError(
          "Media storage returned an invalid object.",
          "provider_response_invalid",
        );
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

function normalizedSupabaseConfig(
  input: SupabaseMediaStorageConfig,
): SupabaseMediaStorageConfig {
  let url: URL;
  try {
    url = new URL(input.url);
  } catch {
    throw new MediaStorageError(
      "Supabase media storage is not configured correctly.",
      "invalid_configuration",
    );
  }
  const requestTimeoutMs = input.requestTimeoutMs ?? mediaRequestTimeoutMs();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^[a-z0-9][a-z0-9_-]{1,62}$/i.test(input.bucket) ||
    input.serviceRoleKey.length < 20 ||
    !Number.isSafeInteger(requestTimeoutMs) ||
    requestTimeoutMs < 1 ||
    requestTimeoutMs > 30_000
  ) {
    throw new MediaStorageError(
      "Supabase media storage is not configured correctly.",
      "invalid_configuration",
    );
  }
  return {
    url: url.toString().replace(/\/$/, ""),
    serviceRoleKey: input.serviceRoleKey,
    bucket: input.bucket,
    requestTimeoutMs,
  };
}

function encodedObjectPath(namespace: MediaNamespace, key: string) {
  return `${encodeURIComponent(namespace)}/${encodeURIComponent(assertMediaObjectKey(key))}`;
}

export class SupabaseMediaObjectStore implements MediaObjectStore {
  readonly provider = "supabase" as const;
  private readonly config: SupabaseMediaStorageConfig;

  constructor(input: SupabaseMediaStorageConfig, private readonly fetcher: FetchLike = fetch) {
    this.config = normalizedSupabaseConfig(input);
  }

  private headers(extra: HeadersInit = {}) {
    return {
      apikey: this.config.serviceRoleKey,
      Authorization: `Bearer ${this.config.serviceRoleKey}`,
      ...extra,
    };
  }

  private bucketPath() {
    return encodeURIComponent(this.config.bucket);
  }

  private async request<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs,
    );
    try {
      return await operation(controller.signal);
    } catch (error) {
      if (error instanceof MediaStorageError) throw error;
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async put(
    namespace: MediaNamespace,
    key: string,
    bytes: Buffer,
    contentType: string,
  ) {
    const response = await this.request((signal) =>
      this.fetcher(`${this.config.url}/storage/v1/object/${this.bucketPath()}/${encodedObjectPath(namespace, key)}`, {
        method: "POST",
        headers: this.headers({
          "Content-Type": contentType,
          "cache-control": "31536000",
          "x-upsert": "false",
        }),
        body: new Uint8Array(bytes),
        signal,
      }),
    );
    if (!response?.ok) {
      throw new MediaStorageError(
        "Media storage is temporarily unavailable. Try the upload again.",
        "provider_write_failed",
      );
    }
  }

  async read(
    namespace: MediaNamespace,
    key: string,
    contentType: string,
  ): Promise<StoredMediaObject | null> {
    const result = await this.request(async (signal) => {
      const response = await this.fetcher(
        `${this.config.url}/storage/v1/object/authenticated/${this.bucketPath()}/${encodedObjectPath(namespace, key)}`,
        { method: "GET", headers: this.headers(), signal },
      );
      if (response.status === 404) return { kind: "missing" as const };
      if (!response.ok) {
        throw new MediaStorageError(
          "Media storage is temporarily unavailable.",
          "provider_read_failed",
        );
      }
      return {
        kind: "object" as const,
        bytes: await readBoundedResponse(response),
        contentType: response.headers.get("content-type") || contentType,
      };
    });
    if (!result) {
      throw new MediaStorageError(
        "Media storage is temporarily unavailable.",
        "provider_read_failed",
      );
    }
    if (result.kind === "missing") return null;
    return {
      bytes: result.bytes,
      contentType: result.contentType,
      contentLength: result.bytes.byteLength,
    };
  }

  async remove(namespace: MediaNamespace, keys: string[]) {
    if (!keys.length) return;
    const response = await this.request((signal) =>
      this.fetcher(`${this.config.url}/storage/v1/object/${this.bucketPath()}`, {
        method: "DELETE",
        headers: this.headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          prefixes: keys.map((key) => `${namespace}/${assertMediaObjectKey(key)}`),
        }),
        signal,
      }),
    );
    if (!response?.ok) {
      throw new MediaStorageError(
        "Media cleanup could not be confirmed.",
        "provider_delete_failed",
      );
    }
  }
}

export function configuredMediaDriver() {
  try {
    return mediaStorageDriver();
  } catch {
    throw new MediaStorageError(
      "MIRTPAGE_MEDIA_DRIVER must be filesystem or supabase.",
      "invalid_configuration",
    );
  }
}

export function getMediaObjectStore(): MediaObjectStore {
  if (configuredMediaDriver() === "filesystem") return new FileMediaObjectStore();
  return new SupabaseMediaObjectStore(supabaseMediaStorageConfig());
}
