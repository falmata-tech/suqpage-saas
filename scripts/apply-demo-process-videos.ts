import { DatabaseSync } from "node:sqlite";
import { databasePath } from "../lib/config";
import { demoProcessVideoFor } from "../lib/demo-process-videos";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";

const benchmarkHandles = [
  "selam-weave",
  "afia-botanics",
  "warka-furniture",
  "addis-metalworks",
  "green-terrace-farm",
  "blue-nile-apiary",
  "rift-valley-mill",
  "entoto-ceramics",
  "koba-leather",
  "nova-assembly",
];
const handles = new Set([
  ...benchmarkHandles,
  ...SCALE_DEMO_BUSINESSES.map((business) => business.handle),
]);
const database = new DatabaseSync(databasePath());
const businesses = database
  .prepare("SELECT id,handle,name,description FROM businesses ORDER BY id")
  .all() as Array<{ id: number; handle: string; name: string; description: string }>;
const updateBusiness = database.prepare(
  "UPDATE businesses SET process_video_ref=? WHERE id=?",
);
const updateProducts = database.prepare(
  "UPDATE products SET video_ref=? WHERE business_id=?",
);

let updated = 0;
database.exec("BEGIN IMMEDIATE");
try {
  for (const business of businesses) {
    if (!handles.has(business.handle)) continue;
    const video = demoProcessVideoFor(
      business.handle,
      business.name,
      business.description,
    );
    updateBusiness.run(video.ref, business.id);
    updateProducts.run(video.ref, business.id);
    updated += 1;
  }
  database.exec("COMMIT");
} catch (error) {
  database.exec("ROLLBACK");
  throw error;
} finally {
  database.close();
}

console.log(`Applied relevant process videos to ${updated} demo showrooms.`);
