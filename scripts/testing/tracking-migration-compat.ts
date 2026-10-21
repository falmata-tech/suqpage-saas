import assert from 'node:assert/strict';
import type {FixtureDatabase} from './postgres-fixture';
/** Historical migration rehearsals may remove only the new EMPTY isolated tables. */
export async function removeEmptyTrackingSchema(db:FixtureDatabase){
 assert.match((await db.prepare('SELECT current_schema() name').get()).name,/^suqpage_test_[a-f0-9]{32}$/);
 assert.equal((await db.prepare('SELECT MAX(version) version FROM schema_migrations').get()).version,77);
 const tables=['tracking_email_deliveries','tracking_events','tracking_shipments','tracking_sessions','tracking_challenges','tracking_recipients'];
 for(const table of tables)assert.equal((await db.prepare(`SELECT COUNT(*) n FROM ${table}`).get()).n,0,'Historical migration fixtures cannot discard populated tracking data');
 for(const table of tables)await db.exec(`DROP TABLE ${table}`);
 await db.exec('DELETE FROM schema_migrations WHERE version IN (71,72,73,74,75)');
}
