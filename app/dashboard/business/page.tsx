import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { readOwnerBusiness } from '@/lib/owner-business-runtime';
import DashboardShell from '@/components/DashboardShell';
import OwnerBusinessForm from '@/components/OwnerBusinessForm';
import { saveOwnerBusinessAction } from './actions';
export const dynamic='force-dynamic';
export default async function OwnerBusinessPage({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
 const actor=await requireUser();if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');
 const setup=await readOwnerBusiness(actor,actor.business_id),business=await runtimeBusinessById(actor.business_id),query=await searchParams;
 const pending=setup.proposal&&setup.proposal.reviewed_version!==setup.proposal.version;
 return <DashboardShell user={actor} business={business||null}><div className="dashboard-head standard-page-heading"><div><h1>Business details</h1><p>Your identity and the area buyers can find you in.</p></div><Link href="/dashboard/page-editor" className="btn secondary">Edit page and contacts</Link></div>
 {query.error?<p className="error" role="alert">{query.error}</p>:null}{query.saved?<p className="notice" role="status">Business details saved.</p>:null}
 <p className="notice">{pending?'Location submitted for review. The previous map placement stays hidden until review.':setup.existing?.approved_at&&!setup.existing.is_excluded?'Your marketplace location is approved.':'Add your city and region so Suqpage can review your marketplace location.'}</p>
 <OwnerBusinessForm setup={setup} action={saveOwnerBusinessAction}/></DashboardShell>;
}
