import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { Business, SessionUser } from "@/lib/types";

export default function DashboardShell({user,business,children}:{user:SessionUser;business:Business|null;children:React.ReactNode}){
  const q=business?`?business=${business.id}`:"";
  return <div className="dashboard"><aside className="sidebar"><Link className="brand" href="/">◆ SuqPage</Link><div style={{fontSize:12,color:"#94a3b8",marginBottom:18}}>{user.name}<br/>{business?business.name:"Platform administration"}</div><nav className="side-nav">
    <Link href={`/dashboard${q}`}>Overview</Link>
    {business&&<><Link href={`/dashboard/catalog${q}`}>Collections & categories</Link><Link href={`/dashboard/products${q}`}>Products</Link><Link href={`/dashboard/inquiries${q}`}>Inquiries</Link><Link href={`/dashboard/deliveries${q}`}>Delivery requests</Link><Link href={`/dashboard/settings${q}`}>Business settings</Link><Link href={`/dashboard/design-sdk${q}`}>Design SDK</Link><Link href={`/preview/@${business.handle}`} target="_blank">Preview showroom ↗</Link></>}
    <Link href="/dashboard/account">Account security</Link>
    {user.role==="admin"&&<><Link href="/dashboard">All businesses</Link><Link href="/dashboard/admin">SaaS administration</Link></>}
    <form action={logoutAction}><button type="submit">Sign out</button></form>
  </nav></aside><main className="main">{user.must_change_password?<div className="error" style={{marginBottom:20}}>Your password is temporary. <Link href="/dashboard/account?required=1">Change it now.</Link></div>:null}{children}</main></div>;
}
