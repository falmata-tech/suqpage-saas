import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-rich-offering-"));
  process.env.MIRTPAGE_DB_PATH = path.join(root, "rich-offering.db");
  try {
    const { closeDbForTests, getDb } = await import("../lib/db");
    const db = getDb();
    const businessColumns = new Set(
      (db.prepare("PRAGMA table_info(businesses)").all() as Array<{ name: string }>).map(
        (column) => column.name,
      ),
    );
    const productColumns = new Set(
      (db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>).map(
        (column) => column.name,
      ),
    );
    for (const column of ["process_video_ref", "is_live", "live_platform", "live_url"]) {
      assert(businessColumns.has(column));
    }
    for (const column of [
      "video_ref",
      "price_minor",
      "currency",
      "quantity_unit",
      "highlights_json",
    ]) {
      assert(productColumns.has(column));
    }
    assert.equal(
      db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=24").get()
        ?.count,
      1,
    );
    assert.throws(() =>
      db.prepare(
        "INSERT INTO businesses(handle,name,design_key,live_platform) VALUES('bad-live','Bad Live','composition','unsupported')",
      ).run(),
    );
    closeDbForTests();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main()
  .then(() => console.log("Rich offering additive migration and constraints passed."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
