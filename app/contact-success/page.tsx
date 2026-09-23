import LanguageSelector from "@/components/LanguageSelector";

import { useUiText } from "@/lib/i18n/ui";
import Link from "next/link";
import PublicMobileNavigation from "@/components/PublicMobileNavigation";

export default function Page(){
  const t = useUiText();return <><LanguageSelector /><main className="login-wrap public-mobile-page"><section className="login-card"><span className="eyebrow">{t("Message received")}</span><h1>{t("Thank you.")}</h1><p>{t("Suqpage will use the contact information you submitted to follow up about your page.")}</p><Link className="btn brand" href="/">{t("Return to Suqpage")}</Link></section></main><PublicMobileNavigation /></>}
