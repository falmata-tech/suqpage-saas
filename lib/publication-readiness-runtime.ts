import { runtimeCatalogByBusinessId } from "./catalog-runtime";
import { runtimeGet } from "./runtime-sql";
import { publicationReadiness } from "./publication-readiness";
import type { ShopPageContent } from "./owner-page-domain";
import {isPublicProduct} from './offerings';
import {LEGACY_STARTER_LABEL_CORRECTION_ACTION,legacyStarterReviewHold,type LegacyStarterReviewHold} from './legacy-starter-review';
import type {Product} from './types';

export async function publicationLocationConfirmed(businessId:number) {
  return Boolean(await runtimeGet(`SELECT 1 FROM businesses b WHERE b.id=? AND (
    EXISTS(SELECT 1 FROM business_discovery_profiles p WHERE p.business_id=b.id AND p.approved_at>0)
    OR EXISTS(SELECT 1 FROM owner_location_proposals p WHERE p.business_id=b.id AND (p.version>1 OR p.reviewed_version>0))
  )`,[businessId]));
}
export async function legacyStarterReviewHoldForBusiness(businessId:number,about:string,products:readonly Pick<Product,'id'|'name'|'description'>[]):Promise<LegacyStarterReviewHold|undefined>{
  const row=await runtimeGet<{detail:string}>(`SELECT detail FROM audit_logs WHERE business_id=? AND action=? ORDER BY id DESC LIMIT 1`,
    [businessId,LEGACY_STARTER_LABEL_CORRECTION_ACTION]);
  return row?legacyStarterReviewHold(row.detail,about,products):undefined;
}
export async function firstPublicationIssues(businessId:number, content:ShopPageContent) {
  const catalog = await runtimeCatalogByBusinessId(businessId,true);
  if (!catalog || catalog.business.status!=="draft") return [];
  const [locationConfirmed,legacyHold]=await Promise.all([
    publicationLocationConfirmed(businessId),legacyStarterReviewHoldForBusiness(businessId,content.about,catalog.products),
  ]);
  return publicationReadiness(content,catalog.products.filter(isPublicProduct),locationConfirmed,legacyHold).filter(check=>!check.ready);
}
