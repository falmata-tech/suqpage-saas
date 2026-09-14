import Link from 'next/link';
import { notFound } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import ShowroomApp from '@/components/showroom/ShowroomApp';
import { requireUser } from '@/lib/auth';
import { runtimeCatalogByBusinessId } from '@/lib/catalog-runtime';
import { ownerPagePort } from '@/lib/owner-page-runtime';
import { pageReviewPort } from '@/lib/page-review-runtime';
import { reviewPageAction } from '../actions';
export const dynamic='force-dynamic';
export default async function ReviewPage({params,searchParams}:{params:Promise<{businessId:string}>;searchParams:Promise<{error?:string;saved?:string}>}){
 const actor=await requireUser();const businessId=Number((await params).businessId);const query=await searchParams;
 if(actor.access_role!=='platform_admin'||!Number.isSafeInteger(businessId)||businessId<1)notFound();
 const review=await pageReviewPort.read(businessId);if(!review)notFound();
 const catalog=await runtimeCatalogByBusinessId(businessId,true);const draft=await ownerPagePort.read(businessId);if(!catalog||!draft)notFound();
 const current=review.draftVersion===draft.version&&review.contentVersion===catalog.business.content_version;
 return <DashboardShell user={actor} business={catalog.business}>
 <nav className="workspace-breadcrumbs" aria-label="Breadcrumb"><Link href="/dashboard/admin/page-reviews">Page reviews</Link><span>/</span><strong>{catalog.business.name}</strong></nav>
 <div className="dashboard-head standard-page-heading"><div><h1>Review {catalog.business.name}</h1><p>{review.status.replaceAll('_',' ')} · {catalog.products.length} products</p></div><Link className="btn" href={`/dashboard/admin/discovery/${businessId}`}>Marketplace settings</Link></div>
 {query.error?<p role="alert" className="error">{query.error}</p>:null}{query.saved?<p role="status" className="notice">Review decision saved.</p>:null}
 {!current?<p role="alert" className="error">The owner changed the page or products after submitting. They need to submit the latest version before review.</p>:null}
 {review.feedback?<p className="notice">{review.feedback}</p>:null}
 {current&&review.status==='pending'?<><section className="panel"><h2>First publication</h2><p>Approve the saved page below, or explain the changes it needs. Marketplace placement also requires approved location and category settings.</p>
 <form action={reviewPageAction}><input type="hidden" name="businessId" value={businessId}/><input type="hidden" name="submission" value={review.submission}/><div className="field"><label htmlFor="review-feedback">Feedback for the owner</label><textarea id="review-feedback" name="feedback" maxLength={1000}/></div><div className="hero-actions"><button className="btn brand" name="decision" value="approve">Approve and publish</button><button className="btn secondary" name="decision" value="changes">Request changes</button></div></form></section>
 <section className="panel"><h2>Submitted page preview</h2><ShowroomApp catalog={catalog} businessProfile={draft.content} previewMode embedded/></section></>:null}
 </DashboardShell>;
}
