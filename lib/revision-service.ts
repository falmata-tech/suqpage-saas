import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { hasCapability } from "./capabilities";
import { mediaRoot } from "./config";
import { getCatalogByBusinessId, getDb, inTransaction } from "./db";
import { resolveRequestAttachment } from "./request-media";
import { canAccessRequest, getRequestDetail } from "./request-sqlite";
import { RevisionError, snapshotToCatalog } from "./revision-domain";
import { catalogToRevisionSnapshotV4 } from "./revision-v4-defaults";
import {
  assignBlueprintSlot,
  blueprintReadiness,
  mediaPlanFromRecipeMetadata,
} from "./showroom-blueprint";
import {
  requireRevisionSnapshotV4,
  type RevisionSnapshotV4,
} from "./revision-v4-domain";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "./showroom-bank-release";
import { evaluateCompositionFitness } from "./showroom-guidance";
import { parseShowroomContentBlocks } from "./showroom-content-blocks";
import type { ContentRevision, SessionUser } from "./types";

const row = <T,>(value: unknown): T =>
  ({ ...(value as Record<string, unknown>) }) as T;

const staffCanWork = (
  user: SessionUser,
  request: NonNullable<ReturnType<typeof getRequestDetail>>,
) => user.access_role !== "client" && canAccessRequest(user, request);

export function listContentRevisions(requestId: number): ContentRevision[] {
  return getDb()
    .prepare(
      "SELECT * FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC",
    )
    .all(requestId)
    .map((value) => row<ContentRevision>(value));
}

export function getContentRevision(id: number): ContentRevision | undefined {
  const value = getDb().prepare("SELECT * FROM content_revisions WHERE id=?").get(id);
  return value ? row<ContentRevision>(value) : undefined;
}

function requestForRevision(user: SessionUser, requestId: number) {
  const request = getRequestDetail(requestId);
  if (!request || !request.business_id || !canAccessRequest(user, request)) {
    throw new RevisionError("Revision not found.", 404);
  }
  return request;
}

function snapshotAssetRefs(snapshot: RevisionSnapshotV4) {
  return [
    snapshot.business.logoRef,
    snapshot.business.heroImageRef,
    snapshot.business.faviconRef,
    ...snapshot.products.map((product) => product.imageRef),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) => media.assetKeys),
    ),
  ].filter(Boolean);
}

function allowedAssetRefs(requestId: number, businessId: number) {
  const catalog = getCatalogByBusinessId(businessId, true);
  if (!catalog) throw new RevisionError("Business catalog not found.", 404);
  const allowed = new Set(
    [
      catalog.business.logo_path,
      catalog.business.hero_image_path,
      catalog.business.favicon_path,
      ...catalog.products.map((product) => product.image_path),
    ].filter(Boolean),
  );
  try {
    const content = parseShowroomContentBlocks(
      JSON.parse(catalog.business.content_blocks_json || "{}"),
      "managed",
    );
    for (const ref of content.blocks.flatMap((block) =>
      block.media.flatMap((media) => media.assetKeys),
    )) {
      allowed.add(ref);
    }
  } catch {
    throw new RevisionError("The live showroom content blocks are invalid.");
  }
  for (const attachment of getDb()
    .prepare("SELECT id FROM request_attachments WHERE request_id=?")
    .all(requestId) as Array<{ id: number }>) {
    allowed.add(`request-attachment:${attachment.id}`);
  }
  for (const media of getDb()
    .prepare("SELECT asset_key FROM recipe_media_assets WHERE request_id=?")
    .all(requestId) as Array<{ asset_key: string }>) {
    allowed.add(media.asset_key);
  }
  return allowed;
}

function validatedV4ForRequest(
  snapshotInput: unknown,
  requestId: number,
  businessId: number,
) {
  const snapshot = requireRevisionSnapshotV4(
    snapshotInput,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const allowed = allowedAssetRefs(requestId, businessId);
  for (const ref of snapshotAssetRefs(snapshot)) {
    if (!allowed.has(ref)) {
      throw new RevisionError(
        "A revision media asset is not owned by this business or request.",
        403,
      );
    }
  }
  return snapshot;
}

function latestDraftSnapshot(
  latest: ContentRevision | undefined,
  requestId: number,
  businessId: number,
) {
  if (!latest) return null;
  try {
    return validatedV4ForRequest(latest.snapshot_json, requestId, businessId);
  } catch {
    return null;
  }
}

export function createDraftRevision(user: SessionUser, requestId: number) {
  const request = requestForRevision(user, requestId);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  const existing = getDb()
    .prepare(
      "SELECT * FROM content_revisions WHERE request_id=? AND status='draft' ORDER BY revision_number DESC LIMIT 1",
    )
    .get(requestId);
  if (existing) return row<ContentRevision>(existing);
  const latest = getDb()
    .prepare(
      "SELECT * FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    )
    .get(requestId) as ContentRevision | undefined;
  const catalog = getCatalogByBusinessId(request.business_id!, true);
  if (!catalog) throw new RevisionError("Business catalog not found.", 404);
  const snapshot =
    latestDraftSnapshot(latest, requestId, request.business_id!) ||
    catalogToRevisionSnapshotV4(catalog);
  return inTransaction(() => {
    if (latest && ["awaiting_review", "approved"].includes(latest.status)) {
      getDb()
        .prepare(
          "UPDATE content_revisions SET status='superseded',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
        .run(latest.id);
    }
    const result = getDb()
      .prepare(
        `INSERT INTO content_revisions(
          request_id,business_id,revision_number,base_content_version,
          snapshot_json,snapshot_schema_version,created_by_user_id
        ) VALUES(?,?,?,?,?,?,?)`,
      )
      .run(
        requestId,
        request.business_id,
        (latest?.revision_number || 0) + 1,
        catalog.business.content_version,
        JSON.stringify(snapshot),
        4,
        user.id,
      );
    getDb()
      .prepare(
        "UPDATE service_requests SET status='in_progress',updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(requestId);
    getDb()
      .prepare(
        "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'draft created')",
      )
      .run(requestId, user.id, "revision_created");
    return getContentRevision(Number(result.lastInsertRowid))!;
  });
}

export function saveDraftRevision(
  user: SessionUser,
  revisionId: number,
  snapshotInput: unknown,
  summaryInput: unknown,
) {
  const revision = getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Submitted revisions cannot be edited.", 409);
  }
  const snapshot = validatedV4ForRequest(
    snapshotInput,
    revision.request_id,
    revision.business_id,
  );
  const summary = String(summaryInput ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, 500);
  const result = getDb()
    .prepare(
      `UPDATE content_revisions
       SET snapshot_json=?,snapshot_schema_version=4,summary=?,
         recipe_import_hash=NULL,recipe_metadata_json=NULL,
         recipe_imported_by_user_id=NULL,recipe_imported_at=NULL,
         updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND status='draft'`,
    )
    .run(JSON.stringify(snapshot), summary, revisionId);
  if (result.changes !== 1) {
    throw new RevisionError(
      "The draft changed while you were saving. Reload and try again.",
      409,
    );
  }
  return getContentRevision(revisionId)!;
}

export function saveRecipeDraftRevision(
  user: SessionUser,
  revisionId: number,
  snapshotInput: unknown,
  summaryInput: unknown,
  importHash: string,
  metadataInput: unknown,
) {
  const revision = getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Submitted revisions cannot be edited.", 409);
  }
  if (!/^[a-f0-9]{64}$/.test(importHash)) {
    throw new RevisionError("The recipe import hash is invalid.");
  }
  if (revision.recipe_import_hash === importHash) {
    return { revision, duplicate: true };
  }
  const snapshot = validatedV4ForRequest(
    snapshotInput,
    revision.request_id,
    revision.business_id,
  );
  const summary = String(summaryInput ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, 500);
  const metadata = JSON.stringify(metadataInput);
  if (Buffer.byteLength(metadata, "utf8") > 16 * 1024) {
    throw new RevisionError("Recipe metadata exceeds its safe limit.", 413);
  }
  const result = getDb()
    .prepare(
      `UPDATE content_revisions
       SET snapshot_json=?,snapshot_schema_version=4,summary=?,
         recipe_import_hash=?,recipe_metadata_json=?,
         recipe_imported_by_user_id=?,recipe_imported_at=CURRENT_TIMESTAMP,
         updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND status='draft'`,
    )
    .run(
      JSON.stringify(snapshot),
      summary,
      importHash,
      metadata,
      user.id,
      revisionId,
    );
  if (result.changes !== 1) {
    throw new RevisionError(
      "The draft changed while you were importing. Reload and try again.",
      409,
    );
  }
  return { revision: getContentRevision(revisionId)!, duplicate: false };
}

export function fulfillBlueprintMediaSlot(
  user: SessionUser,
  revisionId: number,
  slotKey: string,
  attachmentId: number,
) {
  const revision = getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Submitted revisions cannot be edited.", 409);
  }
  const attachment = getDb()
    .prepare(
      "SELECT id,width,height FROM request_attachments WHERE id=? AND request_id=?",
    )
    .get(attachmentId, revision.request_id) as
    | { id: number; width: number | null; height: number | null }
    | undefined;
  if (!attachment) {
    throw new RevisionError("The verified image is unavailable.", 409);
  }
  const snapshot = requireRevisionSnapshotV4(
    revision.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const mediaPlan = mediaPlanFromRecipeMetadata(
    revision.recipe_metadata_json,
    snapshot,
  );
  const slot = mediaPlan.find((item) => item.key === slotKey);
  if (!slot) throw new RevisionError("The media-plan slot is unavailable.", 404);
  const width = Number(attachment.width || 0);
  const height = Number(attachment.height || 0);
  const ratio = width && height ? width / height : 0;
  const compatible =
    slot.aspectRatio === "any" ||
    !ratio ||
    (slot.aspectRatio === "landscape" && ratio >= 1.2) ||
    (slot.aspectRatio === "portrait" && ratio <= 0.83) ||
    (slot.aspectRatio === "square" && ratio >= 0.8 && ratio <= 1.25);
  if (!compatible) {
    throw new RevisionError(
      `Choose a ${slot.aspectRatio} image for ${slot.label}.`,
      409,
    );
  }
  const next = validatedV4ForRequest(
    assignBlueprintSlot(
      snapshot,
      slot,
      `request-attachment:${attachment.id}`,
    ),
    revision.request_id,
    revision.business_id,
  );
  const result = getDb()
    .prepare(
      "UPDATE content_revisions SET snapshot_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='draft'",
    )
    .run(JSON.stringify(next), revision.id);
  if (result.changes !== 1) {
    throw new RevisionError("The draft changed while media was assigned.", 409);
  }
  return {
    revision: getContentRevision(revision.id)!,
    readiness: blueprintReadiness(next, mediaPlan),
  };
}

export function submitRevisionForReview(
  user: SessionUser,
  revisionId: number,
) {
  const revision = getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Only a draft can be sent for review.", 409);
  }
  const snapshot = validatedV4ForRequest(
    revision.snapshot_json,
    revision.request_id,
    revision.business_id,
  );
  const readiness = blueprintReadiness(
    snapshot,
    mediaPlanFromRecipeMetadata(revision.recipe_metadata_json, snapshot),
  );
  if (!readiness.reviewReady) {
    throw new RevisionError(
      `${readiness.unresolvedRequired.length} required media slot${readiness.unresolvedRequired.length === 1 ? " is" : "s are"} still unresolved.`,
      409,
    );
  }
  const fitness = evaluateCompositionFitness(snapshot);
  if (!fitness.allowed) {
    throw new RevisionError(
      fitness.issues.find((issue) => issue.severity === "error")?.message ||
        "The showroom composition needs correction before review.",
      409,
    );
  }
  return inTransaction(() => {
    getDb()
      .prepare(
        "UPDATE content_revisions SET status='superseded',updated_at=CURRENT_TIMESTAMP WHERE request_id=? AND id<>? AND status IN ('awaiting_review','approved')",
      )
      .run(revision.request_id, revision.id);
    const changed = getDb()
      .prepare(
        "UPDATE content_revisions SET status='awaiting_review',submitted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='draft'",
      )
      .run(revision.id);
    if (changed.changes !== 1) {
      throw new RevisionError("The draft is no longer editable.", 409);
    }
    getDb()
      .prepare(
        "UPDATE service_requests SET status='client_review',updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(revision.request_id);
    getDb()
      .prepare(
        "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
      )
      .run(
        revision.request_id,
        user.id,
        "revision_submitted",
        `revision:${revision.revision_number}`,
      );
    return getContentRevision(revision.id)!;
  });
}

export function decideRevision(
  user: SessionUser,
  revisionId: number,
  decision: "approve" | "reject",
  commentInput: unknown,
) {
  const revision = getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = requestForRevision(user, revision.request_id);
  if (
    user.access_role !== "client" ||
    request.represented_client_user_id !== user.id
  ) {
    throw new RevisionError("Client decision access is required.", 403);
  }
  const latest = getDb()
    .prepare(
      "SELECT id FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    )
    .get(revision.request_id) as { id: number } | undefined;
  if (revision.status !== "awaiting_review" || latest?.id !== revision.id) {
    throw new RevisionError(
      "This preview is no longer awaiting your decision.",
      409,
    );
  }
  const comment = String(commentInput ?? "")
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 1000);
  if (decision === "reject" && comment.length < 5) {
    throw new RevisionError(
      "Tell SuqPage what should change in at least 5 characters.",
    );
  }
  return inTransaction(() => {
    const status = decision === "approve" ? "approved" : "rejected";
    const changed = getDb()
      .prepare(
        "UPDATE content_revisions SET status=?,decided_by_user_id=?,decision_comment=?,decided_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='awaiting_review'",
      )
      .run(status, user.id, comment, revision.id);
    if (changed.changes !== 1) {
      throw new RevisionError("This preview already has a decision.", 409);
    }
    getDb()
      .prepare(
        "UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(decision === "approve" ? "client_approved" : "in_progress", revision.request_id);
    getDb()
      .prepare(
        "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
      )
      .run(
        revision.request_id,
        user.id,
        decision === "approve" ? "revision_approved" : "revision_rejected",
        `revision:${revision.revision_number}`,
      );
    return getContentRevision(revision.id)!;
  });
}

function stagePrivateImages(snapshot: RevisionSnapshotV4, requestId: number) {
  const replacements = new Map<string, string>();
  const staged: string[] = [];
  fs.mkdirSync(mediaRoot(), { recursive: true });
  for (const ref of new Set(
    snapshotAssetRefs(snapshot).filter((value) =>
      value.startsWith("request-attachment:"),
    ),
  )) {
    const attachmentId = Number(ref.split(":")[1]);
    const attachment = getDb()
      .prepare(
        "SELECT storage_key,mime_type FROM request_attachments WHERE id=? AND request_id=?",
      )
      .get(attachmentId, requestId) as
      | { storage_key: string; mime_type: string }
      | undefined;
    const source = attachment
      ? resolveRequestAttachment(attachment.storage_key)
      : null;
    if (!attachment || !source || !fs.existsSync(source)) {
      throw new RevisionError("A selected private image is unavailable.", 409);
    }
    const ext =
      attachment.mime_type === "image/png"
        ? "png"
        : attachment.mime_type === "image/webp"
          ? "webp"
          : "jpg";
    const filename = `revision-${crypto.randomUUID()}.${ext}`;
    const destination = path.join(mediaRoot(), filename);
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(destination, 0o640);
    staged.push(destination);
    replacements.set(ref, `/media/${filename}`);
  }
  const replaced = JSON.parse(
    JSON.stringify(snapshot),
    (_key, value) =>
      typeof value === "string" && replacements.has(value)
        ? replacements.get(value)
        : value,
  );
  return {
    snapshot: requireRevisionSnapshotV4(replaced, SHOWROOM_COMPONENT_BANK_LATEST),
    staged,
  };
}

function replaceCanonicalCatalog(
  snapshot: RevisionSnapshotV4,
  businessId: number,
  newVersion: number,
) {
  const business = getDb()
    .prepare("SELECT * FROM businesses WHERE id=?")
    .get(businessId) as Record<string, unknown> | undefined;
  if (!business) throw new RevisionError("Business not found.", 404);
  const catalog = snapshotToCatalog(snapshot, business as never);
  getDb()
    .prepare(
      `UPDATE businesses
       SET name=?,design_key=?,design_manifest_json=?,content_blocks_json=?,
         tagline=?,description=?,logo_path=?,hero_title=?,hero_subtitle=?,
         hero_image_path=?,contact_email=?,whatsapp=?,telegram=?,tiktok=?,
         site_title=?,site_description=?,favicon_path=?,status='active',
         content_version=?
       WHERE id=?`,
    )
    .run(
      catalog.business.name,
      catalog.business.design_key,
      catalog.business.design_manifest_json,
      catalog.business.content_blocks_json,
      catalog.business.tagline,
      catalog.business.description,
      catalog.business.logo_path,
      catalog.business.hero_title,
      catalog.business.hero_subtitle,
      catalog.business.hero_image_path,
      catalog.business.contact_email,
      catalog.business.whatsapp,
      catalog.business.telegram,
      catalog.business.tiktok,
      catalog.business.site_title,
      catalog.business.site_description,
      catalog.business.favicon_path,
      newVersion,
      businessId,
    );
  getDb().prepare("DELETE FROM products WHERE business_id=?").run(businessId);
  getDb().prepare("DELETE FROM categories WHERE business_id=?").run(businessId);
  getDb().prepare("DELETE FROM collections WHERE business_id=?").run(businessId);
  const collectionIds = new Map<string, number>();
  for (const item of snapshot.collections) {
    const id = Number(
      getDb()
        .prepare(
          "INSERT INTO collections(business_id,name,slug,description,sort_order,is_active) VALUES(?,?,?,?,?,?)",
        )
        .run(
          businessId,
          item.name,
          item.slug,
          item.description,
          item.sortOrder,
          item.active ? 1 : 0,
        ).lastInsertRowid,
    );
    collectionIds.set(item.key, id);
  }
  const categoryIds = new Map<string, number>();
  for (const item of snapshot.categories) {
    const id = Number(
      getDb()
        .prepare(
          "INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,?,?,?,?,?)",
        )
        .run(
          businessId,
          item.collectionKey ? collectionIds.get(item.collectionKey) || null : null,
          item.name,
          item.slug,
          item.sortOrder,
          item.active ? 1 : 0,
        ).lastInsertRowid,
    );
    categoryIds.set(item.key, id);
  }
  for (const item of snapshot.products) {
    const productId = Number(
      getDb()
        .prepare(
          "INSERT INTO products(business_id,collection_id,category_id,name,slug,eyebrow,description,image_path,availability,is_published,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        )
        .run(
          businessId,
          item.collectionKey ? collectionIds.get(item.collectionKey) || null : null,
          item.categoryKey ? categoryIds.get(item.categoryKey) || null : null,
          item.name,
          item.slug,
          item.eyebrow,
          item.description,
          item.imageRef,
          item.availability,
          item.published ? 1 : 0,
          item.sortOrder,
        ).lastInsertRowid,
    );
    for (const [position, group] of item.optionGroups.entries()) {
      const groupId = Number(
        getDb()
          .prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,?,?)")
          .run(productId, group.name, position).lastInsertRowid,
      );
      for (const value of group.values) {
        getDb()
          .prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,?)")
          .run(groupId, value);
      }
    }
  }
}

export function publishApprovedRevision(
  user: SessionUser,
  revisionId: number,
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new RevisionError("Operations manager access is required.", 403);
  }
  const revision = getContentRevision(revisionId);
  if (!revision || revision.status !== "approved") {
    throw new RevisionError("An approved revision is required.", 409);
  }
  const latest = getDb()
    .prepare(
      "SELECT id FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    )
    .get(revision.request_id) as { id: number } | undefined;
  if (latest?.id !== revision.id) throw new RevisionError("A newer revision exists.", 409);
  const current = getCatalogByBusinessId(revision.business_id, true);
  if (!current) throw new RevisionError("Business catalog not found.", 404);
  if (current.business.content_version !== revision.base_content_version) {
    throw new RevisionError(
      "The live showroom changed. Create and approve a new revision.",
      409,
    );
  }
  const validated = validatedV4ForRequest(
    revision.snapshot_json,
    revision.request_id,
    revision.business_id,
  );
  const staged = stagePrivateImages(validated, revision.request_id);
  try {
    return inTransaction(() => {
      const now = getCatalogByBusinessId(revision.business_id, true)!;
      if (now.business.content_version !== revision.base_content_version) {
        throw new RevisionError(
          "The live showroom changed. Create and approve a new revision.",
          409,
        );
      }
      getDb()
        .prepare(
          "INSERT OR IGNORE INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'baseline',?)",
        )
        .run(
          revision.business_id,
          now.business.content_version,
          JSON.stringify(catalogToRevisionSnapshotV4(now)),
          user.id,
        );
      const nextVersion = now.business.content_version + 1;
      replaceCanonicalCatalog(staged.snapshot, revision.business_id, nextVersion);
      getDb()
        .prepare(
          "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,source_revision_id,change_kind,actor_user_id) VALUES(?,?,?,?,'publication',?)",
        )
        .run(
          revision.business_id,
          nextVersion,
          JSON.stringify(staged.snapshot),
          revision.id,
          user.id,
        );
      getDb()
        .prepare(
          "UPDATE content_revisions SET status='published',published_by_user_id=?,published_at=CURRENT_TIMESTAMP,published_content_version=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='approved'",
        )
        .run(user.id, nextVersion, revision.id);
      getDb()
        .prepare(
          "UPDATE service_requests SET status='published',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
        .run(revision.request_id);
      getDb()
        .prepare(
          "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
        )
        .run(
          revision.request_id,
          user.id,
          "revision_published",
          `revision:${revision.revision_number};content:${nextVersion}`,
        );
      return {
        businessId: revision.business_id,
        requestId: revision.request_id,
        contentVersion: nextVersion,
      };
    });
  } catch (error) {
    for (const file of staged.staged) fs.rmSync(file, { force: true });
    throw error;
  }
}

export function rollbackCatalogVersion(
  user: SessionUser,
  businessId: number,
  targetVersion: number,
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new RevisionError("Operations manager access is required.", 403);
  }
  const current = getCatalogByBusinessId(businessId, true);
  const target = getDb()
    .prepare(
      "SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=?",
    )
    .get(businessId, targetVersion) as { snapshot_json: string } | undefined;
  if (!current || !target || targetVersion === current.business.content_version) {
    throw new RevisionError("Choose a retained earlier content version.", 409);
  }
  const snapshot = requireRevisionSnapshotV4(
    target.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  return inTransaction(() => {
    const now = getCatalogByBusinessId(businessId, true)!;
    const nextVersion = now.business.content_version + 1;
    getDb()
      .prepare(
        "INSERT OR IGNORE INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'baseline',?)",
      )
      .run(
        businessId,
        now.business.content_version,
        JSON.stringify(catalogToRevisionSnapshotV4(now)),
        user.id,
      );
    replaceCanonicalCatalog(snapshot, businessId, nextVersion);
    getDb()
      .prepare(
        "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'rollback',?)",
      )
      .run(businessId, nextVersion, JSON.stringify(snapshot), user.id);
    return { businessId, contentVersion: nextVersion, targetVersion };
  });
}
