import Link from "next/link";
import RequestForm from "@/components/RequestForm";

export const metadata = { title: "Request a SuqPage showroom" };

export default function RequestPage() {
  return <main className="request-page"><div className="container"><div className="request-header"><Link className="brand" href="/">◆ SuqPage</Link><Link href="/login">Client login</Link></div><div className="contact-grid request-layout"><div><span className="eyebrow">Interested in SuqPage?</span><h1>Introduce your business. We’ll take it from there.</h1><p>This first step is only an expression of interest. Share your contact details and a short note—no account, product setup, or image uploads are needed.</p><ul><li>Our team reviews your interest before creating any account.</li><li>If we accept the project, SuqPage sends you a private invitation.</li><li>Only then can you submit detailed requests and reference images.</li></ul></div><RequestForm/></div></div></main>;
}
