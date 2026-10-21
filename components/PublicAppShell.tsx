import type { ReactNode } from "react";
import PublicAppFrame from "@/components/PublicAppFrame";
import {workspaceHomeHref} from "@/lib/capabilities";
import { currentUser } from "@/lib/auth";

export default async function PublicAppShell({ children }: { children: ReactNode }) {
  const user = await currentUser();
  return <PublicAppFrame signedIn={Boolean(user)} dashboardHref={user?workspaceHomeHref(user):"/dashboard"}>{children}</PublicAppFrame>;
}
