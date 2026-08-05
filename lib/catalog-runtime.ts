import { getBusinessByHandle, getBusinessByHandleAny, getBusinessById, getCatalogByBusinessId, getCatalogByHandle, getUserByEmail, getUserById, hasRetainedPublication } from "./db";
import { postgresRuntimeEnabled, postgresRuntimeServices } from "./postgres-runtime-services";

export async function runtimeBusinessByHandle(handle: string) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getBusinessByHandle(handle) : getBusinessByHandle(handle);
}

export async function runtimeBusinessByHandleAny(handle: string) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getBusinessByHandleAny(handle) : getBusinessByHandleAny(handle);
}

export async function runtimeBusinessById(id: number) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getBusinessById(id) : getBusinessById(id);
}

export async function runtimeCatalogByHandle(handle: string) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getCatalogByHandle(handle) : getCatalogByHandle(handle);
}

export async function runtimeCatalogByBusinessId(businessId: number, includeDrafts = false) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getCatalogByBusinessId(businessId, includeDrafts) : getCatalogByBusinessId(businessId, includeDrafts);
}

export async function runtimeUserByEmail(email: string) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getUserByEmail(email) : getUserByEmail(email);
}

export async function runtimeUserById(id: number) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.getUserById(id) : getUserById(id);
}

export async function runtimeHasRetainedPublication(businessId: number) {
  return postgresRuntimeEnabled() ? postgresRuntimeServices().catalog.hasRetainedPublication(businessId) : hasRetainedPublication(businessId);
}
