import type { Metadata, Viewport } from "next";
import PwaRegistration from "@/components/PwaRegistration";
import { appUrl } from "@/lib/app-url";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),applicationName:"MirtPage",title:{default:"MirtPage",template:"%s · MirtPage"},description:"Explore online showrooms from Ethiopian workshops, producers, and manufacturers, understand their capabilities, and contact them directly.",manifest:"/manifest.webmanifest",icons:{icon:[{url:"/brand/mirtpage-mark-v2.svg",type:"image/svg+xml"},{url:"/pwa/favicon-32.png",sizes:"32x32",type:"image/png"}],apple:[{url:"/pwa/apple-touch-icon.png",sizes:"180x180",type:"image/png"}]},appleWebApp:{capable:true,statusBarStyle:"default",title:"MirtPage"},formatDetection:{telephone:false},other:{"mobile-web-app-capable":"yes"}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#ffffff"},{media:"(prefers-color-scheme: dark)",color:"#0b1d3a"}]};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-scroll-behavior="smooth"><body><PwaRegistration />{children}</body></html>}
