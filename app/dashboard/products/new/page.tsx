import crypto from "node:crypto";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import ProductForm from "@/components/ProductForm";
import { basicProductUpkeepAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { getCatalogByBusinessId } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewProduct({
  searchParams,
}: {
  searchParams: Promise<{ business?: string; error?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const business = resolveProductBusiness(user, query.business);
  if (!business) return null;
  const catalog = getCatalogByBusinessId(business.id, true)!;
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label="Breadcrumb">
          <Link href={`/dashboard?business=${business.id}`}>Overview</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/dashboard/products?business=${business.id}`}>
            My offerings
          </Link>
          <span aria-hidden="true">/</span>
          <span>Add offering</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Basic upkeep</p>
          <h1>Add a product or capability</h1>
          <p>
            Add what the business sells, makes, grows, supplies, or can manufacture. The showroom design
            handles presentation automatically.
          </p>
        </div>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      <ProductForm
        catalog={catalog}
        action={basicProductUpkeepAction}
        businessId={business.id}
        contentVersion={business.content_version}
        idempotencyKey={crypto.randomUUID()}
        staffMode={user.access_role !== "client"}
      />
    </DashboardShell>
  );
}
