
import { getUiText } from "@/lib/i18n/server";
import { publicSeoUrl } from "@/lib/public-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getUiText();
  const url = publicSeoUrl("/terms");
  return { title: t("Terms of use"), alternates: { canonical: url },
    openGraph: { title: t("Terms of use"), url, siteName: "MirtPage" } };
}

export default async function Page() {
  const t = await getUiText();
  return <article className="public-document"><div className="legal">
    <h1>{t("Terms of use")}</h1>
    <p>{t("MirtPage helps you explore business stories and products in digital showrooms. You can send an inquiry for the business to follow up, or use its listed external contacts. Business inquiries are not live chat.")}</p>
    <p>{t("MirtPage is a showroom directory and product-browsing service. It is not a checkout or payment processor and does not guarantee product availability. Confirm product details, prices, payment and returns directly with the business. MirtPage helps connect you with independent logistics providers. Use transport chat to discuss options with the provider you select. Sending a request does not confirm an arrangement.")}</p>
    <p>{t("Creating an account opens a private workspace. Business owners can add products, prepare and publish their showroom. Platform staff authorized by an administrator may help manage business pages. Businesses are responsible for accurate product and public contact details. Do not submit fraudulent, abusive or unlawful content.")}</p>
    <p>{t("Violent images or videos, nudity and sexually explicit content are not allowed. Do not list alcohol, tobacco or vaping products, weapons, recreational drugs, gambling services, adult products or other age-restricted goods or services.")}</p>
    <p>{t("If a listing breaks these rules, use Report on its page or product and choose Prohibited goods or Abusive content. Our team reviews reports and removes prohibited listings. Publishing a listing does not mean it has been reviewed by MirtPage.")}</p>
  </div></article>;
}
