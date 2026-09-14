import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitPageReview,decidePageReview,type PageReviewPort } from '../lib/page-review';
import type { OwnerPagePort } from '../lib/owner-page-service';
import type { SessionUser } from '../lib/types';
const owner={id:1,business_id:1,access_role:'client'} as SessionUser;
const admin={id:2,business_id:null,access_role:'platform_admin'} as SessionUser;
const content={template:'profile-v1' as const,coverStyle:'blended' as const,videoUrl:'',introduction:'',about:'A simple shop',heroImage:''};
const record={businessId:1,version:1,content,assistanceEnabled:false,updatedBy:1,updatedAt:1};
const drafts:OwnerPagePort={read:async()=>record,assigned:async()=>false,create:async()=>record,commit:async()=>record,hasImage:async()=>true};
const pending={businessId:1,submission:1,draftVersion:1,contentVersion:1,status:'pending' as const,feedback:'',submittedBy:1,submittedAt:1,reviewedBy:null,reviewedAt:null};
const port:PageReviewPort={read:async()=>null,readiness:async()=>({status:'draft',contentVersion:1,products:1}),submit:async()=>pending,decide:async()=>({...pending,status:'approved'})};
test('submission is owner-only and must name the saved version',async()=>{
 await assert.rejects(()=>submitPageReview(drafts,port,{...owner,business_id:2},1,1),/Only the owner/);
 await assert.rejects(()=>submitPageReview(drafts,port,admin,1,1),/Only the owner/);
 await assert.rejects(()=>submitPageReview(drafts,port,owner,1,2),/latest/);
 assert.equal((await submitPageReview(drafts,port,owner,1,1)).status,'pending');
});
test('readiness denies suspension, missing products and empty about without submitting',async()=>{
 for(const readiness of [{status:'suspended',contentVersion:1,products:1},{status:'active',contentVersion:1,products:1},{status:'draft',contentVersion:1,products:0}])await assert.rejects(()=>submitPageReview(drafts,{...port,readiness:async()=>readiness,submit:async()=>{throw Error('MUST NOT SUBMIT')}},owner,1,1),/eligible|Add a product/);
 await assert.rejects(()=>submitPageReview({...drafts,read:async()=>({...record,content:{...content,about:''}})},port,owner,1,1),/About/);
});
test('review requires admin, valid decision, bounded feedback and a current submission',async()=>{
 await assert.rejects(()=>decidePageReview(port,owner,1,1,'approve',''),/Administrator/);
 await assert.rejects(()=>decidePageReview(port,admin,1,1,'unknown',''),/decision/);
 await assert.rejects(()=>decidePageReview(port,admin,1,1,'changes',' '),/Explain/);
 await assert.rejects(()=>decidePageReview(port,admin,1,1,'changes','x'.repeat(1001)),/1,000/);
 await assert.rejects(()=>decidePageReview({...port,decide:async()=>null},admin,1,1,'approve',''),/changed/);
});
