
import { getUiText } from "@/lib/i18n/server";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import SignupForm from "@/components/SignupForm";
import { supabaseAuthEnabled } from "@/lib/config";
import { currentSupabaseProviderIdentity } from "@/lib/supabase-auth";

export const metadata = { title: "Set up your business", description: "Add your business and contact details to AfricMade." };

export default async function RequestPage() {
  const t = await getUiText();
  await connection();
  const identity = supabaseAuthEnabled() ? await currentSupabaseProviderIdentity() : null;
  if (!identity) redirect("/login");
  if (identity.userId) redirect("/dashboard");
  return <div className="landing-home platform-task-page">
    <div className="platform-task-main">
      <section className="platform-task-shell request-task-shell" aria-labelledby="request-title">
        <div className="platform-task-context">
          <span className="platform-task-eyebrow">{t("Account setup")}</span>
          <h1 id="request-title">{t("Set up your business.")}</h1>
          <p>{t("Start with a name, category, and contact number.")}</p>
        </div>
        <div className="platform-form-panel">
          <div className="platform-form-heading"><span>{t("Business details")}</span><h2>{t("Introduce your business")}</h2><p>{t("Next, make the example page your own.")}</p></div>
          <SignupForm email={identity.email} initialName={identity.displayName} />
          <div className="platform-form-footer"><span>{t("Using the wrong account?")}</span><form action={logoutAction}><button className="platform-link-button" type="submit">{t("Sign out")}</button></form></div>
        </div>
      </section>
    </div>
  </div>;
}
