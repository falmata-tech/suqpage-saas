import { runtimeAll, runtimeRun, runtimeTransaction } from "../lib/runtime-sql";
import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
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
async function main() {
  const target = new URL(process.env.MIRTPAGE_POSTGRES_URL || "");
  if (!["127.0.0.1", "localhost"].includes(target.hostname)) throw new Error("Demo updates require a local PostgreSQL target.");
  const businesses = await runtimeAll<{ id: number; handle: string; name: string; description: string }>("SELECT id,handle,name,description FROM businesses ORDER BY id");
  let updated = 0;
  await runtimeTransaction(async () => {
    for (const business of businesses) {
      if (!handles.has(business.handle)) continue;
      const video = demoProcessVideoFor(business.handle, business.name, business.description);
      await runtimeRun("UPDATE businesses SET process_video_ref=? WHERE id=?", [video.ref,business.id]);
      const products = await runtimeAll<{ id:number; name:string; category:string; description:string }>("SELECT p.id,p.name,COALESCE(c.name,'') category,p.description FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.business_id=? ORDER BY p.id",[business.id]);
      for (const product of products) await runtimeRun("UPDATE products SET video_ref=? WHERE id=?",[demoOfferingVideoFor(video,product.name,product.category,product.description).ref,product.id]);
      updated++;
    }
  });
  console.log(`Updated videos for ${updated} local demo businesses.`);
}
main().catch(error => {console.error(error instanceof Error ? error.message : "Demo update failed.");process.exitCode=1;}).finally(closePostgresRuntimeForTests);
