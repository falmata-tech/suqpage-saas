import type {SessionUser} from './types';
import {CatalogSafetyError,listingReportCommand,type ListingReportCommand} from './catalog-safety';
export type ReportTarget={businessId:number;productId:number|null;handle:string;businessName:string;productName:string;visible:boolean};
export type ListingReport={id:number;receipt:string;businessId:number|null;productId:number|null;handle:string;businessName:string;productName:string;reason:string;details:string;status:'open'|'review'|'resolved'|'dismissed';version:number;assignedUserId:number|null;assignedName:string|null;createdAt:number;updatedAt:number};
export function canReviewListings(actor:SessionUser){return ['platform_admin','operations_manager'].includes(actor.access_role)||(actor.access_role==='team_member'&&['support','all'].includes(actor.staff_queue_scope??''));}
export function requireReportStaff(actor:SessionUser){if(!canReviewListings(actor))throw new CatalogSafetyError('Report access denied.',403);}
export interface ListingReportPort{
  submit(command:ListingReportCommand,ipHash:string):Promise<{receipt:string;duplicate:boolean}>;
  list(actor:SessionUser,input:{page?:unknown;status?:unknown}):Promise<{items:ListingReport[];page:number;totalPages:number;totalItems:number}>;
  assignees(actor:SessionUser):Promise<Array<{id:number;name:string}>>;
  update(actor:SessionUser,input:{id:unknown;version:unknown;action:unknown;assignedUserId?:unknown}):Promise<void>;
}
export async function submitListingReport(port:ListingReportPort,input:unknown,ipHash:string){return port.submit(listingReportCommand(input),ipHash);}
