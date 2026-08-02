import fs from "node:fs";
import path from "node:path";

export function databasePath(){return path.resolve(/* turbopackIgnore: true */ process.env.MIRTPAGE_DB_PATH||path.join(/* turbopackIgnore: true */ process.cwd(),"data","mirtpage.db"))}
export function mediaRoot(){return path.resolve(/* turbopackIgnore: true */ process.env.MIRTPAGE_MEDIA_ROOT||path.join(/* turbopackIgnore: true */ process.cwd(),"data","media"))}
export function backupRoot(){return path.resolve(/* turbopackIgnore: true */ process.env.MIRTPAGE_BACKUP_ROOT||path.join(/* turbopackIgnore: true */ process.cwd(),"backups"))}
export function requestAttachmentRoot(){return path.resolve(/* turbopackIgnore: true */ mediaRoot(),"requests")}
export function mediaStorageDriver(){const value=(process.env.MIRTPAGE_MEDIA_DRIVER||"filesystem").trim();if(value!=="filesystem"&&value!=="supabase")throw new Error("MIRTPAGE_MEDIA_DRIVER must be filesystem or supabase.");return value as "filesystem"|"supabase"}
export function supabaseMediaStorageConfig(){return{url:(process.env.MIRTPAGE_SUPABASE_URL||"").trim(),serviceRoleKey:process.env.MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY||"",bucket:(process.env.MIRTPAGE_SUPABASE_STORAGE_BUCKET||"mirtpage-media").trim()}}
export function productUpkeepEnabled(){return process.env.MIRTPAGE_PRODUCT_UPKEEP_ENABLED!=="0"}
export function recipeStudioEnabled(){return process.env.MIRTPAGE_RECIPE_STUDIO_ENABLED!=="0"}
export function controlledYouTubeAdmissionEnabled(){return process.env.MIRTPAGE_YOUTUBE_ADMISSION_ENABLED==="1"}
export function supportWhatsAppUrl(){
  const value=process.env.MIRTPAGE_SUPPORT_WHATSAPP_URL||"";
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(value)?value:"";
}
export function ensureRuntimeDirectories(){fs.mkdirSync(path.dirname(databasePath()),{recursive:true});fs.mkdirSync(mediaRoot(),{recursive:true});fs.mkdirSync(requestAttachmentRoot(),{recursive:true})}
export function assertProductionConfiguration(){
  if(process.env.NODE_ENV!=="production")return;
  const url=process.env.NEXT_PUBLIC_APP_URL||"";
  if(!/^https:\/\//i.test(url))throw new Error("NEXT_PUBLIC_APP_URL must be an HTTPS URL in production.");
  if(!process.env.MIRTPAGE_DB_PATH)throw new Error("MIRTPAGE_DB_PATH is required in production and must point to persistent storage.");
  if(!process.env.PRIVACY_SALT||process.env.PRIVACY_SALT.length<24)throw new Error("PRIVACY_SALT must be at least 24 characters in production.");
  const driver=mediaStorageDriver();
  if(driver==="filesystem"&&!process.env.MIRTPAGE_MEDIA_ROOT)throw new Error("MIRTPAGE_MEDIA_ROOT is required for filesystem media in production and must point to persistent storage.");
  if(driver==="supabase"){
    const storage=supabaseMediaStorageConfig();
    let parsed:URL;
    try{parsed=new URL(storage.url);}catch{throw new Error("MIRTPAGE_SUPABASE_URL must be a valid HTTPS URL in Supabase media mode.");}
    if(parsed.protocol!=="https:"||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error("MIRTPAGE_SUPABASE_URL must be a valid HTTPS URL in Supabase media mode.");
    if(storage.serviceRoleKey.length<20)throw new Error("MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY is required in Supabase media mode.");
    if(!/^[a-z0-9][a-z0-9_-]{1,62}$/i.test(storage.bucket))throw new Error("MIRTPAGE_SUPABASE_STORAGE_BUCKET is invalid.");
  }
  fs.mkdirSync(path.dirname(databasePath()),{recursive:true});
  fs.mkdirSync(backupRoot(),{recursive:true});
  fs.accessSync(path.dirname(databasePath()),fs.constants.R_OK|fs.constants.W_OK);
  if(driver==="filesystem"){
    fs.mkdirSync(mediaRoot(),{recursive:true});
    fs.mkdirSync(requestAttachmentRoot(),{recursive:true});
    fs.accessSync(mediaRoot(),fs.constants.R_OK|fs.constants.W_OK);
  }
}
