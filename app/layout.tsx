import type { Metadata } from "next";
import { appUrl } from "@/lib/app-url";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),title:{default:"MirtPage",template:"%s · MirtPage"},description:"Made-in-Ethiopia digital showrooms for makers, growers, workshops, and growing factories.",icons:{icon:"/brand/mirtpage-mark.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>}
