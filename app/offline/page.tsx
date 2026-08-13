import Link from "next/link";
import MirtPageBrand from "@/components/MirtPageBrand";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return <main className="pwa-offline" aria-labelledby="offline-title">
    <div className="pwa-offline-panel">
      <MirtPageBrand className="pwa-offline-brand" />
      <span>You are offline</span>
      <h1 id="offline-title">MirtPage cannot reach the network.</h1>
      <p>Reconnect to refresh showrooms, availability, inquiries, and workspace information.</p>
      <Link href="/">Try the marketplace again</Link>
    </div>
  </main>;
}
