import { isPublicProduct } from "./offerings";
import type { Catalog, Product } from "./types";

export type ShowroomCategory = { id: number; name: string; count: number };

/** Merchant categories are optional and scoped to this visible product catalog. */
export function showroomCategories(catalog: Catalog): ShowroomCategory[] {
  const counts = new Map<number, number>();
  for (const product of catalog.products) {
    if (product.business_id !== catalog.business.id || !product.is_published || !isPublicProduct(product) || product.category_id === null) continue;
    counts.set(product.category_id, (counts.get(product.category_id) || 0) + 1);
  }
  const seen = new Set<number>();
  return catalog.categories.flatMap(category => {
    const count = counts.get(category.id) || 0;
    if (category.business_id !== catalog.business.id || !category.is_active || !count || seen.has(category.id)) return [];
    seen.add(category.id);
    return [{ id: category.id, name: category.name, count }];
  });
}

/** Hydrated names alone never establish an active, same-tenant affiliation. */
export function showroomProductCategory(
  businessId: number,
  categories: readonly ShowroomCategory[],
  product: Pick<Product, "business_id" | "category_id">,
): ShowroomCategory | undefined {
  return product.business_id === businessId ? categories.find(category => category.id === product.category_id) : undefined;
}
