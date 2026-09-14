import { isPageOwner, OwnerPageError, ownerPageVersion } from './owner-page-domain';
import { readOwnerPage, type OwnerPagePort } from './owner-page-service';
import type { SessionUser } from './types';
export type PageReview = { businessId: number; submission: number; draftVersion: number; contentVersion: number; status: 'pending' | 'changes_requested' | 'approved'; feedback: string; submittedBy: number; submittedAt: number; reviewedBy: number | null; reviewedAt: number | null };
export interface PageReviewPort {
 read(businessId: number): Promise<PageReview | null>;
 readiness(businessId: number): Promise<{ status: string; contentVersion: number; products: number } | null>;
 submit(actor: SessionUser, businessId: number, draftVersion: number, contentVersion: number): Promise<PageReview | null>;
 decide(actor: SessionUser, businessId: number, submission: number, decision: 'approve' | 'changes', feedback: string): Promise<PageReview | null>;
}
export async function submitPageReview(drafts: OwnerPagePort, reviews: PageReviewPort, actor: SessionUser, businessId: number, version: unknown) {
 if (!isPageOwner(actor,businessId)) throw new OwnerPageError('Only the owner can submit this page.',403);
 const draft=await readOwnerPage(drafts,actor,businessId);
 if (!draft || draft.version!==ownerPageVersion(version)) throw new OwnerPageError('Save and review the latest page before submitting.',409);
 const business=await reviews.readiness(businessId);
 if (!business || business.status!=='draft') throw new OwnerPageError('This page is not eligible for first review.',409);
 if (!business.products || !(draft.content.about || draft.content.introduction).trim()) throw new OwnerPageError('Add a product and an About description before submitting.');
 if(draft.content.heroImage && !(await drafts.hasImage(businessId,draft.content.heroImage))) throw new OwnerPageError('Choose an available cover image.');
 const result=await reviews.submit(actor,businessId,draft.version,business.contentVersion);
 if(!result) throw new OwnerPageError('The page or products changed. Reload before submitting.',409);
 return result;
}
export async function decidePageReview(reviews: PageReviewPort, actor: SessionUser, businessId: number, submission: unknown, decision: unknown, feedback: unknown) {
 if(actor.access_role!=='platform_admin') throw new OwnerPageError('Administrator access is required.',403);
 if(!Number.isSafeInteger(businessId)||businessId<1) throw new OwnerPageError('Page not found.',404);
 const version=ownerPageVersion(submission);
 if(decision!=='approve'&&decision!=='changes') throw new OwnerPageError('Choose a review decision.');
 if(typeof feedback!=='string'||feedback.length>1000) throw new OwnerPageError('Keep feedback within 1,000 characters.');
 const note=feedback.trim();
 if(decision==='changes'&&!note) throw new OwnerPageError('Explain what the owner should change.');
 const result=await reviews.decide(actor,businessId,version,decision,note);
 if(!result) throw new OwnerPageError('This submission or its products changed. Ask the owner to submit the latest version.',409);
 return result;
}
