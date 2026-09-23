
import { getUiText } from "@/lib/i18n/server";
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
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveProductBusiness(user, query.business);
  if (!business) return null;
  const products = await listProductsPage(business.id, query, true);
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label={t("Breadcrumb")}>
          <Link href={`/dashboard?business=${business.id}`}>{t("Overview")}</Link>
          <span aria-hidden="true">/</span>
          <span>{t("Products & services")}</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <h1>{t("Products & services")}</h1>
        </div>
        <Link
          className="btn brand"
          href={`/dashboard/products/new?business=${business.id}`}
        >
          {t("Add product or service")}</Link>
      </div>
      {query.saved ? (
        <p className="notice">{t("Item saved.")}</p>
      ) : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      <CollectionToolbar
        action="/dashboard/products"
        search={query.q || ""}
        placeholder={t("Name, category, type, or availability")}
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
          <h2>{query.q ? t("No matching items") : t("No products or services yet")}</h2>
          <p>{query.q ? t("Try another name or category.") : t("Add the first product or service to your page.")}</p>
          <Link
            className="btn brand"
            href={`/dashboard/products/new?business=${business.id}`}
          >
            {t("Add first product or service")}</Link>
        </section>
      )}
    </DashboardShell>
  );
}
