import { redirect } from "next/navigation";
import { getBusinessById } from "./db";
import type { SessionUser } from "./types";

export function resolveBusiness(user: SessionUser, requested?: string | number | null) {
  const id = user.role === "owner" ? user.business_id : Number(requested || 0);
  if (!id) return null;
  if (user.role === "owner" && user.business_id !== id) redirect("/dashboard");
  return getBusinessById(id) || null;
}
