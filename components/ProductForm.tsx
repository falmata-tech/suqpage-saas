"use client";
import { useUiText } from "@/lib/i18n/ui";


import { useState } from "react";
import ProductMediaFields from "@/components/ProductMediaFields";
import ProductOptionsFields from "@/components/ProductOptionsFields";
import type { Catalog, Product } from "@/lib/types";
import {
  availabilityLabel,
  offeringKindDescriptions,
  offeringKindLabels,
  offeringKinds,
  type OfferingKind,
} from "@/lib/offerings";
export default function ProductForm({
  catalog,
  product,
  action,
  businessId,
  contentVersion,
  idempotencyKey,
  staffMode,
}: {
  catalog: Catalog;
  product?: Product;
  action: (formData: FormData) => void | Promise<void>;
  businessId: number;
  contentVersion: number;
  idempotencyKey: string;
  staffMode: boolean;
}) {
  const t = useUiText();
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [availability, setAvailability] = useState(
    product?.availability || "available",
  );
  const [offeringKind, setOfferingKind] = useState<OfferingKind>(
    product?.offering_kind || "standard_product",
  );
  const [price, setPrice] = useState(
    product?.price_minor == null ? "" : (product.price_minor / 100).toFixed(product.price_minor % 100 ? 2 : 0),
  );
  const [quantityUnit, setQuantityUnit] = useState(product?.quantity_unit || "");
  const [highlights, setHighlights] = useState((product?.highlights || []).join("\n"));
  const [imagePreview, setImagePreview] = useState(product?.image_path || "");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  return (
    <form action={async formData => {for (const file of galleryFiles) formData.append("mediaImages",file); await action(formData);}} className="panel form-grid product-upkeep-form">
      <input type="hidden" name="businessId" value={businessId} />
      <input
        type="hidden"
        name="expectedContentVersion"
        value={contentVersion}
      />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="kind" value={product ? "update" : "create"} />
      {product ? (
        <input type="hidden" name="productId" value={product.id} />
      ) : null}

      <div className="field full">
        <label htmlFor="product-name">{t("Name")}</label>
        <input
          id="product-name"
          name="name"
          required
          maxLength={140}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="field">
        <label htmlFor="product-price">{t("Price in ETB")}{" "}<span className="optional">{t("(optional)")}</span></label>
        <input
          id="product-price"
          name="priceEtb"
          type="number"
          min="0"
          max="9999999.99"
          step="0.01"
          inputMode="decimal"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="1250"
        />
      </div>

      {staffMode ? <>
      <div className="field">
        <label htmlFor="product-unit">{t("Offered by")}{" "}<span className="optional">{t("(optional)")}</span></label>
        <input
          id="product-unit"
          name="quantityUnit"
          maxLength={40}
          value={quantityUnit}
          onChange={(event) => setQuantityUnit(event.target.value)}
          placeholder={t("Example: piece, kg, hour, session or project")}
        />
      </div>

      <div className="field full">
        <label htmlFor="product-highlights">{t("Highlights")}{" "}<span className="optional">{t("(optional)")}</span></label>
        <textarea
          id="product-highlights"
          name="highlights"
          maxLength={485}
          value={highlights}
          onChange={(event) => setHighlights(event.target.value)}
          placeholder={t("One highlight per line Locally serviceable Food-safe stainless steel")}
        />
        <small>{t("Up to six highlights, each 80 characters or fewer.")}</small>
      </div>

      </> : null}



      {!staffMode ? <div className="field"><label htmlFor="product-type">{t("What do you offer?")}</label><select id="product-type" name="offeringKind" value={offeringKind === 'service' ? 'service' : 'standard_product'} onChange={e=>setOfferingKind(e.target.value as OfferingKind)}><option value="standard_product">{t("Product")}</option><option value="service">{t("Service")}</option></select></div> : null}
      {staffMode ? <>
      <div className="field">
        <label htmlFor="product-offering-kind">{t("Product or service type")}</label>
        <select
          id="product-offering-kind"
          name="offeringKind"
          value={offeringKind}
          onChange={(event) => setOfferingKind(event.target.value as OfferingKind)}
        >
          {offeringKinds.map((kind) => (
            <option key={kind} value={kind}>{t(offeringKindLabels[kind])}</option>
          ))}
        </select>
        <small>{offeringKindDescriptions[offeringKind]}</small>
      </div>

      <input type="hidden" name="quantityMode" value="optional" />
      <div className="field product-quantity-note">
        <strong>{t("Desired quantity is optional")}</strong>
        <small>{t("Buyers may add a quantity to their inquiry or leave it open for discussion.")}</small>
      </div>

      </> : null}

      <div className="field full">
        <label htmlFor="product-description">{t("Description")}</label>
        <textarea
          id="product-description"
          name="description"
          required
          maxLength={3000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {staffMode ? <>
      <div className="field"><label htmlFor="product-visibility">{t("Visibility")}</label><select id="product-visibility" name="isPublished" defaultValue={product?.is_published === 0 ? "0" : "1"}><option value="1">{t("Listed on my page")}</option><option value="0">{t("Hidden from buyers")}</option></select><small>{t("Your business must be published before buyers can see listed products.")}</small></div>
      <ProductOptionsFields initial={(product?.option_groups || []).map(group => ({name:group.name,values:group.values.map(value=>value.value)}))} />

      <div className="field">
        <label htmlFor="product-availability">{t("Availability")}</label>
        <select
          id="product-availability"
          name="availability"
          value={availability}
          onChange={(event) =>
            setAvailability(
              event.target.value as Product["availability"],
            )
          }
        >
          <option value="available">{t("Available")}</option>
          <option value="limited">{t("Limited availability")}</option>
          <option value="unavailable">{t("Unavailable")}</option>
          <option value="coming_soon">{t("Coming soon")}</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="product-category">{t("Category")}</label>
        <select
          id="product-category"
          name="categoryId"
          defaultValue={product?.category_id || ""}
        >
          <option value="">{t("Unassigned")}</option>
          {catalog.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      </> : null}

      <ProductMediaFields staffMode={staffMode} product={product} onFiles={setGalleryFiles} onCover={setImagePreview} />

      {staffMode ? (
        <div className="field full">
          <label htmlFor="service-note">{t("Customer-service note")}</label>
          <input
            id="service-note"
            name="serviceNote"
            required
            maxLength={300}
            placeholder={t("Example: Updated for the client during a support call")}
          />
          </div>
      ) : null}

      <aside className="field full product-upkeep-preview" aria-live="polite">
        <div className="product-upkeep-preview-image">
          {imagePreview ? (
            <img src={imagePreview} alt="" />
          ) : (
            <span aria-hidden="true">◇</span>
          )}
        </div>
        <div>
          <span className={`badge ${availability}`}>
            {t(availabilityLabel(offeringKind, availability))}
          </span>
          {staffMode ? <small>{t(offeringKindLabels[offeringKind])}</small> : null}
          <strong>{name || t("Name preview")}</strong>
          {description ? <p>{description}</p> : null}
          {price ? <strong>ETB {price}</strong> : null}
          {quantityUnit ? <p>{t("Offered by")}{" "}{quantityUnit}</p> : null}
          {highlights.trim() ? <ul className="product-upkeep-facts">{highlights.split(/\r?\n/).filter(Boolean).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </div>
      </aside>

      <div className="field full">
        <button className="btn brand" type="submit">
          {product ? t("Save changes") : t("Add item")}
        </button>
      </div>
    </form>
  );
}
