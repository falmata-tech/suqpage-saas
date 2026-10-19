import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {BusinessSettingsError} from '../lib/business-settings-runtime';
import {canManageBusiness,hasCapability} from '../lib/capabilities';
import {DiscoveryAdminError} from '../lib/discovery-admin';
import {OwnerPageError} from '../lib/owner-page-domain';
import type {OwnerEditResult} from '../lib/owner-edit-contract';

async function actionModule(entry:string,ports:Record<string,unknown>){
  const compiled=await build({entryPoints:[entry],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',plugins:[{name:'explicit-action-ports',setup(b){b.onResolve({filter:/^@\//},a=>({path:a.path,external:true}));}}]});
  const module={exports:{} as Record<string,(form:FormData)=>Promise<OwnerEditResult>>};
  vm.runInNewContext(compiled.outputFiles[0].text,{module,exports:module.exports,require:(name:string)=>ports[name]||{},FormData,File,Set,URLSearchParams,Date,Number,Promise,Error,console});
  return module.exports;
}
const actor={id:1,access_role:'platform_admin' as const,business_id:null};
const security={cleanText:(value:unknown,max:number)=>String(value??'').trim().slice(0,max),audit:async()=>{}};
const navigation={redirect:(url:string)=>{throw Object.assign(new Error('redirect'),{url});}};

test('FE-026 focused category actions preserve expected failures and return successful writes to their business list',async()=>{
  let failure:Error|null=new OwnerPageError('Category access is not available.',403);
  const writes:Record<string,unknown>[]=[];
  const actions=await actionModule('app/actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor},'@/lib/security':security,
    '@/lib/owner-page-domain':{OwnerPageError},'@/lib/product-categories':{changeProductCategory:async(_actor:unknown,command:Record<string,unknown>)=>{writes.push(command);if(failure)throw failure;}},
  });
  const form=new FormData();for(const [key,value]of Object.entries({businessId:'7',categoryId:'8',name:'Made for you',slug:'made-for-you',sortOrder:'2',isActive:'on'}))form.set(key,value);
  assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateCategoryAction(form))),{error:'Category access is not available.'});
  failure=new Error('private postgres details');assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateCategoryAction(form))),{error:'Could not save category.'});
  failure=null;
  for(const action of ['createCategoryAction','updateCategoryAction','deleteCategoryAction'])await assert.rejects(actions[action](form),(error:unknown)=>(error as {url?:string}).url==='/dashboard/catalog?business=7&saved=category');
  assert.equal(writes[0].businessId,7);assert.equal(writes[0].id,8);assert.equal(writes[0].active,true);
});

test('BE-032 actual settings action retains expected errors, cleans staged media and never trusts posted media references',async()=>{
  const writes:Record<string,unknown>[]=[],discarded:string[]=[];
  let failure:Error|null=new BusinessSettingsError('Business details changed. Reload before saving.');
  const actions=await actionModule('app/actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor},'@/lib/capabilities':{canManageBusiness,hasCapability},'@/lib/security':security,
    '@/lib/staff-business-authority':{currentBusinessAuthority:async()=> 'administrator'},
    '@/lib/catalog-runtime':{runtimeBusinessById:async()=>({id:7,handle:'qa-record',logo_path:'/media/old-logo.png',favicon_path:'/media/old-icon.png'})},
    '@/lib/media':{stageUploadedImage:async(_file:unknown,prefix:string)=>({imageRef:'/media/new-'+prefix+'.png',discard:async()=>{discarded.push(prefix);}})},
    '@/lib/business-settings-runtime':{BusinessSettingsError,saveBusinessSettings:async(_actor:unknown,_businessId:number,input:Record<string,unknown>)=>{writes.push(input);if(failure)throw failure;}},
  });
  const form=new FormData();for(const [key,value]of Object.entries({businessId:'7',expectedVersion:'12',name:'Retained business',logoPath:'https://untrusted.example/private',contactEmail:'owner@example.test'}))form.set(key,value);
  assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateBusinessAction(form))),{error:'Business details changed. Reload before saving.'});
  assert.deepEqual(discarded,['logo','favicon']);assert.equal(writes[0].expectedVersion,'12');assert.equal(writes[0].logoPath,'/media/new-logo.png');assert.equal(writes[0].faviconPath,'/media/new-favicon.png');
  failure=new Error('postgres private credentials');assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateBusinessAction(form))),{error:'Could not save settings.'});
  failure=null;const before=discarded.length;await assert.rejects(actions.updateBusinessAction(form),(error:unknown)=>Boolean(error&&typeof error==='object'&&'url' in error&&error.url==='/dashboard/settings?business=7&saved=1'));assert.equal(discarded.length,before,'A committed media reference must not be deleted after a successful save');
});

test('BE-032 focused settings actions admit only their own fields before media and preserve section return context',async()=>{
  const writes:Record<string,unknown>[]=[],staged:string[]=[];
  const actions=await actionModule('app/actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor},'@/lib/capabilities':{canManageBusiness,hasCapability},'@/lib/security':security,
    '@/lib/staff-business-authority':{currentBusinessAuthority:async()=> 'administrator'},
    '@/lib/catalog-runtime':{runtimeBusinessById:async()=>({id:7,handle:'qa-record',logo_path:'/media/old-logo.png',favicon_path:'/media/old-icon.png'})},
    '@/lib/media':{stageUploadedImage:async(file:unknown,prefix:string)=>{staged.push(prefix);return file?{imageRef:'/media/new-'+prefix+'.png',discard:async()=>{}}:null;}},
    '@/lib/business-settings-runtime':{BusinessSettingsError,saveBusinessSettings:async(_actor:unknown,_id:number,input:Record<string,unknown>)=>{writes.push(input);}},
  });
  const form=(section:string,fields:Record<string,string>)=>{const data=new FormData();for(const [key,value]of Object.entries({businessId:'7',expectedVersion:'12',section,...fields}))data.set(key,value);return data;};
  for(const section of ['identity','live','sharing']){
    const fields:Record<string,string>=section==='identity'?{name:'Focused',contactEmail:'notice@example.test'}:section==='live'?{livePlatform:'youtube',liveUrl:'https://youtube.com/@qa/live'}:{siteTitle:'Focused title',siteDescription:'Focused description'};
    await assert.rejects(actions.updateBusinessAction(form(section,fields)),(error:unknown)=>Boolean(error&&typeof error==='object'&&'url'in error&&error.url===`/dashboard/settings?business=7&section=${section}&saved=1`));
    assert.equal(writes.at(-1)!.section,section);assert.ok(!('faviconPath'in writes.at(-1)!));
    if(section!=='identity')assert.ok(!('name'in writes.at(-1)!));
  }
  assert.deepEqual(staged,['logo'],'Live and sharing cannot stage identity media');
  const before=writes.length;
  for(const data of [form('unknown',{}),form('live',{name:'Forbidden'}),form('sharing',{logoPath:'/forged.png'}),form('identity',{name:'Focused',contactEmail:'valid@example.test',isLive:'on'})])assert.equal((await actions.updateBusinessAction(data))?.error,'Reload before saving your business details.');
  const duplicated=form('sharing',{siteTitle:'One',siteDescription:'One'});duplicated.append('siteTitle','Two');assert.equal((await actions.updateBusinessAction(duplicated))?.error,'Reload before saving your business details.');
  assert.equal(writes.length,before);assert.deepEqual(staged,['logo'],'Rejected cross-section submissions do not upload or mutate');
});

test('FE-026 scoped sponsor saves return to the same business and reject arbitrary return origins',async()=>{
  const writes:unknown[]=[];
  const actions=await actionModule('app/staff-actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor},'@/lib/capabilities':{hasCapability},'@/lib/security':security,
    '@/lib/runtime-sql':{runtimeTransaction:async(work:()=>Promise<unknown>)=>work()},
    '@/lib/sponsor-admin':{setBusinessSponsorship:async(input:unknown)=>{writes.push(input);return {businessId:7};}},
  });
  for(const [origin,target]of [['7','/dashboard/admin/sponsors?business=7&saved=showroom'],['99','/dashboard/admin/sponsors?saved=showroom'],['https://evil.test','/dashboard/admin/sponsors?saved=showroom']]){
    const data=new FormData();data.set('businessId','7');data.set('position','2');data.set('return_business',origin);
    await assert.rejects(actions.setBusinessSponsorshipAction(data),error=>(error as {url?:string}).url===target);
  }
  assert.equal(writes.length,3);
});

test('FE-026 owner password recovery returns to Access only for the admitted origin',async()=>{
  const actions=await actionModule('app/actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor,revokeAllUserSessions:async()=>{}},'@/lib/capabilities':{hasCapability},'@/lib/config':{authDriver:()=> 'local'},'@/lib/security':security,
    '@/lib/runtime-sql':{runtimeGet:async()=>({id:8,business_id:7}),runtimeRun:async()=>{}},
    '@/lib/passwords':{isStrongPassword:()=>true},bcryptjs:{hash:async()=> 'hashed'},
  });
  for(const [origin,target]of [['access','/dashboard/access?business=7&saved=password'],['https://evil.test','/dashboard/settings?business=7&saved=password']]){
    const data=new FormData();data.set('businessId','7');data.set('userId','8');data.set('temporaryPassword','TestPassword123');data.set('returnTo',origin);
    await assert.rejects(actions.adminResetClientPasswordAction(data),error=>(error as {url?:string}).url===target);
  }
});

test('FE-026 actual location action delegates omitted fields to locked canonical preservation and forwards explicit geography',async()=>{
  const writes:Record<string,unknown>[]=[];let failure=false;
  const actions=await actionModule('app/staff-actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>actor},'@/lib/capabilities':{hasCapability},'@/lib/security':security,
    '@/lib/staff-business-authority':{currentBusinessAuthority:async()=> 'administrator'},
    '@/lib/runtime-sql':{runtimeTransaction:async(work:()=>Promise<unknown>)=>work()},
    '@/lib/media':{stageUploadedImage:async()=>null},
    '@/lib/discovery-admin':{DiscoveryAdminError,getDiscoveryProfileAdminView:async()=>({sponsored:true,sponsorPosition:4,boothImagePath:'/seed/retained.png'}),updateDiscoveryProfile:async(input:Record<string,unknown>)=>{writes.push(input);if(failure)throw new DiscoveryAdminError('City is required.');return {businessId:7};}},
  });
  const form=new FormData();form.set('businessId','7');
  await assert.rejects(actions.updateDiscoveryProfileAction(form),(error:unknown)=>Boolean(error&&typeof error==='object'&&'url' in error&&error.url==='/dashboard/admin/discovery/7?saved=profile'));
  for(const key of ['sponsored','sponsorPosition','boothImagePath','industryKeys','city','region','placeId','countryCode','excluded'])assert.ok(!(key in writes[0]),key+' must not be replayed from an unlocked pre-read');
  form.set('countryCode','KE');form.set('placeId','canonical-city');form.set('industriesPresent','1');
  await assert.rejects(actions.updateDiscoveryProfileAction(form));assert.equal(writes[1].countryCode,'KE');assert.equal(writes[1].placeId,'canonical-city');assert.deepEqual(Array.from(writes[1].industryKeys as unknown[]),[],'Deliberately clearing the industry controls remains an explicit invalid selection');
  form.set('sponsorPosition','9');await assert.rejects(actions.updateDiscoveryProfileAction(form));assert.equal(writes[2].sponsored,false,'Existing forms with an unchecked sponsorship checkbox retain their original semantics');assert.equal(writes[2].sponsorPosition,'9');
  form.set('visibilityPresent','1');await assert.rejects(actions.updateDiscoveryProfileAction(form));assert.equal(writes[3].excluded,false,'An explicitly unchecked full-form exclusion can be cleared');
  form.set('excluded','on');await assert.rejects(actions.updateDiscoveryProfileAction(form));assert.equal(writes[4].excluded,true);
  failure=true;assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateDiscoveryProfileAction(form))),{error:'City is required.'});
});

test('BE-054/BE-060 location action denies owners and ungranted staff before upload or geography persistence',async()=>{
  const scopedActor={...actor,access_role:'client'};let staged=0,writes=0;
  const actions=await actionModule('app/staff-actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>scopedActor},'@/lib/capabilities':{hasCapability},'@/lib/security':security,
    '@/lib/staff-business-authority':{currentBusinessAuthority:async()=>null},
    '@/lib/runtime-sql':{runtimeTransaction:async(work:()=>Promise<unknown>)=>work()},
    '@/lib/media':{stageUploadedImage:async()=>{staged++;return null;}},
    '@/lib/discovery-admin':{DiscoveryAdminError,updateDiscoveryProfile:async()=>{writes++;return{businessId:7};}},
  });
  const form=new FormData();form.set('businessId','7');form.set('countryCode','KE');form.set('placeId','forged');
  for(const role of ['client','team_member','operations_manager']){scopedActor.access_role=role;await assert.rejects(actions.updateDiscoveryProfileAction(form),/Business management access required/);}
  assert.equal(staged,0);assert.equal(writes,0);
});

test('BE-060 granted staff can save visibility, but forged sponsorship and revoke-before-save fail closed',async()=>{
  const scopedActor={...actor,access_role:'team_member'};
  let revoked=false,staged=0,writes=0,discarded=0,lockedReads=0;
  const actions=await actionModule('app/staff-actions.ts',{
    'next/navigation':navigation,'next/cache':{revalidatePath:()=>{}},'@/lib/auth':{requireUser:async()=>scopedActor},'@/lib/capabilities':{hasCapability},'@/lib/security':security,
    '@/lib/staff-business-authority':{currentBusinessAuthority:async(_actor:unknown,_businessId:number,lock:boolean)=>{if(lock)lockedReads++;return revoked&&lock?null:'staff';}},
    '@/lib/runtime-sql':{runtimeTransaction:async(work:()=>Promise<unknown>)=>work()},
    '@/lib/media':{stageUploadedImage:async()=>{staged++;return {imageRef:'/media/booth-test.png',discard:async()=>{discarded++;}};}},
    '@/lib/discovery-admin':{DiscoveryAdminError,updateDiscoveryProfile:async(input:Record<string,unknown>)=>{writes++;assert.equal(input.excluded,true);assert.equal(input.placeId,'nairobi');assert.equal(input.countryCode,'KE');assert.equal(input.latitude,'-1.28');assert.equal(input.longitude,'36.81');assert.ok(!('sponsored' in input));assert.ok(!('sponsorPosition' in input));return {businessId:7};}},
  });
  const form=new FormData();form.set('businessId','7');form.set('visibilityPresent','1');form.set('excluded','on');form.set('placeId','nairobi');form.set('countryCode','KE');form.set('latitude','-1.28');form.set('longitude','36.81');
  await assert.rejects(actions.updateDiscoveryProfileAction(form),(error:unknown)=>(error as {url?:string}).url==='/dashboard/admin/discovery/7?saved=profile');
  assert.equal(writes,1);assert.equal(lockedReads,1);
  form.set('sponsorPosition','2');await assert.rejects(actions.updateDiscoveryProfileAction(form),/Platform administrator access required/);
  assert.equal(staged,1);assert.equal(writes,1,'A posted sponsor control never reaches the staff write');
  form.delete('sponsorPosition');revoked=true;
  assert.deepEqual(JSON.parse(JSON.stringify(await actions.updateDiscoveryProfileAction(form))),{error:'Business management access changed. Reload before saving.'});
  assert.equal(writes,1,'A grant revoked after initial authorization is checked again under the transaction lock');
  assert.equal(discarded,1,'Staged media is discarded after a revoked edit');
});
