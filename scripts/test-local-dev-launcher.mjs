import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-dev-launcher-'));
const source = path.resolve('scripts/start-local-dev.mjs');
const launcher = path.join(root,'launcher.mjs');
fs.writeFileSync(launcher, `import { launchLocalDev } from ${JSON.stringify('file://'+source)}; await launchLocalDev(async()=>{});`);
const base = {
  SUQPAGE_DATABASE_DRIVER:'postgres', SUQPAGE_AUTH_DRIVER:'supabase', SUQPAGE_MEDIA_DRIVER:'supabase',
  SUQPAGE_POSTGRES_URL:'postgresql://fixture:fixture@127.0.0.1:54322/postgres',
  SUQPAGE_SUPABASE_URL:'http://127.0.0.1:54321', NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',
};
try {
  fs.mkdirSync(path.join(root,'.local'));
  fs.mkdirSync(path.join(root,'node_modules/next/dist/bin'),{recursive:true});
  fs.writeFileSync(path.join(root,'node_modules/next/dist/bin/next'),`console.log(JSON.stringify({args:process.argv.slice(2),driver:process.env.SUQPAGE_DATABASE_DRIVER,origin:process.env.SUQPAGE_CANONICAL_URL,publicOrigin:process.env.NEXT_PUBLIC_APP_URL}));`);
  const run=(args=[],settings=base,environment={})=>{
    fs.writeFileSync(path.join(root,'.local/supabase-runtime.env'),Object.entries(settings).map(([k,v])=>`${k}=${v}`).join('\n'),{mode:0o600});
    return spawnSync(process.execPath,[launcher,...args],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH,...environment}});
  };
  let result=run(['--hostname','127.0.0.1','--port','3102'],base,{PORT:'3001'});
  assert.equal(result.status,0,result.stderr);
  assert.deepEqual(JSON.parse(result.stdout),{args:['dev','--hostname','127.0.0.1','--port','3102'],driver:'postgres',origin:'http://127.0.0.1:3102',publicOrigin:'http://127.0.0.1:3102'});
  assert.equal(JSON.parse(run([],base,{PORT:'3101'}).stdout).origin,'http://127.0.0.1:3101');
  assert.equal(JSON.parse(run().stdout).origin,'http://127.0.0.1:3000');
  assert.equal(JSON.parse(run(['--port=3102','--hostname=localhost']).stdout).origin,'http://localhost:3102');
  for (const [args,settings,message] of [
    [['--port','abc'],base,/PORT must/], [['--port','70000'],base,/PORT must/],
    [['--hostname','0.0.0.0'],base,/loopback/], [['--port'],base,/value is required/],
    [[],{...base,SUQPAGE_DATABASE_DRIVER:'invalid'},/requires SUQPAGE_DATABASE_DRIVER=postgres/],
    [[],{...base,SUQPAGE_POSTGRES_URL:'postgresql://secret:do-not-print@remote.example.test:54322/postgres'},/local Supabase loopback/],
    [[],{...base,NEXT_PUBLIC_SUPABASE_URL:'https://remote.example.test:54321'},/local Supabase loopback/],
  ]) {
    result=run(args,settings);assert.notEqual(result.status,0);assert.equal(result.stdout,'');assert.match(result.stderr,message);assert.doesNotMatch(result.stderr,/do-not-print/);
  }
  fs.rmSync(path.join(root,'.local/supabase-runtime.env'));
  result=spawnSync(process.execPath,[launcher],{cwd:root,encoding:'utf8',env:{PATH:process.env.PATH}});
  assert.notEqual(result.status,0);assert.match(result.stderr,/local:supabase:configure/);
  console.log('PASS local runtime loading, CLI/PORT precedence, matching origin, missing-config guidance and pre-spawn target rejection.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
