import { runtimeCatalogByBusinessId } from "./catalog-runtime";
import { runtimeGet } from "./runtime-sql";
import { publicationReadiness } from "./publication-readiness";
import type { ShopPageContent } from "./owner-page-domain";
import {isPublicProduct} from './offerings';

export async function publicationLocationConfirmed(businessId:number) {
  return Boolean(await runtimeGet(`SELECT 1 FROM businesses b WHERE b.id=? AND (
    EXISTS(SELECT 1 FROM business_discovery_profiles p WHERE p.business_id=b.id AND p.approved_at>0)
    OR EXISTS(SELECT 1 FROM owner_location_proposals p WHERE p.business_id=b.id AND (p.version>1 OR p.reviewed_version>0))
  )`,[businessId]));
}
export async function firstPublicationIssues(businessId:number, content:ShopPageContent) {
  const catalog = await runtimeCatalogByBusinessId(businessId,true);
  if (!catalog || catalog.business.status!=="draft") return [];
  return publicationReadiness(content,catalog.products.filter(isPublicProduct),await publicationLocationConfirmed(businessId)).filter(check=>!check.ready);
}
