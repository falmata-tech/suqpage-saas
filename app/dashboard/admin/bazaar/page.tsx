import { redirect } from "next/navigation";

export default function LegacyDiscoveryAdminRedirect() {
  redirect("/dashboard/admin/discovery");
}
