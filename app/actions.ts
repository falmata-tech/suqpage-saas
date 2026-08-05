"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, requireUser, revokeAllUserSessions, setSession } from "@/lib/auth";
import { canManageBusiness, canOperateBusiness, hasCapability } from "@/lib/capabilities";
import { getBusinessById, getDb, inTransaction } from "@/lib/db";
import { runtimeUserByEmail } from "@/lib/catalog-runtime";
import { saveUploadedImage, stageUploadedImage } from "@/lib/media";
import { isStrongPassword } from "@/lib/passwords";
import { ProductUpkeepError } from "@/lib/product-upkeep-domain";
import { executeBasicProductUpkeep } from "@/lib/product-upkeep";
import { sqliteProductUpkeepPort } from "@/lib/product-upkeep-sqlite";
import { consumeRuntimeRateLimit, resetRuntimeRateLimit } from "@/lib/rate-limit-runtime";
import { audit, cleanText, currentRequestIdentity } from "@/lib/security";
import { normalizeControlledYouTubeUrl } from "@/lib/youtube-provider";
import { validateLiveSettings } from "@/lib/live-showroom";

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
  const assigned=user.access_role==="team_member"&&Boolean(getDb().prepare("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1").get(user.id,requested));
  if(!canManageBusiness(user,requested,assigned))throw new Error("Not authorized for this business.");
  if(!getBusinessById(requested))throw new Error("Business not found.");
  return {businessId:requested,user};
}

async function authorizedOperationsBusinessId(requested:number) {
  const user=await requireUser();
  if(!canOperateBusiness(user,requested))throw new Error("Operations manager access required.");
  if(!getBusinessById(requested))throw new Error("Business not found.");
  return {businessId:requested,user};
}

export async function loginAction(formData:FormData) {
  const email=text(formData,"email",160).toLowerCase();
  const password=String(formData.get("password")||"");
  const identity=await currentRequestIdentity();
  const rate=await consumeRuntimeRateLimit(`login:${identity.ipHash}:${email}`,5,15*60*1000,30*60*1000);
  if(!rate.allowed)go("/login",{error:"Too many attempts. Try again later."});
  const user=await runtimeUserByEmail(email);
  if(!user||password.length>200||!await bcrypt.compare(password,user.password_hash)){
    audit("auth.login_failed",{detail:{email},ipHash:identity.ipHash});
    go("/login",{error:"Invalid email or password."});
  }
  await resetRuntimeRateLimit(`login:${identity.ipHash}:${email}`);
  await setSession(user.id);
  audit("auth.login_success",{userId:user.id,businessId:user.business_id,ipHash:identity.ipHash});
  redirect(user.must_change_password?"/dashboard/account?required=1":"/dashboard");
}

export async function logoutAction(){const user=await requireUser({allowTemporaryPassword:true});audit("auth.logout",{userId:user.id,businessId:user.business_id});await clearSession();redirect("/login");}

export async function changePasswordAction(formData:FormData){
  const user=await requireUser({allowTemporaryPassword:true});
  const current=String(formData.get("currentPassword")||"");
  const password=String(formData.get("newPassword")||"");
  const confirm=String(formData.get("confirmPassword")||"");
  const stored=getDb().prepare("SELECT password_hash FROM users WHERE id=?").get(user.id) as {password_hash:string}|undefined;
  if(!stored||!await bcrypt.compare(current,stored.password_hash))go("/dashboard/account",{error:"Current password is incorrect."});
  if(!isStrongPassword(password))go("/dashboard/account",{error:"Use at least 12 characters with upper-case, lower-case, and a number."});
  if(password!==confirm)go("/dashboard/account",{error:"New passwords do not match."});
  const passwordHash=await bcrypt.hash(password,12);
  getDb().prepare("UPDATE users SET password_hash=?,must_change_password=0,password_updated_at=CURRENT_TIMESTAMP WHERE id=?").run(passwordHash,user.id);
  await revokeAllUserSessions(user.id);
  await setSession(user.id);
  audit("auth.password_changed",{userId:user.id,businessId:user.business_id});
  go("/dashboard/account",{saved:1});
}

export async function updateBusinessAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));
  const existing=getBusinessById(businessId)!;
  try{
    const logoPath=await saveUploadedImage(formData.get("logo"),existing.logo_path,"logo");
    const heroImage=await saveUploadedImage(formData.get("heroImage"),existing.hero_image_path,"hero");
    const favicon=await saveUploadedImage(formData.get("favicon"),existing.favicon_path,"favicon");
    const processVideoUrl=text(formData,"processVideoUrl",500);
    const processVideoRef=processVideoUrl?normalizeControlledYouTubeUrl(processVideoUrl).managedRef:"";
    const live=validateLiveSettings({isLive:formData.get("isLive"),platform:text(formData,"livePlatform",30),url:text(formData,"liveUrl",500)});
    getDb().prepare(`UPDATE businesses SET name=?,tagline=?,description=?,logo_path=?,hero_title=?,hero_subtitle=?,hero_image_path=?,contact_email=?,whatsapp=?,telegram=?,tiktok=?,process_video_ref=?,is_live=?,live_platform=?,live_url=?,site_title=?,site_description=?,favicon_path=? WHERE id=?`).run(
      text(formData,"name",100),text(formData,"tagline",180),text(formData,"description",1200),logoPath,text(formData,"heroTitle",180),text(formData,"heroSubtitle",300),heroImage,text(formData,"contactEmail",160),text(formData,"whatsapp",40).replace(/\D/g,""),text(formData,"telegram",80).replace(/^@/,""),text(formData,"tiktok",80).replace(/^@/,""),processVideoRef,live.isLive?1:0,live.platform,live.url,text(formData,"siteTitle",120),text(formData,"siteDescription",240),favicon,businessId
    );
    audit("business.updated",{userId:user.id,businessId});
  }catch(error){go("/dashboard/settings",{business:businessId,error:error instanceof Error?error.message:"Could not save settings."});}
  revalidatePath("/");revalidatePath(`/@${existing.handle}`);revalidatePath("/dashboard/settings");
  go("/dashboard/settings",{business:businessId,saved:1});
}

export async function adminUpdateBusinessAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const businessId=int(formData,"businessId"),status=text(formData,"status",20),business=getBusinessById(businessId);
  if(!business||business.status==="draft"||!operationalStatuses.has(status))go("/dashboard/admin/businesses",{error:"Only an established showroom can be suspended or restored."});
  getDb().prepare("UPDATE businesses SET status=? WHERE id=?").run(status,businessId);
  audit("admin.business_status_updated",{userId:user.id,businessId,detail:{status}});
  revalidatePath("/");revalidatePath("/dashboard/admin/businesses");go("/dashboard/admin/businesses",{saved:1});
}

export async function adminResetClientPasswordAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const userId=int(formData,"userId"),password=String(formData.get("temporaryPassword")||"");
  const target=getDb().prepare("SELECT u.id,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='client'").get(userId) as any;
  if(!target||!isStrongPassword(password))go("/dashboard/admin/clients",{error:"Choose a client and use a 12+ character password with upper-case, lower-case, and a number."});
  const passwordHash=await bcrypt.hash(password,12);
  getDb().prepare("UPDATE users SET password_hash=?,must_change_password=1 WHERE id=?").run(passwordHash,userId);
  await revokeAllUserSessions(userId);audit("admin.client_password_reset",{userId:user.id,businessId:target.business_id,detail:{targetUserId:userId}});
  revalidatePath("/dashboard/admin/clients");go("/dashboard/admin/clients",{saved:"password"});
}

export async function createCategoryAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const name=text(formData,"name",100);
  try{getDb().prepare("INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,NULL,?,?,?,1)").run(businessId,name,slugify(text(formData,"slug",80)||name),int(formData,"sortOrder"));audit("category.created",{userId:user.id,businessId,detail:{name}});}catch(error){go("/dashboard/catalog",{business:businessId,error:error instanceof Error?error.message:"Could not create category."});}
  revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"category"});
}

export async function updateCategoryAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const id=int(formData,"categoryId"),name=text(formData,"name",100);
  if(!getDb().prepare("SELECT id FROM categories WHERE id=? AND business_id=?").get(id,businessId))throw new Error("Category not found.");
  getDb().prepare("UPDATE categories SET collection_id=NULL,name=?,slug=?,sort_order=?,is_active=? WHERE id=? AND business_id=?").run(name,slugify(text(formData,"slug",80)||name),int(formData,"sortOrder"),formData.get("isActive")?1:0,id,businessId);audit("category.updated",{userId:user.id,businessId,detail:{id}});revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"category"});
}

export async function deleteCategoryAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const id=int(formData,"categoryId");inTransaction(()=>{getDb().prepare("UPDATE products SET category_id=NULL WHERE business_id=? AND category_id=?").run(businessId,id);getDb().prepare("DELETE FROM categories WHERE id=? AND business_id=?").run(id,businessId);});audit("category.deleted",{userId:user.id,businessId,detail:{id}});revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"deleted"});
}

const productFormFields = new Set([
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
  try{
    const unsupported=[...formData.keys()].filter(key=>!productFormFields.has(key)&&!key.startsWith("$ACTION_"));
    if(unsupported.length)throw new ProductUpkeepError("The product form contains unsupported fields.");
    const file=formData.get("image");
    const hasFile=file instanceof File&&file.size>0;
    const removeImage=Boolean(formData.get("removeImage"));
    if(hasFile&&removeImage)throw new ProductUpkeepError("Choose either a replacement image or remove the current image.");
    const staged=await stageUploadedImage(file,"product");
    const priceInput=text(formData,"priceEtb",40);
    const priceValue=priceInput===""?null:Number(priceInput);
    if(priceValue!==null&&(!Number.isFinite(priceValue)||priceValue<0||priceValue>9999999.99))throw new ProductUpkeepError("Price must be a valid non-negative ETB amount.");
    const videoInput=text(formData,"videoUrl",500);
    result=await executeBasicProductUpkeep(sqliteProductUpkeepPort,user,{
      kind:text(formData,"kind",20),
      businessId,
      productId,
      expectedContentVersion:int(formData,"expectedContentVersion"),
      idempotencyKey:text(formData,"idempotencyKey",100),
      name:text(formData,"name",140),
      description:text(formData,"description",3000),
      availability:text(formData,"availability",30),
      offeringKind:text(formData,"offeringKind",40),
      quantityMode:text(formData,"quantityMode",20),
      capacitySummary:text(formData,"capacitySummary",180),
      minimumOrderSummary:text(formData,"minimumOrderSummary",140),
      leadTimeSummary:text(formData,"leadTimeSummary",140),
      priceMinor:priceValue===null?null:Math.round(priceValue*100),
      quantityUnit:text(formData,"quantityUnit",40),
      highlights:text(formData,"highlights",485).split(/\r?\n/),
      videoRef:videoInput?normalizeControlledYouTubeUrl(videoInput).managedRef:"",
      categoryId:int(formData,"categoryId")||null,
      imageAction:hasFile?"replace":removeImage?"remove":"keep",
      serviceNote:text(formData,"serviceNote",300),
    },staged);
  }catch(error){
    go(returnPath,{
      business:businessId||undefined,
      error:error instanceof Error?error.message:"Could not save product.",
    });
  }
  const business=getBusinessById(businessId)!;
  revalidatePath(`/@${business.handle}`);
  revalidatePath(`/preview/@${business.handle}`);
  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${result.productId}`);
  go(`/dashboard/products/${result.productId}`,{business:businessId,saved:1,version:result.contentVersion});
}

export async function updateInquiryStatusAction(formData:FormData){const {businessId,user}=await authorizedOperationsBusinessId(int(formData,"businessId"));const status=text(formData,"status",20);if(!new Set(["new","contacted","confirmed","closed","cancelled"]).has(status))throw new Error("Invalid inquiry status.");getDb().prepare("UPDATE inquiries SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?").run(status,int(formData,"inquiryId"),businessId);audit("inquiry.status_updated",{userId:user.id,businessId,detail:{status}});revalidatePath("/dashboard/inquiries");go("/dashboard/inquiries",{business:businessId,saved:1,q:text(formData,"returnQ",120)||undefined,status:text(formData,"returnStatus",20)||undefined,page:int(formData,"returnPage")||undefined});}
