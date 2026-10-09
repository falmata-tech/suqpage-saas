const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const vm=require('node:vm');const {spawnSync}=require('node:child_process');
(async()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'suqpage-notification-config-'));
 try{
  const file=path.join(temporary,'google-services.json'),env={...process.env,SUQPAGE_MOBILE_BUILD_PROFILE:'preview',EXPO_PUBLIC_API_ORIGIN:'https://suqpage.com',SUQPAGE_MOBILE_DATA_TARGET:'production',EXPO_PUBLIC_SUPABASE_URL:'https://sjeiiqxgscuqajpgddcc.supabase.co',EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture_only',SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED:'1',SUQPAGE_GOOGLE_SERVICES_FILE:'',SUQPAGE_FIREBASE_PROJECT_ID:'suqpage'};
  const run=extra=>spawnSync(process.execPath,['scripts/validate-mobile-build.cjs'],{encoding:'utf8',env:{...env,...extra},timeout:5000});
  for(const profile of ['preview','production'])assert.notEqual(run({SUQPAGE_MOBILE_BUILD_PROFILE:profile}).status,0,'Missing Firebase source cannot claim either notification build');
  fs.writeFileSync(file,JSON.stringify({project_info:{project_id:'suqpage',project_number:'588262779708'},client:[{client_info:{mobilesdk_app_id:'1:588262779708:android:fixture',android_client_info:{package_name:'com.suqpage.app.preview'}}}]}));
  for(const profile of ['preview','production'])assert.notEqual(run({SUQPAGE_GOOGLE_SERVICES_FILE:file,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).status,0,'Legacy preview APK package rejected in both profiles');
  fs.writeFileSync(file,JSON.stringify({project_info:{project_id:'suqpage',project_number:'588262779708'},client:[{client_info:{mobilesdk_app_id:'1:588262779708:android:fixture',android_client_info:{package_name:'com.suqpage.app'}}}]}));
  for(const profile of ['preview','production'])assert.notEqual(run({SUQPAGE_GOOGLE_SERVICES_FILE:file,SUQPAGE_FIREBASE_PROJECT_ID:'other-fixture',SUQPAGE_MOBILE_BUILD_PROFILE:profile}).status,0,'Wrong Firebase project rejected in both profiles');
  for(const profile of ['preview','production'])assert.equal(run({SUQPAGE_GOOGLE_SERVICES_FILE:file,SUQPAGE_MOBILE_BUILD_PROFILE:profile}).status,0,'Both hosted profiles admit the same canonical Firebase registration');
  assert.equal(run({SUQPAGE_MOBILE_NOTIFICATIONS_ENABLED:'0'}).status,0,'Build without background capability remains explicit');
  const valid=JSON.parse(fs.readFileSync(file,'utf8'));
  const privateFixture='PRIVATE_FIXTURE_NEVER_PRINTED';
  fs.writeFileSync(file,'{"private_key":'+privateFixture+'}');
  const malformed=run({SUQPAGE_GOOGLE_SERVICES_FILE:file});
  assert.notEqual(malformed.status,0,'Malformed client JSON is rejected');
  assert.ok((malformed.stderr+malformed.stdout).includes('must be valid JSON'));
  assert.ok(!(malformed.stderr+malformed.stdout).includes(privateFixture),'JSON parser must not expose a source excerpt');
  for(const invalid of [{...valid,project_info:{project_id:'suqpage',project_number:'000'}},{...valid,private_key:'fixture-private'},{...valid,extra:{client_secret:'fixture'}},{...valid,extra:{nested:'-----BEGIN PRIVATE KEY-----fixture'}}]){fs.writeFileSync(file,JSON.stringify(invalid));assert.notEqual(run({SUQPAGE_GOOGLE_SERVICES_FILE:file}).status,0,'Wrong project number/private material rejected');}
  fs.writeFileSync(file,JSON.stringify(valid));
  for(const worker of ['public/attention-push.js','apps/mobile/public/attention-sw.js']){
   const handlers={},shown=[],opened=[];const self={location:{origin:'https://suqpage.com'},addEventListener:(kind,f)=>handlers[kind]=f,registration:{showNotification:async(...args)=>shown.push(args)},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}};
   vm.runInNewContext(fs.readFileSync(worker,'utf8'),{self,URL,console});
   let wait;const push=value=>{handlers.push({data:{json:()=>value},waitUntil:promise=>wait=promise});return wait;};
   await push({title:'Suqpage',body:'New chat message',notificationId:1,destination:{screen:'transport-chat'},silent:true});assert.equal(shown.length,1);assert.equal(shown[0][1].silent,true);
   await push({title:'Forged brand',body:'Private customer body',notificationId:2});assert.equal(shown.length,1,'Unknown payload not shown');
   const notification={data:{destination:{screen:'transport-chat'}},close(){}};handlers.notificationclick({notification,waitUntil:promise=>wait=promise});await wait;assert.ok(opened[0].startsWith('https://suqpage.com/')||opened[0].startsWith('/'));
   notification.data.destination={screen:'https://evil.example',id:1};handlers.notificationclick({notification,waitUntil:promise=>wait=promise});await wait;assert.ok(opened.every(url=>!url.includes('evil.example')),'Tap cannot become an external redirect');
  }
  const ts=require('typescript'),source=ts.createSourceFile('actions.ts',fs.readFileSync('app/actions.ts','utf8'),ts.ScriptTarget.Latest,true);
  const action=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='logoutAction');assert.ok(action);
  const code=ts.transpileModule(action.getText(source).replace(/^export\s+/,''),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  for(const failing of ['none','lookup','revoke','audit']){
   const calls=[];const step=name=>{calls.push(name);if(failing===name)throw Error('fixture outage');};const context={currentUser:async()=>{step('lookup');return {id:1,business_id:1};},revokeUserAttention:async()=>step('revoke'),audit:async()=>step('audit'),clearSession:async()=>step('clear'),redirect:()=>step('redirect'),console:{error(){}}};vm.createContext(context);vm.runInContext(code,context);await context.logoutAction();assert.equal(calls.filter(n=>n==='clear').length,1);assert.equal(calls.at(-1),'redirect','Notification cleanup must not block logout');
  }
  console.log('PASS Firebase package/project/missing-config gates and both push workers’ quiet generic payload/internal navigation contracts, and logout during lookup/revocation/audit failures. No provider request sent.');
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
