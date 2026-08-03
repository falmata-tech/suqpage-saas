import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  buildMediaReferenceManifest,
  listLocalMediaObjects,
  reconcileLocalMedia,
} from "../lib/media-manifest";

const publicKey = "hero-00000000-0000-4000-8000-000000000001.webp";
const privateKey = "00000000-0000-4000-8000-000000000002.png";
const retainedKey = "product-00000000-0000-4000-8000-000000000003.jpg";
const unreferencedKey = "logo-00000000-0000-4000-8000-000000000004.png";

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-media-manifest-"));
  const publicRoot = path.join(root, "media");
  const requestRoot = path.join(publicRoot, "requests");
  fs.mkdirSync(requestRoot, { recursive: true });
  const db = new DatabaseSync(path.join(root, "manifest.db"));
  try {
    db.exec(`
      CREATE TABLE businesses(
        id INTEGER PRIMARY KEY,
        logo_path TEXT,
        hero_image_path TEXT,
        favicon_path TEXT,
        content_blocks_json TEXT,
        design_manifest_json TEXT
      );
      CREATE TABLE products(id INTEGER PRIMARY KEY,image_path TEXT);
      CREATE TABLE content_revisions(id INTEGER PRIMARY KEY,snapshot_json TEXT,recipe_metadata_json TEXT);
      CREATE TABLE published_catalog_versions(id INTEGER PRIMARY KEY,snapshot_json TEXT);
      CREATE TABLE request_attachments(storage_key TEXT,mime_type TEXT);
    `);
    db.prepare("INSERT INTO businesses VALUES(1,'',?,'',?,?)").run(
      `/media/${publicKey}`,
      JSON.stringify({ imageRef: `/media/${publicKey}` }),
      JSON.stringify({ sections: [{ media: `/media/${retainedKey}` }] }),
    );
    db.prepare("INSERT INTO products VALUES(1,?)").run(`/media/${publicKey}`);
    db.prepare("INSERT INTO content_revisions VALUES(1,?,?)").run(
      JSON.stringify({ imageRef: `/media/${retainedKey}` }),
      "{}",
    );
    db.prepare("INSERT INTO published_catalog_versions VALUES(1,?)").run("{}");
    db.prepare("INSERT INTO request_attachments VALUES(?,?)").run(privateKey, "image/png");

    fs.writeFileSync(path.join(publicRoot, publicKey), "public");
    fs.writeFileSync(path.join(publicRoot, retainedKey), "retained");
    fs.writeFileSync(path.join(requestRoot, privateKey), "private");
    fs.writeFileSync(path.join(publicRoot, unreferencedKey), "orphan");

    const manifest = buildMediaReferenceManifest(db);
    assert.equal(manifest.references.length, 3, "references are deduplicated across live and retained data");
    const complete = reconcileLocalMedia(
      manifest,
      listLocalMediaObjects(publicRoot, requestRoot),
    );
    assert.deepEqual(
      {
        referenced: complete.referenced,
        present: complete.present,
        missing: complete.missing,
        unreferenced: complete.unreferenced,
      },
      { referenced: 3, present: 4, missing: 0, unreferenced: 1 },
    );

    fs.rmSync(path.join(publicRoot, retainedKey));
    assert.equal(
      reconcileLocalMedia(
        manifest,
        listLocalMediaObjects(publicRoot, requestRoot),
      ).missing,
      1,
      "missing retained media fails reconciliation",
    );
    console.log("Database-derived public, private, retained, missing, and unreferenced media reconciliation passed.");
  } finally {
    db.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main();
