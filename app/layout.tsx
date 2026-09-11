import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/PwaRegistration";
import { appUrl } from "@/lib/app-url";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),applicationName:"AfricMade",title:{default:"AfricMade",template:"%s · AfricMade"},description:"Find locally made and grown products from Ethiopian artisans, farms, workshops, and small manufacturers.",manifest:"/manifest.webmanifest",icons:{icon:[{url:"/brand/africmade-mark.svg",type:"image/svg+xml"},{url:"/pwa/favicon-32.png",sizes:"32x32",type:"image/png"}],apple:[{url:"/pwa/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]},appleWebApp:{capable:true,statusBarStyle:"default",title:"AfricMade"},formatDetection:{telephone:false},other:{"mobile-web-app-capable":"yes"}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#ffffff"},{media:"(prefers-color-scheme: dark)",color:"#202428"}]};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-scroll-behavior="smooth"><body><PwaRegistration />{children}</body></html>}
