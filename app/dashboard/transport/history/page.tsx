import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import { requireUser } from "@/lib/auth";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import { readOwnerTransport } from "@/lib/owner-transport";
import { getUiText } from "@/lib/i18n/server";
import styles from "@/components/OwnerTransportWorkspace.module.css";
import {clientChatPresentation} from '@/lib/support-client-state';

export const dynamic = "force-dynamic";
export default async function OwnerTransportHistoryPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const actor = await requireUser();
  if (actor.access_role !== "client" || !actor.business_id) redirect("/dashboard");
  const query = await searchParams;
  const [result, business, t] = await Promise.all([readOwnerTransport(actor, { ...query, history: "1" }), runtimeBusinessById(actor.business_id), getUiText()]);
  if (!("items" in result)) notFound();
  return <DashboardShell user={actor} business={business || null}>
    <div className="dashboard-head"><div><h1>{t("Chat history")}</h1><Link href="/dashboard/transport">{t("Transport chat")}</Link></div><Link className="small-btn" href="/dashboard/transport?new=1">{t("Start chat")}</Link></div>
    <section className={styles.history} aria-label={t("Chat history")}>
      {result.items.map(item => <Link key={item.id} href={`/dashboard/transport?conversation=${item.id}`}><span><strong>{item.subject}</strong><small>{item.publicRef}</small>{item.unread && <small>{t("New")}</small>}</span><span>{t(clientChatPresentation(item).statusKey)}</span></Link>)}
      {!result.items.length && <div className="empty-state">{t("No conversations yet.")}</div>}
    </section>
    <PaginationNav result={{ page: result.page, totalPages: result.pages, totalItems: result.total, firstItem: result.firstItem, lastItem: result.lastItem }} pathname="/dashboard/transport/history" />
  </DashboardShell>;
}
