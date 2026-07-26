import Image from "next/image";
import Link from "next/link";
import BazaarMap from "@/components/BazaarMap";
import ShowroomDirectory from "@/components/ShowroomDirectory";
import { listBazaarAdminState } from "@/lib/bazaar";
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
  const bazaarState = listBazaarAdminState();
  const bazaar = bazaarState.current;
  const schedule = [...bazaarState.themes].sort((a,b)=>(a.weekday || 7)-(b.weekday || 7));
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return <>
    <header className="topbar"><div className="container" style={{display:"flex",alignItems:"center",width:"100%"}}>
      <Link href="/" className="brand"><Image src="/uploads/seed/suqpage/icon.png" alt="" width={34} height={34}/>SuqPage</Link>
      <nav className="nav"><a href="#bazaar">Bazaar</a><a href="#showrooms">All Showrooms</a><a href="#how-it-works">About SuqPage</a><Link href="/request">Get a Showroom</Link><Link className="btn secondary" href="/login">Login</Link></nav>
    </div></header>
    <main>
      <section className="landing-hero suq-hero"><div className="container suq-hero-grid"><div><span className="eyebrow">Permanent product showrooms</span><h1>Your products.<br/>Your story.<br/>Your own showroom.</h1><p>For artisans, growers, producers, and small manufacturers. Show what you sell, explain your process, receive customer inquiries, and share your own /@handle.</p><div className="hero-actions"><Link className="btn brand" href="/request">Get your SuqPage showroom</Link><a className="btn secondary" href="#how-it-works">How it works</a></div><div className="hero-benefits"><span>Your own /@handle</span><span>Show products and process</span><span>Receive customer inquiries</span><span>Join weekly Bazaars</span></div></div><aside className="hero-bazaar-card"><span className="eyebrow">Today's Bazaar</span><h2>{bazaar.themeName}</h2><p><span className={`badge ${bazaar.status==="live"?"active":"limited"}`}>{bazaar.status==="live"?"Live now":bazaar.status}</span></p><p>{bazaar.booths.length} participating businesses. Changes daily at 4:00 AM.</p><a className="small-btn" href="#bazaar">View today's Bazaar</a></aside></div></section>
      <section className="bazaar-schedule-band"><div className="container"><h2>This week's Bazaar schedule</h2><div className="bazaar-schedule">{schedule.map(theme=><div key={theme.id} className={`schedule-card ${theme.slug===bazaar.themeSlug?"active":""}`}><strong>{weekdays[theme.weekday]}</strong><span>{theme.name}</span></div>)}</div></div></section>
      <section className="section soft" id="showrooms"><div className="container"><div className="section-head"><div><span className="eyebrow">All Showrooms</span><h2>Every business on SuqPage.</h2></div><p style={{maxWidth:520,color:"var(--muted)"}}>Search by name, /@handle, product, category, or industry. These permanent showrooms are available every day, regardless of today's Bazaar theme.</p></div><ShowroomDirectory businesses={businesses} previews={previews}/></div></section>
      <section className="section" id="bazaar"><div className="container"><BazaarMap bazaar={bazaar}/></div></section>
      <section className="section soft" id="how-it-works"><div className="container contact-grid"><div><span className="eyebrow">How SuqPage works</span><h2 style={{fontSize:"clamp(2.4rem,5vw,4.5rem)",letterSpacing:"0",margin:"12px 0"}}>Get your showroom and join weekly discovery.</h2><p style={{color:"var(--muted)",lineHeight:1.8}}>Create a permanent /@handle, showcase products and process, receive structured inquiries, and appear in the weekly Bazaar for your industry.</p></div><div className="form-card"><h2>Get your SuqPage showroom</h2><p style={{color:"var(--muted)",lineHeight:1.7}}>A permanent public showroom, product and process presentation, customer inquiries, automatic weekly Bazaar participation, and optional featured visibility.</p><Link className="btn brand" href="/request">Get your showroom</Link></div></div></section>
    </main>
    <footer className="section soft"><div className="container" style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><strong>SuqPage</strong><span>falmata.dawano@gmail.com</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span><span>© 2026 SuqPage</span></div></footer>
  </>;
}
