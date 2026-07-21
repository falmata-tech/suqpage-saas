import { DatabaseSync } from "node:sqlite";

const [, , databasePath, probe, value] = process.argv;
const queries = {
  inquiryByCustomer: "SELECT status,contact FROM inquiries WHERE customer_name=? ORDER BY id DESC LIMIT 1",
  productStockByName: "SELECT stock_count FROM products WHERE name=? ORDER BY id DESC LIMIT 1",
  deliveryByAddress: "SELECT status FROM delivery_requests WHERE delivery_address=? ORDER BY id DESC LIMIT 1",
};

if (!databasePath || !value || !Object.hasOwn(queries, probe)) {
  console.error("Invalid acceptance database probe.");
  process.exit(2);
}

const database = new DatabaseSync(databasePath, { readOnly: true });
try {
  const row = database.prepare(queries[probe]).get(value) ?? null;
  process.stdout.write(JSON.stringify(row));
} finally {
  database.close();
}
