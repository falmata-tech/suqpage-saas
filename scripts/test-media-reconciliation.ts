import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getEmptyDb, closeDbForTests } from "./testing/postgres-fixture";
import { buildRuntimeMediaReferenceManifest, listLocalMediaObjects, reconcileLocalMedia, } from "../lib/media-manifest";
const publicKey = "hero-00000000-0000-4000-8000-000000000001.webp";
const privateKey = "00000000-0000-4000-8000-000000000002.png";
const supportKey = "support-00000000-0000-4000-8000-000000000005.pdf";
const retainedKey = "product-00000000-0000-4000-8000-000000000003.jpg";
const unreferencedKey = "logo-00000000-0000-4000-8000-000000000004.png";
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-media-manifest-"));
    const publicRoot = path.join(root, "media");
    const requestRoot = path.join(publicRoot, "requests");
    const supportRoot = path.join(publicRoot, "support");
    fs.mkdirSync(requestRoot, { recursive: true });
    fs.mkdirSync(supportRoot, { recursive: true });
    const db = await getEmptyDb();
    try {
        await db.exec(`
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
      CREATE TABLE support_attachments(storage_key TEXT,mime_type TEXT);
    `);
        await db.prepare("INSERT INTO businesses VALUES(1,'',?,'',?,?)").run(`/media/${publicKey}`, JSON.stringify({ imageRef: `/media/${publicKey}` }), JSON.stringify({ sections: [{ media: `/media/${retainedKey}` }] }));
        await db.prepare("INSERT INTO products VALUES(1,?)").run(`/media/${publicKey}`);
        await db.prepare("INSERT INTO content_revisions VALUES(1,?,?)").run(JSON.stringify({ imageRef: `/media/${retainedKey}` }), "{}");
        await db.prepare("INSERT INTO published_catalog_versions VALUES(1,?)").run("{}");
        await db.prepare("INSERT INTO request_attachments VALUES(?,?)").run(privateKey, "image/png");
        await db.prepare("INSERT INTO support_attachments VALUES(?,?)").run(supportKey, "application/pdf");
        fs.writeFileSync(path.join(publicRoot, publicKey), "public");
        fs.writeFileSync(path.join(publicRoot, retainedKey), "retained");
        fs.writeFileSync(path.join(requestRoot, privateKey), "private");
        fs.writeFileSync(path.join(supportRoot, supportKey), "%PDF-1.7\n%%EOF");
        fs.writeFileSync(path.join(publicRoot, unreferencedKey), "orphan");
        const manifest = await buildRuntimeMediaReferenceManifest();
        assert.equal(manifest.references.length, 4, "references are deduplicated across public, request, support, and retained data");
        const complete = reconcileLocalMedia(manifest, listLocalMediaObjects(publicRoot, requestRoot, supportRoot));
        assert.deepEqual({
            referenced: complete.referenced,
            present: complete.present,
            missing: complete.missing,
            unreferenced: complete.unreferenced,
        }, { referenced: 4, present: 5, missing: 0, unreferenced: 1 });
        fs.rmSync(path.join(publicRoot, retainedKey));
        assert.equal(reconcileLocalMedia(manifest, listLocalMediaObjects(publicRoot, requestRoot, supportRoot)).missing, 1, "missing retained media fails reconciliation");
        const pagesRoot = path.join(requestRoot, 'pages');
        fs.mkdirSync(pagesRoot, { recursive: true });
        const draftKey = 'page-1-00000000-0000-4000-8000-000000000006.png', publishedKey = 'page-1-00000000-0000-4000-8000-000000000007.png', productKey = 'product-private-1-00000000-0000-4000-8000-000000000008.png';
        await db.exec('CREATE TABLE owner_page_drafts(content_json TEXT); CREATE TABLE owner_page_publications(content_json TEXT)');
        await db.prepare('INSERT INTO owner_page_drafts VALUES(?)').run(JSON.stringify({ heroImage: `/api/page-drafts/1/media/${draftKey}` }));
        await db.prepare('INSERT INTO owner_page_publications VALUES(?)').run(JSON.stringify({ heroImage: `/api/page-drafts/1/media/${publishedKey}` }));
        await db.prepare('INSERT INTO products VALUES(2,?)').run(`/media/${productKey}`);
        for (const key of [draftKey, publishedKey, productKey])
            fs.writeFileSync(path.join(pagesRoot, key), 'private fixture');
        const pages = await buildRuntimeMediaReferenceManifest();
        assert.equal(pages.references.filter(r => r.namespace === 'pages').length, 3);
        assert.ok(!pages.references.some(r => r.key === productKey && r.namespace === 'public'));
        assert.equal(reconcileLocalMedia(pages, listLocalMediaObjects(publicRoot, requestRoot, supportRoot)).missing, 1, 'only the deliberately removed legacy object is missing');
        await db.prepare('INSERT INTO owner_page_drafts VALUES(?)').run(JSON.stringify({ heroImage: `/api/page-drafts/2/media/${draftKey}` }));
        assert.equal((await buildRuntimeMediaReferenceManifest()).invalidReferenceCount, 1, 'foreign route/key pair rejected');
        console.log("Database-derived public, private, retained, missing, and unreferenced media reconciliation passed.");
    }
    finally {
        await closeDbForTests();
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
