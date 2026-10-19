import { platformEnvironment } from "./platform-environment.mjs";
import { runtimeCatalogByBusinessId } from "./catalog-runtime";
import { OwnerPageError, readSavedPageContent, type OwnerPageDraft } from "./owner-page-domain";
import type { OwnerPagePort } from "./owner-page-service";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import { ownerPageImageKey } from "./owner-page-media";
import { getMediaObjectStore } from "./media-storage";
import { mediaMime } from "./media";
import { currentBusinessAuthority } from './staff-business-authority';

export function ownerPageEditorEnabled(): boolean {
  return platformEnvironment().SUQPAGE_OWNER_EDITOR_ENABLED !== "0";
}
type DraftRow = { business_id: number; version: number; content_json: string; assistance_enabled: number; updated_by: number; updated_at: number };
function draft(row: DraftRow): OwnerPageDraft {
  return { businessId: row.business_id, version: row.version, content: readSavedPageContent(JSON.parse(row.content_json)),
    assistanceEnabled: row.assistance_enabled === 1, updatedBy: row.updated_by, updatedAt: Number(row.updated_at) };
}
async function read(businessId: number) {
  const row = await runtimeGet<DraftRow>("SELECT * FROM owner_page_drafts WHERE business_id=?", [businessId]);
  return row ? draft(row) : null;
}
export const ownerPagePort: OwnerPagePort = {
  read,
  async authorized(actor,businessId) {
    return (await currentBusinessAuthority(actor,businessId)) !== null;
  },
  async hasImage(businessId, ref) {
    const key = ownerPageImageKey(businessId, ref);
    if (key) return Boolean(await getMediaObjectStore().read("pages", key, mediaMime(key)));
    const catalog = await runtimeCatalogByBusinessId(businessId, true);
    if (!catalog) throw new OwnerPageError("Page not found.", 404);
    return [catalog.business.hero_image_path, catalog.business.logo_path, ...catalog.products.map((p) => p.image_path)].filter(Boolean).includes(ref);
  },
  async create(businessId, actor, content) {
    return runtimeTransaction(async () => {
      if(!await currentBusinessAuthority(actor,businessId,true))throw new OwnerPageError('Page access is not available for this account.',403);
      const now = Date.now();
      const result = await runtimeRun(`INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at)
        VALUES(?,1,?,0,?,?) ON CONFLICT(business_id) DO NOTHING`, [businessId, JSON.stringify(content), actor.id, now]);
      if (result.changes) await runtimeRun("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,1,?,'created',?)", [businessId, actor.id, now]);
      return (await read(businessId))!;
    });
  },
  async commit(actor, before, change) {
    return runtimeTransaction(async () => {
      if(!await currentBusinessAuthority(actor,before.businessId,true))return null;
      const now = Date.now();
      const result = await runtimeRun(`UPDATE owner_page_drafts SET content_json=?,version=version+1,updated_by=?,updated_at=?
        WHERE business_id=? AND version=?`, [JSON.stringify(change.content), actor.id, now, before.businessId, before.version]);
      if (!result.changes) return null;
      // A stale version or revoked permission remains a conflict. A disallowed video
      // rolls back this transaction, including the conditional update above.
      await runtimeRun("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,?,?,'content',?)", [before.businessId, before.version + 1, actor.id, now]);
      return read(before.businessId);
    });
  },
};
