import pg from "pg";

const [, , probe, value] = process.argv;
const queries = {
  inquiryByCustomer: "SELECT status,contact FROM inquiries WHERE customer_name=? ORDER BY id DESC LIMIT 1",
};

if (!process.env.MIRTPAGE_POSTGRES_URL || !value || !Object.hasOwn(queries, probe)) {
  console.error("Invalid acceptance database probe.");
  process.exit(2);
}

const database = new pg.Client({ connectionString: process.env.MIRTPAGE_POSTGRES_URL });
try {
  await database.connect();
  const result = await database.query(queries[probe].replace("?", "$1"), [value]);
  const row = result.rows[0] ?? null;
  process.stdout.write(JSON.stringify(row));
} finally {
  await database.end();
}
