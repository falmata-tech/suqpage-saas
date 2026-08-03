import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { mediaMime } from "./media";
import {
  assertMediaObjectKey,
  type MediaNamespace,
} from "./media-storage";

export type MediaManifestReference = {
  namespace: MediaNamespace;
  key: string;
  contentType: string;
  sources: string[];
};

export type MediaReferenceManifest = {
  references: MediaManifestReference[];
  invalidReferenceCount: number;
  malformedDocumentCount: number;
};

export type LocalMediaObject = {
  namespace: MediaNamespace;
  key: string;
  fullPath: string;
  contentType: string;
  contentLength: number;
  sha256: string;
};

type ColumnSource = {
  table: string;
  column: string;
};

const DIRECT_PUBLIC_COLUMNS: ColumnSource[] = [
  { table: "businesses", column: "logo_path" },
  { table: "businesses", column: "hero_image_path" },
  { table: "businesses", column: "favicon_path" },
  { table: "products", column: "image_path" },
  { table: "business_discovery_profiles", column: "booth_image_path" },
  { table: "bazaar_booth_profiles", column: "booth_image_path" },
];

const JSON_DOCUMENT_COLUMNS: ColumnSource[] = [
  { table: "businesses", column: "content_blocks_json" },
  { table: "businesses", column: "design_manifest_json" },
  { table: "content_revisions", column: "snapshot_json" },
  { table: "content_revisions", column: "recipe_metadata_json" },
  { table: "published_catalog_versions", column: "snapshot_json" },
];

const PUBLIC_MEDIA_PREFIX = "/media/";
const digest = (bytes: Buffer) =>
  crypto.createHash("sha256").update(bytes).digest("hex");
const identity = (namespace: MediaNamespace, key: string) => `${namespace}:${key}`;

function tableColumns(db: DatabaseSync, table: string) {
  if (!/^[a-z][a-z0-9_]*$/i.test(table)) return new Set<string>();
  return new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(
      (row) => row.name,
    ),
  );
}

function addReference(
  references: Map<string, MediaManifestReference>,
  namespace: MediaNamespace,
  key: string,
  contentType: string,
  source: string,
) {
  const id = identity(namespace, key);
  const existing = references.get(id);
  if (existing) {
    if (!existing.sources.includes(source)) existing.sources.push(source);
    return;
  }
  references.set(id, { namespace, key, contentType, sources: [source] });
}

function visitJsonStrings(value: unknown, visit: (value: string) => void) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => visitJsonStrings(item, visit));
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.values(value).forEach((item) => visitJsonStrings(item, visit));
}

export function buildMediaReferenceManifest(db: DatabaseSync): MediaReferenceManifest {
  const references = new Map<string, MediaManifestReference>();
  let invalidReferenceCount = 0;
  let malformedDocumentCount = 0;

  for (const source of DIRECT_PUBLIC_COLUMNS) {
    if (!tableColumns(db, source.table).has(source.column)) continue;
    const rows = db
      .prepare(
        `SELECT ${source.column} value FROM ${source.table} WHERE ${source.column} LIKE '/media/%'`,
      )
      .all() as Array<{ value: string }>;
    for (const row of rows) {
      const key = row.value.slice(PUBLIC_MEDIA_PREFIX.length);
      try {
        assertMediaObjectKey(key);
        addReference(
          references,
          "public",
          key,
          mediaMime(key),
          `${source.table}.${source.column}`,
        );
      } catch {
        invalidReferenceCount += 1;
      }
    }
  }

  for (const source of JSON_DOCUMENT_COLUMNS) {
    if (!tableColumns(db, source.table).has(source.column)) continue;
    const rows = db
      .prepare(`SELECT ${source.column} value FROM ${source.table}`)
      .all() as Array<{ value: string | null }>;
    for (const row of rows) {
      if (!row.value) continue;
      let document: unknown;
      try {
        document = JSON.parse(row.value);
      } catch {
        malformedDocumentCount += 1;
        continue;
      }
      visitJsonStrings(document, (value) => {
        if (!value.startsWith(PUBLIC_MEDIA_PREFIX)) return;
        const key = value.slice(PUBLIC_MEDIA_PREFIX.length);
        try {
          assertMediaObjectKey(key);
          addReference(
            references,
            "public",
            key,
            mediaMime(key),
            `${source.table}.${source.column}`,
          );
        } catch {
          invalidReferenceCount += 1;
        }
      });
    }
  }

  const attachmentColumns = tableColumns(db, "request_attachments");
  if (attachmentColumns.has("storage_key") && attachmentColumns.has("mime_type")) {
    const rows = db
      .prepare("SELECT storage_key,mime_type FROM request_attachments")
      .all() as Array<{ storage_key: string; mime_type: string }>;
    for (const row of rows) {
      try {
        assertMediaObjectKey(row.storage_key);
        addReference(
          references,
          "requests",
          row.storage_key,
          row.mime_type,
          "request_attachments.storage_key",
        );
      } catch {
        invalidReferenceCount += 1;
      }
    }
  }

  return {
    references: [...references.values()]
      .map((reference) => ({
        ...reference,
        sources: reference.sources.sort(),
      }))
      .sort((left, right) =>
        identity(left.namespace, left.key).localeCompare(
          identity(right.namespace, right.key),
        ),
      ),
    invalidReferenceCount,
    malformedDocumentCount,
  };
}

export function listLocalMediaObjects(
  publicRoot: string,
  requestRoot: string,
): LocalMediaObject[] {
  const roots: Array<{ namespace: MediaNamespace; root: string }> = [
    { namespace: "public", root: publicRoot },
    { namespace: "requests", root: requestRoot },
  ];
  const objects: LocalMediaObject[] = [];
  for (const { namespace, root } of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      try {
        assertMediaObjectKey(entry.name);
      } catch {
        continue;
      }
      const fullPath = path.join(root, entry.name);
      const bytes = fs.readFileSync(fullPath);
      objects.push({
        namespace,
        key: entry.name,
        fullPath,
        contentType: mediaMime(entry.name),
        contentLength: bytes.byteLength,
        sha256: digest(bytes),
      });
    }
  }
  return objects.sort((left, right) =>
    identity(left.namespace, left.key).localeCompare(
      identity(right.namespace, right.key),
    ),
  );
}

export function reconcileLocalMedia(
  manifest: MediaReferenceManifest,
  localObjects: LocalMediaObject[],
) {
  const expected = new Set(
    manifest.references.map((reference) =>
      identity(reference.namespace, reference.key),
    ),
  );
  const present = new Set(
    localObjects.map((object) => identity(object.namespace, object.key)),
  );
  return {
    referenced: expected.size,
    present: present.size,
    missing: [...expected].filter((key) => !present.has(key)).length,
    unreferenced: [...present].filter((key) => !expected.has(key)).length,
    invalidReferences: manifest.invalidReferenceCount,
    malformedDocuments: manifest.malformedDocumentCount,
    bytesChecked: localObjects.reduce(
      (total, object) => total + object.contentLength,
      0,
    ),
  };
}

export function mediaObjectIdentity(namespace: MediaNamespace, key: string) {
  return identity(namespace, key);
}
