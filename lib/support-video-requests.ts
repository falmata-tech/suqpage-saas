import { runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { createSupportConversation, getSupportConversation, postSupportMessage, SupportError } from './support';
import { normalizeControlledYouTubeUrl, controlledYouTubeWatchUrl } from './youtube-provider';
import { videoSourceUrl } from './video-request-policy';
import { STARTER_VIDEO_REF, STARTER_VIDEO_URL } from './business-starter';
import { productMedia, parseProductMedia } from './product-media';
import { parseShopPageContent } from './owner-page-domain';
import { runtimeCatalogByBusinessId } from './catalog-runtime';
import { catalogToRevisionSnapshotV4 } from './revision-v4-defaults';
import type { Product, SessionUser } from './types';

export type VideoRequest = { conversation_id:number; business_id:number; target_kind:'header'|'product'; product_id:number|null; target_label:string; source_url:string; request_note:string; baseline_videos:string; status:'pending'|'approved'|'declined'; approved_ref:string|null; reviewed_by:number|null; reviewed_at:number|null };
const fail = (message:string, code='video_request_invalid'):never => { throw new SupportError(message,code); };
async function target(businessId:number, kind:'header'|'product', productId:number|null) {
  const business=await runtimeGet<{id:number;handle:string;process_video_ref:string;content_version:number;status:string}>('SELECT id,handle,process_video_ref,content_version,status FROM businesses WHERE id=?',[businessId]);
  if(!business) return fail('Business not found.');
  if(kind==='product') {
    const product=await runtimeGet<Product>('SELECT * FROM products WHERE id=? AND business_id=?',[productId,businessId]);
    if(!product)return fail('Product not found.');
    return {business,product,label:product.name,videos:productMedia(product).filter(m=>m.kind==='video').map(m=>m.ref),draft:null,publication:null};
  }
  const draft=await runtimeGet<{version:number;content_json:string}>('SELECT version,content_json FROM owner_page_drafts WHERE business_id=?',[businessId]);
  const publication=await runtimeGet<{revision:number;draft_version:number;content_json:string|null}>('SELECT revision,draft_version,content_json FROM owner_page_publications WHERE business_id=? ORDER BY revision DESC LIMIT 1',[businessId]);
  const fallback=business.process_video_ref?controlledYouTubeWatchUrl(business.process_video_ref):STARTER_VIDEO_URL;
  return {business,product:null,label:'Business video',videos:[draft?parseShopPageContent(JSON.parse(draft.content_json)).videoUrl:fallback,publication?.content_json?parseShopPageContent(JSON.parse(publication.content_json)).videoUrl:fallback],draft,publication};
}
export async function createVideoRequest(user:SessionUser,input:{target:unknown;productId?:unknown;sourceUrl:unknown;note?:unknown;idempotencyKey:unknown}) {
  if(user.access_role!=='client'||!user.business_id)return fail('A client account is required.','forbidden');
  if(input.target!=='header'&&input.target!=='product')return fail('Choose a video location.');
  const kind=input.target,productId=kind==='product'?Number(input.productId):null;
  if(kind==='product'&&(!Number.isSafeInteger(productId)||!productId||productId<1))return fail('Product not found.');
  let source:string;try{source=videoSourceUrl(input.sourceUrl);}catch{return fail('Add a valid HTTPS video link.');}
  const note=String(input.note||'').trim();if(note.length>1500)return fail('Keep the message under 1,500 characters.');
  return runtimeTransaction(async()=>{
    await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
    const current=await target(user.business_id!,kind,productId);
    const created=await createSupportConversation(user,{subject:'Video request',message:`${current.label}\n${source}${note?`\n${note}`:''}`,idempotencyKey:input.idempotencyKey});
    const existing=await runtimeGet<VideoRequest>('SELECT * FROM support_video_requests WHERE conversation_id=?',[created.id]);
    if(existing) {
      if(existing.target_kind!==kind||existing.product_id!==productId||existing.source_url!==source||existing.request_note!==note)return fail('This request was already sent with different details.','idempotency_conflict');
      return {id:created.id,duplicate:true};
    }
    if(created.duplicate)return fail('This request was already sent with different details.','idempotency_conflict');
    await runtimeRun(`INSERT INTO support_video_requests(conversation_id,business_id,target_kind,product_id,target_label,source_url,request_note,baseline_videos,created_at) VALUES(?,?,?,?,?,?,?,?,?)`,[created.id,user.business_id!,kind,productId,current.label,source,note,JSON.stringify(current.videos),Date.now()]);
    return {id:created.id,duplicate:false};
  });
}
export async function getVideoRequest(user:SessionUser,conversationId:number):Promise<VideoRequest|null> {
  await getSupportConversation(user,conversationId);
  return await runtimeGet<VideoRequest>('SELECT * FROM support_video_requests WHERE conversation_id=?',[conversationId])||null;
}
export async function reviewVideoRequest(user:SessionUser,conversationId:number,input:{decision:unknown;youtubeUrl?:unknown;reply:unknown}) {
  return runtimeTransaction(async()=>{
    await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
    const {conversation}=await getSupportConversation(user,conversationId);
    if(user.access_role==='client'||(user.access_role!=='platform_admin'&&user.access_role!=='operations_manager'&&conversation.assignedUserId!==user.id))return fail('Only the assigned team member can review this video.','forbidden');
    const request=await runtimeGet<VideoRequest>('SELECT * FROM support_video_requests WHERE conversation_id=? FOR UPDATE',[conversationId]);
    if(!request)return fail('Video request not found.');
    if(input.decision!=='approved'&&input.decision!=='declined')return fail('Choose a review decision.');
    const reply=String(input.reply||'').trim();if(!reply||reply.length>1500)return fail('Write a reply to the business owner.');
    let ref:string|null=null;
    if(input.decision==='approved') {
      try{ref=normalizeControlledYouTubeUrl(input.youtubeUrl).managedRef;}catch{return fail('Use a supported YouTube video.');}
      if(ref===STARTER_VIDEO_REF)return fail('Choose the business video, not the example.');
    }
    if(request.status!=='pending') {
      if(request.status===input.decision&&request.approved_ref===ref)return {businessId:request.business_id,duplicate:true};
      return fail('This video request has already been reviewed.');
    }
    if(conversation.status!=='open')return fail('Claim or reopen this conversation before reviewing the video.');
    if(input.decision==='approved'&&ref) {
      // Same lock order as owner page saves: draft, then business. Product-only writes lock business.
      if(request.target_kind==='header')await runtimeRun('UPDATE owner_page_drafts SET version=version WHERE business_id=?',[request.business_id]);
      await runtimeRun('UPDATE businesses SET content_version=content_version WHERE id=?',[request.business_id]);
      const current=await target(request.business_id,request.target_kind,request.product_id);
      if(current.business.status==='suspended')return fail('This business is suspended.');
      if(JSON.stringify(current.videos)!==request.baseline_videos)return fail('The video changed. Ask the owner to send a new request.','stale_video');
      const now=Date.now();
      if(current.product) {
        const previous=(await runtimeCatalogByBusinessId(request.business_id,true))!;
        await runtimeRun("INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'baseline',?) ON CONFLICT(business_id,content_version) DO NOTHING",[request.business_id,current.business.content_version,JSON.stringify(catalogToRevisionSnapshotV4(previous)),user.id]);
        const media=parseProductMedia([...productMedia(current.product).filter(m=>m.kind!=='video'||m.ref!==STARTER_VIDEO_REF),...(!current.videos.includes(ref)?[{kind:'video',ref}]:[])]);
        await runtimeRun('UPDATE products SET video_ref=?,media_json=? WHERE id=? AND business_id=?',[media.find(m=>m.kind==='video')?.ref||'',JSON.stringify(media),current.product.id,request.business_id]);
        await runtimeRun('UPDATE businesses SET content_version=content_version+1 WHERE id=?',[request.business_id]);
        const next=(await runtimeCatalogByBusinessId(request.business_id,true))!;
        await runtimeRun("INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'product_upkeep',?)",[request.business_id,current.business.content_version+1,JSON.stringify(catalogToRevisionSnapshotV4(next)),user.id]);
      } else {
        const url=controlledYouTubeWatchUrl(ref);
        if(current.draft) {
          const content={...parseShopPageContent(JSON.parse(current.draft.content_json)),videoUrl:url};
          await runtimeRun('UPDATE owner_page_drafts SET content_json=?,version=version+1,updated_by=?,updated_at=? WHERE business_id=?',[JSON.stringify(content),user.id,now,request.business_id]);
          await runtimeRun("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,?,?,'content',?)",[request.business_id,current.draft.version+1,user.id,now]);
        }
        if(current.publication?.content_json) {
          const content={...parseShopPageContent(JSON.parse(current.publication.content_json)),videoUrl:url};
          await runtimeRun("INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at) VALUES(?,?,?,?,'publish',?,?)",[request.business_id,current.publication.revision+1,current.publication.draft_version,JSON.stringify(content),user.id,now]);
        }
        await runtimeRun('UPDATE businesses SET process_video_ref=?,content_version=content_version+1 WHERE id=?',[ref,request.business_id]);
      }
    }
    const now=Date.now();
    await runtimeRun('UPDATE support_video_requests SET status=?,approved_ref=?,reviewed_by=?,reviewed_at=? WHERE conversation_id=?',[input.decision,ref,user.id,now,conversationId]);
    await postSupportMessage(user,conversationId,{message:`${reply}${ref?`\n${controlledYouTubeWatchUrl(ref)}`:''}`,idempotencyKey:`video-review-reply-${conversationId}`});
    await runtimeRun('INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,?)',[user.id,request.business_id,'support.video_reviewed',JSON.stringify({conversationId,decision:input.decision,target:request.target_kind,productId:request.product_id}), '']);
    return {businessId:request.business_id,duplicate:false};
  });
}
