
import { useUiText } from "@/lib/i18n/ui";
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
  const t = useUiText();
  return (
    <div className="table-wrap">
      <table className="data-table product-list-table">
        <thead>
          <tr>
            <th>{t("Offering")}</th>
            <th>{t("Type and category")}</th>
            <th>{t("Availability")}</th>
            <th><span className="sr-only">{t("Action")}</span></th>
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
                <strong>{t(offeringKindLabels[product.offering_kind])}</strong>
                <br />
                <small>{product.category_name || t("Unassigned")}</small>
              </td>
              <td>
                <span className={`badge ${product.availability}`}>
                  {t(availabilityLabel(product.offering_kind, product.availability))}
                </span>
              </td>
              <td>
                <Link
                  className="small-btn"
                  href={`/dashboard/products/${product.id}?business=${businessId}`}
                >
                  {t("Edit")}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
