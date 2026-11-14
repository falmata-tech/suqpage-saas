import fs from 'node:fs';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {nativeQaDatabaseUrl,nativeQaSchema} from './native-qa-target';
import {getDb,seedFixture,closeDbForTests} from './testing/postgres-fixture';

async function checkBackend(){
 const started=Date.now();let status='waiting_fixture';
 while(Date.now()-started<120000){
  try{
   const fixture=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
   nativeQaSchema(fixture.schema);
   if(!/^[a-z0-9-]{3,80}$/.test(fixture.handle))throw Error('Invalid QA handle.');
   const response=await fetch(`http://127.0.0.1:3000/api/mobile/v1/shops/${fixture.handle}`,{signal:AbortSignal.timeout(5000)});
   status=`http_${response.status}`;
   if(response.ok){
    const shop=await response.json();
    if(shop.id!==fixture.businessId||shop.isDemo!==true||!Array.isArray(shop.products)||
       !shop.products.some((p:{id:number;options:unknown[]})=>p.id===fixture.productId&&Array.isArray(p.options)&&p.options.length===0))
      {status='invalid_projection';throw Error('QA public projection does not match its fixture.');}
    fs.writeFileSync('.local/native-qa/evidence/backend-preflight.json',JSON.stringify({result:'passed',elapsedMs:Date.now()-started,source:fixture.source})+'\n');
    console.log('PASS disposable native QA API is ready before Android compilation.');return;
   }
  }catch{if(status==='invalid_projection')break;status=status.startsWith('http_')?status:'transport_or_fixture_unavailable';}
  await new Promise(resolve=>setTimeout(resolve,1000));
 }
 fs.writeFileSync('.local/native-qa/evidence/backend-preflight.json',JSON.stringify({result:'failed',category:status,elapsedMs:Date.now()-started})+'\n');
 throw Error('Disposable native QA API preflight failed before compilation.');
}
async function main(){
nativeQaDatabaseUrl();
if(process.argv.includes('--check'))return checkBackend();
const root=path.resolve('.local/native-qa');
fs.mkdirSync(root,{recursive:true,mode:0o700});
Object.assign(process.env,{SUQPAGE_MEDIA_ROOT:path.join(root,'media'),SUQPAGE_BACKUP_ROOT:path.join(root,'backups'),
 SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem',SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT:'1',
 PRIVACY_SALT:'native-qa-disposable-privacy-salt',SUQPAGE_DEMO_INQUIRY_PHONE:''});
await seedFixture();
const db=await getDb();
const schema=nativeQaSchema((await db.prepare('SELECT current_schema() name').get()).name);
const product=await db.prepare(`SELECT p.id,p.name,b.id business_id,b.handle,b.name business_name FROM products p
 JOIN businesses b ON b.id=p.business_id WHERE b.status='active' AND b.is_demo=1 AND p.is_published=1
 AND p.availability IN ('available','limited') AND p.offering_kind<>'service'
 AND b.handle='demo-liya-soap-kitchen' AND p.name='Oat Everyday Bar'
 AND NOT EXISTS(SELECT 1 FROM option_groups o WHERE o.product_id=p.id) ORDER BY b.id,p.id LIMIT 1`).get();
if(!product)throw Error('Native QA needs a published demo product without required options.');
const manifest={schema,source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),businessId:Number(product.business_id),handle:product.handle,
 businessName:product.business_name,productId:Number(product.id),productName:product.name,
 initialInquiries:Number((await db.prepare('SELECT count(*) total FROM inquiries').get()).total)};
fs.writeFileSync(path.join(root,'fixture.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','0.0.0.0','--port','3000'],{
 env:{...process.env,NODE_ENV:'development',NEXT_TELEMETRY_DISABLED:'1',
  SUQPAGE_POSTGRES_DIRECT_URL:process.env.SUQPAGE_POSTGRES_URL,
  SUQPAGE_CANONICAL_URL:'http://127.0.0.1:3000',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3000',
  SUQPAGE_NEXT_DIST_DIR:'.next'},stdio:'inherit'});
let stopping=false;
async function stop(){if(stopping)return;stopping=true;child.kill('SIGTERM');await closeDbForTests();}
process.once('SIGTERM',()=>{void stop().finally(()=>process.exit(0));});
process.once('SIGINT',()=>{void stop().finally(()=>process.exit(0));});
child.once('exit',code=>{void stop().finally(()=>process.exit(code||0));});
}
void main().catch(error=>{console.error(error instanceof Error?error.message:'Native QA backend failed.');process.exitCode=1;});
