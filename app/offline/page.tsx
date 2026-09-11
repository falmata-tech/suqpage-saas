import Link from "next/link";
import AfricMadeBrand from "@/components/AfricMadeBrand";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return <main className="pwa-offline" aria-labelledby="offline-title">
    <div className="pwa-offline-panel">
      <AfricMadeBrand className="pwa-offline-brand" />
      <span>You are offline</span>
      <h1 id="offline-title">AfricMade cannot reach the network.</h1>
      <p>Reconnect to refresh AfricMade pages, inquiries, and workspace information.</p>
      <Link href="/">Try the marketplace again</Link>
    </div>
  </main>;
}
