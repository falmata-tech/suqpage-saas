import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { runtimeBusinessById } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function BusinessAccessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const businessId = Number.parseInt((await params).businessId, 10);
  if (!Number.isInteger(businessId)) notFound();
  const business = await runtimeBusinessById(businessId);
  if (!business) notFound();
  redirect(`/dashboard/settings?business=${business.id}#owner-sign-in`);
}
