import Link from "next/link";
import RequestForm from "@/components/RequestForm";

export const metadata = { title: "Request a SuqPage showroom" };

export default function RequestPage() {
  return <main className="request-page"><div className="container"><div className="request-header"><Link className="brand" href="/">◆ SuqPage</Link><Link href="/login">Client login</Link></div><div className="contact-grid request-layout"><div><span className="eyebrow">Managed for you</span><h1>Tell us what you need. We’ll handle the setup.</h1><p>Send one message with your business information, requested products or changes, and any useful reference images. You do not need an account for this first request.</p><ul><li>Our team reviews and organizes your request.</li><li>Nothing goes live without a private preview and your approval.</li><li>If we accept the project, we’ll invite you to a simple client workspace.</li></ul></div><RequestForm/></div></div></main>;
}
