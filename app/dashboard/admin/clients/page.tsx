import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hasCapability } from "@/lib/capabilities";
import { getManagedClient } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function AdminClients({ searchParams }: {
  searchParams: Promise<{ error?:string; saved?:string; page?:string; q?:string; client?:string }>;
}) {
  const user = await requireUser();
  if (!hasCapability(user, "platform:admin")) redirect("/dashboard");
  const query = await searchParams;
  const selectedId = Number.parseInt(query.client || "",10);
  const selected = Number.isInteger(selectedId) ? await getManagedClient(selectedId) : undefined;
  if (selected) redirect(`/dashboard/admin/businesses/${selected.business_id}/access`);
  const next = new URLSearchParams();
  if (query.q) next.set("q", query.q);
  if (query.page) next.set("page", query.page);
  redirect(`/dashboard/admin/businesses${next.size ? `?${next}` : ""}`);
}
