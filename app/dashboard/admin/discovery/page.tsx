import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function DiscoveryAdminPage({ searchParams }: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const next = new URLSearchParams();
  if (query.q) next.set("q", query.q);
  if (query.status) next.set("status", query.status);
  if (query.page) next.set("page", query.page);
  redirect(`/dashboard/admin/businesses${next.size ? `?${next}` : ""}`);
}
