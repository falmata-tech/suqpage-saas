"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Languages } from "lucide-react";
import { languageNames, enabledLocales, localeCookie, parseLocale } from "@/lib/i18n/core";
import { useUiText } from "@/lib/i18n/ui";

export default function LanguageSelector() {
  const t = useUiText();
  const locale = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => { setReady(true); }, []);
  return <label className="language-selector" aria-busy={pending}>
    <Languages size={18} aria-hidden="true" />
    <select aria-label={t("Language")} value={locale} disabled={!ready || pending} onChange={event => {
      const next = parseLocale(event.target.value);
      // Non-sensitive display preference. A refresh preserves mounted form/cart state.
      document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      startTransition(() => router.refresh());
    }}>
      {enabledLocales.map(value => <option key={value} value={value} lang={value}>{languageNames[value]}</option>)}
    </select>
  </label>;
}
