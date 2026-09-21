import crypto from "node:crypto";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import ProductForm from "@/components/ProductForm";
import { basicProductUpkeepAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function NewProduct({
  searchParams,
}: {
  searchParams: Promise<{ business?: string; error?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveProductBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label="Breadcrumb">
          <Link href={`/dashboard?business=${business.id}`}>Overview</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/dashboard/products?business=${business.id}`}>
            Products & services
          </Link>
          <span aria-hidden="true">/</span>
          <span>Add product or service</span>
        </nav>
      </div>
      <div className="dashboard-head standard-page-heading">
        <div>
          <h1>Add a product or service</h1>
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
