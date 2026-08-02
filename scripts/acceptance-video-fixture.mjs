import { DatabaseSync } from "node:sqlite";

const [, , databasePath, handle = "selam-weave"] = process.argv;
if (!databasePath) {
  console.error("Usage: acceptance-video-fixture.mjs <database> [handle]");
  process.exit(2);
}

const database = new DatabaseSync(databasePath);
try {
  const row = database
    .prepare("SELECT id FROM businesses WHERE handle=?")
    .get(handle);
  if (!row) throw new Error(`Business ${handle} not found.`);
  database
    .prepare("UPDATE businesses SET process_video_ref=? WHERE id=?")
    .run("youtube:wJV9EDe_sFc", row.id);
  process.stdout.write(JSON.stringify({ handle, updated: true }));
} finally {
  database.close();
}
