import { parseAccentColor } from "./storefront-accent";
import { parsePublicContacts, type PublicContacts } from "./business-profile-contacts";
import type { SessionUser } from "./types";
import { productVideoWatchUrl, normalizeProductVideoUrl } from "./video/product-video";

export type ShopPageContent = {
  template: "profile-v1";
  coverStyle: "blended" | "overlay";
  introduction: string;
  about: string;
  heroImage: string;
  videoUrl: string;
  contacts?: PublicContacts;
  accentColor?: string;
};
export type OwnerPageDraft = {
  businessId: number;
  version: number;
  content: ShopPageContent;
  assistanceEnabled: boolean;
  updatedBy: number;
  updatedAt: number;
};
export class OwnerPageError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function ownerPageImageKey(businessId: number, ref: string): string | null {
  if (!Number.isSafeInteger(businessId) || businessId < 1) return null;
  const prefix = `/api/page-drafts/${businessId}/media/`;
  if (!ref.startsWith(prefix)) return null;
  const key = ref.slice(prefix.length);
  return new RegExp(`^page-${businessId}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|png|webp)$`).test(key) ? key : null;
}

export function ownerPageRecord(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)
    || Object.keys(input).some((key) => !keys.includes(key))) {
    throw new OwnerPageError("The page form contains unsupported fields.");
  }
  return input as Record<string, unknown>;
}
export function ownerPageVersion(input: unknown): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < 1) {
    throw new OwnerPageError("Reload the latest saved page before continuing.", 409);
  }
  return input;
}
export function parseShopPageContent(input: unknown): ShopPageContent {
  const value = ownerPageRecord(input, ["template", "coverStyle", "introduction", "about", "heroImage", "videoUrl", "contacts", "accentColor"]);
  if (value.template !== "profile-v1" || (value.coverStyle !== "blended" && value.coverStyle !== "overlay")) {
    throw new OwnerPageError("Choose an available cover style.");
  }
  const text = (key: string, max: number) => {
    const raw = value[key];
    if (typeof raw !== "string" || raw.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]|<\/?[a-z][^>]*>|javascript:|data:|https?:\/\//i.test(raw)) {
      throw new OwnerPageError(`Check the ${key === "heroImage" ? "cover image" : key} field.`);
    }
    return raw.trim();
  };
  let videoUrl = "";
  if (value.videoUrl !== "") {
    try { videoUrl = productVideoWatchUrl(normalizeProductVideoUrl(value.videoUrl).managedRef); }
    catch { throw new OwnerPageError("Use a supported video link."); }
  }
  let contacts: PublicContacts | undefined;
  if (value.contacts !== undefined) {
    try { contacts = parsePublicContacts(value.contacts); }
    catch (error) { throw new OwnerPageError(error instanceof Error ? error.message : "Check public contacts."); }
  }
  let accentColor: string | undefined;
  if (value.accentColor !== undefined) {
    try { accentColor = parseAccentColor(value.accentColor); }
    catch (error) { throw new OwnerPageError((error as Error).message); }
  }
  return { ...(accentColor !== undefined ? { accentColor } : {}), template: value.template, coverStyle: value.coverStyle, videoUrl, ...(contacts ? { contacts } : {}),
    introduction: text("introduction", 600), about: text("about", 3000), heroImage: text("heroImage", 240) };
}

// Read compatibility for the private local checkpoint; new API writes stay strict.
export function readSavedPageContent(input: unknown): ShopPageContent {
  if (input && typeof input === "object" && "template" in input && input.template === "shop-v1") {
    const old = ownerPageRecord(input, ["template", "layout", "title", "introduction", "about", "heroImage"]);
    if ((old.layout !== "catalog" && old.layout !== "editorial") || typeof old.title !== "string" || old.title.length > 180) {
      throw new OwnerPageError("The saved page is invalid.");
    }
    return parseShopPageContent({ template: "profile-v1", coverStyle: old.layout === "catalog" ? "blended" : "overlay",
      introduction: old.introduction, about: old.about, heroImage: old.heroImage, videoUrl: "" });
  }
  return parseShopPageContent(input);
}
export function isPageOwner(actor: SessionUser, businessId: number): boolean {
  return actor.access_role === "client" && actor.business_id === businessId;
}
export function canEditOwnerPage(actor: SessionUser, businessId: number, _consent: boolean, granted: boolean): boolean {
  if (isPageOwner(actor, businessId)) return true;
  return actor.access_role === "platform_admin" ||
    ((actor.access_role === "operations_manager" || actor.access_role === "team_member") && granted);
}
