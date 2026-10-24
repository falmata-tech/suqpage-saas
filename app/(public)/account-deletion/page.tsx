import Link from "next/link";
import { getUiText } from "@/lib/i18n/server";

export default async function AccountDeletion() {
  const t = await getUiText();
  return <>
    <article className="public-document">
      <div className="legal">


        <h1>{t("Delete your AfricMade account")}</h1>
        <p>{t("Send your request from the email you use to sign in. Include your page handle, if you have one.")}</p>
        <p>{t("Our team will verify your identity and confirm the data to be removed before deleting your account.")}</p>
        <a className="btn brand" href="mailto:falmata.dawano@gmail.com?subject=AfricMade%20account%20deletion%20request">{t("Email deletion request")}</a>
        <p><a href="mailto:falmata.dawano@gmail.com">falmata.dawano@gmail.com</a></p>
        <Link href="/privacy">{t("Privacy notice")}</Link>
      </div>
    </article>

  </>;
}
