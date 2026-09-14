import { postgresRuntimeServices } from "./postgres-runtime-services";
export async function runtimeBusinessByHandle(handle: string) {
    return postgresRuntimeServices().catalog.getBusinessByHandle(handle);
}
export async function runtimeBusinessByHandleAny(handle: string) {
    return postgresRuntimeServices().catalog.getBusinessByHandleAny(handle);
}
export async function runtimeBusinessById(id: number) {
    return postgresRuntimeServices().catalog.getBusinessById(id);
}
export async function runtimeCatalogByHandle(handle: string) {
    return postgresRuntimeServices().catalog.getCatalogByHandle(handle);
}
export async function runtimeCatalogByBusinessId(businessId: number, includeDrafts = false) {
    return postgresRuntimeServices().catalog.getCatalogByBusinessId(businessId, includeDrafts);
}
export async function runtimeUserByEmail(email: string) {
    return postgresRuntimeServices().catalog.getUserByEmail(email);
}
export async function runtimeUserById(id: number) {
    return postgresRuntimeServices().catalog.getUserById(id);
}
export async function runtimeHasRetainedPublication(businessId: number) {
    return postgresRuntimeServices().catalog.hasRetainedPublication(businessId);
}
