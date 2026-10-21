import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {build} from 'esbuild';

type Actor={access_role:'client'|'team_member'|'platform_admin';business_id:number|null};

async function actionFixture(actor:Actor){
  const writes:Array<{businessId:number;handle:unknown;reason:unknown}>=[];
  const result=await build({entryPoints:['app/dashboard/business/handle-actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{
    name:'handle-action-ports',setup(plugin){
      plugin.onResolve({filter:/^(next\/navigation|next\/cache|@\/lib\/auth|@\/lib\/business-handle-runtime)$/},args=>({path:args.path,namespace:'ports'}));
      plugin.onLoad({filter:/.*/,namespace:'ports'},args=>({contents:
        args.path==='next/navigation'?`export const redirect=path=>{throw Object.assign(new Error('redirect'),{path});};`
        :args.path==='next/cache'?`export const revalidatePath=()=>{},revalidateTag=()=>{};`
        :args.path==='@/lib/auth'?`export const requireUser=async()=>fixture.actor;`
        :`export const changeBusinessHandle=async(_actor,businessId,raw)=>{fixture.writes.push({businessId,handle:raw.handle,reason:raw.reason});return {oldHandle:'old-handle',handle:String(raw.handle)};};`,loader:'js'}));
    },
  }]});
  const module={exports:{} as {saveBusinessHandleAction:(form:FormData)=>Promise<unknown>}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture:{actor,writes},require:createRequire(import.meta.url),FormData});
  return{action:module.exports.saveBusinessHandleAction,writes};
}

test('FE-072 a granted staff handle edit keeps the selected business context',async()=>{
  const {action,writes}=await actionFixture({access_role:'team_member',business_id:null});
  const form=new FormData();form.set('businessId','18');form.set('expectedVersion','4');form.set('handle','new-handle');
  await assert.rejects(action(form),error=>(error as {path?:string}).path==='/dashboard/settings?business=18&saved=handle');
  assert.deepEqual(JSON.parse(JSON.stringify(writes)),[{businessId:18,handle:'new-handle',reason:null}]);
});

test('BE-060 an owner handle edit uses their own linked business, not a forged form ID',async()=>{
  const {action,writes}=await actionFixture({access_role:'client',business_id:7});
  const form=new FormData();form.set('businessId','18');form.set('expectedVersion','4');form.set('handle','owner-handle');form.set('returnTo','showroom');
  await assert.rejects(action(form),error=>(error as {path?:string}).path==='/dashboard/profile/showroom?saved=handle');
  assert.deepEqual(JSON.parse(JSON.stringify(writes)),[{businessId:7,handle:'owner-handle',reason:null}]);
});
