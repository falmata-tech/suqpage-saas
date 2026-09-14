import { canEditOwnerPage, isPageOwner, OwnerPageError, ownerPageVersion, parseShopPageContent,
  type OwnerPageDraft, type ShopPageContent } from "./owner-page-domain";
import type { SessionUser } from "./types";

export interface OwnerPagePort {
  read(businessId: number): Promise<OwnerPageDraft | null>;
  assigned(userId: number, businessId: number): Promise<boolean>;
  create(businessId: number, actorId: number, content: ShopPageContent): Promise<OwnerPageDraft>;
  // Implementations must atomically compare version and current scope, update,
  // and append the event. Consent changes increment the same version as edits.
  commit(actor: SessionUser, before: OwnerPageDraft, change:
    { kind: "content"; content: ShopPageContent } | { kind: "consent"; enabled: boolean }): Promise<OwnerPageDraft | null>;
  hasImage(businessId: number, ref: string): Promise<boolean>;
}

export async function readOwnerPage(port: OwnerPagePort, actor: SessionUser, businessId: number): Promise<OwnerPageDraft | null> {
  if (!Number.isSafeInteger(businessId) || businessId < 1) throw new OwnerPageError("Page not found.", 404);
  if (actor.access_role === "client" && !isPageOwner(actor, businessId)) throw new OwnerPageError("Page access is not available for this account.", 403);
  const assigned = actor.access_role === "team_member" && await port.assigned(actor.id, businessId);
  if (actor.access_role === "team_member" && !assigned) throw new OwnerPageError("Page access is not available for this account.", 403);
  const draft = await port.read(businessId);
  if (!canEditOwnerPage(actor, businessId, draft?.assistanceEnabled ?? false, assigned)) {
    throw new OwnerPageError("Page access is not available for this account.", 403);
  }
  return draft;
}
export async function startOwnerPage(port: OwnerPagePort, actor: SessionUser, businessId: number, input: unknown): Promise<OwnerPageDraft> {
  if (!isPageOwner(actor, businessId)) throw new OwnerPageError("Only the owner can start this page.", 403);
  const current = await readOwnerPage(port, actor, businessId);
  const content = parseShopPageContent(input);
  if (content.heroImage && !(await port.hasImage(businessId, content.heroImage))) {
    throw new OwnerPageError("Choose an image belonging to this shop.");
  }
  const saved = current || await port.create(businessId, actor.id, content);
  if (JSON.stringify(saved.content) !== JSON.stringify(content)) {
    throw new OwnerPageError("A draft already exists. Reload before saving your changes.", 409);
  }
  return saved;
}
export async function saveOwnerPage(port: OwnerPagePort, actor: SessionUser, businessId: number, version: unknown, input: unknown): Promise<OwnerPageDraft> {
  const current = await readOwnerPage(port, actor, businessId);
  if (!current || current.version !== ownerPageVersion(version)) throw new OwnerPageError("This page has newer saved changes. Reload before saving.", 409);
  const content = parseShopPageContent(input);
  if (content.heroImage && !(await port.hasImage(businessId, content.heroImage))) {
    throw new OwnerPageError("Choose an image belonging to this shop.");
  }
  const saved = await port.commit(actor, current, { kind: "content", content });
  if (!saved) throw new OwnerPageError("The page or editing permission changed. Reload before saving.", 409);
  return saved;
}
export async function setOwnerPageAssistance(port: OwnerPagePort, actor: SessionUser, businessId: number, version: unknown, enabled: unknown): Promise<OwnerPageDraft> {
  if (!isPageOwner(actor, businessId)) throw new OwnerPageError("Only the owner can change team assistance.", 403);
  if (typeof enabled !== "boolean") throw new OwnerPageError("Choose whether to allow team assistance.");
  const current = await readOwnerPage(port, actor, businessId);
  if (!current || current.version !== ownerPageVersion(version)) throw new OwnerPageError("Reload the latest editing permission.", 409);
  const saved = await port.commit(actor, current, { kind: "consent", enabled });
  if (!saved) throw new OwnerPageError("The page changed. Reload before changing permission.", 409);
  return saved;
}
