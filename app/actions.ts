"use server";

import bcrypt from "bcryptjs";
import { changeProductCategory } from "@/lib/product-categories";
import { stageTenantProductImage } from "@/lib/tenant-product-media";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, currentUser, requireUser, revokeAllUserSessions, setSession } from "@/lib/auth";
import { authDriver } from "@/lib/config";
import { canMaintainBasicProducts, canManageBusiness, canOperateBusiness, hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById, runtimeUserByEmail } from "@/lib/catalog-runtime";
import { runtimeGet, runtimeRun, runtimeTransaction } from "@/lib/runtime-sql";
import { saveUploadedImage, stageUploadedImage, type StagedImage } from "@/lib/media";
import { isStrongPassword } from "@/lib/passwords";
import { ProductUpkeepError } from "@/lib/product-upkeep-domain";
import { executeBasicProductUpkeep } from "@/lib/product-upkeep";
import { runtimeProductUpkeepPort } from "@/lib/product-upkeep-runtime";
import { consumeRuntimeRateLimit, resetRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { audit, cleanText, currentRequestIdentity } from "@/lib/security";
import { normalizeControlledYouTubeUrl } from "@/lib/youtube-provider";
import { validateLiveSettings } from "@/lib/live-showroom";
import { beginGoogleSignIn, signInWithSupabasePassword, updateCurrentSupabasePassword, updateLinkedSupabasePassword } from "@/lib/supabase-auth";

const text = (fd:FormData,key:string,max=500) => cleanText(fd.get(key),max);
const int = (fd:FormData,key:string,fallback=0) => { const value=Number.parseInt(text(fd,key,30),10); return Number.isFinite(value)?value:fallback; };
const slugify = (value:string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80) || `item-${Date.now()}`;
const operationalStatuses = new Set(["active","suspended"]);

function go(path:string,params:Record<string,string|number|undefined>={}): never {
  const query=new URLSearchParams();
  Object.entries(params).forEach(([key,value])=>{if(value!==undefined)query.set(key,String(value))});
  redirect(`${path}${query.size?`?${query}`:""}`);
}

async function authorizedBusinessId(requested:number) {
  const user=await requireUser();
  const assigned=user.access_role==="team_member"&&Boolean(await runtimeGet("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1",[user.id,requested]));
  if(!canManageBusiness(user,requested,assigned))throw new Error("Not authorized for this business.");
  if(!await runtimeBusinessById(requested))throw new Error("Business not found.");
  return {businessId:requested,user};
}

async function authorizedOperationsBusinessId(requested:number) {
  const user=await requireUser();
  if(!canOperateBusiness(user,requested))throw new Error("Operations manager access required.");
  if(!await runtimeBusinessById(requested))throw new Error("Business not found.");
  return {businessId:requested,user};
}

export async function loginAction(formData:FormData) {
  const email=text(formData,"email",160).toLowerCase();
  const password=String(formData.get("password")||"");
  const identity=await currentRequestIdentity();
  const rate=await consumeRuntimeRateLimit(`login:${identity.ipHash}:${email}`,5,15*60*1000,30*60*1000);
  if(!rate.allowed)go("/login",{error:"Too many attempts. Try again later."});
  const user=await runtimeUserByEmail(email);
  const authenticated=user&&password.length<=200&&(authDriver()==="supabase"
    ? (await signInWithSupabasePassword(email,password))?.userId===user.id
    : await bcrypt.compare(password,user.password_hash));
  if(!authenticated||!user){
    await audit("auth.login_failed",{detail:{email},ipHash:identity.ipHash});
    go("/login",{error:"Invalid email or password."});
  }
  await resetRuntimeRateLimit(`login:${identity.ipHash}:${email}`);
  if(authDriver()==="local")await setSession(user.id);
  await audit("auth.login_success",{userId:user.id,businessId:user.business_id,ipHash:identity.ipHash});
  redirect(user.must_change_password?"/dashboard/account?required=1":"/dashboard");
}

export async function googleLoginAction(){
  if(authDriver()!=="supabase")go("/login",{error:"Google sign-in is not available yet."});
  const destination=await beginGoogleSignIn();
  if(!destination)go("/login",{error:"Google sign-in could not be started."});
  redirect(destination);
}

export async function logoutAction(){const user=await currentUser();if(user)await audit("auth.logout",{userId:user.id,businessId:user.business_id});await clearSession();redirect("/login");}

export async function changePasswordAction(formData:FormData){
  const user=await requireUser({allowTemporaryPassword:true});
  const current=String(formData.get("currentPassword")||"");
  const password=String(formData.get("newPassword")||"");
  const confirm=String(formData.get("confirmPassword")||"");
  if(!isStrongPassword(password))go("/dashboard/account",{error:"Use at least 12 characters with upper-case, lower-case, and a number."});
  if(password!==confirm)go("/dashboard/account",{error:"New passwords do not match."});
  const stored=await runtimeGet<{password_hash:string}>("SELECT password_hash FROM users WHERE id=?",[user.id]);
  if(!stored)go("/dashboard/account",{error:"Current password is incorrect."});
  const currentMatches=authDriver()==="supabase"
    ? await updateCurrentSupabasePassword(user.email,current,password)
    : await bcrypt.compare(current,stored.password_hash);
  if(!currentMatches)go("/dashboard/account",{error:"Current password is incorrect."});
  const passwordHash=await bcrypt.hash(password,12);
  await runtimeRun("UPDATE users SET password_hash=?,must_change_password=0,password_updated_at=CURRENT_TIMESTAMP WHERE id=?",[passwordHash,user.id]);
  await revokeAllUserSessions(user.id);
  if(authDriver()==="local")await setSession(user.id);
  await audit("auth.password_changed",{userId:user.id,businessId:user.business_id});
  go("/dashboard/account",{saved:1});
}

export async function updateBusinessAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));
  const existing=(await runtimeBusinessById(businessId))!;
  try{
    const logoPath=await saveUploadedImage(formData.get("logo"),existing.logo_path,"logo");
    const favicon=await saveUploadedImage(formData.get("favicon"),existing.favicon_path,"favicon");
    const live=validateLiveSettings({isLive:formData.get("isLive"),platform:text(formData,"livePlatform",30),url:text(formData,"liveUrl",500)});
    await runtimeRun(`UPDATE businesses SET name=?,logo_path=?,contact_email=?,whatsapp=?,telegram=?,tiktok=?,is_live=?,live_platform=?,live_url=?,site_title=?,site_description=?,favicon_path=?,content_version=content_version+1 WHERE id=?`,[
      text(formData,"name",100),logoPath,text(formData,"contactEmail",160),text(formData,"whatsapp",40).replace(/\D/g,""),text(formData,"telegram",80).replace(/^@/,""),text(formData,"tiktok",80).replace(/^@/,""),live.isLive?1:0,live.platform,live.url,text(formData,"siteTitle",120),text(formData,"siteDescription",240),favicon,businessId
    ]);
    await audit("business.updated",{userId:user.id,businessId});
  }catch(error){go("/dashboard/settings",{business:businessId,error:error instanceof Error?error.message:"Could not save settings."});}
  revalidatePath("/");revalidatePath(`/@${existing.handle}`);revalidatePath("/dashboard/settings");
  go("/dashboard/settings",{business:businessId,saved:1});
}

export async function adminUpdateBusinessAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const businessId=int(formData,"businessId"),returnBusiness=int(formData,"returnBusiness"),status=text(formData,"status",20),business=await runtimeBusinessById(businessId);
  const returnPath=returnBusiness===businessId?"/dashboard":"/dashboard/admin/businesses";
  const returnParams=returnBusiness===businessId?{business:businessId,error:"Only an established showroom can be suspended or restored."}:{error:"Only an established showroom can be suspended or restored."};
  if(!business||business.status==="draft"||!operationalStatuses.has(status))go(returnPath,returnParams);
  await runtimeRun("UPDATE businesses SET status=? WHERE id=?",[status,businessId]);
  await audit("admin.business_status_updated",{userId:user.id,businessId,detail:{status}});
  revalidatePath("/");revalidatePath("/dashboard/admin/businesses");revalidatePath("/dashboard");
  if(returnBusiness===businessId)go("/dashboard",{business:businessId,saved:"status"});
  go("/dashboard/admin/businesses",{saved:1});
}

export async function adminResetClientPasswordAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const userId=int(formData,"userId"),businessId=int(formData,"businessId"),password=String(formData.get("temporaryPassword")||"");
  const target=await runtimeGet<{id:number;business_id:number|null}>("SELECT u.id,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='client'",[userId]);
  if(!target||target.business_id!==businessId||!isStrongPassword(password))go("/dashboard/settings",{business:businessId,accessError:"Choose the authorized owner and use a 12+ character password with upper-case, lower-case, and a number."});
  if(authDriver()==="supabase"&&!await updateLinkedSupabasePassword(userId,password))go("/dashboard/settings",{business:businessId,accessError:"The managed identity provider could not update this password."});
  const passwordHash=await bcrypt.hash(password,12);
  await runtimeRun("UPDATE users SET password_hash=?,must_change_password=1 WHERE id=?",[passwordHash,userId]);
  await revokeAllUserSessions(userId);await audit("admin.client_password_reset",{userId:user.id,businessId:target.business_id,detail:{targetUserId:userId}});
  revalidatePath("/dashboard/settings");go("/dashboard/settings",{business:businessId,saved:"password"});
}

async function categoryAction(kind:"create"|"update"|"delete",formData:FormData){
 const user=await requireUser();const businessId=int(formData,"businessId");const name=text(formData,"name",100);
 try{await changeProductCategory(user,{kind,businessId,id:int(formData,"categoryId")||undefined,name,slug:slugify(text(formData,"slug",80)||name),sortOrder:int(formData,"sortOrder"),active:Boolean(formData.get("isActive"))});}
 catch(error){go("/dashboard/catalog",{business:businessId,error:error instanceof Error?error.message:"Could not save category."});}
 revalidatePath("/dashboard/catalog");revalidatePath("/dashboard/products");revalidatePath("/");go("/dashboard/catalog",{business:businessId,saved:"category"});
}
export async function createCategoryAction(formData:FormData){return categoryAction("create",formData);}
export async function updateCategoryAction(formData:FormData){return categoryAction("update",formData);}
export async function deleteCategoryAction(formData:FormData){return categoryAction("delete",formData);}

const productFormFields = new Set([
  "optionGroups",
  "isPublished",
  "businessId",
  "productId",
  "kind",
  "expectedContentVersion",
  "idempotencyKey",
  "name",
  "description",
  "availability",
  "offeringKind",
  "quantityMode",
  "capacitySummary",
  "minimumOrderSummary",
  "leadTimeSummary",
  "priceEtb",
  "quantityUnit",
  "highlights",
  "videoUrl",
  "categoryId",
  "removeImage",
  "image",
  "serviceNote",
]);

export async function basicProductUpkeepAction(formData:FormData){
  const user=await requireUser();
  const businessId=int(formData,"businessId");
  const productId=int(formData,"productId")||null;
  const returnPath=productId?`/dashboard/products/${productId}`:"/dashboard/products/new";
  let result:{productId:number;contentVersion:number};
  let staged:StagedImage|null=null;
  try{
    const unsupported=[...formData.keys()].filter(key=>!productFormFields.has(key)&&!key.startsWith("$ACTION_"));
    if(unsupported.length)throw new ProductUpkeepError("The product form contains unsupported fields.");
    const file=formData.get("image");
    const hasFile=file instanceof File&&file.size>0;
    const removeImage=Boolean(formData.get("removeImage"));
    if(hasFile&&removeImage)throw new ProductUpkeepError("Choose either a replacement image or remove the current image.");
    staged=await stageTenantProductImage(user,businessId,file);
    const previous=productId?await runtimeGet<{capacity_summary:string;minimum_order_summary:string;lead_time_summary:string}>("SELECT capacity_summary,minimum_order_summary,lead_time_summary FROM products WHERE id=? AND business_id=?",[productId,businessId]):undefined;
    const optionText=String(formData.get("optionGroups")||"[]");
    if(optionText.length>25000)throw new ProductUpkeepError("Product options are too long.");
    const priceInput=text(formData,"priceEtb",40);
    const priceValue=priceInput===""?null:Number(priceInput);
    if(priceValue!==null&&(!Number.isFinite(priceValue)||priceValue<0||priceValue>9999999.99))throw new ProductUpkeepError("Price must be a valid non-negative ETB amount.");
    const videoInput=text(formData,"videoUrl",500);
    result=await executeBasicProductUpkeep(runtimeProductUpkeepPort(),user,{
      ...(formData.has("optionGroups")?{optionGroups:JSON.parse(optionText)}:{}),
      ...(formData.has("isPublished")?{isPublished:formData.get("isPublished")==="1"}:{}),
      preserveMetadata:user.access_role==="client",
      kind:text(formData,"kind",20),
      businessId,
      productId,
      expectedContentVersion:int(formData,"expectedContentVersion"),
      idempotencyKey:text(formData,"idempotencyKey",100),
      name:text(formData,"name",140),
      description:text(formData,"description",3000),
      availability:text(formData,"availability",30)||"available",
      offeringKind:text(formData,"offeringKind",40)||"standard_product",
      quantityMode:text(formData,"quantityMode",20)||"optional",
      capacitySummary:formData.has("capacitySummary")?text(formData,"capacitySummary",180):previous?.capacity_summary||"",
      minimumOrderSummary:formData.has("minimumOrderSummary")?text(formData,"minimumOrderSummary",140):previous?.minimum_order_summary||"",
      leadTimeSummary:formData.has("leadTimeSummary")?text(formData,"leadTimeSummary",140):previous?.lead_time_summary||"",
      priceMinor:priceValue===null?null:Math.round(priceValue*100),
      quantityUnit:text(formData,"quantityUnit",40),
      highlights:text(formData,"highlights",485).split(/\r?\n/),
      videoRef:videoInput?normalizeControlledYouTubeUrl(videoInput).managedRef:"",
      categoryId:int(formData,"categoryId")||null,
      imageAction:hasFile?"replace":removeImage?"remove":"keep",
      serviceNote:text(formData,"serviceNote",300),
    },staged);
  }catch(error){
    await staged?.discard();
    go(returnPath,{
      business:businessId||undefined,
      error:error instanceof Error?error.message:"Could not save product.",
    });
  }
  const business=(await runtimeBusinessById(businessId))!;
  revalidatePath(`/@${business.handle}`);
  revalidatePath(`/preview/@${business.handle}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/");
  revalidatePath(`/dashboard/products/${result.productId}`);
  go(`/dashboard/products/${result.productId}`,{business:businessId,saved:1,version:result.contentVersion});
}

export async function updateInquiryStatusAction(formData:FormData){const {businessId,user}=await authorizedOperationsBusinessId(int(formData,"businessId"));const status=text(formData,"status",20);if(!new Set(["new","contacted","confirmed","closed","cancelled"]).has(status))throw new Error("Invalid inquiry status.");await runtimeRun("UPDATE inquiries SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?",[status,int(formData,"inquiryId"),businessId]);await audit("inquiry.status_updated",{userId:user.id,businessId,detail:{status}});revalidatePath("/dashboard/inquiries");go("/dashboard/inquiries",{business:businessId,saved:1,q:text(formData,"returnQ",120)||undefined,status:text(formData,"returnStatus",20)||undefined,page:int(formData,"returnPage")||undefined});}
