"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, requireUser, revokeAllUserSessions, setSession } from "@/lib/auth";
import { canManageBusiness, canOperateBusiness, hasCapability } from "@/lib/capabilities";
import { createDeliveryRequest } from "@/lib/deliveries";
import { getBusinessById, getDb, getUserByEmail, inTransaction } from "@/lib/db";
import { saveUploadedImage, stageUploadedImage } from "@/lib/media";
import { isStrongPassword } from "@/lib/passwords";
import { ProductUpkeepError } from "@/lib/product-upkeep-domain";
import { executeBasicProductUpkeep } from "@/lib/product-upkeep";
import { sqliteProductUpkeepPort } from "@/lib/product-upkeep-sqlite";
import { consumeRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { audit, cleanText, currentRequestIdentity } from "@/lib/security";

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

function validateRelationship(businessId:number,collectionId:number|null,categoryId:number|null) {
  if(collectionId&&!getDb().prepare("SELECT id FROM collections WHERE id=? AND business_id=?").get(collectionId,businessId))throw new Error("Collection does not belong to this business.");
  if(categoryId&&!getDb().prepare("SELECT id FROM categories WHERE id=? AND business_id=?").get(categoryId,businessId))throw new Error("Category does not belong to this business.");
}

export async function loginAction(formData:FormData) {
  const email=text(formData,"email",160).toLowerCase();
  const password=String(formData.get("password")||"");
  const identity=await currentRequestIdentity();
  const rate=consumeRateLimit(`login:${identity.ipHash}:${email}`,5,15*60*1000,30*60*1000);
  if(!rate.allowed)go("/login",{error:"Too many attempts. Try again later."});
  const user=getUserByEmail(email);
  if(!user||password.length>200||!bcrypt.compareSync(password,user.password_hash)){
    audit("auth.login_failed",{detail:{email},ipHash:identity.ipHash});
    go("/login",{error:"Invalid email or password."});
  }
  resetRateLimit(`login:${identity.ipHash}:${email}`);
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
  const stored=getDb().prepare("SELECT password_hash FROM users WHERE id=?").get(user.id) as any;
  if(!stored||!bcrypt.compareSync(current,stored.password_hash))go("/dashboard/account",{error:"Current password is incorrect."});
  if(!isStrongPassword(password))go("/dashboard/account",{error:"Use at least 12 characters with upper-case, lower-case, and a number."});
  if(password!==confirm)go("/dashboard/account",{error:"New passwords do not match."});
  getDb().prepare("UPDATE users SET password_hash=?,must_change_password=0,password_updated_at=CURRENT_TIMESTAMP WHERE id=?").run(bcrypt.hashSync(password,12),user.id);
  revokeAllUserSessions(user.id);
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
    getDb().prepare(`UPDATE businesses SET name=?,tagline=?,description=?,logo_path=?,hero_title=?,hero_subtitle=?,hero_image_path=?,contact_email=?,whatsapp=?,telegram=?,tiktok=?,site_title=?,site_description=?,favicon_path=? WHERE id=?`).run(
      text(formData,"name",100),text(formData,"tagline",180),text(formData,"description",1200),logoPath,text(formData,"heroTitle",180),text(formData,"heroSubtitle",300),heroImage,text(formData,"contactEmail",160),text(formData,"whatsapp",40).replace(/\D/g,""),text(formData,"telegram",80).replace(/^@/,""),text(formData,"tiktok",80).replace(/^@/,""),text(formData,"siteTitle",120),text(formData,"siteDescription",240),favicon,businessId
    );
    audit("business.updated",{userId:user.id,businessId});
  }catch(error){go("/dashboard/settings",{business:businessId,error:error instanceof Error?error.message:"Could not save settings."});}
  revalidatePath("/");revalidatePath(`/@${existing.handle}`);revalidatePath("/dashboard/settings");
  go("/dashboard/settings",{business:businessId,saved:1});
}

export async function adminUpdateBusinessAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const businessId=int(formData,"businessId"),status=text(formData,"status",20),business=getBusinessById(businessId);
  if(!business||business.status==="draft"||!operationalStatuses.has(status))go("/dashboard/admin",{error:"Only an established showroom can be suspended or restored."});
  getDb().prepare("UPDATE businesses SET status=? WHERE id=?").run(status,businessId);
  audit("admin.business_status_updated",{userId:user.id,businessId,detail:{status}});
  revalidatePath("/");go("/dashboard/admin",{saved:1});
}

export async function adminResetClientPasswordAction(formData:FormData){
  const user=await requireUser();if(!hasCapability(user,"platform:admin"))throw new Error("Administrator access required.");
  const userId=int(formData,"userId"),password=String(formData.get("temporaryPassword")||"");
  const target=getDb().prepare("SELECT u.id,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND p.access_role='client'").get(userId) as any;
  if(!target||!isStrongPassword(password))go("/dashboard/admin",{error:"Choose a client and use a 12+ character password with upper-case, lower-case, and a number."});
  getDb().prepare("UPDATE users SET password_hash=?,must_change_password=1 WHERE id=?").run(bcrypt.hashSync(password,12),userId);
  revokeAllUserSessions(userId);audit("admin.client_password_reset",{userId:user.id,businessId:target.business_id,detail:{targetUserId:userId}});
  go("/dashboard/admin",{saved:"password"});
}

export async function createCollectionAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const name=text(formData,"name",100);if(!name)go("/dashboard/catalog",{business:businessId,error:"Collection name is required."});
  try{getDb().prepare("INSERT INTO collections(business_id,name,slug,description,sort_order,is_active) VALUES(?,?,?,?,?,1)").run(businessId,name,slugify(text(formData,"slug",80)||name),text(formData,"description",500),int(formData,"sortOrder"));audit("collection.created",{userId:user.id,businessId,detail:{name}});}catch(error){go("/dashboard/catalog",{business:businessId,error:error instanceof Error?error.message:"Could not create collection."});}
  revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"collection"});
}

export async function updateCollectionAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const id=int(formData,"collectionId"),name=text(formData,"name",100);
  const existing=getDb().prepare("SELECT id FROM collections WHERE id=? AND business_id=?").get(id,businessId);if(!existing)throw new Error("Collection not found.");
  getDb().prepare("UPDATE collections SET name=?,slug=?,description=?,sort_order=?,is_active=? WHERE id=? AND business_id=?").run(name,slugify(text(formData,"slug",80)||name),text(formData,"description",500),int(formData,"sortOrder"),formData.get("isActive")?1:0,id,businessId);audit("collection.updated",{userId:user.id,businessId,detail:{id}});revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"collection"});
}

export async function deleteCollectionAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const id=int(formData,"collectionId");
  inTransaction(()=>{getDb().prepare("UPDATE products SET collection_id=NULL WHERE business_id=? AND collection_id=?").run(businessId,id);getDb().prepare("UPDATE categories SET collection_id=NULL WHERE business_id=? AND collection_id=?").run(businessId,id);getDb().prepare("DELETE FROM collections WHERE id=? AND business_id=?").run(id,businessId);});audit("collection.deleted",{userId:user.id,businessId,detail:{id}});revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"deleted"});
}

export async function createCategoryAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const name=text(formData,"name",100),collectionId=int(formData,"collectionId")||null;validateRelationship(businessId,collectionId,null);
  try{getDb().prepare("INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,?,?,?,?,1)").run(businessId,collectionId,name,slugify(text(formData,"slug",80)||name),int(formData,"sortOrder"));audit("category.created",{userId:user.id,businessId,detail:{name}});}catch(error){go("/dashboard/catalog",{business:businessId,error:error instanceof Error?error.message:"Could not create category."});}
  revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"category"});
}

export async function updateCategoryAction(formData:FormData){
  const {businessId,user}=await authorizedBusinessId(int(formData,"businessId"));const id=int(formData,"categoryId"),collectionId=int(formData,"collectionId")||null,name=text(formData,"name",100);validateRelationship(businessId,collectionId,null);
  if(!getDb().prepare("SELECT id FROM categories WHERE id=? AND business_id=?").get(id,businessId))throw new Error("Category not found.");
  getDb().prepare("UPDATE categories SET collection_id=?,name=?,slug=?,sort_order=?,is_active=? WHERE id=? AND business_id=?").run(collectionId,name,slugify(text(formData,"slug",80)||name),int(formData,"sortOrder"),formData.get("isActive")?1:0,id,businessId);audit("category.updated",{userId:user.id,businessId,detail:{id}});revalidatePath("/dashboard/catalog");go("/dashboard/catalog",{business:businessId,saved:"category"});
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
  "collectionId",
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
    result=executeBasicProductUpkeep(sqliteProductUpkeepPort,user,{
      kind:text(formData,"kind",20),
      businessId,
      productId,
      expectedContentVersion:int(formData,"expectedContentVersion"),
      idempotencyKey:text(formData,"idempotencyKey",100),
      name:text(formData,"name",140),
      description:text(formData,"description",3000),
      availability:text(formData,"availability",30),
      collectionId:int(formData,"collectionId")||null,
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

export async function updateInquiryStatusAction(formData:FormData){const {businessId,user}=await authorizedOperationsBusinessId(int(formData,"businessId"));const status=text(formData,"status",20);if(!new Set(["new","contacted","confirmed","closed","cancelled"]).has(status))throw new Error("Invalid inquiry status.");getDb().prepare("UPDATE inquiries SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND business_id=?").run(status,int(formData,"inquiryId"),businessId);audit("inquiry.status_updated",{userId:user.id,businessId,detail:{status}});revalidatePath("/dashboard/inquiries");go("/dashboard/inquiries",{business:businessId,saved:1});}

export async function createDeliveryRequestAction(formData:FormData){
  const {businessId,user}=await authorizedOperationsBusinessId(int(formData,"businessId"));
  let result:{externalRequestId:string};
  try{result=createDeliveryRequest({businessId,inquiryId:int(formData,"inquiryId")||null,customerName:text(formData,"customerName",80),phone:text(formData,"phone",40),pickupAddress:text(formData,"pickupAddress",300),deliveryAddress:text(formData,"deliveryAddress",300),packageCount:int(formData,"packageCount",1),note:text(formData,"note",1000),companyIds:formData.getAll("companyIds"),idempotencyKey:crypto.randomUUID()},user.business_id,hasCapability(user,"operations:manage"));}catch(error){go("/dashboard/deliveries",{business:businessId,error:error instanceof Error?error.message:"Could not create delivery request."});}
  audit("delivery.created",{userId:user.id,businessId,detail:result});revalidatePath("/dashboard/deliveries");revalidatePath("/dashboard/inquiries");go("/dashboard/deliveries",{business:businessId,created:result.externalRequestId});
}
