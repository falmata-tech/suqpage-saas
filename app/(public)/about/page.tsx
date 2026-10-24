import { getUiText } from "@/lib/i18n/server";
import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import AboutAudience from "@/components/AboutAudience";
import { BRAND_SOCIAL_IMAGE, publicSeoImageUrl, publicSeoUrl } from "@/lib/public-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getUiText();
  const title = t("About AfricMade"), description = t(MARKET_STOREFRONT_COPY.description);
  const url = publicSeoUrl("/about");
  const image = publicSeoImageUrl(BRAND_SOCIAL_IMAGE);
  return { title: { absolute: title }, description, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "AfricMade", images: image ? [image] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] } };
}
export default function AboutPage() {
  return <AboutAudience/>;
}
