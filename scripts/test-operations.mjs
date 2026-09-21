import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-ops-'));
const container=`supabase_db_suqpage_ops_${process.pid}`;
const password=crypto.randomBytes(24).toString('hex');
let pool;
function run(command,args,env=process.env,allowFailure=false){const r=spawnSync(command,args,{env,encoding:'utf8'});if(!allowFailure&&r.status!==0)throw new Error(`${command} operation failed: ${(r.stderr||'').slice(-2000)}`);return r;}
try{
 run('docker',['run','-d','--rm','--name',container,'-p','127.0.0.1::5432','-e',`POSTGRES_PASSWORD=${password}`,'postgres:17.10-alpine']);
 let ready=false;for(let n=0;n<30;n++){if(run('docker',['exec',container,'pg_isready','-U','postgres'],process.env,true).status===0){ready=true;break;}await new Promise(r=>setTimeout(r,500));}assert.ok(ready);
 const port=run('docker',['port',container,'5432/tcp']).stdout.trim().match(/:(\d+)$/)?.[1];assert.ok(port);
 const url=`postgresql://postgres:${password}@127.0.0.1:${port}/postgres`;
 pool=new pg.Pool({connectionString:url,max:1});
 await pool.query("CREATE TABLE public.archive_fixture(id integer PRIMARY KEY, value text NOT NULL); INSERT INTO public.archive_fixture VALUES(1,'preserved')");
 await pool.query('INSERT INTO public.archive_fixture VALUES(2,$1)',[crypto.randomBytes(512*1024).toString('hex')]);
 await pool.query("CREATE FUNCTION public.archive_fixture_guard() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$; CREATE TRIGGER archive_fixture_guard BEFORE UPDATE ON public.archive_fixture FOR EACH ROW EXECUTE FUNCTION public.archive_fixture_guard()");
 const env={...process.env,SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_DIRECT_URL:url,SUQPAGE_BACKUP_ROOT:root,SUQPAGE_LOCAL_PG_CONTAINER:container};
 const script=(file,args=[],extra={},fail=false)=>run(process.execPath,['--import','tsx',`scripts/${file}`,...args],{...env,...extra},fail);
 script('backup.ts');const directory=fs.readdirSync(root).find(n=>fs.existsSync(path.join(root,n,'postgres.dump')));assert.ok(directory);const from=path.join(root,directory);
 const archive=fs.readFileSync(path.join(from,'postgres.dump'));assert.equal(archive.subarray(0,5).toString(),'PGDMP');assert.equal(fs.statSync(path.join(from,'postgres.dump')).mode&0o777,0o600);
 const originalPlan=script('restore.ts',[`--from=${from}`]);const sourceDigest=originalPlan.stdout.match(/Target digest: ([a-f0-9]{64})/)?.[1];assert.ok(sourceDigest);
 assert.notEqual(script('restore.ts',[`--from=${from}`,'--execute'],{},true).status,0,'approval is required');
 assert.notEqual(script('restore.ts',[`--from=${from}`,'--execute'],{SUQPAGE_APPROVE_POSTGRES_RESTORE:sourceDigest},true).status,0,'populated target cannot be replaced');
 assert.equal((await pool.query('SELECT value FROM archive_fixture WHERE id=1')).rows[0].value,'preserved');
 await pool.query('CREATE DATABASE suqpage_restore_test');
 const restoreTarget=new URL(url);restoreTarget.pathname='/suqpage_restore_test';const restoreUrl=restoreTarget.href;const overrides={SUQPAGE_POSTGRES_DIRECT_URL:restoreUrl};
 const plan=script('restore.ts',[`--from=${from}`],overrides);const digest=plan.stdout.match(/Target digest: ([a-f0-9]{64})/)?.[1];assert.ok(digest);
 script('restore.ts',[`--from=${from}`,'--execute'],{...overrides,SUQPAGE_APPROVE_POSTGRES_RESTORE:digest});
 const restored=new pg.Pool({connectionString:restoreUrl,max:1});try{assert.equal((await restored.query('SELECT value FROM archive_fixture WHERE id=1')).rows[0].value,'preserved');}finally{await restored.end();}
 const originalMetadata=JSON.parse(fs.readFileSync(path.join(from,'backup.json'),'utf8'));
 const truncated=archive.subarray(0,Math.floor(archive.length/2));
 fs.writeFileSync(path.join(from,'postgres.dump'),truncated);
 fs.writeFileSync(path.join(from,'backup.json'),JSON.stringify({...originalMetadata,databaseBytes:truncated.length,databaseSha256:crypto.createHash('sha256').update(truncated).digest('hex')}));
 const truncatedPlan=script('restore.ts',[`--from=${from}`],overrides,true);
 assert.notEqual(truncatedPlan.status,0,'matching manifest cannot admit a truncated data payload');
 assert.match(truncatedPlan.stderr,/archive validation failed/);
 fs.writeFileSync(path.join(from,'postgres.dump'),archive);fs.writeFileSync(path.join(from,'backup.json'),JSON.stringify(originalMetadata));
 const metadata=JSON.parse(fs.readFileSync(path.join(from,'backup.json'),'utf8'));metadata.databaseSha256='tampered';fs.writeFileSync(path.join(from,'backup.json'),JSON.stringify(metadata));assert.notEqual(script('restore.ts',[`--from=${from}`],overrides,true).status,0,'tampering fails closed');
 console.log('PostgreSQL archive privacy, integrity, explicit target approval, populated-target denial and isolated restore passed.');
}finally{await pool?.end();spawnSync('docker',['stop',container],{stdio:'ignore'});fs.rmSync(root,{recursive:true,force:true});}
