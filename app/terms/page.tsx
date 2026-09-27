import LanguageSelector from "@/components/LanguageSelector";

import { getUiText } from "@/lib/i18n/server";
import SuqpageBrand from "@/components/SuqpageBrand";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";

export default async function Page() {
  const t = await getUiText();
  return <><main className="section public-mobile-page"><div className="container legal"><SuqpageBrand /><LanguageSelector /><h1>{t("Terms of use")}</h1><p>{t("Suqpage is a market-discovery and inquiry service. It is not a checkout, payment processor, or guarantee that a product is available. Product details, pricing, payment, returns, and fulfillment are confirmed directly between the customer and the account owner.")}</p><p>{t("Creating an account opens a private workspace. Owners add products or services, prepare their page, and publish it when ready. Later owner saves update the live page without staff approval. Account owners are responsible for the accuracy of their catalog, public contact details, and customer communications. Users must not submit fraudulent, abusive, or unlawful content.")}</p><p>{t("Buying assistance lets you request help with a purchase, a business check, or a product quality check. Our team contacts you to discuss the work. Submitting a request does not place an order, authorize a payment, or certify or guarantee a seller or product.")}</p><p>{t("A published active page remains visible until Suqpage suspends it; manual renewal records do not automatically control publication.")}</p></div></main><PublicMobileNavigation /></>;
}
