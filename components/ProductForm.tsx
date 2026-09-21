"use client";

import { useEffect, useRef, useState } from "react";
import ProductOptionsFields from "@/components/ProductOptionsFields";
import type { Catalog, Product } from "@/lib/types";
import {
  availabilityLabel,
  offeringKindDescriptions,
  offeringKindLabels,
  offeringKinds,
  type OfferingKind,
} from "@/lib/offerings";
import { controlledYouTubeWatchUrl } from "@/lib/youtube-provider";

function productVideoUrl(product?: Product) {
  if (!product?.video_ref) return "";
  try { return controlledYouTubeWatchUrl(product.video_ref); } catch { return ""; }
}

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
  const [removeImage, setRemoveImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const temporaryImageUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (temporaryImageUrl.current) {
        URL.revokeObjectURL(temporaryImageUrl.current);
      }
    },
    [],
  );
  return (
    <form action={action} className="panel form-grid product-upkeep-form">
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
        <label htmlFor="product-name">Name</label>
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
        <label htmlFor="product-price">Price in ETB <span className="optional">(optional)</span></label>
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
        <label htmlFor="product-unit">Offered by <span className="optional">(optional)</span></label>
        <input
          id="product-unit"
          name="quantityUnit"
          maxLength={40}
          value={quantityUnit}
          onChange={(event) => setQuantityUnit(event.target.value)}
          placeholder="Example: piece, kg, hour, session or project"
        />
      </div>

      <div className="field full">
        <label htmlFor="product-highlights">Highlights <span className="optional">(optional)</span></label>
        <textarea
          id="product-highlights"
          name="highlights"
          maxLength={485}
          value={highlights}
          onChange={(event) => setHighlights(event.target.value)}
          placeholder={"One highlight per line\nLocally serviceable\nFood-safe stainless steel"}
        />
        <small>Up to six highlights, each 80 characters or fewer.</small>
      </div>

      </> : null}

      <div className="field full">
        <label htmlFor="product-video">YouTube video <span className="optional">(optional)</span></label>
        <input
          id="product-video"
          name="videoUrl"
          type="url"
          maxLength={500}
          defaultValue={productVideoUrl(product)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      {!staffMode ? <div className="field"><label htmlFor="product-type">What do you offer?</label><select id="product-type" name="offeringKind" value={offeringKind === 'service' ? 'service' : 'standard_product'} onChange={e=>setOfferingKind(e.target.value as OfferingKind)}><option value="standard_product">Product</option><option value="service">Service</option></select></div> : null}
      {staffMode ? <>
      <div className="field">
        <label htmlFor="product-offering-kind">Offering type</label>
        <select
          id="product-offering-kind"
          name="offeringKind"
          value={offeringKind}
          onChange={(event) => setOfferingKind(event.target.value as OfferingKind)}
        >
          {offeringKinds.map((kind) => (
            <option key={kind} value={kind}>{offeringKindLabels[kind]}</option>
          ))}
        </select>
        <small>{offeringKindDescriptions[offeringKind]}</small>
      </div>

      <input type="hidden" name="quantityMode" value="optional" />
      <div className="field product-quantity-note">
        <strong>Desired quantity is optional</strong>
        <small>Buyers may add a quantity to their inquiry or leave it open for discussion.</small>
      </div>

      </> : null}

      <div className="field full">
        <label htmlFor="product-description">Description</label>
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
      <div className="field"><label htmlFor="product-visibility">Visibility</label><select id="product-visibility" name="isPublished" defaultValue={product?.is_published === 0 ? "0" : "1"}><option value="1">Listed on my page</option><option value="0">Hidden from buyers</option></select><small>Your business must be published before buyers can see listed products.</small></div>
      <ProductOptionsFields initial={(product?.option_groups || []).map(group => ({name:group.name,values:group.values.map(value=>value.value)}))} />

      <div className="field">
        <label htmlFor="product-availability">Availability</label>
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
          <option value="available">Available</option>
          <option value="limited">Limited availability</option>
          <option value="unavailable">Unavailable</option>
          <option value="coming_soon">Coming soon</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="product-category">Category</label>
        <select
          id="product-category"
          name="categoryId"
          defaultValue={product?.category_id || ""}
        >
          <option value="">Unassigned</option>
          {catalog.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      </> : null}

      <div className="field">
        <label htmlFor="product-image">Primary image</label>
        <input
          id="product-image"
          ref={imageInput}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            if (temporaryImageUrl.current) {
              URL.revokeObjectURL(temporaryImageUrl.current);
              temporaryImageUrl.current = null;
            }
            const file = event.target.files?.[0];
            if (file) {
              temporaryImageUrl.current = URL.createObjectURL(file);
              setImagePreview(temporaryImageUrl.current);
              setRemoveImage(false);
            } else {
              setImagePreview(product?.image_path || "");
            }
          }}
        />
        <small>JPEG, PNG, or WebP; up to 5 MB.</small>
      </div>

      {product?.image_path ? (
        <div className="field full product-current-media">
          <img src={product.image_path} alt="" />
          <label className="check-field">
            <input
              type="checkbox"
              name="removeImage"
              checked={removeImage}
              onChange={(event) => {
                setRemoveImage(event.target.checked);
                if (event.target.checked && imageInput.current) {
                  imageInput.current.value = "";
                  setImagePreview("");
                } else {
                  setImagePreview(product.image_path);
                }
              }}
            />
            Remove the current image without replacing it
          </label>
        </div>
      ) : null}

      {staffMode ? (
        <div className="field full">
          <label htmlFor="service-note">Customer-service note</label>
          <input
            id="service-note"
            name="serviceNote"
            required
            maxLength={300}
            placeholder="Example: Updated for the client during a support call"
          />
          </div>
      ) : null}

      <aside className="field full product-upkeep-preview" aria-live="polite">
        <div className="product-upkeep-preview-image">
          {!removeImage && imagePreview ? (
            <img src={imagePreview} alt="" />
          ) : (
            <span aria-hidden="true">◇</span>
          )}
        </div>
        <div>
          <span className={`badge ${availability}`}>
            {availabilityLabel(offeringKind, availability)}
          </span>
          {staffMode ? <small>{offeringKindLabels[offeringKind]}</small> : null}
          <strong>{name || "Name preview"}</strong>
          {description ? <p>{description}</p> : null}
          {price ? <strong>ETB {price}</strong> : null}
          {quantityUnit ? <p>Offered by {quantityUnit}</p> : null}
          {highlights.trim() ? <ul className="product-upkeep-facts">{highlights.split(/\r?\n/).filter(Boolean).slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </div>
      </aside>

      <div className="field full">
        <button className="btn brand" type="submit">
          {product ? "Save changes" : "Add item"}
        </button>
      </div>
    </form>
  );
}
