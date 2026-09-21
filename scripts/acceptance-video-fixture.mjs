import pg from "pg";

const [, , handle = "selam-weave"] = process.argv;
if (!process.env.SUQPAGE_POSTGRES_URL) {
  console.error("SUQPAGE_POSTGRES_URL is required for the acceptance video fixture.");
  process.exit(2);
}

if (!['127.0.0.1','localhost'].includes(new URL(process.env.SUQPAGE_POSTGRES_URL).hostname)) throw new Error('Local fixture database required.');
const database = new pg.Client({ connectionString: process.env.SUQPAGE_POSTGRES_URL });
try {
  await database.connect();
  const row = (await database.query("SELECT id FROM businesses WHERE handle=$1", [handle])).rows[0];
  if (!row) throw new Error(`Business ${handle} not found.`);
  await database.query('BEGIN');
  await database.query("UPDATE businesses SET process_video_ref=$1 WHERE id=$2", ["youtube:wJV9EDe_sFc", row.id]);
  await database.query("UPDATE owner_page_publications SET content_json=jsonb_set(content_json::jsonb,'{videoUrl}',to_jsonb($1::text))::text WHERE business_id=$2", ['https://www.youtube.com/watch?v=wJV9EDe_sFc',row.id]);
  await database.query('COMMIT');
  process.stdout.write(JSON.stringify({ handle, updated: true }));
} finally {
  await database.end();
}
