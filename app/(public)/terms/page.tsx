
import { getUiText } from "@/lib/i18n/server";
import { publicSeoUrl } from "@/lib/public-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getUiText();
  const url = publicSeoUrl("/terms");
  return { title: t("Terms of use"), alternates: { canonical: url },
    openGraph: { title: t("Terms of use"), url, siteName: "AfricMade" } };
}

export default async function Page() {
  const t = await getUiText();
  return <article className="public-document"><div className="legal">
    <h1>{t("Terms of use")}</h1>
    <p>{t("AfricMade helps you explore business pages, stories and products. You can send an inquiry for the business to follow up, or use its listed external contacts. Business inquiries are not live chat.")}</p>
    <p>{t("Confirm product details, availability, prices, payment, delivery and returns directly with the business. AfricMade provides business support through the owner workspace.")}</p>
    <p>{t("Creating an account opens a private workspace. Business owners can add products, prepare and publish their page. Platform staff authorized by an administrator may help manage business pages. Businesses are responsible for accurate product and public contact details. Do not submit fraudulent, abusive or unlawful content.")}</p>
    <p>{t("Violent images or videos, nudity and sexually explicit content are not allowed. Do not list alcohol, tobacco or vaping products, weapons, recreational drugs, gambling services, adult products or other age-restricted goods or services.")}</p>
    <p>{t("If a listing breaks these rules, use Report on its page or product and choose Prohibited goods or Abusive content. Our team reviews reports and removes prohibited listings. Publishing a listing does not mean it has been reviewed by AfricMade.")}</p>
  </div></article>;
}
