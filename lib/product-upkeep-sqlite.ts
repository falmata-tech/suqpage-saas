import { canMaintainBasicProducts } from "./capabilities";
import { productUpkeepEnabled } from "./config";
import {
  getBusinessById,
  getCatalogByBusinessId,
  getDb,
  inTransaction,
} from "./db";
import {
  ProductUpkeepError,
  type BasicProductCommand,
} from "./product-upkeep-domain";
import type {
  BasicProductUpkeepPort,
  ProductUpkeepResult,
} from "./product-upkeep";
import { catalogToRevisionSnapshotV4 } from "./revision-v4-defaults";
import { requireRevisionSnapshotV4 } from "./revision-v4-domain";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "./showroom-bank-release";
import { audit } from "./security";
import type { Category, SessionUser } from "./types";

type StoredCommand = {
  payload_hash: string;
  result_product_id: number;
  result_content_version: number;
};

const assignedToBusiness = (userId: number, businessId: number) =>
  Boolean(
    getDb()
      .prepare(
        "SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1",
      )
      .get(userId, businessId),
  );

function authorize(
  user: SessionUser,
  command: BasicProductCommand,
) {
  if (!productUpkeepEnabled()) {
    throw new ProductUpkeepError(
      "Product upkeep is temporarily disabled.",
      503,
      "feature_disabled",
    );
  }
  const assigned =
    user.access_role === "team_member" &&
    assignedToBusiness(user.id, command.businessId);
  if (!canMaintainBasicProducts(user, command.businessId, assigned)) {
    throw new ProductUpkeepError(
      "You cannot maintain products for this business.",
      403,
      "forbidden",
    );
  }
  const business = getBusinessById(command.businessId);
  if (!business) {
    throw new ProductUpkeepError("Business not found.", 404, "not_found");
  }
  const hasPublication = Boolean(
    getDb()
      .prepare(
        "SELECT 1 FROM published_catalog_versions WHERE business_id=? LIMIT 1",
      )
      .get(command.businessId),
  );
  if (business.status === "draft" || !hasPublication) {
    throw new ProductUpkeepError(
      "Products become editable after the first showroom publication.",
      409,
      "showroom_not_established",
    );
  }
  if (user.access_role !== "client" && !command.serviceNote) {
    throw new ProductUpkeepError(
      "Add a short customer-service note for this staff update.",
      400,
      "service_note_required",
    );
  }
  return business;
}

const slugBase = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "product";

function uniqueSlug(businessId: number, name: string) {
  const base = slugBase(name);
  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix ? `${base}-${suffix + 1}` : base;
    if (
      !getDb()
        .prepare("SELECT 1 FROM products WHERE business_id=? AND slug=?")
        .get(businessId, candidate)
    ) {
      return candidate;
    }
  }
  throw new ProductUpkeepError(
    "A unique product address could not be created.",
    409,
    "slug_conflict",
  );
}

function loadStructure(command: BasicProductCommand) {
  const category = command.categoryId
    ? (getDb()
        .prepare("SELECT id FROM categories WHERE id=? AND business_id=?")
        .get(command.categoryId, command.businessId) as
        | Pick<Category, "id">
        | undefined)
    : null;
  if (command.categoryId && !category) {
    throw new ProductUpkeepError(
      "Category not found for this business.",
      404,
      "structure_not_found",
    );
  }
  return category || null;
}

function validateProspectiveSnapshot(
  command: BasicProductCommand,
  imageRef: string,
) {
  const catalog = getCatalogByBusinessId(command.businessId, true);
  if (!catalog) {
    throw new ProductUpkeepError("Business catalog not found.", 404, "not_found");
  }
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  const categoryKey = command.categoryId
    ? `category-${command.categoryId}`
    : null;
  if (command.kind === "create") {
    snapshot.products.push({
      key: `pending-${command.idempotencyKey}`,
      collectionKey: null,
      categoryKey,
      name: command.name,
      slug: uniqueSlug(command.businessId, command.name),
      eyebrow: "",
      description: command.description,
      imageRef,
      videoRef: command.videoRef,
      priceMinor: command.priceMinor,
      currency: "ETB",
      quantityUnit: command.quantityUnit,
      highlights: command.highlights,
      availability: command.availability,
      offeringKind: command.offeringKind,
      quantityMode: command.quantityMode,
      capacitySummary: command.capacitySummary,
      minimumOrderSummary: command.minimumOrderSummary,
      leadTimeSummary: command.leadTimeSummary,
      published: true,
      sortOrder:
        snapshot.products.reduce(
          (maximum, product) => Math.max(maximum, product.sortOrder),
          -1,
        ) + 1,
      optionGroups: [],
    });
  } else {
    const product = snapshot.products.find(
      (entry) => entry.key === `product-${command.productId}`,
    );
    if (!product) {
      throw new ProductUpkeepError("Product not found.", 404, "not_found");
    }
    Object.assign(product, {
      collectionKey: null,
      categoryKey,
      name: command.name,
      description: command.description,
      imageRef,
      videoRef: command.videoRef,
      priceMinor: command.priceMinor,
      currency: "ETB",
      quantityUnit: command.quantityUnit,
      highlights: command.highlights,
      availability: command.availability,
      offeringKind: command.offeringKind,
      quantityMode: command.quantityMode,
      capacitySummary: command.capacitySummary,
      minimumOrderSummary: command.minimumOrderSummary,
      leadTimeSummary: command.leadTimeSummary,
    });
  }
  requireRevisionSnapshotV4(snapshot, SHOWROOM_COMPONENT_BANK_LATEST);
}

export const sqliteProductUpkeepPort: BasicProductUpkeepPort = {
  assertAuthorized(user, command) {
    authorize(user, command);
  },
  publish(user, command, stagedImage, payloadHash): ProductUpkeepResult {
    return inTransaction(() => {
      const duplicate = getDb()
        .prepare(
          "SELECT payload_hash,result_product_id,result_content_version FROM product_upkeep_commands WHERE business_id=? AND idempotency_key=?",
        )
        .get(command.businessId, command.idempotencyKey) as
        | StoredCommand
        | undefined;
      if (duplicate) {
        if (duplicate.payload_hash !== payloadHash) {
          throw new ProductUpkeepError(
            "This product form was already used for different content. Refresh and try again.",
            409,
            "idempotency_conflict",
          );
        }
        return {
          productId: duplicate.result_product_id,
          contentVersion: duplicate.result_content_version,
          duplicate: true,
        };
      }

      const business = authorize(user, command);
      if (business.content_version !== command.expectedContentVersion) {
        throw new ProductUpkeepError(
          "The showroom changed while this form was open. Refresh and review the latest version.",
          409,
          "stale_version",
        );
      }
      loadStructure(command);
      const existing =
        command.kind === "update"
          ? (getDb()
              .prepare(
                "SELECT * FROM products WHERE id=? AND business_id=?",
              )
              .get(command.productId, command.businessId) as
              | { id: number; image_path: string }
              | undefined)
          : null;
      if (command.kind === "update" && !existing) {
        throw new ProductUpkeepError("Product not found.", 404, "not_found");
      }
      const imageRef =
        command.imageAction === "replace"
          ? stagedImage!.imageRef
          : command.imageAction === "remove"
            ? ""
            : existing?.image_path || "";
      validateProspectiveSnapshot(command, imageRef);

      const currentCatalog = getCatalogByBusinessId(command.businessId, true)!;
      getDb()
        .prepare(
          "INSERT OR IGNORE INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'baseline',?)",
        )
        .run(
          command.businessId,
          business.content_version,
          JSON.stringify(catalogToRevisionSnapshotV4(currentCatalog)),
          user.id,
        );

      let productId: number;
      if (command.kind === "create") {
        const nextOrder = (
          getDb()
            .prepare(
              "SELECT COALESCE(MAX(sort_order),-1)+1 next_order FROM products WHERE business_id=?",
            )
            .get(command.businessId) as { next_order: number }
        ).next_order;
        productId = Number(
          getDb()
            .prepare(
              `INSERT INTO products(
                business_id,collection_id,category_id,name,slug,eyebrow,
                description,image_path,availability,offering_kind,quantity_mode,
                capacity_summary,minimum_order_summary,lead_time_summary,
                video_ref,price_minor,currency,quantity_unit,highlights_json,
                is_published,sort_order
              ) VALUES(?,NULL,?,?,?,'',?,?,?,?,?,?,?,?,?,?,'ETB',?,?,1,?)`,
            )
            .run(
              command.businessId,
              command.categoryId,
              command.name,
              uniqueSlug(command.businessId, command.name),
              command.description,
              imageRef,
              command.availability,
              command.offeringKind,
              command.quantityMode,
              command.capacitySummary,
              command.minimumOrderSummary,
              command.leadTimeSummary,
              command.videoRef,
              command.priceMinor,
              command.quantityUnit,
              JSON.stringify(command.highlights),
              nextOrder,
            ).lastInsertRowid,
        );
      } else {
        productId = existing!.id;
        const changed = getDb()
          .prepare(
            `UPDATE products SET
              collection_id=NULL,category_id=?,name=?,description=?,
              image_path=?,availability=?,offering_kind=?,quantity_mode=?,
              capacity_summary=?,minimum_order_summary=?,lead_time_summary=?,
              video_ref=?,price_minor=?,currency='ETB',quantity_unit=?,highlights_json=?
            WHERE id=? AND business_id=?`,
          )
          .run(
            command.categoryId,
            command.name,
            command.description,
            imageRef,
            command.availability,
            command.offeringKind,
            command.quantityMode,
            command.capacitySummary,
            command.minimumOrderSummary,
            command.leadTimeSummary,
            command.videoRef,
            command.priceMinor,
            command.quantityUnit,
            JSON.stringify(command.highlights),
            productId,
            command.businessId,
          );
        if (changed.changes !== 1) {
          throw new ProductUpkeepError(
            "The product changed while saving.",
            409,
            "write_conflict",
          );
        }
      }

      const nextVersion = business.content_version + 1;
      const bumped = getDb()
        .prepare(
          "UPDATE businesses SET content_version=? WHERE id=? AND content_version=?",
        )
        .run(nextVersion, command.businessId, business.content_version);
      if (bumped.changes !== 1) {
        throw new ProductUpkeepError(
          "The showroom changed while saving.",
          409,
          "stale_version",
        );
      }
      const finalCatalog = getCatalogByBusinessId(command.businessId, true)!;
      const finalSnapshot = catalogToRevisionSnapshotV4(finalCatalog);
      getDb()
        .prepare(
          "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'product_upkeep',?)",
        )
        .run(
          command.businessId,
          nextVersion,
          JSON.stringify(finalSnapshot),
          user.id,
        );
      getDb()
        .prepare(
          `INSERT INTO product_upkeep_commands(
            business_id,idempotency_key,payload_hash,actor_user_id,
            result_product_id,result_content_version
          ) VALUES(?,?,?,?,?,?)`,
        )
        .run(
          command.businessId,
          command.idempotencyKey,
          payloadHash,
          user.id,
          productId,
          nextVersion,
        );
      audit("product.basic_upkeep_published", {
        userId: user.id,
        businessId: command.businessId,
        detail: {
          productId,
          kind: command.kind,
          changedFields: [
            "name",
            "description",
            "availability",
            "offeringKind",
            "quantityMode",
            "capacitySummary",
            "minimumOrderSummary",
            "leadTimeSummary",
            "price",
            "quantityUnit",
            "highlights",
            "video",
            "category",
            ...(command.imageAction === "keep" ? [] : ["image"]),
          ],
          serviceAttribution: Boolean(command.serviceNote),
          baseVersion: business.content_version,
          contentVersion: nextVersion,
        },
      });
      return { productId, contentVersion: nextVersion, duplicate: false };
    });
  },
};
