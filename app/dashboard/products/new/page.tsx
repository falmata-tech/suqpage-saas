import {runtimeCategoryExampleVideo} from "@/lib/category-starter-runtime";

import { getUiText } from "@/lib/i18n/server";
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
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveProductBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;
  return (
    <DashboardShell user={user} business={business}>
      <div className="navigation-trail">
        <nav aria-label={t("Breadcrumb")}>
          <Link href={`/dashboard?business=${business.id}`}>{t("Overview")}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/dashboard/products?business=${business.id}`}>
            {t("Products & services")}</Link>
          <span aria-hidden="true">/</span>
          <span>{t("Add product or service")}</span>
        </nav>
      </div>
      <div className="dashboard-head standard-page-heading">
        <div>
          <h1>{t("Add a product or service")}</h1>
        </div>
      </div>
      {query.error ? <p className="error">{t(query.error)}</p> : null}
      <ProductForm exampleVideoRef={await runtimeCategoryExampleVideo(business.id)}
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
