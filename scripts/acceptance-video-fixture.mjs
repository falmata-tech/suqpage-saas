import pg from "pg";

const [, , handle = "selam-weave"] = process.argv;
if (!process.env.MIRTPAGE_POSTGRES_URL) {
  console.error("MIRTPAGE_POSTGRES_URL is required for the acceptance video fixture.");
  process.exit(2);
}

const database = new pg.Client({ connectionString: process.env.MIRTPAGE_POSTGRES_URL });
try {
  await database.connect();
  const row = (await database.query("SELECT id FROM businesses WHERE handle=$1", [handle])).rows[0];
  if (!row) throw new Error(`Business ${handle} not found.`);
  await database.query("UPDATE businesses SET process_video_ref=$1 WHERE id=$2", ["youtube:wJV9EDe_sFc", row.id]);
  process.stdout.write(JSON.stringify({ handle, updated: true }));
} finally {
  await database.end();
}
