import { redirect } from "next/navigation";

export default async function LegacyDiscoveryProfileRedirect({ params }: { params: Promise<{ businessId: string }> }) {
  redirect(`/dashboard/admin/discovery/${(await params).businessId}`);
}
