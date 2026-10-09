import {findPlaceSuggestions} from '../lib/place-catalog';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { ACCENT_PRESETS, parseAccentColor, storefrontAccent, accentContrast } from '../lib/storefront-accent';
import { parseShopPageContent } from '../lib/owner-page-domain';
import { createPublicClientWorkspace } from '../lib/signup';
import { getDb, closeDbForTests, getUserById } from './testing/postgres-fixture';
import { ownerPagePort } from '../lib/owner-page-runtime';
import { saveOwnerPageAndPublication } from '../lib/owner-page-save-runtime';
import { pagePublicationPort, runtimePublishedPage } from '../lib/owner-page-publication-runtime';
import { changePagePublication } from '../lib/owner-page-publication';
import { ownerHome } from '../lib/mobile/owner';
import { setOwnerPageAssistance } from '../lib/owner-page-service';
import { handleMobileRequest } from '../lib/mobile/router';
const content={template:'profile-v1',coverStyle:'blended',introduction:'',about:'Handmade items',heroImage:'',videoUrl:''};
assert.equal(parseAccentColor('#ab12cd'),'#AB12CD');assert.equal(parseAccentColor(undefined),'');assert.equal(storefrontAccent(''),null);
for(const invalid of [null,123,{},[],true,'red','#fff','#1234567',' #123456','var(--red)','url(https://x.test)','<script>']) {
 assert.throws(()=>parseAccentColor(invalid));assert.throws(()=>parseShopPageContent({...content,accentColor:invalid}));
}
assert.equal(parseShopPageContent(content).accentColor,undefined);
for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17){
 const p=storefrontAccent('#'+[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join(''))!;
 assert.ok(accentContrast(p.accent,p.on)>=4.5);assert.ok(accentContrast(p.ink,p.soft)>=4.5);assert.ok(accentContrast(p.edge,'#FFFFFF')>=3);
}
for(const color of ACCENT_PRESETS)assert.equal(storefrontAccent(color)?.accent,color);
async function main(){const db=await getDb();try{
 const base={name:'Accent Owner',phone:'+251911000123',businessName:'Accent Fixture',businessCategory:'home-living', placeId:findPlaceSuggestions("Addis Ababa")[0].id,consent:true,idempotencyKey:crypto.randomUUID()};
 const before=await db.prepare('SELECT COUNT(*) n FROM businesses').get();
 await assert.rejects(()=>createPublicClientWorkspace({...base,accentColor:'red'},{providerUserId:crypto.randomUUID(),email:'invalid-accent@example.test'}),/color/);
 assert.deepEqual(await db.prepare('SELECT COUNT(*) n FROM businesses').get(),before);
 const created=await createPublicClientWorkspace({...base,accentColor:'#ff00b8'},{providerUserId:crypto.randomUUID(),email:'accent-owner@example.test'});
 const owner=(await getUserById(created.userId))!;const bid=created.businessId;
 let draft=(await ownerPagePort.read(bid))!;assert.equal(draft.content.accentColor,'#FF00B8');assert.equal(await runtimePublishedPage(bid),undefined);
 const native=await ownerHome({...owner,business_id:bid});assert.equal(native.shop.accentColor,'#FF00B8');assert.equal(native.draft?.content.accentColor,'#FF00B8');
 await assert.rejects(()=>saveOwnerPageAndPublication({...owner,business_id:bid+1},bid,{action:'save',version:draft.version,content:{...draft.content,accentColor:'#000000'}}),/access/);
 await assert.rejects(()=>saveOwnerPageAndPublication(owner,bid,{action:'save',version:draft.version,content:{...draft.content,accentColor:'var(--x)'}}),/color/);
 assert.equal((await ownerPagePort.read(bid))?.version,draft.version);
 // Confirm the disposable starter's location; production uses the existing location form.
 await db.prepare('UPDATE owner_location_proposals SET version=version+1 WHERE business_id=?').run(bid);
 await db.prepare("UPDATE products SET name='Test textile ' || id,description='A handwoven textile' WHERE business_id=?").run(bid);
 draft=await saveOwnerPageAndPublication(owner,bid,{action:'save',version:draft.version,content:{...draft.content,about:'Our handwoven textiles',contacts:{phone:'+251911000123'},accentColor:'#B6FF00'}});
 await changePagePublication(ownerPagePort,pagePublicationPort,owner,bid,{action:'publish',version:draft.version,revision:0});
 assert.equal((await runtimePublishedPage(bid))?.accentColor,'#B6FF00');
 const res=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/shops/'+native.shop.handle),['shops',native.shop.handle]);
 assert.equal(res.status,200);assert.equal((await res.json()).accentColor,'#B6FF00');
 const oldContent={...draft.content};delete oldContent.accentColor;
 draft=await saveOwnerPageAndPublication(owner,bid,{action:'save',version:draft.version,content:oldContent});
 assert.equal(draft.content.accentColor,'#B6FF00');assert.equal((await runtimePublishedPage(bid))?.accentColor,'#B6FF00');
 await assert.rejects(()=>saveOwnerPageAndPublication(owner,bid,{action:'save',version:1,content:{...draft.content,accentColor:'#000000'}}),/newer saved/);
 const beforeFailure=await ownerPagePort.read(bid);
 await db.exec("CREATE FUNCTION reject_accent_publication() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'accent publication failure'; END; $$; CREATE TRIGGER reject_accent_publication BEFORE INSERT ON owner_page_publications FOR EACH ROW EXECUTE FUNCTION reject_accent_publication();");
 await assert.rejects(()=>saveOwnerPageAndPublication(owner,bid,{action:'save',version:draft.version,content:{...draft.content,accentColor:'#000000'}}),/accent publication failure/);
 assert.deepEqual(await ownerPagePort.read(bid),beforeFailure);
 await db.exec('DROP TRIGGER reject_accent_publication ON owner_page_publications; DROP FUNCTION reject_accent_publication();');
 const staffId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('accent-staff@example.test','unused','Staff','admin')").run()).insertedId);
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(staffId);
 const staff=(await getUserById(staffId))!;
 await assert.rejects(()=>saveOwnerPageAndPublication(staff,bid,{action:'save',version:draft.version,content:{...draft.content,accentColor:'#000000'}}),/access/);
 const consent=await setOwnerPageAssistance(ownerPagePort,owner,bid,draft.version,true);
 draft=await saveOwnerPageAndPublication(staff,bid,{action:'save',version:consent.version,content:{...draft.content,accentColor:'#000000'}});
 assert.equal(draft.content.accentColor,'#000000');assert.equal((await runtimePublishedPage(bid))?.accentColor,'#B6FF00');
 draft=await saveOwnerPageAndPublication(owner,bid,{action:'save',version:draft.version,content:{...draft.content,accentColor:''}});
 assert.equal((await runtimePublishedPage(bid))?.accentColor,'');assert.equal((await ownerHome({...owner,business_id:bid})).shop.accentColor,'');
 console.log('PASS: 4096 palettes; invalid/legacy/default; signup; real PostgreSQL reload/publication; native projection; tenant/staff/stale guards; rollback; explicit reset.');
}finally{await closeDbForTests();}}
main().catch(error=>{console.error(error);process.exitCode=1;});
