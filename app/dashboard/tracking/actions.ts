"use server";

import type { OwnerEditResult } from '@/lib/owner-edit-contract';

function retired(): OwnerEditResult {
  return {error:'This service is no longer available.'};
}

export async function submitShipmentAction(_form:FormData) {return retired();}
export async function updateShipmentAction(_form:FormData) {return retired();}
export async function revokeShipmentAction(_form:FormData) {return retired();}
