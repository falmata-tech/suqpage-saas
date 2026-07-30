import Link from "next/link";
import type { Product } from "@/lib/types";
import { availabilityLabel, offeringKindLabels } from "@/lib/offerings";

export default function ProductUpkeepList({
  products,
  businessId,
}: {
  products: Product[];
  businessId: number;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table product-list-table">
        <thead>
          <tr>
            <th>Offering</th>
            <th>Type and category</th>
            <th>Availability</th>
            <th><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="table-identity">
                  <span className="table-thumbnail">
                    {product.image_path ? <img src={product.image_path} alt="" /> : <b aria-hidden="true">◇</b>}
                  </span>
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.description}</small>
                  </span>
                </div>
              </td>
              <td>
                <strong>{offeringKindLabels[product.offering_kind]}</strong>
                <br />
                <small>{product.category_name || "Unassigned"}</small>
              </td>
              <td>
                <span className={`badge ${product.availability}`}>
                  {availabilityLabel(product.offering_kind, product.availability)}
                </span>
              </td>
              <td>
                <Link
                  className="small-btn"
                  href={`/dashboard/products/${product.id}?business=${businessId}`}
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
