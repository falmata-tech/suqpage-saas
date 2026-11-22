import Link from "next/link";

import { getUiText } from "@/lib/i18n/server";
import { publicSeoUrl } from "@/lib/public-seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getUiText();
  const url = publicSeoUrl("/privacy");
  return { title: t("Privacy notice"), alternates: { canonical: url },
    openGraph: { title: t("Privacy notice"), url, siteName: "AfricMade" } };
}

export default async function Page() {
  const t = await getUiText();
  return <article className="public-document"><div className="legal">
    <h1>{t("Privacy notice")}</h1>
    <p>{t("AfricMade stores account details, business page content, inquiries, and business support conversations to operate the service.")}</p>
    <p>{t("Account entry uses Supabase Auth. After sign-in, setup collects your name, account phone number, business name, and category. Your account email and phone remain private. You choose the separate contact details to display on your public page.")}</p>
    <p>{t("Draft pages and uploaded images stay private until publication. Owners and platform staff authorized by an administrator can manage business pages. Staff cannot change an owner's private sign-in email.")}</p>
    <p>{t("Changes saved to a published page appear publicly. Businesses without an exact public address may appear at their city on the map. An exact storefront pin appears only when the owner chooses to publish it.")}</p>
    <p>{t("When you send a business inquiry, AfricMade stores your name, phone number, message and selected products privately for that business and its authorized managers to follow up. This is not live chat. If you use an external contact option instead, the message is sent through that service.")}</p>
    <p>{t("When you contact business support or report a listing, we store the details and replies you submit so our team can handle the request.")}</p>
    <p>{t("The web and Android maps request map tiles from OpenStreetMap. The provider receives network information such as your IP address. Android uses MapLibre and caches map tiles on your device. Tile requests do not include your account details or search text.")}</p>
    <p>{t("Notifications are optional. Expo and Firebase Cloud Messaging help send account and chat alerts. We store your push token and notification choices. You can turn notifications off in the app or your device settings.")}</p>
    <p>{t("Videos use YouTube, TikTok, Facebook or Instagram players. These providers may receive network information and use their own cookies or storage when a video loads. Opening a social link or business website shares information with that service under its own privacy policy.")}</p>
    <p>{t("After verifying a deletion request, we remove the account, business page, associated inquiries, support history and uploads. Include the reference for any guest chat you also want removed. Restricted backups may remain for recovery; recorded deletions are reapplied before restored data goes live. Any necessary security or legal retention is explained when handling your request.")}</p>
    <p>{t("We count business page visits and record when chat messages are read to show business activity and conversation status.")}</p>
    <p>{t("AfricMade has retired its former transport conversations and shipment records. You can contact us about information from those services.")}</p>
    <p>{t("Contact falmata.dawano@gmail.com to request access, correction, or deletion of information held by AfricMade.")}</p>
    <section aria-labelledby="delete-account"><h2 id="delete-account">{t("Delete account")}</h2><Link className="btn" href="/account-deletion">{t("Request account deletion")}</Link></section>
  </div></article>;
}
