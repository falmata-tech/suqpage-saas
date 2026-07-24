import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import DesignBankLaboratory from "@/components/showroom/bank/DesignBankLaboratory";
import { requireUser } from "@/lib/auth";
import {
  SHOWROOM_BANK_1_2_COMBINATION_FLOOR,
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
} from "@/lib/showroom-bank-release";
import { hasCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export default async function DesignBankPage() {
  const user = await requireUser();
  if (!hasCapability(user, "design-bank:view")) redirect("/dashboard");
  return (
    <DashboardShell user={user} business={null}>
      <div className="dashboard-head">
        <div>
          <span className="eyebrow">Internal design system</span>
          <h1>Showroom component bank</h1>
          <p>
            Review candidate release {SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release}.
            These previews use synthetic fixture content and cannot change a
            tenant, become the runtime default, or publish a showroom.
          </p>
        </div>
      </div>
      <DesignBankLaboratory
        bank={SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE}
        combinationFloor={SHOWROOM_BANK_1_2_COMBINATION_FLOOR}
      />
    </DashboardShell>
  );
}
