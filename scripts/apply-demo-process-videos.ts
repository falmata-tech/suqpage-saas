import { DatabaseSync } from "node:sqlite";
import { databasePath } from "../lib/config";
import { demoOfferingVideoFor, demoProcessVideoFor } from "../lib/demo-process-videos";
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
  "UPDATE products SET video_ref=? WHERE id=?",
);
const productsForBusiness = database.prepare(
  `SELECT p.id,p.name,COALESCE(c.name,'') AS category,p.description
   FROM products p
   LEFT JOIN categories c ON c.id=p.category_id
   WHERE p.business_id=?
   ORDER BY p.id`,
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
    const products = productsForBusiness.all(business.id) as Array<{
      id: number;
      name: string;
      category: string;
      description: string;
    }>;
    for (const product of products) {
      const productVideo = demoOfferingVideoFor(
        video,
        product.name,
        product.category,
        product.description,
      );
      updateProducts.run(productVideo.ref, product.id);
    }
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
