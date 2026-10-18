import assert from "node:assert/strict";
import fs from "node:fs";
import { platformEnvironment } from "../lib/platform-environment.mjs";
import { platformCookie, platformCookies, readPlatformState, type BrowserStateStore } from "../lib/platform-state";
import { platformAssetRewrites } from "../lib/platform-assets";
import { postgresRuntimeConfig } from "../lib/postgres-runtime";
import { trustedOriginPolicy } from "../lib/trusted-origins";
import { migratePostgresDatabase } from "../lib/postgres-migrations";
import { PLATFORM_BRAND } from "../lib/brand";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";

class Store implements BrowserStateStore {
  values = new Map<string,string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string,value: string) { this.values.set(key,value); }
  removeItem(key: string) { this.values.delete(key); }
}
async function main() {
// FE-070 presentation identity does not rename persisted/provider namespaces.
assert.equal(PLATFORM_BRAND.name, "MirtPage", "The current public platform identity is MirtPage");
assert.equal(PLATFORM_BRAND.wordmark.leading + PLATFORM_BRAND.wordmark.trailing, PLATFORM_BRAND.name, "The visible wordmark retains the canonical name and case");
const legacyEnvironment = { MIRTPAGE_DATABASE_DRIVER:"postgres", MIRTPAGE_POSTGRES_URL:"postgresql://fixture:fixture@127.0.0.1:54322/postgres", MIRTPAGE_AUTH_DRIVER:"supabase", MIRTPAGE_EMAIL_OTP_ENABLED:"1", NEXT_PUBLIC_MIRTPAGE_PWA_ENABLED:"false", MIRTPAGE_SERVER_ACTION_ORIGINS:"old-proxy.example.test" };
const normalized = platformEnvironment(legacyEnvironment);
assert.equal(normalized.SUQPAGE_POSTGRES_URL,legacyEnvironment.MIRTPAGE_POSTGRES_URL);
assert.equal(normalized.NEXT_PUBLIC_SUQPAGE_PWA_ENABLED,"false");
assert.equal(postgresRuntimeConfig(legacyEnvironment)?.connectionString,legacyEnvironment.MIRTPAGE_POSTGRES_URL);
assert.ok(trustedOriginPolicy({...legacyEnvironment,NODE_ENV:"production"}).serverActionHosts.includes("old-proxy.example.test"));
assert.equal(platformEnvironment({...legacyEnvironment,SUQPAGE_EMAIL_OTP_ENABLED:"0"}).SUQPAGE_EMAIL_OTP_ENABLED,"0");
assert.equal(platformEnvironment({...legacyEnvironment,SUQPAGE_POSTGRES_URL:""}).SUQPAGE_POSTGRES_URL,"");
assert.ok(!("SUQPAGE_POSTGRES_URL" in legacyEnvironment),"Normalization never mutates its source or credential values");
for (const kind of ["session","visitor","support"] as const) {
  const names=platformCookies[kind];const legacy={get:(key:string)=>key===names.legacy?{value:"retained-token"}:undefined};
  assert.equal(platformCookie(legacy,kind),"retained-token");
  assert.equal(platformCookie({get:key=>({value:key===names.current?"new-token":"old-token"})},kind),"new-token");
}
const store=new Store();store.setItem("mirtpage-cart:shop-one",'["saved"]');store.setItem("mirtpage-cart:shop-two",'["other"]');
assert.equal(readPlatformState(store,"suqpage-cart:shop-one"),'["saved"]');assert.equal(store.getItem("mirtpage-cart:shop-one"),null);assert.equal(store.getItem("mirtpage-cart:shop-two"),'["other"]');
store.setItem("suqpage-cart:shop-one","[]");store.setItem("mirtpage-cart:shop-one",'["stale"]');assert.equal(readPlatformState(store,"suqpage-cart:shop-one"),"[]");
store.setItem("mirtpage-cart:shop-one:private-preview",'["private"]');assert.equal(readPlatformState(store,"suqpage-cart:shop-one:private-preview"),null);
assert.equal(readPlatformState({getItem:()=>{throw Error("blocked");},setItem(){},removeItem(){}},"suqpage-cart:shop-one"),null);
let removed=false;assert.equal(readPlatformState({getItem:key=>key.startsWith("mirtpage")?"saved":null,setItem(){throw Error("quota");},removeItem(){removed=true;}},"suqpage-cart:shop-one"),"saved");assert.equal(removed,false);
for(const suffix of ["discovery-navigation:v2","last-marketplace-url:v1"]){store.setItem("mirtpage:"+suffix,"/search");assert.equal(readPlatformState(store,"suqpage:"+suffix),"/search");}
for(const route of platformAssetRewrites){assert.ok(fs.existsSync("public"+route.destination));assert.ok(!route.source.includes(".."));}
// Audit unreviewed previous brands in active source, with bounded compatibility adapters.
const compatibilityFiles = new Set([
  'lib/platform-environment.mjs', 'lib/platform-state.ts', 'lib/platform-assets.ts',
  'components/PwaRegistration.tsx', 'lib/postgres-migrations.ts',
]);
function auditDirectory(directory: string) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) { auditDirectory(file); continue; }
    if (!/\.(?:tsx?|mjs)$/.test(file) || compatibilityFiles.has(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const reviewed = file === 'lib/config.ts' ? source.replaceAll('mirtpage-media', 'retained-bucket') : source;
    assert.doesNotMatch(reviewed, /africmade|africpage/i, `Unexpected unreviewed previous platform name in ${file}`);
  }
}
for (const directory of ['app', 'components', 'lib']) auditDirectory(directory);
assert.doesNotMatch(fs.readFileSync('proxy.ts','utf8'), /process\.env\.SUQPAGE_/, 'The root proxy must use the environment compatibility boundary');
assert.ok(fs.existsSync('SUQPAGE-MASTER-PROMPT.md'));
assert.ok(!fs.existsSync('MIRTPAGE-MASTER-PROMPT.md'));
const cdnRules = fs.readFileSync('public/_redirects', 'utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#'));
assert.deepEqual(cdnRules, platformAssetRewrites.map(route => `${route.source} ${route.destination} 200`), 'Netlify static aliases must match the bounded Next mappings exactly');
const auth=fs.readFileSync("lib/auth.ts","utf8");assert.match(auth,/new Set\(\[jar\.get\(COOKIE\)\?\.value, jar\.get\(platformCookies\.session\.legacy\)\?\.value\]\)/);assert.match(auth,/for \(const token of tokens\)[\s\S]*revokeByToken/);
const db=await getDb();
try {
  const schema=(await db.prepare("SELECT current_schema() name").get()).name as string;
  await db.prepare("INSERT INTO businesses(name,handle,design_key) VALUES(?,?,?)").run("AfricMade tenant-owned label","retained-naming-fixture","composition");
  await db.prepare("UPDATE business_subscriptions SET plan_name='MirtPage monthly'").run();
  await db.prepare("INSERT INTO business_subscriptions(business_id,plan_name,currency,starts_at,current_period_start,current_period_end,grace_ends_at,updated_at) SELECT id,'MirtPage monthly','ETB',1,1,2,3,1 FROM businesses").run();
  const custom = await db.prepare("INSERT INTO businesses(name,handle,design_key) VALUES('Custom plan shop','custom-plan-fixture','composition')").run();
  await db.prepare("INSERT INTO business_subscriptions(business_id,plan_name,amount_minor,currency,starts_at,current_period_start,current_period_end,grace_ends_at,updated_at) VALUES(?,'My negotiated plan',12345,'ETB',1,1,2,3,1)").run(custom.insertedId);
  const subscriptions = await db.prepare("SELECT * FROM business_subscriptions ORDER BY business_id").all();
  const before=await db.prepare("SELECT * FROM businesses ORDER BY id").all();
  await db.runner.query("DELETE FROM schema_migrations WHERE version IN (44,45,60)");
  await db.runner.query("ALTER TABLE support_conversations ALTER COLUMN requester_label SET DEFAULT 'AfricMade client'");
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[44,45,60]);
  assert.match(String((await db.prepare("SELECT column_default FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='support_conversations' AND column_name='requester_label'").get()).column_default),/Suqpage client/);
  assert.deepEqual(await db.prepare("SELECT * FROM businesses ORDER BY id").all(),before);
  assert.deepEqual(await db.prepare("SELECT * FROM business_subscriptions ORDER BY business_id").all(), subscriptions.map(row => ({...row, plan_name:row.plan_name==='MirtPage monthly'?'Suqpage monthly':row.plan_name})));
  const inserted=await db.prepare("INSERT INTO businesses(name,handle,design_key) VALUES('New shop','new-naming-fixture','composition')").run();
  assert.equal(await db.prepare("SELECT 1 FROM business_subscriptions WHERE business_id=?").get(inserted.insertedId),undefined,'renaming historical plans never resumes retired subscriptions');
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
} finally { await closeDbForTests(); }
console.log("PASS canonical/legacy environment precedence, cookie continuity/logout, tenant cart/navigation migration, asset compatibility and PostgreSQL 44–45 data preservation.");

}
main().catch(error => { console.error(error); process.exitCode=1; });
