import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { parseShopPageContent } from './owner-page-domain';
import { normalizePageRequest, pageResult, pageWindow, likePattern } from './pagination';
import type { PageReview, PageReviewPort } from './page-review';
type Row={ business_id:number;submission:number;draft_version:number;content_version:number;status:PageReview['status'];feedback:string;submitted_by:number;submitted_at:number;reviewed_by:number|null;reviewed_at:number|null };
const review=(r:Row):PageReview=>({businessId:r.business_id,submission:r.submission,draftVersion:r.draft_version,contentVersion:r.content_version,status:r.status,feedback:r.feedback,submittedBy:r.submitted_by,submittedAt:Number(r.submitted_at),reviewedBy:r.reviewed_by,reviewedAt:r.reviewed_at===null?null:Number(r.reviewed_at)});
async function read(businessId:number){const row=await runtimeGet<Row>('SELECT * FROM owner_page_reviews WHERE business_id=?',[businessId]);return row?review(row):null;}
export const pageReviewPort:PageReviewPort={
 read,
 async readiness(businessId){const row=await runtimeGet<{status:string;content_version:number;products:number}>("SELECT b.status,b.content_version,(SELECT COUNT(*) FROM products p WHERE p.business_id=b.id AND p.is_published=1) products FROM businesses b WHERE b.id=?",[businessId]);return row?{status:row.status,contentVersion:row.content_version,products:Number(row.products)}:null;},
 async submit(actor,businessId,draftVersion,contentVersion){return runtimeTransaction(async()=>{
  const locked=await runtimeRun(`UPDATE owner_page_drafts SET version=version WHERE business_id=? AND version=? AND EXISTS(
    SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND u.business_id=? AND p.access_role='client')`,[businessId,draftVersion,actor.id,businessId]);
  if(!locked.changes)return null;
  const business=await runtimeRun("UPDATE businesses SET content_version=content_version WHERE id=? AND status='draft' AND content_version=? AND EXISTS(SELECT 1 FROM products p WHERE p.business_id=businesses.id AND p.is_published=1)",[businessId,contentVersion]);
  if(!business.changes)return null;
  const current=await read(businessId);
  if(current?.status==='pending'&&current.draftVersion===draftVersion&&current.contentVersion===contentVersion)return current;
  const now=Date.now();
  await runtimeRun(`INSERT INTO owner_page_reviews(business_id,submission,draft_version,content_version,status,feedback,submitted_by,submitted_at)
   VALUES(?,?,?,?, 'pending','',?,?) ON CONFLICT(business_id) DO UPDATE SET submission=excluded.submission,draft_version=excluded.draft_version,
   content_version=excluded.content_version,status='pending',feedback='',submitted_by=excluded.submitted_by,submitted_at=excluded.submitted_at,reviewed_by=NULL,reviewed_at=NULL`,[businessId,(current?.submission||0)+1,draftVersion,contentVersion,actor.id,now]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'page.review_submitted',?,'')",[actor.id,businessId,JSON.stringify({submission:(current?.submission||0)+1,draftVersion,contentVersion})]);
  return read(businessId);
 });},
 async decide(actor,businessId,submission,decision,feedback){return runtimeTransaction(async()=>{
  if(actor.access_role!=='platform_admin'||!await runtimeGet("SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='platform_admin'",[actor.id]))return null;
  // Same lock order as draft edits/publication: draft, then business, then review.
  const locked=await runtimeRun('UPDATE owner_page_drafts SET version=version WHERE business_id=?',[businessId]);if(!locked.changes)return null;
  const business=await runtimeRun("UPDATE businesses SET content_version=content_version WHERE id=? AND status='draft'",[businessId]);if(!business.changes)return null;
  const current=await read(businessId);if(!current||current.status!=='pending'||current.submission!==submission)return null;
  const draft=await runtimeGet<{version:number;content_json:string}>('SELECT version,content_json FROM owner_page_drafts WHERE business_id=?',[businessId]);
  const state=await this.readiness(businessId);
  if(!draft||draft.version!==current.draftVersion||state?.contentVersion!==current.contentVersion||!state.products)return null;
  const content=parseShopPageContent(JSON.parse(draft.content_json));
  const now=Date.now();
  if(decision==='approve'){
   await runtimeRun("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,1,?,?,'publish',?,?)",[businessId,draft.version,JSON.stringify(content),current.submittedBy,now]);
   await runtimeRun("UPDATE businesses SET status='active' WHERE id=? AND status='draft'",[businessId]);
  }
  await runtimeRun('UPDATE owner_page_reviews SET status=?,feedback=?,reviewed_by=?,reviewed_at=? WHERE business_id=? AND submission=?',[decision==='approve'?'approved':'changes_requested',feedback,actor.id,now,businessId,submission]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,decision==='approve'?'page.review_approved':'page.review_changes',JSON.stringify({submission,draftVersion:draft.version,contentVersion:state.contentVersion})]);
  return read(businessId);
 });},
};
export async function listPageReviews(input:{page?:string;q?:string;status?:string}){
 const request=normalizePageRequest({page:input.page,search:input.q});
 const status=['pending','changes_requested','approved'].includes(input.status||'')?input.status!:'pending';
 const where="FROM owner_page_reviews r JOIN businesses b ON b.id=r.business_id WHERE r.status=? AND (lower(b.name) LIKE ? ESCAPE '\\' OR lower(b.handle) LIKE ? ESCAPE '\\')";
 const args=[status,likePattern(request.search),likePattern(request.search)];
 const total=Number((await runtimeGet<{total:number}>(`SELECT COUNT(*) total ${where}`,args))?.total||0);const window=pageWindow(total,request);
 const rows=await runtimeAll<Row & {name:string;handle:string}>(`SELECT r.*,b.name,b.handle ${where} ORDER BY r.submitted_at,r.business_id LIMIT ? OFFSET ?`,[...args,window.limit,window.offset]);
 return pageResult(rows.map(r=>({...review(r),name:r.name,handle:r.handle})),total,request);
}

// Submission grants administrators read-only access to this exact pending cover;
// it never grants consent to edit the private draft or access unrelated images.
export async function canReadSubmittedCover(actorId:number,businessId:number,ref:string){
 const row=await runtimeGet<{content_json:string}>(`SELECT d.content_json FROM owner_page_reviews r JOIN owner_page_drafts d ON d.business_id=r.business_id AND d.version=r.draft_version WHERE r.business_id=? AND r.status='pending' AND EXISTS(SELECT 1 FROM user_access_profiles p WHERE p.user_id=? AND p.access_role='platform_admin')`,[businessId,actorId]);
 if(!row)return false;try{return parseShopPageContent(JSON.parse(row.content_json)).heroImage===ref;}catch{return false;}
}
