import crypto from "node:crypto";
import { hasCapability } from "./capabilities";
import { runtimeCatalogByBusinessId } from "./catalog-runtime";
import { getMediaObjectStore } from "./media-storage";
import { readRequestAttachment } from "./request-media";
import { canAccessRequest, runtimeRequestDetail } from "./request-runtime";
import { runtimeAll, runtimeGet, runtimeRun, runtimeTransaction } from "./runtime-sql";
import {
  RevisionError,
  snapshotToCatalog,
  withAuthoritativeBusinessSettings,
} from "./revision-domain";
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
  request: NonNullable<Awaited<ReturnType<typeof runtimeRequestDetail>>>,
) => user.access_role !== "client" && canAccessRequest(user, request);

export async function listContentRevisions(requestId: number): Promise<ContentRevision[]> {
  return (await runtimeAll<ContentRevision>(
    "SELECT * FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC",
    [requestId],
  ))
    .map((value) => row<ContentRevision>(value));
}

export async function getContentRevision(id: number): Promise<ContentRevision | undefined> {
  const value = await runtimeGet<ContentRevision>("SELECT * FROM content_revisions WHERE id=?", [id]);
  return value ? row<ContentRevision>(value) : undefined;
}

async function requestForRevision(user: SessionUser, requestId: number) {
  const request = await runtimeRequestDetail(requestId);
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
    snapshot.business.processVideoRef,
    ...snapshot.products.map((product) => product.imageRef),
    ...snapshot.products.map((product) => product.videoRef),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) => media.assetKeys),
    ),
  ].filter(Boolean);
}

async function allowedAssetRefs(requestId: number, businessId: number) {
  const catalog = await runtimeCatalogByBusinessId(businessId, true);
  if (!catalog) throw new RevisionError("Business catalog not found.", 404);
  const allowed = new Set(
    [
      catalog.business.logo_path,
      catalog.business.hero_image_path,
      catalog.business.favicon_path,
      catalog.business.process_video_ref,
      ...catalog.products.map((product) => product.image_path),
      ...catalog.products.map((product) => product.video_ref),
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
  for (const attachment of await runtimeAll<{ id: number }>("SELECT id FROM request_attachments WHERE request_id=?", [requestId])) {
    allowed.add(`request-attachment:${attachment.id}`);
  }
  for (const media of await runtimeAll<{ asset_key: string; provider_id: string | null }>("SELECT asset_key,provider_id FROM recipe_media_assets WHERE request_id=?", [requestId])) {
    allowed.add(media.asset_key);
    if (media.provider_id) allowed.add(`youtube:${media.provider_id}`);
  }
  return allowed;
}

async function validatedV4ForRequest(
  snapshotInput: unknown,
  requestId: number,
  businessId: number,
) {
  const snapshot = requireRevisionSnapshotV4(
    snapshotInput,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const allowed = await allowedAssetRefs(requestId, businessId);
  for (const ref of snapshotAssetRefs(snapshot)) {
    if (!allowed.has(ref)) {
      throw new RevisionError(
        "A revision media asset is not owned by this business or request.",
        403,
      );
    }
  }
  const catalog = await runtimeCatalogByBusinessId(businessId, true);
  if (!catalog) throw new RevisionError("Business catalog not found.", 404);
  return withAuthoritativeBusinessSettings(snapshot, catalog.business);
}

async function latestDraftSnapshot(
  latest: ContentRevision | undefined,
  requestId: number,
  businessId: number,
) {
  if (!latest) return null;
  try {
    return await validatedV4ForRequest(latest.snapshot_json, requestId, businessId);
  } catch {
    return null;
  }
}

export async function createDraftRevision(user: SessionUser, requestId: number) {
  const request = await requestForRevision(user, requestId);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  const existing = await runtimeGet<ContentRevision>(
    "SELECT * FROM content_revisions WHERE request_id=? AND status='draft' ORDER BY revision_number DESC LIMIT 1",
    [requestId],
  );
  if (existing) return row<ContentRevision>(existing);
  const latest = await runtimeGet<ContentRevision>(
    "SELECT * FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    [requestId],
  );
  const catalog = await runtimeCatalogByBusinessId(request.business_id!, true);
  if (!catalog) throw new RevisionError("Business catalog not found.", 404);
  const snapshot =
    await latestDraftSnapshot(latest, requestId, request.business_id!) ||
    catalogToRevisionSnapshotV4(catalog);
  return runtimeTransaction(async () => {
    if (latest && ["awaiting_review", "approved"].includes(latest.status)) {
      await runtimeRun(
        "UPDATE content_revisions SET status='superseded',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [latest.id],
      );
    }
    const result = await runtimeGet<{ id: number }>(
        `INSERT INTO content_revisions(
          request_id,business_id,revision_number,base_content_version,
          snapshot_json,snapshot_schema_version,created_by_user_id
        ) VALUES(?,?,?,?,?,?,?) RETURNING id`, [
        requestId,
        request.business_id,
        (latest?.revision_number || 0) + 1,
        catalog.business.content_version,
        JSON.stringify(snapshot),
        4,
        user.id,
      ],
    );
    await runtimeRun(
      "UPDATE service_requests SET status='in_progress',updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [requestId],
    );
    await runtimeRun(
      "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,'draft created')",
      [requestId, user.id, "revision_created"],
    );
    return (await getContentRevision(Number(result!.id)))!;
  });
}

export async function saveDraftRevision(
  user: SessionUser,
  revisionId: number,
  snapshotInput: unknown,
  summaryInput: unknown,
) {
  const revision = await getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = await requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Submitted revisions cannot be edited.", 409);
  }
  const snapshot = await validatedV4ForRequest(
    snapshotInput,
    revision.request_id,
    revision.business_id,
  );
  const summary = String(summaryInput ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, 500);
  const result = await runtimeRun(
    `UPDATE content_revisions
       SET snapshot_json=?,snapshot_schema_version=4,summary=?,
         recipe_import_hash=NULL,recipe_metadata_json=NULL,
         recipe_imported_by_user_id=NULL,recipe_imported_at=NULL,
         updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND status='draft'`,
    [JSON.stringify(snapshot), summary, revisionId],
  );
  if (result.changes !== 1) {
    throw new RevisionError(
      "The draft changed while you were saving. Reload and try again.",
      409,
    );
  }
  return (await getContentRevision(revisionId))!;
}

export async function saveRecipeDraftRevision(
  user: SessionUser,
  revisionId: number,
  snapshotInput: unknown,
  summaryInput: unknown,
  importHash: string,
  metadataInput: unknown,
) {
  const revision = await getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = await requestForRevision(user, revision.request_id);
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
  const snapshot = await validatedV4ForRequest(
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
  const result = await runtimeRun(
    `UPDATE content_revisions
       SET snapshot_json=?,snapshot_schema_version=4,summary=?,
         recipe_import_hash=?,recipe_metadata_json=?,
         recipe_imported_by_user_id=?,recipe_imported_at=CURRENT_TIMESTAMP,
         updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND status='draft'`,
    [
      JSON.stringify(snapshot),
      summary,
      importHash,
      metadata,
      user.id,
      revisionId,
    ],
  );
  if (result.changes !== 1) {
    throw new RevisionError(
      "The draft changed while you were importing. Reload and try again.",
      409,
    );
  }
  return { revision: (await getContentRevision(revisionId))!, duplicate: false };
}

export async function fulfillBlueprintMediaSlot(
  user: SessionUser,
  revisionId: number,
  slotKey: string,
  attachmentId: number,
) {
  const revision = await getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = await requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Submitted revisions cannot be edited.", 409);
  }
  const attachment = await runtimeGet<{
    id: number;
    width: number | null;
    height: number | null;
  }>(
    "SELECT id,width,height FROM request_attachments WHERE id=? AND request_id=?",
    [attachmentId, revision.request_id],
  );
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
  const next = await validatedV4ForRequest(
    assignBlueprintSlot(
      snapshot,
      slot,
      `request-attachment:${attachment.id}`,
    ),
    revision.request_id,
    revision.business_id,
  );
  const result = await runtimeRun(
    "UPDATE content_revisions SET snapshot_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='draft'",
    [JSON.stringify(next), revision.id],
  );
  if (result.changes !== 1) {
    throw new RevisionError("The draft changed while media was assigned.", 409);
  }
  return {
    revision: (await getContentRevision(revision.id))!,
    readiness: blueprintReadiness(next, mediaPlan),
  };
}

export async function submitRevisionForReview(
  user: SessionUser,
  revisionId: number,
) {
  const revision = await getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = await requestForRevision(user, revision.request_id);
  if (!staffCanWork(user, request)) {
    throw new RevisionError("Assigned staff access is required.", 403);
  }
  if (revision.status !== "draft") {
    throw new RevisionError("Only a draft can be sent for review.", 409);
  }
  const snapshot = await validatedV4ForRequest(
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
  return runtimeTransaction(async () => {
    await runtimeRun(
      "UPDATE content_revisions SET status='superseded',updated_at=CURRENT_TIMESTAMP WHERE request_id=? AND id<>? AND status IN ('awaiting_review','approved')",
      [revision.request_id, revision.id],
    );
    const changed = await runtimeRun(
      "UPDATE content_revisions SET status='awaiting_review',submitted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='draft'",
      [revision.id],
    );
    if (changed.changes !== 1) {
      throw new RevisionError("The draft is no longer editable.", 409);
    }
    await runtimeRun(
      "UPDATE service_requests SET status='client_review',updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [revision.request_id],
    );
    await runtimeRun(
      "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
      [
        revision.request_id,
        user.id,
        "revision_submitted",
        `revision:${revision.revision_number}`,
      ],
    );
    return (await getContentRevision(revision.id))!;
  });
}

export async function decideRevision(
  user: SessionUser,
  revisionId: number,
  decision: "approve" | "reject",
  commentInput: unknown,
) {
  const revision = await getContentRevision(revisionId);
  if (!revision) throw new RevisionError("Revision not found.", 404);
  const request = await requestForRevision(user, revision.request_id);
  if (
    user.access_role !== "client" ||
    request.represented_client_user_id !== user.id
  ) {
    throw new RevisionError("Client decision access is required.", 403);
  }
  const latest = await runtimeGet<{ id: number }>(
    "SELECT id FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    [revision.request_id],
  );
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
      "Tell MirtPage what should change in at least 5 characters.",
    );
  }
  return runtimeTransaction(async () => {
    const status = decision === "approve" ? "approved" : "rejected";
    const changed = await runtimeRun(
      "UPDATE content_revisions SET status=?,decided_by_user_id=?,decision_comment=?,decided_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='awaiting_review'",
      [status, user.id, comment, revision.id],
    );
    if (changed.changes !== 1) {
      throw new RevisionError("This preview already has a decision.", 409);
    }
    await runtimeRun(
      "UPDATE service_requests SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [decision === "approve" ? "client_approved" : "in_progress", revision.request_id],
    );
    await runtimeRun(
      "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
      [
        revision.request_id,
        user.id,
        decision === "approve" ? "revision_approved" : "revision_rejected",
        `revision:${revision.revision_number}`,
      ],
    );
    return (await getContentRevision(revision.id))!;
  });
}

async function stagePrivateImages(snapshot: RevisionSnapshotV4, requestId: number) {
  const replacements = new Map<string, string>();
  const staged: string[] = [];
  const store = getMediaObjectStore();
  try {
    for (const ref of new Set(
      snapshotAssetRefs(snapshot).filter((value) =>
        value.startsWith("request-attachment:"),
      ),
    )) {
      const attachmentId = Number(ref.split(":")[1]);
      const attachment = await runtimeGet<{
        storage_key: string;
        mime_type: string;
      }>(
        "SELECT storage_key,mime_type FROM request_attachments WHERE id=? AND request_id=?",
        [attachmentId, requestId],
      );
      const source = attachment
        ? await readRequestAttachment(attachment.storage_key, attachment.mime_type)
        : null;
      if (!attachment || !source) {
        throw new RevisionError("A selected private image is unavailable.", 409);
      }
      const ext =
        attachment.mime_type === "image/png"
          ? "png"
          : attachment.mime_type === "image/webp"
            ? "webp"
            : "jpg";
      const filename = `revision-${crypto.randomUUID()}.${ext}`;
      await store.put("public", filename, source.bytes, attachment.mime_type);
      staged.push(filename);
      replacements.set(ref, `/media/${filename}`);
    }
  } catch (error) {
    try {
      await store.remove("public", staged);
    } catch {
      console.error("revision.media_cleanup_failed", {
        provider: store.provider,
        count: staged.length,
      });
    }
    throw error;
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
    store,
  };
}

async function replaceCanonicalCatalog(
  snapshot: RevisionSnapshotV4,
  businessId: number,
  newVersion: number,
) {
  const business = await runtimeGet<Record<string, unknown>>(
    "SELECT * FROM businesses WHERE id=?",
    [businessId],
  );
  if (!business) throw new RevisionError("Business not found.", 404);
  const catalog = snapshotToCatalog(snapshot, business as never);
  await runtimeRun(
    `UPDATE businesses
       SET design_key=?,design_manifest_json=?,content_blocks_json=?,
         tagline=?,description=?,hero_title=?,hero_subtitle=?,hero_image_path=?,
         process_video_ref=?,status='active',content_version=?
       WHERE id=?`,
    [
      catalog.business.design_key,
      catalog.business.design_manifest_json,
      catalog.business.content_blocks_json,
      catalog.business.tagline,
      catalog.business.description,
      catalog.business.hero_title,
      catalog.business.hero_subtitle,
      catalog.business.hero_image_path,
      catalog.business.process_video_ref,
      newVersion,
      businessId,
    ],
  );
  await runtimeRun("DELETE FROM products WHERE business_id=?", [businessId]);
  await runtimeRun("DELETE FROM categories WHERE business_id=?", [businessId]);
  await runtimeRun("DELETE FROM collections WHERE business_id=?", [businessId]);
  const collectionIds = new Map<string, number>();
  for (const item of snapshot.collections) {
    const inserted = await runtimeGet<{ id: number }>(
      "INSERT INTO collections(business_id,name,slug,description,sort_order,is_active) VALUES(?,?,?,?,?,?) RETURNING id",
      [
          businessId,
          item.name,
          item.slug,
          item.description,
          item.sortOrder,
          item.active ? 1 : 0,
      ],
    );
    const id = Number(inserted!.id);
    collectionIds.set(item.key, id);
  }
  const categoryIds = new Map<string, number>();
  for (const item of snapshot.categories) {
    const inserted = await runtimeGet<{ id: number }>(
      "INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,?,?,?,?,?) RETURNING id",
      [
          businessId,
          item.collectionKey ? collectionIds.get(item.collectionKey) || null : null,
          item.name,
          item.slug,
          item.sortOrder,
          item.active ? 1 : 0,
      ],
    );
    const id = Number(inserted!.id);
    categoryIds.set(item.key, id);
  }
  for (const item of snapshot.products) {
    const insertedProduct = await runtimeGet<{ id: number }>(
      `INSERT INTO products(
            business_id,collection_id,category_id,name,slug,eyebrow,description,
            image_path,availability,offering_kind,quantity_mode,capacity_summary,
            minimum_order_summary,lead_time_summary,video_ref,price_minor,currency,
            quantity_unit,highlights_json,is_published,sort_order
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`,
      [
          businessId,
          item.collectionKey ? collectionIds.get(item.collectionKey) || null : null,
          item.categoryKey ? categoryIds.get(item.categoryKey) || null : null,
          item.name,
          item.slug,
          item.eyebrow,
          item.description,
          item.imageRef,
          item.availability,
          item.offeringKind,
          item.quantityMode,
          item.capacitySummary,
          item.minimumOrderSummary,
          item.leadTimeSummary,
          item.videoRef,
          item.priceMinor,
          item.currency,
          item.quantityUnit,
          JSON.stringify(item.highlights),
          item.published ? 1 : 0,
          item.sortOrder,
      ],
    );
    const productId = Number(insertedProduct!.id);
    for (const [position, group] of item.optionGroups.entries()) {
      const insertedGroup = await runtimeGet<{ id: number }>(
        "INSERT INTO option_groups(product_id,name,position) VALUES(?,?,?) RETURNING id",
        [productId, group.name, position],
      );
      const groupId = Number(insertedGroup!.id);
      for (const value of group.values) {
        await runtimeRun(
          "INSERT INTO option_values(option_group_id,value) VALUES(?,?)",
          [groupId, value],
        );
      }
    }
  }
}

export async function publishApprovedRevision(
  user: SessionUser,
  revisionId: number,
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new RevisionError("Operations manager access is required.", 403);
  }
  const revision = await getContentRevision(revisionId);
  if (!revision || revision.status !== "approved") {
    throw new RevisionError("An approved revision is required.", 409);
  }
  const latest = await runtimeGet<{ id: number }>(
    "SELECT id FROM content_revisions WHERE request_id=? ORDER BY revision_number DESC LIMIT 1",
    [revision.request_id],
  );
  if (latest?.id !== revision.id) throw new RevisionError("A newer revision exists.", 409);
  const current = await runtimeCatalogByBusinessId(revision.business_id, true);
  if (!current) throw new RevisionError("Business catalog not found.", 404);
  if (current.business.content_version !== revision.base_content_version) {
    throw new RevisionError(
      "The live showroom changed. Create and approve a new revision.",
      409,
    );
  }
  const validated = await validatedV4ForRequest(
    revision.snapshot_json,
    revision.request_id,
    revision.business_id,
  );
  const staged = await stagePrivateImages(validated, revision.request_id);
  try {
    return runtimeTransaction(async () => {
      const now = (await runtimeCatalogByBusinessId(revision.business_id, true))!;
      if (now.business.content_version !== revision.base_content_version) {
        throw new RevisionError(
          "The live showroom changed. Create and approve a new revision.",
          409,
        );
      }
      await runtimeRun(
        `INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id)
         VALUES(?,?,?,'baseline',?) ON CONFLICT(business_id,content_version) DO NOTHING`,
        [
          revision.business_id,
          now.business.content_version,
          JSON.stringify(catalogToRevisionSnapshotV4(now)),
          user.id,
        ],
      );
      const nextVersion = now.business.content_version + 1;
      await replaceCanonicalCatalog(staged.snapshot, revision.business_id, nextVersion);
      await runtimeRun(
        "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,source_revision_id,change_kind,actor_user_id) VALUES(?,?,?,?,'publication',?)",
        [
          revision.business_id,
          nextVersion,
          JSON.stringify(catalogToRevisionSnapshotV4((await runtimeCatalogByBusinessId(revision.business_id, true))!)),
          revision.id,
          user.id,
        ],
      );
      const published = await runtimeRun(
        "UPDATE content_revisions SET status='published',published_by_user_id=?,published_at=CURRENT_TIMESTAMP,published_content_version=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='approved'",
        [user.id, nextVersion, revision.id],
      );
      if (published.changes !== 1) {
        throw new RevisionError("The approved revision changed before publication.", 409);
      }
      await runtimeRun(
        "UPDATE service_requests SET status='published',updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [revision.request_id],
      );
      await runtimeRun(
        "INSERT INTO request_events(request_id,actor_user_id,event_type,detail) VALUES(?,?,?,?)",
        [
          revision.request_id,
          user.id,
          "revision_published",
          `revision:${revision.revision_number};content:${nextVersion}`,
        ],
      );
      return {
        businessId: revision.business_id,
        requestId: revision.request_id,
        contentVersion: nextVersion,
      };
    });
  } catch (error) {
    try {
      await staged.store.remove("public", staged.staged);
    } catch {
      console.error("revision.media_cleanup_failed", {
        provider: staged.store.provider,
        count: staged.staged.length,
      });
    }
    throw error;
  }
}

export async function rollbackCatalogVersion(
  user: SessionUser,
  businessId: number,
  targetVersion: number,
) {
  if (!hasCapability(user, "operations:manage")) {
    throw new RevisionError("Operations manager access is required.", 403);
  }
  const current = await runtimeCatalogByBusinessId(businessId, true);
  const target = await runtimeGet<{ snapshot_json: string }>(
    "SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=?",
    [businessId, targetVersion],
  );
  if (!current || !target || targetVersion === current.business.content_version) {
    throw new RevisionError("Choose a retained earlier content version.", 409);
  }
  const snapshot = requireRevisionSnapshotV4(
    target.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  return runtimeTransaction(async () => {
    const now = (await runtimeCatalogByBusinessId(businessId, true))!;
    const nextVersion = now.business.content_version + 1;
    await runtimeRun(
      `INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id)
       VALUES(?,?,?,'baseline',?) ON CONFLICT(business_id,content_version) DO NOTHING`,
      [
        businessId,
        now.business.content_version,
        JSON.stringify(catalogToRevisionSnapshotV4(now)),
        user.id,
      ],
    );
    await replaceCanonicalCatalog(snapshot, businessId, nextVersion);
    await runtimeRun(
      "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind,actor_user_id) VALUES(?,?,?,'rollback',?)",
      [businessId, nextVersion, JSON.stringify(catalogToRevisionSnapshotV4((await runtimeCatalogByBusinessId(businessId, true))!)), user.id],
    );
    return { businessId, contentVersion: nextVersion, targetVersion };
  });
}
