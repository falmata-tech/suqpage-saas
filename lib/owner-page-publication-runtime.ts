import { firstPublicationIssues } from "./publication-readiness-runtime";
import { OwnerPageError } from "./owner-page-domain";
import { applyPendingOwnerLocation } from "./owner-business-runtime";
import { parseShopPageContent, type ShopPageContent } from "./owner-page-domain";
import type { PagePublication, PagePublicationPort } from "./owner-page-publication";
import { ownerPageEditorEnabled } from "./owner-page-runtime";
import { ownerPageImageKey } from "./owner-page-media";
import { getMediaObjectStore } from "./media-storage";
import { mediaMime } from "./media";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import { publicPageContent } from "./business-profile";
import { currentBusinessAuthority } from './staff-business-authority';
export { publicPageContent } from "./business-profile";

type PublicationRow = {
  business_id: number; revision: number; draft_version: number; content_json: string | null;
  action: "publish" | "restore"; published_by: number; published_at: number;
};
function publication(row: PublicationRow): PagePublication {
  return { businessId: row.business_id, revision: row.revision, draftVersion: row.draft_version,
    content: row.content_json === null ? null : parseShopPageContent(JSON.parse(row.content_json)),
    action: row.action, publishedBy: row.published_by, publishedAt: Number(row.published_at) };
}
async function latest(businessId: number): Promise<PagePublication | null> {
  const row = await runtimeGet<PublicationRow>("SELECT * FROM owner_page_publications WHERE business_id=? ORDER BY revision DESC LIMIT 1", [businessId]);
  return row ? publication(row) : null;
}
async function active(businessId: number): Promise<boolean> {
  return Boolean(await runtimeGet("SELECT 1 FROM businesses WHERE id=? AND status='active'", [businessId]));
}
export const pagePublicationPort: PagePublicationPort = {
  latest,
  async publishable(businessId) {
    return Boolean(await runtimeGet("SELECT 1 FROM businesses b WHERE b.id=? AND (b.status='active' OR (b.status='draft' AND EXISTS(SELECT 1 FROM products p WHERE p.business_id=b.id AND p.is_published=1 AND p.offering_kind<>'service')))", [businessId]));
  },
  async previous(businessId, revision) {
    const row = await runtimeGet<PublicationRow>("SELECT * FROM owner_page_publications WHERE business_id=? AND revision<? ORDER BY revision DESC LIMIT 1", [businessId, revision]);
    return row ? publication(row) : null;
  },
  async commit(actor, draft, expectedRevision, content, action) {
    return runtimeTransaction(async () => {
      if(!await currentBusinessAuthority(actor,draft.businessId,true))return null;
      // A no-op update locks the same row as content/consent writes, without
      // changing the owner's draft or granting a new publication authority.
      const locked = await runtimeRun(`UPDATE owner_page_drafts SET version=version WHERE business_id=? AND version=?`,
      [draft.businessId, draft.version]);
      if (!locked.changes) return null;
      const business = await runtimeRun("UPDATE businesses SET content_version=content_version WHERE id=? AND (status='active' OR (status='draft' AND EXISTS(SELECT 1 FROM products p WHERE p.business_id=businesses.id AND p.is_published=1 AND p.offering_kind<>'service')))", [draft.businessId]);
      if (!business.changes) return null;
      const current = await latest(draft.businessId);
      if ((current?.revision || 0) !== expectedRevision) return null;
      if (action === "publish" && content) {
        const issues = await firstPublicationIssues(draft.businessId, content);
        if (issues.length) throw new OwnerPageError(issues[0].label);
      }
      const now = Date.now();
      await runtimeRun(`INSERT INTO owner_page_publications
        (business_id,revision,draft_version,content_json,action,published_by,published_at)
        VALUES(?,?,?,?,?,?,?)`, [draft.businessId, expectedRevision + 1, draft.version,
        content ? JSON.stringify(content) : null, action, actor.id, now]);
      await runtimeRun("UPDATE businesses SET status='active' WHERE id=? AND status='draft'", [draft.businessId]);
      await applyPendingOwnerLocation(draft.businessId);
      return latest(draft.businessId);
    });
  },
};

export async function runtimePublishedPage(businessId: number): Promise<ShopPageContent | undefined> {
  if (!ownerPageEditorEnabled() || !(await active(businessId))) return undefined;
  const current = await latest(businessId);
  return current?.content ? publicPageContent(businessId, current.content) : undefined;
}

export async function runtimeCurrentPageCovers(businessIds: number[]): Promise<Map<number, string>> {
  const covers = new Map<number, string>();
  if (!ownerPageEditorEnabled()) return covers;
  const ids = [...new Set(businessIds.filter((id) => Number.isSafeInteger(id) && id > 0))];
  // Keep frequently edited covers outside the heavier geography/schedule cache.
  // Batches cap query parameters and avoid one database call for every card.
  for (let offset = 0; offset < ids.length; offset += 250) {
    const batch = ids.slice(offset, offset + 250);
    const rows = await runtimeAll<{ id: number; hero_image_path: string; content_json: string | null }>(`
      SELECT b.id,b.hero_image_path,p.content_json FROM businesses b
      LEFT JOIN owner_page_publications p ON p.business_id=b.id
        AND p.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id)
      WHERE b.status='active' AND b.id IN (${batch.map(() => "?").join(",")})`, batch);
    for (const row of rows) covers.set(row.id, row.content_json
      ? publicPageContent(row.id, parseShopPageContent(JSON.parse(row.content_json))).heroImage
      : row.hero_image_path);
  }
  return covers;
}

export async function runtimePublishedPageImage(businessId: number, filename: string) {
  if (!ownerPageEditorEnabled() || !Number.isSafeInteger(businessId) || businessId < 1 || !(await active(businessId))) return null;
  const current = await latest(businessId);
  if (!current?.content || ownerPageImageKey(businessId, current.content.heroImage) !== filename) return null;
  const image = await getMediaObjectStore().read("pages", filename, mediaMime(filename));
  if (!(await active(businessId)) || (await latest(businessId))?.revision !== current.revision) return null;
  return image;
}
