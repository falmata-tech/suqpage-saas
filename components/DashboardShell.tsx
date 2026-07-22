import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { hasCapability, isClient } from "@/lib/capabilities";
import type { Business, SessionUser } from "@/lib/types";

export default function DashboardShell({ user, business, children }: { user:SessionUser; business:Business|null; children:React.ReactNode }) {
  const query = business ? `?business=${business.id}` : "";
  const client = isClient(user);
  const operations = hasCapability(user, "operations:manage");
  const platformAdmin = hasCapability(user, "platform:admin");
  return <div className="dashboard">
    <aside className="sidebar">
      <Link className="brand" href="/">◆ SuqPage</Link>
      <div className="sidebar-identity">{user.name}<br/>{business ? business.name : "Platform administration"}</div>
      <nav className="side-nav" aria-label="Dashboard">
        <Link href={`/dashboard${query}`}>Overview</Link>
        {client && business ? <>
          <Link href="/dashboard/requests">Requests</Link>
          <Link href={`/dashboard/inquiries${query}`}>Customer inquiries</Link>
          <Link href={`/dashboard/deliveries${query}`}>Delivery activity</Link>
          <Link href={`/preview/@${business.handle}`}>Preview / review</Link>
        </> : null}
        {!client && business ? <>
          <Link href={`/dashboard/catalog${query}`}>Collections &amp; categories</Link>
          <Link href={`/dashboard/products${query}`}>Products</Link>
          <Link href={`/dashboard/inquiries${query}`}>Inquiries</Link>
          <Link href={`/dashboard/deliveries${query}`}>Delivery requests</Link>
          <Link href={`/dashboard/settings${query}`}>Business settings</Link>
          <Link href={`/dashboard/design-sdk${query}`}>Design SDK</Link>
          <Link href={`/preview/@${business.handle}`} target="_blank">Preview showroom ↗</Link>
        </> : null}
        {operations ? <Link href="/dashboard/requests">Client requests</Link> : null}
        {platformAdmin ? <><Link href="/dashboard">All businesses</Link><Link href="/dashboard/admin">SaaS administration</Link></> : null}
        <Link href="/dashboard/account">Account security</Link>
        <form action={logoutAction}><button type="submit">Sign out</button></form>
      </nav>
    </aside>
    <main className="main">{user.must_change_password ? <div className="error temporary-password">Your password is temporary. <Link href="/dashboard/account?required=1">Change it now.</Link></div> : null}{children}</main>
  </div>;
}
