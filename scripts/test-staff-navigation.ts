import assert from 'node:assert/strict';
import {supportViewState,supportFormState,supportInboxHref,supportThreadHref,supportAssignmentHistoryHref,workspaceActiveHref,workloadViewState,workloadHref,staffListViewState,staffListHref,staffWorkloadEditHref} from '../lib/support-navigation';
const source={queue:'transport',status:'history',q:' chairs & fabric ',page:'2'};
const state=supportViewState(source);assert.equal(supportInboxHref(state),'/dashboard/support?queue=transport&status=history&q=chairs+%26+fabric&page=2');
assert.equal(supportThreadHref(42,state,{sent:'1'}),'/dashboard/support/42?queue=transport&status=history&q=chairs+%26+fabric&page=2&sent=1');
assert.equal(supportAssignmentHistoryHref(42,state),'/dashboard/support/42/assignments?queue=transport&status=history&q=chairs+%26+fabric&page=2');
const f=new FormData();for(const[k,v]of Object.entries(source))f.set('nav_'+k,v);assert.deepEqual(supportFormState(f),state);assert.equal(supportFormState(f,'support').queue,'support');
for(const status of ['needs_reply','overdue','waiting_customer']){
 const view=supportViewState({...source,status});assert.equal(view.status,status);
 const form=new FormData();for(const[key,value]of Object.entries(view))form.set('nav_'+key,value);
 assert.deepEqual(supportFormState(form),view);assert.ok(supportThreadHref(42,view).includes('status='+status));assert.ok(supportAssignmentHistoryHref(42,view).includes('status='+status));
}
assert.deepEqual(supportViewState({queue:'https://evil.test',status:'delete',page:'-1',q:['bad'],returnTo:'https://evil.test'},{fallbackQueue:'support',fallbackStatus:'active'}),{queue:'support',status:'active'});
assert.equal(supportViewState({q:'x'.repeat(200),page:'1x'}).q!.length,120);assert.equal(supportViewState({page:'1000000000000'}).page,undefined);assert.throws(()=>supportThreadHref(-1));
const items=[{href:'/dashboard/admin'},{href:'/dashboard/support?queue=support'},{href:'/dashboard/support?queue=transport'},{href:'/dashboard/admin/staff',activePaths:['/dashboard/support/agents']},{href:'/dashboard/admin/businesses'}];
assert.equal(workspaceActiveHref(items,'/dashboard/support',new URLSearchParams('queue=transport')),items[2].href);
assert.equal(workspaceActiveHref(items,'/dashboard/support/42',new URLSearchParams('queue=support'),'transport'),items[2].href,'Case authority supplies actual queue context');
assert.equal(workspaceActiveHref(items,'/dashboard/support/42/assignments',new URLSearchParams('queue=support'),'transport'),items[2].href,'History keeps the authoritative conversation queue');
assert.equal(workspaceActiveHref(items,'/dashboard/support/agents',new URLSearchParams()),items[3].href);
assert.equal(workspaceActiveHref(items,'/dashboard/admin/businesses/8/team',new URLSearchParams()),items[4].href);
assert.equal(workspaceActiveHref([{href:'/dashboard?business=1'},{href:'/dashboard?business=2'}],'/dashboard',new URLSearchParams('business=2')),'/dashboard?business=2');
assert.equal(workspaceActiveHref([{href:'/dashboard/support?queue=support'}],'/dashboard/support',new URLSearchParams('queue=transport')),undefined,'Nav cannot invent other queue membership');
console.log('PASS safe inbox origin/action roundtrip, scoped queue pinning, case/menu matching, workload parent and unchanged business context.');

assert.deepEqual(supportViewState({queue:["transport"]},{fallbackQueue:"support"}),{queue:"support"});
assert.equal(workloadHref(workloadViewState({q:"name & email",page:"2",status:"available"}),true),"/dashboard/support/agents?q=name+%26+email&page=2&status=available&saved=agent");
assert.equal(workloadHref(workloadViewState({q:["bad"],page:"1e9",status:"delete",returnTo:"https://evil.test"})),"/dashboard/support/agents");
assert.equal(staffListHref(staffListViewState({q:' agent & name ',page:'2',role:'transport_agent'})),'/dashboard/admin/staff?q=agent+%26+name&page=2&role=transport_agent');
assert.equal(staffListHref(staffListViewState({q:['private'],page:'1e9',role:'platform_admin',origin:'https://evil.test'})),'/dashboard/admin/staff');
const editor=new URL(staffWorkloadEditHref(8,'qa@example.invalid',{q:'QA',page:'2',role:'support_agent'}),'https://suqpage.invalid');
assert.equal(editor.pathname,'/dashboard/support/agents');assert.equal(editor.searchParams.get('edit'),'8');assert.equal(editor.searchParams.get('back_origin'),'staff');assert.equal(editor.searchParams.get('back_role'),'support_agent');
assert.throws(()=>staffWorkloadEditHref(-1,'qa@example.invalid',{}));

import {workspaceHomeHref} from '../lib/capabilities';
import type {SessionUser} from '../lib/types';
const principal=(access_role:SessionUser['access_role'],business_id:number|null=null,staff_queue_scope:SessionUser['staff_queue_scope']='all')=>({access_role,business_id,staff_queue_scope} as SessionUser);
assert.equal(workspaceHomeHref(principal('platform_admin')),'/dashboard/admin');
assert.equal(workspaceHomeHref(principal('client',1)),'/dashboard/profile');
assert.equal(workspaceHomeHref(principal('team_member',null,'support')),'/dashboard/support?queue=support');
assert.equal(workspaceHomeHref(principal('team_member',null,'transport')),'/dashboard/support?queue=transport');
assert.equal(workspaceHomeHref(principal('team_member')),'/dashboard');
