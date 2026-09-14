import { isPageOwner, OwnerPageError, ownerPageVersion, parseShopPageContent, type OwnerPageDraft, type ShopPageContent } from "./owner-page-domain";
import { readOwnerPage, type OwnerPagePort } from "./owner-page-service";
import type { SessionUser } from "./types";

export type PagePublication = {
  businessId: number;
  revision: number;
  draftVersion: number;
  content: ShopPageContent | null;
  action: "publish" | "restore";
  publishedBy: number;
  publishedAt: number;
};

export interface PagePublicationPort {
  latest(businessId: number): Promise<PagePublication | null>;
  previous(businessId: number, revision: number): Promise<PagePublication | null>;
  active(businessId: number): Promise<boolean>;
  // Serialize with draft edits and publication writes; recheck owner, active
  // business, draft version and expected publication revision in the transaction.
  commit(actor: SessionUser, draft: OwnerPageDraft, expectedRevision: number,
    content: ShopPageContent | null, action: "publish" | "restore"): Promise<PagePublication | null>;
}

export async function changePagePublication(
  drafts: OwnerPagePort, publications: PagePublicationPort, actor: SessionUser,
  businessId: number, input: { action: "publish" | "restore"; version: unknown; revision: unknown },
): Promise<PagePublication> {
  if (!isPageOwner(actor, businessId)) throw new OwnerPageError("Only the owner can publish or restore this page.", 403);
  if (input.action !== "publish" && input.action !== "restore") throw new OwnerPageError("Choose a page action.");
  const version = ownerPageVersion(input.version);
  if (typeof input.revision !== "number" || !Number.isSafeInteger(input.revision) || input.revision < 0) {
    throw new OwnerPageError("Reload the latest publication before continuing.", 409);
  }
  const draft = await readOwnerPage(drafts, actor, businessId);
  if (!draft || draft.version !== version) throw new OwnerPageError("The draft has changed. Reload and review it before publishing.", 409);
  if (!(await publications.active(businessId))) throw new OwnerPageError("This page is not available for publication yet.", 403);
  const latest = await publications.latest(businessId);
  if ((latest?.revision || 0) !== input.revision) throw new OwnerPageError("The published page has changed. Reload before continuing.", 409);
  if (input.action === "restore" && !latest) throw new OwnerPageError("There is no previous publication to restore.", 409);
  const selected = input.action === "publish" ? draft.content : (await publications.previous(businessId, input.revision))?.content || null;
  const content = selected ? parseShopPageContent(selected) : null;
  if (content?.heroImage && !(await drafts.hasImage(businessId, content.heroImage))) throw new OwnerPageError("The cover image is unavailable. Choose another image before publishing.");
  const result = await publications.commit(actor, draft, input.revision, content, input.action);
  if (!result) throw new OwnerPageError("The page changed. Reload and review it before continuing.", 409);
  return result;
}
