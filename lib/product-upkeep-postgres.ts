import { canMaintainBasicProducts } from "./capabilities";
import { runtimeBusinessById, runtimeCatalogByBusinessId, runtimeHasRetainedPublication } from "./catalog-runtime";
import { productUpkeepEnabled } from "./config";
import { ProductUpkeepError, type BasicProductCommand } from "./product-upkeep-domain";
import type { BasicProductUpkeepPort, ProductUpkeepResult } from "./product-upkeep";
import { catalogToRevisionSnapshotV4 } from "./revision-v4-defaults";
import { requireRevisionSnapshotV4 } from "./revision-v4-domain";
import { runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "./showroom-bank-release";
import type { SessionUser } from "./types";

type StoredCommand = {
  payload_hash: string;
  result_product_id: number;
  result_content_version: number;
};

const slugBase = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "product";

async function uniqueSlug(businessId: number, name: string) {
  const base = slugBase(name);
  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix ? `${base}-${suffix + 1}` : base;
    if (!(await runtimeGet("SELECT 1 FROM products WHERE business_id=? AND slug=?", [businessId, candidate]))) return candidate;
  }
  throw new ProductUpkeepError("A unique product address could not be created.", 409, "slug_conflict");
}

async function authorize(user: SessionUser, command: BasicProductCommand) {
  if (!productUpkeepEnabled()) {
    throw new ProductUpkeepError("Product upkeep is temporarily disabled.", 503, "feature_disabled");
  }
  const assigned = user.access_role === "team_member" && Boolean(
    await runtimeGet("SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1", [user.id, command.businessId]),
  );
  if (!canMaintainBasicProducts(user, command.businessId, assigned)) {
    throw new ProductUpkeepError("You cannot maintain products for this business.", 403, "forbidden");
  }
  const business = await runtimeBusinessById(command.businessId);
  if (!business) throw new ProductUpkeepError("Business not found.", 404, "not_found");
  if (business.status === "draft" || !(await runtimeHasRetainedPublication(command.businessId))) {
    throw new ProductUpkeepError("Products become editable after the first showroom publication.", 409, "showroom_not_established");
  }
  if (user.access_role !== "client" && !command.serviceNote) {
    throw new ProductUpkeepError("Add a short customer-service note for this staff update.", 400, "service_note_required");
  }
  return business;
}

async function validateStructure(command: BasicProductCommand) {
  if (command.categoryId && !(await runtimeGet(
    "SELECT 1 FROM categories WHERE id=? AND business_id=?",
    [command.categoryId, command.businessId],
  ))) {
    throw new ProductUpkeepError("Category not found for this business.", 404, "structure_not_found");
  }
}

async function validateProspectiveSnapshot(command: BasicProductCommand, imageRef: string, slug?: string) {
  const catalog = await runtimeCatalogByBusinessId(command.businessId, true);
  if (!catalog) throw new ProductUpkeepError("Business catalog not found.", 404, "not_found");
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  const categoryKey = command.categoryId ? `category-${command.categoryId}` : null;
  if (command.kind === "create") {
    snapshot.products.push({
      key: `pending-${command.idempotencyKey}`,
      collectionKey: null,
      categoryKey,
      name: command.name,
      slug: slug!,
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
      sortOrder: snapshot.products.reduce((maximum, product) => Math.max(maximum, product.sortOrder), -1) + 1,
      optionGroups: [],
    });
  } else {
    const product = snapshot.products.find((entry) => entry.key === `product-${command.productId}`);
    if (!product) throw new ProductUpkeepError("Product not found.", 404, "not_found");
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

export const postgresProductUpkeepPort: BasicProductUpkeepPort = {
  async assertAuthorized(user, command) {
    await authorize(user, command);
  },
  async publish(user, command, stagedImage, payloadHash): Promise<ProductUpkeepResult> {
    return runtimeTransaction(async () => {
      const duplicate = await runtimeGet<StoredCommand>(
        "SELECT payload_hash,result_product_id,result_content_version FROM product_upkeep_commands WHERE business_id=? AND idempotency_key=?",
        [command.businessId, command.idempotencyKey],
      );
      if (duplicate) {
        if (duplicate.payload_hash !== payloadHash) {
          throw new ProductUpkeepError("This product form was already used for different content. Refresh and try again.", 409, "idempotency_conflict");
        }
        return { productId: duplicate.result_product_id, contentVersion: duplicate.result_content_version, duplicate: true };
      }

      const business = await authorize(user, command);
      if (business.content_version !== command.expectedContentVersion) {
        throw new ProductUpkeepError("The showroom changed while this form was open. Refresh and review the latest version.", 409, "stale_version");
      }
      await validateStructure(command);
      const existing = command.kind === "update"
        ? await runtimeGet<{ id: number; image_path: string }>("SELECT id,image_path FROM products WHERE id=? AND business_id=?", [command.productId, command.businessId])
        : null;
      if (command.kind === "update" && !existing) throw new ProductUpkeepError("Product not found.", 404, "not_found");
      const imageRef = command.imageAction === "replace"
        ? stagedImage!.imageRef
        : command.imageAction === "remove" ? "" : existing?.image_path || "";
      const slug = command.kind === "create" ? await uniqueSlug(command.businessId, command.name) : undefined;
      await validateProspectiveSnapshot(command, imageRef, slug);

      const currentCatalog = (await runtimeCatalogByBusinessId(command.businessId, true))!;
      await runtimeRun(
        `INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id)
         VALUES(?,?,?,'baseline',?) ON CONFLICT (business_id,content_version) DO NOTHING`,
        [command.businessId, business.content_version, JSON.stringify(catalogToRevisionSnapshotV4(currentCatalog)), user.id],
      );

      let productId: number;
      if (command.kind === "create") {
        const order = await runtimeGet<{ next_order: number }>(
          "SELECT COALESCE(MAX(sort_order),-1)+1 next_order FROM products WHERE business_id=?",
          [command.businessId],
        );
        const inserted = await runtimeGet<{ id: number }>(
          `INSERT INTO products(
            business_id,collection_id,category_id,name,slug,eyebrow,description,image_path,
            availability,offering_kind,quantity_mode,capacity_summary,minimum_order_summary,
            lead_time_summary,video_ref,price_minor,currency,quantity_unit,highlights_json,is_published,sort_order
          ) VALUES(?,NULL,?,?,?,'',?,?,?,?,?,?,?,?,?,?,'ETB',?,?,1,?) RETURNING id`,
          [command.businessId, command.categoryId, command.name, slug!, command.description, imageRef,
            command.availability, command.offeringKind, command.quantityMode, command.capacitySummary,
            command.minimumOrderSummary, command.leadTimeSummary, command.videoRef, command.priceMinor,
            command.quantityUnit, JSON.stringify(command.highlights), Number(order?.next_order || 0)],
        );
        productId = inserted!.id;
      } else {
        productId = existing!.id;
        const changed = await runtimeRun(
          `UPDATE products SET collection_id=NULL,category_id=?,name=?,description=?,image_path=?,
            availability=?,offering_kind=?,quantity_mode=?,capacity_summary=?,minimum_order_summary=?,
            lead_time_summary=?,video_ref=?,price_minor=?,currency='ETB',quantity_unit=?,highlights_json=?
           WHERE id=? AND business_id=?`,
          [command.categoryId, command.name, command.description, imageRef, command.availability,
            command.offeringKind, command.quantityMode, command.capacitySummary, command.minimumOrderSummary,
            command.leadTimeSummary, command.videoRef, command.priceMinor, command.quantityUnit,
            JSON.stringify(command.highlights), productId, command.businessId],
        );
        if (changed.changes !== 1) throw new ProductUpkeepError("The product changed while saving.", 409, "write_conflict");
      }

      const nextVersion = business.content_version + 1;
      const bumped = await runtimeRun(
        "UPDATE businesses SET content_version=? WHERE id=? AND content_version=?",
        [nextVersion, command.businessId, business.content_version],
      );
      if (bumped.changes !== 1) throw new ProductUpkeepError("The showroom changed while saving.", 409, "stale_version");
      const finalCatalog = (await runtimeCatalogByBusinessId(command.businessId, true))!;
      await runtimeRun(
        "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'product_upkeep',?)",
        [command.businessId, nextVersion, JSON.stringify(catalogToRevisionSnapshotV4(finalCatalog)), user.id],
      );
      await runtimeRun(
        `INSERT INTO product_upkeep_commands(business_id,idempotency_key,payload_hash,actor_user_id,result_product_id,result_content_version)
         VALUES(?,?,?,?,?,?)`,
        [command.businessId, command.idempotencyKey, payloadHash, user.id, productId, nextVersion],
      );
      await runtimeRun(
        "INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,?)",
        [user.id, command.businessId, "product.basic_upkeep_published", JSON.stringify({
          productId,
          kind: command.kind,
          serviceAttribution: Boolean(command.serviceNote),
          baseVersion: business.content_version,
          contentVersion: nextVersion,
        }), ""],
      );
      return { productId, contentVersion: nextVersion, duplicate: false };
    });
  },
};
