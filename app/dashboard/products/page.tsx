import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import ProductUpkeepList from "@/components/ProductUpkeepList";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { listProductsPage } from "@/lib/scalable-queries";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    business?: string;
    saved?: string;
    error?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveProductBusiness(user, query.business);
  if (!business) return null;
  const products = await listProductsPage(business.id, query, true);
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label="Breadcrumb">
          <Link href={`/dashboard?business=${business.id}`}>Overview</Link>
          <span aria-hidden="true">/</span>
          <span>My offerings</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Your market offer</p>
          <h1>Products</h1>
          <p>
            Add products, photos, videos and features to your page.
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
        <p className="notice">Product saved.</p>
      ) : null}
      {query.error ? <p className="error">{query.error}</p> : null}
      <CollectionToolbar
        action="/dashboard/products"
        search={query.q || ""}
        placeholder="Name, category, type, or availability"
        hidden={{ business: business.id }}
      />
      {products.items.length ? (
        <>
          <ProductUpkeepList products={products.items} businessId={business.id} />
          <PaginationNav
            result={products}
            pathname="/dashboard/products"
            params={{ business: business.id, q: query.q }}
          />
        </>
      ) : (
        <section className="empty-state">
          <h2>{query.q ? "No matching offerings" : "No offerings yet"}</h2>
          <p>{query.q ? "Try a broader search." : "Add the first product to your page."}</p>
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
