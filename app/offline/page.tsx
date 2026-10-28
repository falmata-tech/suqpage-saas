import LanguageSelector from "@/components/LanguageSelector";

import { useUiText } from "@/lib/i18n/ui";
import Link from "next/link";
import AfricMadeBrand from "@/components/AfricMadeBrand";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  const t = useUiText();
  return <main className="pwa-offline" aria-labelledby="offline-title">
    <div className="pwa-offline-panel">
      <AfricMadeBrand className="pwa-offline-brand" /><LanguageSelector />
      <span>{t("You are offline")}</span>
      <h1 id="offline-title">{t("AfricMade cannot reach the network.")}</h1>
      <p>{t("Reconnect to refresh AfricMade pages, inquiries, and workspace information.")}</p>
      <Link href="/">{t("Try the marketplace again")}</Link>
    </div>
  </main>;
}
