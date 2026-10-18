import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import OwnerTransportWorkspace from "@/components/OwnerTransportWorkspace";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { readOwnerTransport } from "@/lib/owner-transport";
import { SupportError } from "@/lib/support";

export const dynamic = "force-dynamic";
export default async function OwnerTransportPage({ searchParams }: { searchParams: Promise<{ conversation?: string; new?: string }> }) {
  const actor = await requireUser();
  if (actor.access_role !== "client" || !actor.business_id) redirect("/dashboard");
  const query = await searchParams;
  const business = await runtimeBusinessById(actor.business_id);
  let initial;
  try { initial = await readOwnerTransport(actor, query); }
  catch (error) { if (error instanceof SupportError && ["not_found", "forbidden"].includes(error.code)) notFound(); throw error; }
  if (!("conversation" in initial)) notFound();
  return <DashboardShell user={actor} business={business || null}><OwnerTransportWorkspace key={`${actor.id}:${query.new === "1" ? "new" : query.conversation || "active"}`} initial={initial} draftScope={String(actor.id)} /></DashboardShell>;
}
