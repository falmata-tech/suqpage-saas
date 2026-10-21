import { OwnerPageError } from './owner-page-domain';
import type { PageResult } from './pagination';
import type { SessionUser } from './types';

// Compatibility signatures for retired route callers. Historical assignment
// rows remain in PostgreSQL but cannot be read or changed as live authority.
export interface BusinessAssignmentCandidate {
  id:number;
  name:string;
  email:string;
  active:number;
  canAssign:boolean;
}

export async function listBusinessAssignmentCandidates(
  _actor:SessionUser,_businessId:number,_input:{page?:unknown;q?:unknown}={},
):Promise<PageResult<BusinessAssignmentCandidate>> {
  throw new OwnerPageError('Per-business staff assignments are retired.',410);
}

export async function setBusinessAssignment(
  _actor:SessionUser,_businessId:number,_userId:number,_active:boolean,
):Promise<void> {
  throw new OwnerPageError('Per-business staff assignments are retired.',410);
}
