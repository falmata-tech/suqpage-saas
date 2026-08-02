import NavigationTrail from "@/components/NavigationTrail";
import { redeemInvitationAction } from "@/app/invitation-actions";
import { getActiveInvitation } from "@/lib/invitations";

export const dynamic = "force-dynamic";

const maskEmail = (email:string) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, Math.min(6, name.length - 2)))}@${domain}`;
};

export default async function InvitationPage({ params, searchParams }: { params:Promise<{token:string}>; searchParams:Promise<{error?:string}> }) {
  const token = (await params).token;
  const query = await searchParams;
  const invitation = getActiveInvitation(token);
  const errors: Record<string,string> = {
    mismatch: "The passwords do not match.",
    expired: "This invitation expired or was replaced. Ask MirtPage for a new link.",
    replayed: "This invitation has already been used.",
    conflict: "An account already exists for this email. Contact MirtPage for help.",
    invalid: "The invitation could not be accepted.",
  };
  return <main className="invite-page"><div className="invite-card">
    <NavigationTrail items={[{label:"MirtPage",href:"/"},{label:"Client invitation"}]} fallback="/"/>
    {!invitation ? <><span className="eyebrow">Invitation unavailable</span><h1>Ask MirtPage for a new invitation</h1><p>This link is invalid, expired, already used, or was replaced for your protection.</p><a className="btn secondary" href="/">Return home</a></> : <>
      <span className="eyebrow">Private client invitation</span><h1>Join {invitation.business_name}</h1><p>Set up your private client workspace. You’ll use it to send requests, follow inquiries, manage offerings, contact support, and review showroom previews.</p>
      <div className="invite-summary"><div><small>Account email</small><strong>{maskEmail(invitation.email)}</strong></div><div><small>Link expires</small><strong>{new Date(invitation.expires_at).toLocaleString()}</strong></div></div>
      {query.error && <p className="error" role="alert">{errors[query.error] || errors.invalid}</p>}
      <form action={redeemInvitationAction} className="form-grid"><input type="hidden" name="token" value={token}/><div className="field full"><label htmlFor="invite-account-name">Your name</label><input id="invite-account-name" name="name" autoComplete="name" required maxLength={100}/></div><div className="field"><label htmlFor="invite-password">Password</label><input id="invite-password" type="password" name="password" autoComplete="new-password" minLength={12} required/></div><div className="field"><label htmlFor="invite-confirm">Confirm password</label><input id="invite-confirm" type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required/></div><div className="field full"><small>Use 12–128 characters with upper-case, lower-case, and a number.</small></div><div className="field full"><button className="btn brand">Create private workspace</button></div></form>
    </>}
  </div></main>;
}
