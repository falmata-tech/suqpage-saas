import Link from "next/link";
import { loginAction } from "@/app/actions";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
  const p=await searchParams;
  return <main className="login-wrap"><form className="login-card" action={loginAction}>
    <Link href="/" className="brand">◆ SuqPage</Link><h1>Client dashboard</h1><p style={{color:"var(--muted)"}}>Manage products, inquiries, availability and delivery requests.</p>
    {p.error&&<p className="error">{p.error}</p>}
    <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" required/></div><div style={{height:14}}/>
    <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" autoComplete="current-password" required/></div><div style={{height:20}}/>
    <button className="btn brand" style={{width:"100%"}}>Sign in</button>
    <p className="hint">Account access is provided by SuqPage. Temporary passwords must be changed after the first sign-in.</p>
  </form></main>;
}
