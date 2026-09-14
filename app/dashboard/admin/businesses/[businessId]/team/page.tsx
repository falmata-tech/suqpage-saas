import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { runtimeAll,runtimeGet } from '@/lib/runtime-sql';
import { normalizePageRequest,pageWindow,pageResult,likePattern } from '@/lib/pagination';
import DashboardShell from '@/components/DashboardShell';
import CollectionToolbar from '@/components/CollectionToolbar';
import PaginationNav from '@/components/PaginationNav';
import { businessAssignmentAction } from './actions';
export const dynamic='force-dynamic';
export default async function BusinessTeam({params,searchParams}:{params:Promise<{businessId:string}>;searchParams:Promise<{page?:string;q?:string;error?:string;saved?:string}>}){
 const actor=await requireUser();const businessId=Number((await params).businessId);const business=await runtimeBusinessById(businessId);if(!business||actor.access_role!=='platform_admin')notFound();
 const query=await searchParams;const request=normalizePageRequest({page:query.page,search:query.q});const pattern=likePattern(request.search);
 const where="FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='team_member' AND (lower(u.name) LIKE ? ESCAPE '\\' OR lower(u.email) LIKE ? ESCAPE '\\')";
 const total=Number((await runtimeGet<{total:number}>(`SELECT COUNT(*) total ${where}`,[pattern,pattern]))?.total||0);const window=pageWindow(total,request);
 const rows=await runtimeAll<{id:number;name:string;email:string;active:number}>(`SELECT u.id,u.name,u.email,COALESCE((SELECT active FROM staff_business_assignments a WHERE a.user_id=u.id AND a.business_id=?),0) active ${where} ORDER BY lower(u.name),u.id LIMIT ? OFFSET ?`,[businessId,pattern,pattern,window.limit,window.offset]);
 return <DashboardShell user={actor} business={business}><div className="dashboard-head standard-page-heading"><div><h1>Staff assistance</h1><p>Assign team members to {business.name}. Page editing also requires the owner's assistance permission.</p></div><Link className="btn" href={`/dashboard?business=${businessId}`}>Back to business</Link></div>{query.error?<p role="alert" className="error">{query.error}</p>:null}{query.saved?<p role="status" className="notice">Staff access updated.</p>:null}
 <CollectionToolbar action={`/dashboard/admin/businesses/${businessId}/team`} search={query.q||''} placeholder="Staff name or email"/>
 <div className="compact-business-list">{rows.map(row=><div className="compact-business-row" key={row.id}><span><strong>{row.name}</strong><small>{row.email}</small></span><span>{row.active?'Assigned':'Not assigned'}</span><form action={businessAssignmentAction}><input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="userId" value={row.id}/><input type="hidden" name="active" value={row.active?'0':'1'}/><button className="small-btn">{row.active?'Revoke access':'Assign'}</button></form></div>)}</div>
 {!rows.length?<div className="empty-state">No team members match this search.</div>:null}<PaginationNav result={pageResult(rows,total,request)} pathname={`/dashboard/admin/businesses/${businessId}/team`} params={{q:query.q}}/></DashboardShell>;
}
