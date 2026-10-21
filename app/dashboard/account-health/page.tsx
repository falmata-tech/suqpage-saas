import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Old bookmarks return to the workspace; business subscriptions are retired. */
export default async function RetiredAccountHealth() {
  await requireUser();
  redirect("/dashboard");
}
