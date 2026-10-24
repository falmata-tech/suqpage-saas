"use client";
import { useUiText } from "@/lib/i18n/ui";


import { useEffect, useRef, useState, type ReactNode } from "react";
import {unstable_rethrow} from "next/navigation";
import LoadingBar from "@/components/LoadingBar";
import ProductMediaFields from "@/components/ProductMediaFields";
import ProductOptionsFields from "@/components/ProductOptionsFields";
import type { Catalog, Product } from "@/lib/types";
import {isOrderScope} from "@/lib/order-scope";
import type {OwnerEditResult} from "@/lib/owner-edit-contract";
import useFormExitGuard from "./useFormExitGuard";
import {
  activeProductKinds,
  isActiveProductKind,
  productSupplyLabel,
  type OfferingKind,
} from "@/lib/offerings";
function ProductFormControls({ children, pending }: { children: ReactNode; pending: boolean }) {
  const [ready, setReady] = useState(false);
  const t = useUiText();
  useEffect(() => setReady(true), []);
  const busy = !ready || pending;
  return (
    <>
      <div className="field full" hidden={!busy}>
        {busy && <LoadingBar label={pending ? t("Saving...") : undefined} />}
      </div>
      <fieldset style={{ display: "contents" }} aria-label={t("Products")} aria-busy={busy} disabled={busy}>
        {children}
      </fieldset>
    </>
  );
}
export default function ProductForm({
  catalog,
  product,
  action,
  businessId,
  contentVersion,
  idempotencyKey,
  staffMode,
  exampleVideoRef,
  cancelHref = `/dashboard/products?business=${businessId}`,
  listOrigin,
}: {
  catalog: Catalog;
  product?: Product;
  action: (formData: FormData) => OwnerEditResult | Promise<OwnerEditResult>;
  businessId: number;
  contentVersion: number;
  idempotencyKey: string;
  staffMode: boolean;
  exampleVideoRef?:string;
  cancelHref?:string;
  listOrigin?:{q?:string;page?:string};
}) {
  const t = useUiText();
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const exit = useFormExitGuard(formRef, inFlight);
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [availability, setAvailability] = useState(
    product?.availability || "available",
  );
  const [offeringKind, setOfferingKind] = useState<OfferingKind | "">(
    !product ? "standard_product" : isActiveProductKind(product.offering_kind) ? product.offering_kind : "",
  );
  const [price, setPrice] = useState(
    product?.price_minor == null ? "" : (product.price_minor / 100).toFixed(product.price_minor % 100 ? 2 : 0),
  );
  const [quantityUnit, setQuantityUnit] = useState(product?.quantity_unit || "");
  const [highlights, setHighlights] = useState((product?.highlights || []).join("\n"));
  const [orderScope, setOrderScope] = useState(product?.order_scope || "unspecified");
  const [minimumOrderSummary, setMinimumOrderSummary] = useState(product?.minimum_order_summary || "");
  const [leadTimeSummary, setLeadTimeSummary] = useState(product?.lead_time_summary || "");
  const [capacitySummary, setCapacitySummary] = useState(product?.capacity_summary || "");
  const [imagePreview, setImagePreview] = useState(product?.image_path || "");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  return (
    <form ref={formRef} aria-busy={saving} onSubmit={async event => {
      event.preventDefault();
      if (inFlight.current) return;
      const formData = new FormData(event.currentTarget);
      for (const file of galleryFiles) formData.append("mediaImages", file);
      inFlight.current = true; setSaving(true); setError("");
      try {
        const result = await action(formData);
        if (result) setError(result.error);
        else exit.markSaved();
      } catch (error) {
        try { unstable_rethrow(error); }
        catch (navigation) { exit.allowExit(); throw navigation; }
        setError("Unable to connect. Please try again.");
      } finally { inFlight.current = false; setSaving(false); }
    }} className="panel form-grid product-upkeep-form">
      {error ? <p className="error field full" role="alert">{t(error)}</p> : null}
      <ProductFormControls pending={saving}>
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="nav_q" value={listOrigin?.q || ""} />
      <input type="hidden" name="nav_page" value={listOrigin?.page || ""} />
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

      <div className="field">
        <label htmlFor="product-order-scope">{t("Order sizes")}</label>
        <select id="product-order-scope" name="orderScope" value={orderScope} onChange={event => { if(isOrderScope(event.target.value)) setOrderScope(event.target.value); }}>
          <option value="unspecified">{t("Ask me about order size")}</option>
          <option value="single">{t("Single items")}</option>
          <option value="bulk">{t("Bulk orders")}</option>
          <option value="both">{t("Single items and bulk orders")}</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="product-unit">{t("Offered by")}{" "}<span className="optional">{t("(optional)")}</span></label>
        <input
          id="product-unit"
          name="quantityUnit"
          maxLength={40}
          value={quantityUnit}
          onChange={(event) => setQuantityUnit(event.target.value)}
          placeholder={t("Example: piece, kg, box or set")}
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

      <div className="field">
        <label htmlFor="product-minimum-order">{t("Minimum order")} <span className="optional">{t("(optional)")}</span></label>
        <input id="product-minimum-order" name="minimumOrderSummary" maxLength={140} value={minimumOrderSummary} onChange={event => setMinimumOrderSummary(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="product-lead-time">{t("Typical lead time")} <span className="optional">{t("(optional)")}</span></label>
        <input id="product-lead-time" name="leadTimeSummary" maxLength={140} value={leadTimeSummary} onChange={event => setLeadTimeSummary(event.target.value)} />
      </div>
      <div className="field full">
        <label htmlFor="product-capacity">{t("Supply capacity")} <span className="optional">{t("(optional)")}</span></label>
        <input id="product-capacity" name="capacitySummary" maxLength={180} value={capacitySummary} onChange={event => setCapacitySummary(event.target.value)} />
      </div>



      <div className="field">
        <label htmlFor="product-offering-kind">{t("How is this product supplied?")}</label>
        <select
          id="product-offering-kind"
          name="offeringKind"
          required
          value={offeringKind}
          onChange={(event) => setOfferingKind(event.target.value as OfferingKind)}
        >
          <option value="" disabled>{t("Choose a product type")}</option>
          {activeProductKinds.map((kind) => (
            <option key={kind} value={kind}>{t(kind === "made_to_order" ? "Made to order" : "Ready to ship")}</option>
          ))}
        </select>
        {!offeringKind ? <small>{t("Choose how this product is supplied before saving.")}</small> : offeringKind === "made_to_order" ? <small>{t("Products are made after the customer orders.")}</small> : null}
      </div>

      {staffMode ? <>
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

      <div className="field"><label htmlFor="product-visibility">{t("Visibility")}</label><select id="product-visibility" name="isPublished" defaultValue={product?.is_published === 0 ? "0" : "1"}><option value="1">{t("Listed on my page")}</option><option value="0">{t("Hidden from buyers")}</option></select><small>{t("Your business must be published before buyers can see listed products.")}</small></div>

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

      {staffMode ? <>
      <ProductOptionsFields initial={(product?.option_groups || []).map(group => ({name:group.name,values:group.values.map(value=>value.value)}))} />
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

      <ProductMediaFields exampleVideoRef={exampleVideoRef} staffMode={staffMode} product={product} onFiles={setGalleryFiles} onCover={setImagePreview} />

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
            {t(productSupplyLabel(offeringKind, availability))}
          </span>
          <strong>{name || t("Name preview")}</strong>
          {description ? <p>{description}</p> : null}
          {price ? <strong>ETB {price}</strong> : null}
          {quantityUnit ? <p>{t("Offered by")}{" "}{quantityUnit}</p> : null}
          {highlights.trim() ? <ul className="product-upkeep-facts">{highlights.split(/\r?\n/).filter(Boolean).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </div>
      </aside>

      <div className="field full inline-actions">
        <button className="btn brand" type="submit" disabled={saving}>
          {saving ? t("Saving...") : product ? t("Save changes") : t("Add item")}
        </button>
        <button className="btn secondary" type="button" disabled={saving} onClick={() => exit.requestExit(cancelHref)}>{t("Cancel")}</button>
      </div>
      </ProductFormControls>
      {exit.confirmation}
    </form>
  );
}
