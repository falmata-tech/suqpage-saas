import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions";
import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";
import { resolveManagedBusiness as resolveBusiness } from "@/lib/dashboard";
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
  const user = await requireUser();
  const query = await searchParams;
  const business = resolveBusiness(user, query.business);
  if (!business) return null;
  const catalog = (await runtimeCatalogByBusinessId(business.id, true))!;

  return (
    <DashboardShell user={user} business={business}>
      <div className="dashboard-head">
        <div>
          <h1>Product categories</h1>
          <p>Create, correct, order, deactivate, or remove product categories.</p>
        </div>
      </div>
      {query.saved ? <p className="notice">Product categories saved.</p> : null}
      {query.error ? <p className="error">{query.error}</p> : null}

      <section className="panel">
        <h2>Add category</h2>
        <form action={createCategoryAction} className="form-grid">
          <input type="hidden" name="businessId" value={business.id} />
          <div className="field">
            <label htmlFor="new-category-name">Name</label>
            <input id="new-category-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="new-category-slug">Slug</label>
            <input id="new-category-slug" name="slug" />
          </div>
          <div className="field">
            <label htmlFor="new-category-order">Sort order</label>
            <input
              id="new-category-order"
              name="sortOrder"
              type="number"
              defaultValue="0"
            />
          </div>
          <div className="field" style={{ alignSelf: "end" }}>
            <button className="btn">Add category</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Categories</h2>
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
              <label htmlFor={`category-${category.id}-name`}>Name</label>
              <input
                id={`category-${category.id}-name`}
                name="name"
                defaultValue={category.name}
              />
            </div>
            <div className="field">
              <label htmlFor={`category-${category.id}-slug`}>Slug</label>
              <input
                id={`category-${category.id}-slug`}
                name="slug"
                defaultValue={category.slug}
              />
            </div>
            <div className="field">
              <label htmlFor={`category-${category.id}-order`}>Sort</label>
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
                Active
              </label>
            </div>
            <div className="inline-actions">
              <button className="small-btn">Save</button>
              <button
                className="small-btn danger"
                formAction={deleteCategoryAction}
              >
                Delete
              </button>
            </div>
          </form>
        ))}
      </section>
    </DashboardShell>
  );
}
