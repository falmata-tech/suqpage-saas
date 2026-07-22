import Image from "next/image";
import Link from "next/link";
import ShowroomDirectory from "@/components/ShowroomDirectory";
import { getAllBusinesses } from "@/lib/db";

export const dynamic = "force-dynamic";
const previews: Record<string, string> = {
  alhayabrand: "/uploads/seed/suqpage/alhaya-mockup.jpg",
  usashopet: "/uploads/seed/suqpage/usashopet-mockup.jpg",
  novatech: "/uploads/seed/suqpage/novatech-mockup.jpg",
  homevibe: "/uploads/seed/suqpage/homevibe-mockup.jpg",
};

export default function Home() {
  const businesses = getAllBusinesses().filter((business) => business.status === "active");
  return <>
    <header className="topbar"><div className="container" style={{display:"flex",alignItems:"center",width:"100%"}}>
      <Link href="/" className="brand"><Image src="/uploads/seed/suqpage/icon.png" alt="" width={34} height={34}/>SuqPage</Link>
      <nav className="nav"><a href="#showrooms">Showrooms</a><Link href="/request">Request a showroom</Link><Link className="btn secondary" href="/login">Client login</Link></nav>
    </div></header>
    <main>
      <section className="landing-hero"><div className="container"><span className="eyebrow">A smarter digital showroom</span><h1>Your products. Your identity. One clear conversation.</h1><p>SuqPage gives social sellers a professionally designed showroom, a structured inquiry cart and a practical workflow for turning customer interest into delivery requests.</p><div className="hero-actions"><a className="btn brand" href="#showrooms">Find a showroom</a><Link className="btn secondary" href="/request">Build your showroom</Link></div></div></section>
      <section className="section soft" id="showrooms"><div className="container"><div className="section-head"><div><span className="eyebrow">Client showrooms</span><h2>Every business keeps its own identity.</h2></div><p style={{maxWidth:420,color:"var(--muted)"}}>Each page is designed manually. SuqPage supplies the catalog, inquiry and delivery workflow underneath.</p></div><ShowroomDirectory businesses={businesses} previews={previews}/></div></section>
      <section className="section"><div className="container contact-grid"><div><span className="eyebrow">Managed for you</span><h2 style={{fontSize:"clamp(2.4rem,5vw,4.5rem)",letterSpacing:"-.06em",margin:"12px 0"}}>One request. A showroom built with you.</h2><p style={{color:"var(--muted)",lineHeight:1.8}}>Send your business information, ideas, and images in one private request. Our team handles the detailed setup and returns a private preview for your approval before anything is published.</p></div><div className="form-card"><h2>No complicated setup forms.</h2><p style={{color:"var(--muted)",lineHeight:1.7}}>You do not need an account to begin. If SuqPage accepts the project, we’ll invite you to a focused client workspace for requests, inquiries, deliveries, and previews.</p><Link className="btn brand" href="/request">Start a private request</Link></div></div></section>
    </main>
    <footer className="section soft"><div className="container" style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><strong>SuqPage</strong><span>falmata.dawano@gmail.com</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span><span>© 2026 SuqPage</span></div></footer>
  </>;
}
