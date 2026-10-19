import { runtimeAll, runtimeGet } from "./runtime-sql";
import type { PublicSeoEntry } from "./public-seo";

const ELIGIBLE_PRODUCT = "p.is_published=1 AND p.offering_kind<>'service'";
const ELIGIBLE_BUSINESS = `b.status='active' AND b.is_demo=0 AND d.is_excluded=0 AND d.approved_at>0
  AND EXISTS(SELECT 1 FROM products visible WHERE visible.business_id=b.id
    AND visible.is_published=1 AND visible.offering_kind<>'service')`;

const ELIGIBLE_BUSINESSES_SQL = `
  SELECT b.id,b.handle FROM businesses b
  JOIN business_discovery_profiles d ON d.business_id=b.id
  WHERE ${ELIGIBLE_BUSINESS}
`;

export type PublicDirectoryBusiness = {
  id: number;
  handle: string;
  name: string;
  summary: string;
  logo_path: string;
  city: string;
  category_key: string | null;
};

/** A directly shared showroom can remain viewable without entering search. */
export async function publicSeoBusinessEligible(businessId: number): Promise<boolean> {
  if (!Number.isSafeInteger(businessId) || businessId <= 0) return false;
  const row = await runtimeGet<{ id: number }>(`
    SELECT b.id FROM businesses b
    JOIN business_discovery_profiles d ON d.business_id=b.id
    WHERE b.id=? AND ${ELIGIBLE_BUSINESS}
  `, [businessId]);
  return Boolean(row);
}

/** Counts canonical public entries only. No merchant content or private rows are read. */
export async function countPublicSeoEntries(): Promise<number> {
  const row = await runtimeGet<{ total: number | string }>(`
    WITH eligible_businesses AS (${ELIGIBLE_BUSINESSES_SQL})
    SELECT (
      (SELECT COUNT(*) FROM eligible_businesses) +
      (SELECT COUNT(*) FROM products p JOIN eligible_businesses b ON b.id=p.business_id
        WHERE ${ELIGIBLE_PRODUCT})
    ) AS total
  `);
  const count = Number(row?.total);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid public sitemap count");
  return count;
}

/** One bounded page; business and product URLs share the same tenant eligibility. */
export async function listPublicSeoEntries(limit: number, offset: number): Promise<PublicSeoEntry[]> {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10_000 || !Number.isSafeInteger(offset) || offset < 0) {
    throw new Error("Invalid public sitemap window");
  }
  return runtimeAll<PublicSeoEntry>(`
    WITH eligible_businesses AS (${ELIGIBLE_BUSINESSES_SQL})
    SELECT entries.handle,entries.product_id
    FROM (
      SELECT b.id business_id,b.handle,0 kind,NULL::bigint product_id
      FROM eligible_businesses b
      UNION ALL
      SELECT b.id business_id,b.handle,1 kind,p.id product_id
      FROM eligible_businesses b JOIN products p ON p.business_id=b.id
      WHERE ${ELIGIBLE_PRODUCT}
    ) entries
    ORDER BY entries.business_id,entries.kind,entries.product_id
    LIMIT ? OFFSET ?
  `, [limit, offset]);
}

/** Public directory keyset; fetch one extra row to decide whether Next exists. */
export async function listPublicDirectoryBusinesses(afterId: number, limit = 25): Promise<PublicDirectoryBusiness[]> {
  if (!Number.isSafeInteger(afterId) || afterId < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 25) {
    throw new Error("Invalid public directory window");
  }
  return runtimeAll<PublicDirectoryBusiness>(`
    SELECT b.id,b.handle,b.name,
      LEFT(COALESCE(NULLIF(publication.content_json::jsonb->>'about',''),
        NULLIF(publication.content_json::jsonb->>'introduction',''),
        NULLIF(b.description,''),NULLIF(b.tagline,''),''),240) AS summary,
      b.logo_path,d.city,
      (SELECT i.industry_key FROM business_industries i WHERE i.business_id=b.id ORDER BY i.industry_key LIMIT 1) AS category_key
    FROM businesses b
    JOIN business_discovery_profiles d ON d.business_id=b.id
    LEFT JOIN owner_page_publications publication ON publication.business_id=b.id
      AND publication.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id)
    WHERE ${ELIGIBLE_BUSINESS} AND b.id>?
    ORDER BY b.id
    LIMIT ?
  `, [afterId, limit]);
}
