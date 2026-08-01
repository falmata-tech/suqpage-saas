import { redirect } from "next/navigation";

export default function LegacyExpoRedirect() {
  redirect("/discover");
}
