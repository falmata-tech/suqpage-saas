"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import {
  availabilityLabel,
  offeringKindLabels,
} from "@/lib/offerings";

export default function ProductUpkeepList({
  products,
  businessId,
}: {
  products: Product[];
  businessId: number;
}) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [
        product.name,
        product.description,
        product.category_name,
        product.availability.replace("_", " "),
        offeringKindLabels[product.offering_kind],
        product.capacity_summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(normalized)),
    );
  }, [products, query]);

  return (
    <>
      <div className="product-upkeep-search field">
        <label htmlFor="product-upkeep-search">Find an offering</label>
        <input
          id="product-upkeep-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, category, or availability"
        />
        <small aria-live="polite">
          Showing {visible.length} of {products.length} offerings
        </small>
      </div>
      {visible.length ? (
        <section className="product-upkeep-grid" aria-label="Products and capabilities">
          {visible.map((product) => (
            <article className="product-upkeep-card" key={product.id}>
              <div className="product-upkeep-image">
                {product.image_path ? (
                  <img src={product.image_path} alt="" />
                ) : (
                  <span aria-hidden="true">◇</span>
                )}
              </div>
              <div className="product-upkeep-copy">
                <div className="product-upkeep-meta">
                  <span className={`badge ${product.availability}`}>
                    {availabilityLabel(product.offering_kind, product.availability)}
                  </span>
                  <span>{offeringKindLabels[product.offering_kind]}</span>
                  <span>{product.category_name || "Unassigned"}</span>
                </div>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                {product.capacity_summary ? <small>Capacity: {product.capacity_summary}</small> : null}
                <Link
                  className="small-btn"
                  href={`/dashboard/products/${product.id}?business=${businessId}`}
                >
                  Edit basic details
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state" aria-live="polite">
          No offerings match “{query}”.
        </section>
      )}
    </>
  );
}
