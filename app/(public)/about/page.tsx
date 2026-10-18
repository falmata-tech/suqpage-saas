import { getUiText } from "@/lib/i18n/server";
import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import AboutAudience from "@/components/AboutAudience";

export async function generateMetadata() {
  const t = await getUiText();
  const title = t("About MirtPage"), description = t(MARKET_STOREFRONT_COPY.description);
  return { title, description, openGraph: { title, description, siteName: "MirtPage" }, twitter: { title, description } };
}
export default function AboutPage() {
  return <AboutAudience/>;
}
