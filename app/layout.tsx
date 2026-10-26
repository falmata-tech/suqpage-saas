import { getUiText } from "@/lib/i18n/server";
import { MARKET_STOREFRONT_COPY } from "@/lib/storefront-copy";
import { NextIntlClientProvider } from "next-intl";
import { clientMessages } from "@/lib/i18n/client-messages";
import type { UiMessages } from "@/lib/i18n/core";
import { getLocale, getMessages } from "next-intl/server";
import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/PwaRegistration";
import { appUrl } from "@/lib/app-url";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
import "./navigation.css";
const metadata:Metadata={metadataBase:new URL(appUrl()),applicationName:"AfricMade",title:{default:"AfricMade",template:"%s · AfricMade"},manifest:"/manifest.webmanifest",icons:{icon:[{url:"/brand/africmade-showroom-mark-v3.png",type:"image/png"},{url:"/pwa/africmade-favicon-v3-32.png",sizes:"32x32",type:"image/png"}],apple:[{url:"/pwa/africmade-apple-touch-v4-180.png",sizes:"180x180",type:"image/png"}]},appleWebApp:{capable:true,statusBarStyle:"default",title:"AfricMade"},formatDetection:{telephone:false},other:{"mobile-web-app-capable":"yes"}};
export async function generateMetadata():Promise<Metadata> {
  const t = await getUiText();
  const title=t(MARKET_STOREFRONT_COPY.title),description=t(MARKET_STOREFRONT_COPY.description);
  // An explicit replacement is required on SPA return from Tracking: removing
  // its no-referrer meta element does not reset the document's active policy.
  return { ...metadata, referrer:'strict-origin-when-cross-origin', description, openGraph:{title,description,siteName:"AfricMade"},twitter:{card:"summary_large_image",title,description} };
}
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#ffffff"},{media:"(prefers-color-scheme: dark)",color:"#202428"}]};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const locale = await getLocale(); const messages = clientMessages(await getMessages() as UiMessages); return <html lang={locale} data-scroll-behavior="smooth"><body><NextIntlClientProvider messages={messages}><PwaRegistration />{children}</NextIntlClientProvider></body></html>}
