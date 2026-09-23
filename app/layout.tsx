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
export const metadata:Metadata={metadataBase:new URL(appUrl()),applicationName:"Suqpage",title:{default:"Suqpage",template:"%s · Suqpage"},description:"Discover businesses, products and services. Explore the map, search the listings and inquire directly on Suqpage.",manifest:"/manifest.webmanifest",icons:{icon:[{url:"/brand/suqpage-mark.svg",type:"image/svg+xml"},{url:"/pwa/suqpage-favicon-32.png",sizes:"32x32",type:"image/png"}],apple:[{url:"/pwa/suqpage-apple-touch-icon.png",sizes:"180x180",type:"image/png"}]},appleWebApp:{capable:true,statusBarStyle:"default",title:"Suqpage"},formatDetection:{telephone:false},other:{"mobile-web-app-capable":"yes"}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#ffffff"},{media:"(prefers-color-scheme: dark)",color:"#202428"}]};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const locale = await getLocale(); const messages = clientMessages(await getMessages() as UiMessages); return <html lang={locale} data-scroll-behavior="smooth"><body><NextIntlClientProvider messages={messages}><PwaRegistration />{children}</NextIntlClientProvider></body></html>}
