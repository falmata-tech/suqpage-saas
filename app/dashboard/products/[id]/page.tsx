
import { getUiText } from "@/lib/i18n/server";
import crypto from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import ProductForm from "@/components/ProductForm";
import { basicProductUpkeepEditAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness } from "@/lib/dashboard";
import { runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";
import {productListView,productListHref} from '@/lib/product-workspace-navigation';

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
    nav_q?:string;
    nav_page?:string;
  }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const route = await params;
  const business = await resolveProductBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;
  const product = catalog.products.find(
    (candidate) => candidate.id === Number(route.id),
  );
  if (!product) notFound();
  const listOrigin=productListView({q:query.nav_q,page:query.nav_page}),cancelHref=productListHref(business.id,listOrigin);
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label={t("Breadcrumb")}>
          <Link href={user.access_role==='client'?'/dashboard/profile':`/dashboard?business=${business.id}`}>{t(user.access_role==='client'?"Account":"Overview")}</Link>
          <span aria-hidden="true">/</span>
          <Link href={cancelHref}>
            {t("Products")}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>
      </div>
      <div className="dashboard-head standard-page-heading">
        <div>
          <h1>{t("Edit")}{" "}{product.name}</h1>
        </div>
        <Link
          className="btn secondary"
          href={`/preview/@${business.handle}`}
          target="_blank"
        >
          {t("Open preview ↗")}</Link>
      </div>
      {query.saved ? (
        <p className="notice">
          {t("Item saved.")}</p>
      ) : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      <ProductForm
        key={`${product.id}:${business.content_version}`}
        catalog={catalog}
        product={product}
        action={basicProductUpkeepEditAction}
        cancelHref={cancelHref}
        listOrigin={listOrigin}
        businessId={business.id}
        contentVersion={business.content_version}
        idempotencyKey={crypto.randomUUID()}
        staffMode={user.access_role !== "client"}
      />
    </DashboardShell>
  );
}
