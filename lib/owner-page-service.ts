import { canEditOwnerPage, OwnerPageError, ownerPageVersion, parseShopPageContent,
  type OwnerPageDraft, type ShopPageContent } from "./owner-page-domain";
import type { SessionUser } from "./types";

export interface OwnerPagePort {
  read(businessId: number): Promise<OwnerPageDraft | null>;
  authorized(actor: SessionUser, businessId: number): Promise<boolean>;
  create(businessId: number, actor: SessionUser, content: ShopPageContent): Promise<OwnerPageDraft>;
  // Implementations atomically compare version and current persisted authority,
  // update and append the event. Historical consent is no longer mutable.
  commit(actor: SessionUser, before: OwnerPageDraft, change:
    { kind: "content"; content: ShopPageContent }): Promise<OwnerPageDraft | null>;
  hasImage(businessId: number, ref: string): Promise<boolean>;
}

export async function readOwnerPage(port: OwnerPagePort, actor: SessionUser, businessId: number): Promise<OwnerPageDraft | null> {
  if (!Number.isSafeInteger(businessId) || businessId < 1) throw new OwnerPageError("Page not found.", 404);
  if (!await port.authorized(actor,businessId)) throw new OwnerPageError("Page access is not available for this account.", 403);
  const draft = await port.read(businessId);
  if (!await port.authorized(actor,businessId)) throw new OwnerPageError("Page access is not available for this account.", 403);
  if (!canEditOwnerPage(actor, businessId, draft?.assistanceEnabled ?? false, true)) {
    throw new OwnerPageError("Page access is not available for this account.", 403);
  }
  return draft;
}
export async function startOwnerPage(port: OwnerPagePort, actor: SessionUser, businessId: number, input: unknown): Promise<OwnerPageDraft> {
  const current = await readOwnerPage(port, actor, businessId);
  const content = parseShopPageContent(input);
  if (content.heroImage && !(await port.hasImage(businessId, content.heroImage))) {
    throw new OwnerPageError("Choose an image belonging to this shop.");
  }
  const saved = current || await port.create(businessId, actor, content);
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
  // Older clients do not send the additive field. Only an explicit empty value resets it.
  if (content.accentColor === undefined && current.content.accentColor !== undefined) content.accentColor = current.content.accentColor;
  const saved = await port.commit(actor, current, { kind: "content", content });
  if (!saved) throw new OwnerPageError("The page or editing permission changed. Reload before saving.", 409);
  return saved;
}
export async function setOwnerPageAssistance(_port: OwnerPagePort, _actor: SessionUser, _businessId: number, _version: unknown, _enabled: unknown): Promise<OwnerPageDraft> {
  throw new OwnerPageError("Team editing is no longer an owner setting.",410);
}
