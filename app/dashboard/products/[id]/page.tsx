import crypto from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ProductForm from "@/components/ProductForm";
import { basicProductUpkeepAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    business?: string;
    saved?: string;
    version?: string;
    error?: string;
  }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const route = await params;
  const business = resolveProductBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;
  const product = catalog.products.find(
    (candidate) => candidate.id === Number(route.id),
  );
  if (!product) notFound();
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
          <span>{product.name}</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Basic upkeep</p>
          <h1>Edit {product.name}</h1>
          <p>
            Only the safe client-managed fields below will change. Existing
            options and showroom design remain intact.
          </p>
        </div>
        <Link
          className="btn secondary"
          href={`/preview/@${business.handle}`}
          target="_blank"
        >
          Open preview ↗
        </Link>
      </div>
      {query.saved ? (
        <p className="notice">
          Offering published successfully
          {query.version ? ` as showroom version ${query.version}` : ""}.
        </p>
      ) : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      <ProductForm
        catalog={catalog}
        product={product}
        action={basicProductUpkeepAction}
        businessId={business.id}
        contentVersion={business.content_version}
        idempotencyKey={crypto.randomUUID()}
        staffMode={user.access_role !== "client"}
      />
    </DashboardShell>
  );
}
