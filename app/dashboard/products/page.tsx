import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import ProductUpkeepList from "@/components/ProductUpkeepList";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { getCatalogByBusinessId } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    business?: string;
    saved?: string;
    error?: string;
  }>;
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
          <span>My products</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Simple product upkeep</p>
          <h1>My products</h1>
          <p>
            Keep names, descriptions, images, availability, and placement
            current without opening the showroom design system.
          </p>
        </div>
        <Link
          className="btn brand"
          href={`/dashboard/products/new?business=${business.id}`}
        >
          Add product
        </Link>
      </div>
      {query.saved ? (
        <p className="notice">Product published in a retained showroom version.</p>
      ) : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      {catalog.products.length ? (
        <ProductUpkeepList
          products={catalog.products}
          businessId={business.id}
        />
      ) : (
        <section className="empty-state">
          <h2>No products yet</h2>
          <p>Add the first product to this established showroom.</p>
          <Link
            className="btn brand"
            href={`/dashboard/products/new?business=${business.id}`}
          >
            Add first product
          </Link>
        </section>
      )}
    </DashboardShell>
  );
}
