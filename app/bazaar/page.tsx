import { redirect } from "next/navigation";

export default function LegacyBazaarRedirect() {
  redirect("/discover");
}
