import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookie, parseLocale } from "@/lib/i18n/core";

export default getRequestConfig(async () => {
  const locale = parseLocale((await cookies()).get(localeCookie)?.value);
  const messages = locale === "en" ? {} : (await import(`../lib/i18n/messages/${locale}.json`)).default;
  return { locale, messages, timeZone: "Africa/Addis_Ababa" };
});
