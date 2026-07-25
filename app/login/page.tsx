import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { currentUser } from "@/lib/auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const user = await currentUser();
  if (user) redirect(user.must_change_password ? "/dashboard/account?required=1" : "/dashboard");
  const p=await searchParams;
  return <main className="login-wrap"><form className="login-card" action={loginAction}>
    <Link href="/" className="brand">◆ SuqPage</Link><h1>Private workspace</h1><p style={{color:"var(--muted)"}}>Sign in to follow requests, customer inquiries, deliveries, and showroom previews.</p>
    {p.error&&<p className="error">{p.error}</p>}
    <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required/></div><div style={{height:14}}/>
    <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" autoComplete="current-password" required/></div><div style={{height:20}}/>
    <button className="btn brand" style={{width:"100%"}}>Sign in</button>
    <p className="hint">Account access is provided by SuqPage. Temporary passwords must be changed after the first sign-in.</p>
  </form></main>;
}
