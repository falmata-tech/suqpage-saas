import { platformEnvironment } from "./platform-environment.mjs";
import { runtimeCatalogByBusinessId } from "./catalog-runtime";
import { OwnerPageError, readSavedPageContent, type OwnerPageDraft } from "./owner-page-domain";
import type { OwnerPagePort } from "./owner-page-service";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import { ownerPageImageKey } from "./owner-page-media";
import { getMediaObjectStore } from "./media-storage";
import { mediaMime } from "./media";
import { isQueueAgent } from "./capabilities";

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
  async assigned(userId, businessId) {
    return Boolean(await runtimeGet("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1", [userId, businessId]));
  },
  async hasImage(businessId, ref) {
    const key = ownerPageImageKey(businessId, ref);
    if (key) return Boolean(await getMediaObjectStore().read("pages", key, mediaMime(key)));
    const catalog = await runtimeCatalogByBusinessId(businessId, true);
    if (!catalog) throw new OwnerPageError("Page not found.", 404);
    return [catalog.business.hero_image_path, catalog.business.logo_path, ...catalog.products.map((p) => p.image_path)].filter(Boolean).includes(ref);
  },
  async create(businessId, actorId, content) {
    return runtimeTransaction(async () => {
      const now = Date.now();
      const result = await runtimeRun(`INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at)
        VALUES(?,1,?,0,?,?) ON CONFLICT(business_id) DO NOTHING`, [businessId, JSON.stringify(content), actorId, now]);
      if (result.changes) await runtimeRun("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,1,?,'created',?)", [businessId, actorId, now]);
      return (await read(businessId))!;
    });
  },
  async commit(actor, before, change) {
    if (isQueueAgent(actor)) return null;
    return runtimeTransaction(async () => {
      const now = Date.now();
      const isOwner = actor.access_role === "client" && actor.business_id === before.businessId;
      const operator = actor.access_role === "platform_admin" || actor.access_role === "operations_manager";
      const team = actor.access_role === "team_member";
      if (change.kind === "consent" && !isOwner) return null;
      const field = change.kind === "content" ? "content_json" : "assistance_enabled";
      const value = change.kind === "content" ? JSON.stringify(change.content) : Number(change.enabled);
      const result = await runtimeRun(`UPDATE owner_page_drafts SET ${field}=?,version=version+1,updated_by=?,updated_at=?
        WHERE business_id=? AND version=?
        AND EXISTS(SELECT 1 FROM user_access_profiles p WHERE p.user_id=? AND p.access_role=?)
        AND NOT EXISTS(SELECT 1 FROM support_agent_settings s
          WHERE s.user_id=? AND s.queue_scope IN ('support','transport') AND ?='team_member')
        AND (
          ?=1 OR (assistance_enabled=1 AND (?=1 OR (?=1 AND EXISTS (
            SELECT 1 FROM staff_business_assignments a WHERE a.user_id=? AND a.business_id=owner_page_drafts.business_id AND a.active=1
          ))))
        )`, [value, actor.id, now, before.businessId, before.version, actor.id, actor.access_role,
          actor.id, actor.access_role, Number(isOwner), Number(operator), Number(team), actor.id]);
      if (!result.changes) return null;
      // A stale version or revoked permission remains a conflict. A disallowed video
      // rolls back this transaction, including the conditional update above.
      const kind = change.kind === "content" ? "content" : change.enabled ? "consent_enabled" : "consent_revoked";
      await runtimeRun("INSERT INTO owner_page_events(business_id,version,actor_user_id,kind,created_at) VALUES(?,?,?,?,?)", [before.businessId, before.version + 1, actor.id, kind, now]);
      return read(before.businessId);
    });
  },
};
