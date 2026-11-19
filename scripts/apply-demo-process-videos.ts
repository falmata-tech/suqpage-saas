import { runtimeAll, runtimeRun, runtimeTransaction } from "../lib/runtime-sql";
import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
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
async function main() {
  const target = new URL(process.env.SUQPAGE_POSTGRES_URL || "");
  if (!["127.0.0.1", "localhost"].includes(target.hostname)) throw new Error("Demo updates require a local PostgreSQL target.");
  const businesses = await runtimeAll<{ id: number; handle: string; name: string; description: string }>("SELECT id,handle,name,description FROM businesses WHERE is_demo=1 AND status='active' ORDER BY id");
  let updated = 0;
  await runtimeTransaction(async () => {
    for (const business of businesses) {
      if (!handles.has(business.handle)) continue;
      const video = demoProcessVideoFor(business.handle);
      if (!video.ref) continue;
      await runtimeRun("UPDATE businesses SET process_video_ref=? WHERE id=? AND is_demo=1 AND status='active'", [video.ref,business.id]);
      await runtimeRun("UPDATE products SET video_ref=? WHERE business_id=? AND is_published=1 AND EXISTS(SELECT 1 FROM businesses b WHERE b.id=products.business_id AND b.is_demo=1 AND b.status='active')", [video.ref, business.id]);
      updated++;
    }
  });
  console.log(`Updated videos for ${updated} local demo businesses.`);
}
main().catch(error => {console.error(error instanceof Error ? error.message : "Demo update failed.");process.exitCode=1;}).finally(closePostgresRuntimeForTests);
