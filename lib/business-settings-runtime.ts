import {runtimeGet,runtimeTransaction} from './runtime-sql';
import {audit,cleanText} from './security';
import {validateLiveSettings} from './live-showroom';
import type {SessionUser} from './types';

export class BusinessSettingsError extends Error {}
export type BusinessSettingsSection='identity'|'live'|'sharing';
type LegacyBusinessSettingsWrite={
  expectedVersion:unknown;name:unknown;contactEmail:unknown;isLive:unknown;livePlatform:unknown;liveUrl:unknown;siteTitle:unknown;siteDescription:unknown;
  /** Media references come from the authenticated upload adapter, never form strings. */
  logoPath:string;faviconPath:string;
};
type FocusedBusinessSettingsWrite={expectedVersion:unknown;section:BusinessSettingsSection}&(
  {section:'identity';name:unknown;contactEmail:unknown;logoPath?:string}|
  {section:'live';isLive:unknown;livePlatform:unknown;liveUrl:unknown}|
  {section:'sharing';siteTitle:unknown;siteDescription:unknown}
);
export type BusinessSettingsWrite=LegacyBusinessSettingsWrite|FocusedBusinessSettingsWrite;

const sectionFields:Record<BusinessSettingsSection,readonly string[]>={
  identity:['name','contactEmail','logoPath'],live:['isLive','livePlatform','liveUrl'],sharing:['siteTitle','siteDescription'],
};
type SavedSettings={id:number;name:string;contact_email:string;logo_path:string;favicon_path:string;is_live:number;live_platform:string;live_url:string;site_title:string;site_description:string;content_version:number};

export async function saveBusinessSettings(actor:SessionUser,businessId:number,input:BusinessSettingsWrite) {
  if(actor.access_role!=='platform_admin'||!Number.isSafeInteger(businessId)||businessId<1)throw new BusinessSettingsError('Not authorized for this business.');
  const expectedVersion=Number(input.expectedVersion),values=input as unknown as Record<string,unknown>;
  if(!Number.isSafeInteger(expectedVersion)||expectedVersion<1)throw new BusinessSettingsError('Reload before saving your business details.');
  let section:BusinessSettingsSection|undefined;
  if(Object.hasOwn(values,'section')){
    if(typeof values.section!=='string'||!Object.hasOwn(sectionFields,values.section))throw new BusinessSettingsError('Reload before saving your business details.');
    section=values.section as BusinessSettingsSection;
    const allowed=new Set(['expectedVersion','section',...sectionFields[section]]);
    if(Object.keys(values).some(key=>!allowed.has(key)))throw new BusinessSettingsError('Reload before saving your business details.');
    if(sectionFields[section].filter(key=>key!=='logoPath').some(key=>!Object.hasOwn(values,key)))throw new BusinessSettingsError('Reload before saving your business details.');
    if(Object.hasOwn(values,'logoPath')&&typeof values.logoPath!=='string')throw new BusinessSettingsError('Reload before saving your business details.');
  }
  return runtimeTransaction(async()=>{
    const authority=await runtimeGet("SELECT p.user_id FROM user_access_profiles p WHERE p.user_id=? AND p.access_role='platform_admin' FOR SHARE",[actor.id]);
    if(!authority)throw new BusinessSettingsError('Not authorized for this business.');
    const current=section?await runtimeGet<SavedSettings>('SELECT id,name,contact_email,logo_path,favicon_path,is_live,live_platform,live_url,site_title,site_description,content_version FROM businesses WHERE id=? FOR UPDATE',[businessId]):null;
    if(section&&(!current||current.content_version!==expectedVersion))throw new BusinessSettingsError('Business details changed. Reload before saving.');
    // Omitted fields come from the locked canonical row, never posted snapshots.
    const merged:Record<string,unknown>=current?{name:current.name,contactEmail:current.contact_email,logoPath:current.logo_path,faviconPath:current.favicon_path,isLive:Boolean(current.is_live),livePlatform:current.live_platform,liveUrl:current.live_url,siteTitle:current.site_title,siteDescription:current.site_description,...values}:values;
    const name=cleanText(merged.name,100),email=cleanText(merged.contactEmail,160);
    const logoPath=merged.logoPath,faviconPath=merged.faviconPath;
    if(typeof logoPath!=='string'||typeof faviconPath!=='string')throw new BusinessSettingsError('Reload before saving your business details.');
    if(!name)throw new BusinessSettingsError('Enter a business name.');
    if(email&&!/^\S+@\S+\.\S+$/.test(email))throw new BusinessSettingsError('Enter a valid email address.');
    let live:ReturnType<typeof validateLiveSettings>;
    try{live=validateLiveSettings({isLive:merged.isLive,platform:merged.livePlatform,url:merged.liveUrl});}
    catch(error){throw new BusinessSettingsError(error instanceof Error?error.message:'Could not save settings.');}
    const saved=await runtimeGet<{id:number;content_version:number}>(`UPDATE businesses SET name=?,logo_path=?,contact_email=?,is_live=?,live_platform=?,live_url=?,site_title=?,site_description=?,favicon_path=?,content_version=content_version+1
      WHERE id=? AND content_version=? RETURNING id,content_version`,[
      name,logoPath,email,live.isLive?1:0,live.platform,live.url,cleanText(merged.siteTitle,120),cleanText(merged.siteDescription,240),faviconPath,businessId,expectedVersion,
    ]);
    if(!saved)throw new BusinessSettingsError('Business details changed. Reload before saving.');
    await audit('business.updated',{userId:actor.id,businessId});
    return saved;
  });
}
