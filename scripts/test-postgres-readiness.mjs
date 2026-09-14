import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
const container = `suqpage-postgres-${process.pid}`;
const password = crypto.randomBytes(24).toString('hex');
function run(command,args,env=process.env,capture=false) {
  const result=spawnSync(command,args,{env,stdio:capture?'pipe':'inherit',encoding:'utf8'});
  if(result.status!==0)throw new Error(`${command} failed. Inspect the focused test output.`);
  return result.stdout?.trim()||'';
}
try {
 run('docker',['run','-d','--rm','--name',container,'-p','127.0.0.1::5432','-e','POSTGRES_USER=postgres','-e',`POSTGRES_PASSWORD=${password}`,'-e','POSTGRES_DB=postgres','postgres:17.10-alpine'],process.env,true);
 let ready=false;
 for(let attempt=0;attempt<30;attempt++){
  const check=spawnSync('docker',['exec',container,'pg_isready','-U','postgres'],{stdio:'ignore'});
  if(check.status===0){ready=true;break;}
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 if(!ready)throw new Error('Disposable PostgreSQL did not become ready.');
 const port=run('docker',['port',container,'5432/tcp'],process.env,true).match(/:(\d+)$/)?.[1];
 if(!port)throw new Error('Disposable PostgreSQL port is missing.');
 const env={...process.env,MIRTPAGE_DATABASE_DRIVER:'postgres',MIRTPAGE_TEST_POSTGRES_URL:`postgresql://postgres:${password}@127.0.0.1:${port}/postgres`};
 for(const script of ['test-native-postgres.ts','test-postgres-runtime.ts','test-launch-wiring.ts','test-security.ts','test-product-upkeep.ts','test-discovery-pagination.ts','test-account-contacts.ts','test-media-reconciliation.ts'])run(process.execPath,['--import','tsx',`scripts/${script}`],env);
 console.log('Native PostgreSQL installation, constraints, transactions and workflow gates passed.');
}finally{spawnSync('docker',['stop',container],{stdio:'ignore'});}
