import Link from "next/link";
import SuqpageBrand from "@/components/SuqpageBrand";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return <main className="pwa-offline" aria-labelledby="offline-title">
    <div className="pwa-offline-panel">
      <SuqpageBrand className="pwa-offline-brand" />
      <span>You are offline</span>
      <h1 id="offline-title">Suqpage cannot reach the network.</h1>
      <p>Reconnect to refresh Suqpage pages, inquiries, and workspace information.</p>
      <Link href="/">Try the marketplace again</Link>
    </div>
  </main>;
}
