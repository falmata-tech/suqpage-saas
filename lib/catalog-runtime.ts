import { getBusinessByHandle, getBusinessByHandleAny, getBusinessById, getCatalogByBusinessId, getCatalogByHandle, getUserByEmail, getUserById, hasRetainedPublication } from "./db";
import { postgresRuntimePreviewEnabled, postgresRuntimeServices } from "./postgres-runtime-services";

export async function runtimeBusinessByHandle(handle: string) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getBusinessByHandle(handle) : getBusinessByHandle(handle);
}

export async function runtimeBusinessByHandleAny(handle: string) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getBusinessByHandleAny(handle) : getBusinessByHandleAny(handle);
}

export async function runtimeBusinessById(id: number) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getBusinessById(id) : getBusinessById(id);
}

export async function runtimeCatalogByHandle(handle: string) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getCatalogByHandle(handle) : getCatalogByHandle(handle);
}

export async function runtimeCatalogByBusinessId(businessId: number, includeDrafts = false) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getCatalogByBusinessId(businessId, includeDrafts) : getCatalogByBusinessId(businessId, includeDrafts);
}

export async function runtimeUserByEmail(email: string) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getUserByEmail(email) : getUserByEmail(email);
}

export async function runtimeUserById(id: number) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.getUserById(id) : getUserById(id);
}

export async function runtimeHasRetainedPublication(businessId: number) {
  return postgresRuntimePreviewEnabled() ? postgresRuntimeServices().catalog.hasRetainedPublication(businessId) : hasRetainedPublication(businessId);
}
