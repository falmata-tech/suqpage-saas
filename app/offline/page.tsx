import LanguageSelector from "@/components/LanguageSelector";

import { useUiText } from "@/lib/i18n/ui";
import Link from "next/link";
import SuqpageBrand from "@/components/SuqpageBrand";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  const t = useUiText();
  return <main className="pwa-offline" aria-labelledby="offline-title">
    <div className="pwa-offline-panel">
      <SuqpageBrand className="pwa-offline-brand" /><LanguageSelector />
      <span>{t("You are offline")}</span>
      <h1 id="offline-title">{t("MirtPage cannot reach the network.")}</h1>
      <p>{t("Reconnect to refresh MirtPage pages, inquiries, and workspace information.")}</p>
      <Link href="/">{t("Try the marketplace again")}</Link>
    </div>
  </main>;
}
