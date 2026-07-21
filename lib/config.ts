import fs from "node:fs";
import path from "node:path";

export function databasePath(){return path.resolve(process.env.SUQPAGE_DB_PATH||path.join(/* turbopackIgnore: true */ process.cwd(),"data","suqpage.db"))}
export function mediaRoot(){return path.resolve(process.env.SUQPAGE_MEDIA_ROOT||path.join(/* turbopackIgnore: true */ process.cwd(),"data","media"))}
export function ensureRuntimeDirectories(){fs.mkdirSync(path.dirname(databasePath()),{recursive:true});fs.mkdirSync(mediaRoot(),{recursive:true})}
export function assertProductionConfiguration(){
  if(process.env.NODE_ENV!=="production")return;
  const url=process.env.NEXT_PUBLIC_APP_URL||"";
  if(!/^https:\/\//i.test(url))throw new Error("NEXT_PUBLIC_APP_URL must be an HTTPS URL in production.");
  if(!process.env.SUQPAGE_DB_PATH)throw new Error("SUQPAGE_DB_PATH is required in production and must point to persistent storage.");
  if(!process.env.SUQPAGE_MEDIA_ROOT)throw new Error("SUQPAGE_MEDIA_ROOT is required in production and must point to persistent storage.");
  if(!process.env.PRIVACY_SALT||process.env.PRIVACY_SALT.length<24)throw new Error("PRIVACY_SALT must be at least 24 characters in production.");
  ensureRuntimeDirectories();fs.accessSync(path.dirname(databasePath()),fs.constants.R_OK|fs.constants.W_OK);fs.accessSync(mediaRoot(),fs.constants.R_OK|fs.constants.W_OK);
}
