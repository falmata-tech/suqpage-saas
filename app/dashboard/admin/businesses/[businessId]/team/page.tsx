
import { getUiText } from "@/lib/i18n/server";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { listBusinessAssignmentCandidates } from '@/lib/business-assistance';
import DashboardShell from '@/components/DashboardShell';
import CollectionToolbar from '@/components/CollectionToolbar';
import PaginationNav from '@/components/PaginationNav';
import { businessAssignmentAction } from './actions';
import styles from './team.module.css';
export const dynamic='force-dynamic';
export default async function BusinessTeam({params,searchParams}:{params:Promise<{businessId:string}>;searchParams:Promise<{page?:string;q?:string;error?:string;saved?:string}>}){
  const t = await getUiText();
 const actor=await requireUser();const businessId=Number((await params).businessId);const business=await runtimeBusinessById(businessId);if(!business||actor.access_role!=='platform_admin')notFound();
 const query=await searchParams;const result=await listBusinessAssignmentCandidates(actor,businessId,query);const rows=result.items;
 return <DashboardShell user={actor} business={business}><div className="dashboard-head standard-page-heading"><div><h1>{t("Staff assistance")}</h1><p>{t("Assign team members to")}{" "}{business.name}{t(". Page editing also requires the owner's assistance permission.")}</p></div><Link className="btn" href={`/dashboard/access?business=${businessId}`}>{t("Back to {value1}",{value1:t('Access')})}</Link></div>{query.error?<p role="alert" className="error">{t(query.error)}</p>:null}{query.saved?<p role="status" className="notice">{t("Staff access updated.")}</p>:null}
 <p className="muted">{t("Only page-editing staff can be newly assigned. Support and transport agents work from their chat queues.")}</p>
 <CollectionToolbar action={`/dashboard/admin/businesses/${businessId}/team`} search={query.q||''} placeholder={t("Staff name or email")}/>
 <div className="compact-business-list">{rows.map(row=><div className={'compact-business-row '+styles.row} key={row.id}><span><strong>{row.name}</strong><small>{row.email}</small>{!row.canAssign?<small>{t("This account cannot receive a staff editing assignment.")}</small>:null}</span><span>{!row.canAssign?t("Previous assignment"):row.active?t("Assigned"):t("Not assigned")}</span>{row.canAssign||row.active?<form action={businessAssignmentAction}><input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="userId" value={row.id}/><input type="hidden" name="active" value={row.active?'0':'1'}/><button className="small-btn">{row.active?t("Revoke access"):t("Assign")}</button></form>:null}</div>)}</div>
 {!rows.length?<div className="empty-state">{t("No team members match this search.")}</div>:null}<PaginationNav result={result} pathname={`/dashboard/admin/businesses/${businessId}/team`} params={{q:query.q}}/></DashboardShell>;
}
