import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { getDb,closeDbForTests } from './testing/postgres-fixture';
import { archiveCommand,inspectArchive } from './postgres-archive';

async function main(){
 const db=await getDb();
 try {
  const schema=String((await db.prepare('SELECT current_schema() name').get()).name);
  assert.match(schema,/^suqpage_test_/);
  await db.runner.query('CREATE TABLE archive_validation_fixture(id integer PRIMARY KEY, payload text NOT NULL)');
  // Incompressible data large enough that header-only listing cannot consume stdin.
  await db.runner.query('INSERT INTO archive_validation_fixture VALUES(1,?)',[randomBytes(512*1024).toString('hex')]);
  const target=new URL(process.env.SUQPAGE_POSTGRES_URL!);
  assert.ok(['127.0.0.1','localhost'].includes(target.hostname));
  const command=archiveCommand('pg_dump',['--format=custom','--no-owner','--no-privileges',`--schema=${schema}`,`--dbname=${target.pathname.slice(1)}`],target);
  const result=spawnSync(command.binary,command.args,{env:command.env,maxBuffer:16*1024*1024});
  assert.equal(result.status,0,'Archive fixture dump succeeds');assert.ifError(result.error);
  const archive=result.stdout;assert.ok(archive.length>256*1024);
  assert.doesNotThrow(()=>inspectArchive(archive));
  assert.throws(()=>inspectArchive(archive.subarray(0,Math.floor(archive.length/2))),/validation failed/);
  assert.throws(()=>inspectArchive(Buffer.from('invalid')),/custom-format archive/);
  console.log('PASS native full archive validation: large valid payload, truncated data rejection and invalid-format rejection.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Archive validation test failed');process.exitCode=1;});
