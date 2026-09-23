
import { getUiText } from "@/lib/i18n/server";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { resolveProductBusiness as resolveBusiness } from "@/lib/dashboard";
import { runtimeCatalogByBusinessId } from "@/lib/catalog-runtime";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    business?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  const t = await getUiText();
  const user = await requireUser();
  const query = await searchParams;
  const business = await resolveBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;

  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <h1>{t("Product categories")}</h1>
          <p>{t("Create, correct, order, deactivate, or remove product categories.")}</p>
        </div>
      </div>
      {query.saved ? <p className="notice">{t("Product categories saved.")}</p> : null}
      {query.error ? <p className="error">{t(query.error)}</p> : null}

      <section className="panel">
        <h2>{t("Add category")}</h2>
        <form action={createCategoryAction} className="form-grid">
          <input type="hidden" name="businessId" value={business.id} />
          <div className="field">
            <label htmlFor="new-category-name">{t("Name")}</label>
            <input id="new-category-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="new-category-slug">{t("Slug")}</label>
            <input id="new-category-slug" name="slug" />
          </div>
          <div className="field">
            <label htmlFor="new-category-order">{t("Sort order")}</label>
            <input
              id="new-category-order"
              name="sortOrder"
              type="number"
              defaultValue="0"
            />
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <button className="btn">{t("Add category")}</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>{t("Categories")}</h2>
        {catalog.categories.map((category) => (
          <form
            key={category.id}
            action={updateCategoryAction}
            className="form-grid"
            style={{ padding: "18px 0", borderTop: "1px solid var(--line)" }}
          >
            <input type="hidden" name="businessId" value={business.id} />
            <input type="hidden" name="categoryId" value={category.id} />
            <div className="field">
              <label htmlFor={`category-${category.id}-name`}>{t("Name")}</label>
              <input
                id={`category-${category.id}-name`}
                name="name"
                defaultValue={category.name}
              />
            </div>
            <div className="field">
              <label htmlFor={`category-${category.id}-slug`}>{t("Slug")}</label>
              <input
                id={`category-${category.id}-slug`}
                name="slug"
                defaultValue={category.slug}
              />
            </div>
            <div className="field">
              <label htmlFor={`category-${category.id}-order`}>{t("Sort")}</label>
              <input
                id={`category-${category.id}-order`}
                type="number"
                name="sortOrder"
                defaultValue={category.sort_order}
              />
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={Boolean(category.is_active)}
                />{" "}
                {t("Active")}</label>
            </div>
            <div className="inline-actions">
              <button className="small-btn">{t("Save")}</button>
              <button
                className="small-btn danger"
                formAction={deleteCategoryAction}
              >
                {t("Delete")}</button>
            </div>
          </form>
        ))}
      </section>
    </DashboardShell>
  );
}
