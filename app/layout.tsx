import type { Metadata } from "next";
import { appUrl } from "@/lib/app-url";
import "./globals.css";
export const metadata:Metadata={metadataBase:new URL(appUrl()),title:{default:"SuqPage",template:"%s · SuqPage"},description:"Custom digital showrooms with structured inquiries and delivery initiation.",icons:{icon:"/uploads/seed/suqpage/icon.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
