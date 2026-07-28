"use client";

import { useEffect, useRef, useState } from "react";
import type { Catalog, Product } from "@/lib/types";

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
        <label htmlFor="product-name">Product name</label>
        <input
          id="product-name"
          name="name"
          required
          maxLength={140}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
        />
        <small>Shown exactly as entered in the showroom.</small>
      </div>

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
        <small>No inventory count is stored.</small>
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
        <small>Only categories for this business are shown.</small>
      </div>

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
          <small>This records why a team member changed client content.</small>
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
            {availability.replace("_", " ")}
          </span>
          <strong>{name || "Product name preview"}</strong>
          <p>{description || "The product description will appear here."}</p>
        </div>
      </aside>

      <div className="field full product-upkeep-explainer">
        <strong>This publishes only this product update.</strong>
        <span>
          Design, options, order, categories, and business settings
          stay protected. A retained showroom version is created automatically.
        </span>
      </div>

      <div className="field full">
        <button className="btn brand" type="submit">
          {product ? "Save and publish product" : "Add and publish product"}
        </button>
      </div>
    </form>
  );
}
