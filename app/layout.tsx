import type { Metadata } from "next";
import { appUrl } from "@/lib/app-url";
import "./globals.css";
import "./landing.css";
import "./discovery.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),title:{default:"MirtPage",template:"%s · MirtPage"},description:"Search what Ethiopia makes, find producers by place, and start direct retail or wholesale inquiries from their showrooms.",icons:{icon:"/brand/mirtpage-mark-v2.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>}
