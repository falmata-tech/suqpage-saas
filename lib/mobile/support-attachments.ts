import type { SessionUser } from '../types';
import { getSupportAttachment, getSupportConversation, postSupportMessage } from '../support';
import { stageSupportAttachment, readSupportAttachment, MAX_SUPPORT_ATTACHMENT_BYTES, SupportAttachmentError } from '../support-media';
import { boundedBody, MobileError } from './http';
export async function nativeSupportAttachment(actor:SessionUser,conversationId:number,attachmentId:number){
 const attachment=await getSupportAttachment(actor,conversationId,attachmentId);
 const media=await readSupportAttachment(attachment.storage_key,attachment.mime_type);
 if(!media)throw new MobileError('Attachment was not found.',404);
 return new Response(new Uint8Array(media.bytes),{headers:{'Content-Type':attachment.mime_type,'Content-Length':String(media.contentLength),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(attachment.original_name)}`}});
}
export async function nativeSupportReply(request:Request,actor:SessionUser,conversationId:number){
 // Authorize before processing or staging private upload bytes.
 await getSupportConversation(actor,conversationId);
 const type=request.headers.get('content-type')||'';
 if(!type.startsWith('multipart/form-data;'))throw new MobileError('Choose a file.',415);
 const form=await new Response(await boundedBody(request,MAX_SUPPORT_ATTACHMENT_BYTES+24000),{headers:{'Content-Type':type}}).formData();
 const allowed=['message','idempotencyKey','attachment'];
 if([...form.keys()].some(k=>!allowed.includes(k))||allowed.some(k=>form.getAll(k).length>1))throw new MobileError('Unsupported fields.');
 let staged:Awaited<ReturnType<typeof stageSupportAttachment>>=null;
 try{
  staged=await stageSupportAttachment(form.get('attachment'));
  if(!staged)throw new MobileError('Choose a file.');
  const result=await postSupportMessage(actor,conversationId,{message:form.get('message'),idempotencyKey:form.get('idempotencyKey'),attachment:staged});
  if(result.duplicate)await staged.discard();
  staged=null;
  return result;
 }catch(error){await staged?.discard().catch(()=>{});if(error instanceof SupportAttachmentError)throw new MobileError(error.message);throw error;}
}
