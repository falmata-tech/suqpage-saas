import { STARTER_VIDEO_URL } from "./business-starter";
import type { Catalog } from "./types";
import { ownerPageImageKey, type ShopPageContent } from "./owner-page-domain";
import { controlledYouTubeWatchUrl } from "./youtube-provider";
import { legacyPublicContacts, type PublicContacts } from "./business-profile-contacts";
import { approvedDemoContactMethods } from "./demo-inquiry-policy";

export function publicPageContent(businessId: number, content: ShopPageContent): ShopPageContent {
  const key = ownerPageImageKey(businessId, content.heroImage);
  return key ? { ...content, heroImage: `/api/page-media/${businessId}/${key}` } : content;
}

export function initialBusinessProfile(catalog: Catalog): ShopPageContent {
  let videoUrl = STARTER_VIDEO_URL;
  if (catalog.business.process_video_ref) {
    try { videoUrl = controlledYouTubeWatchUrl(catalog.business.process_video_ref); } catch {}
  }
  return { template: "profile-v1", coverStyle: "blended",
    introduction: catalog.business.hero_subtitle || "", about: catalog.business.description || "",
    heroImage: catalog.business.hero_image_path || "", videoUrl };
}

export function businessProfileDescription(content: Pick<ShopPageContent, "about" | "introduction">): string {
  return content.about || content.introduction;
}

export function publicBusinessCatalog(catalog: Catalog, contacts?: PublicContacts, configuredDemoPhone?: string): Catalog {
  return { ...catalog, business: { ...catalog.business, contact_email: "",
    approvedDemoContactMethods: approvedDemoContactMethods(catalog.business.is_demo, contacts ?? legacyPublicContacts(catalog.business), configuredDemoPhone),
  } };
}
