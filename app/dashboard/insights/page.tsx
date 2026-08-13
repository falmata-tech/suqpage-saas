import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { resolveBusiness } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function ShowroomVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const user = await requireUser();
  if (user.access_role === "team_member") redirect("/dashboard");
  const query = await searchParams;
  const business = await resolveBusiness(user, query.business);
  if (!business) return null;
  redirect(`/dashboard?business=${business.id}#showroom-visits`);
}
