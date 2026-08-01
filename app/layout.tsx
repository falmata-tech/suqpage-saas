import type { Metadata } from "next";
import { appUrl } from "@/lib/app-url";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),title:{default:"SuqPage",template:"%s · SuqPage"},description:"Custom digital showrooms with structured inquiries and delivery initiation.",icons:{icon:"/brand/suqpage-mark.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>}
