"use client";

import {useEffect, useState} from "react";
import {createUiText, localeCookie, parseLocale} from "@/lib/i18n/core";
import am from "@/lib/i18n/messages/am.json";
import om from "@/lib/i18n/messages/om.json";
import so from "@/lib/i18n/messages/so.json";
import ti from "@/lib/i18n/messages/ti.json";

// Root recovery must also work when the usual layout/translation provider failed.
export function useRecoveryText() {
  const [locale, setLocale] = useState<ReturnType<typeof parseLocale>>("en");
  useEffect(() => {
    const cookie = document.cookie.split(";").map(value => value.trim())
      .find(value => value.startsWith(localeCookie + "="))?.slice(localeCookie.length + 1);
    setLocale(parseLocale(cookie || document.documentElement.lang));
  }, []);
  return {locale, t: createUiText({en: {}, am, om, so, ti}[locale])};
}

export default function RouteRecovery({retry}: {retry: () => void}) {
  const {t} = useRecoveryText();
  const action = {display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "10px 18px", borderRadius: 10, font: "inherit", fontWeight: 650, cursor: "pointer", textDecoration: "none"} as const;
  return <main style={{minHeight: "65vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "system-ui, sans-serif", color: "#252b2d", background: "#f5f7f7"}}>
    <section aria-labelledby="recovery-title" style={{boxSizing: "border-box", width: "min(100%, 480px)", padding: 28, background: "white", border: "1px solid #d9e1e3", borderRadius: 16}}>
      <p style={{color: "#be3d00", fontWeight: 750, marginTop: 0}}>AfricMade</p>
      <h1 id="recovery-title" style={{fontSize: 25, lineHeight: 1.3}}>{t("Unable to connect. Please try again.")}</h1>
      <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
        <button type="button" style={{...action, border: "1px solid #be3d00", background: "#be3d00", color: "white"}} onClick={retry}>{t("Try again")}</button>
        <a style={{...action, border: "1px solid #d9e1e3", color: "#963200"}} href="/">{t("Back to Market")}</a>
      </div>
    </section>
  </main>;
}
