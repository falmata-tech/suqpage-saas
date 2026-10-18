
import { getUiText } from "@/lib/i18n/server";
import Link from "next/link";
import CollectionToolbar from "@/components/CollectionToolbar";
import DashboardShell from "@/components/DashboardShell";
import PaginationNav from "@/components/PaginationNav";
import ProductUpkeepList from "@/components/ProductUpkeepList";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { listProductsPage } from "@/lib/scalable-queries";
import {productListView,productEditorHref} from '@/lib/product-workspace-navigation';

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
  const listOrigin=productListView({q:query.q,page:products.page});
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label={t("Breadcrumb")}>
          <Link href={user.access_role==='client'?'/dashboard/profile':`/dashboard?business=${business.id}`}>{t(user.access_role==='client'?"Account":"Overview")}</Link>
          <span aria-hidden="true">/</span>
          <span>{t("Products")}</span>
        </nav>
      </div>
      <div className="dashboard-head">
        <div>
          <h1>{t("Products")}</h1>
        </div>
        <div className="inline-actions">{user.access_role!=='client'?<Link className="btn secondary" href={`/dashboard/catalog?business=${business.id}`}>{t("Categories")}</Link>:null}<Link
          className="btn brand"
          href={productEditorHref('new',business.id,listOrigin)}
        >
          {t("Add product")}</Link></div>
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
          <ProductUpkeepList products={products.items} businessId={business.id} listOrigin={listOrigin}/>
          <PaginationNav
            result={products}
            pathname="/dashboard/products"
            params={{ business: business.id, q: query.q }}
          />
        </>
      ) : (
        <section className="empty-state">
          <h2>{query.q ? t("No matching items") : t("No products yet")}</h2>
          <p>{query.q ? t("Try another name or category.") : t("Add the first product to your page.")}</p>
          <Link
            className="btn brand"
            href={productEditorHref('new',business.id,listOrigin)}
          >
            {t("Add first product")}</Link>
        </section>
      )}
    </DashboardShell>
  );
}
