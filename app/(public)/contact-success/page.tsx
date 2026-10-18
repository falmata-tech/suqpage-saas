
import { useUiText } from "@/lib/i18n/ui";
import Link from "next/link";

export default function Page(){
  const t = useUiText();return <><article className="public-document"><section className="login-card"><span className="eyebrow">{t("Message received")}</span><h1>{t("Thank you.")}</h1><p>{t("MirtPage will use the contact information you submitted to follow up about your page.")}</p><Link className="btn brand" href="/">{t("Return to MirtPage")}</Link></section></article></>}
