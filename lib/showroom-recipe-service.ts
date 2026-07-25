import crypto from "node:crypto";
import { controlledYouTubeAdmissionEnabled, recipeStudioEnabled } from "./config";
import { canAccessRequest, getRequestDetail } from "./request-sqlite";
import {
  getBusinessById,
  getCatalogByBusinessId,
  getDb,
  inTransaction,
} from "./db";
import { FileRequestAttachmentStore } from "./request-media";
import {
  requireRevisionSnapshotV4,
  type RevisionSnapshotV4,
} from "./revision-v4-domain";
import {
  getContentRevision,
  saveRecipeDraftRevision,
} from "./revision-service";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "./showroom-bank-release";
import {
  SHOWROOM_CONTENT_SCHEMA_VERSION,
  SHOWROOM_RECIPE_SCHEMA_VERSION,
  ShowroomRecipeError,
  validateShowroomRecipe,
  type RecipeProvenance,
  type ValidatedShowroomRecipe,
} from "./showroom-recipe-domain";
import type { SessionUser } from "./types";
import {
  ControlledYouTubeError,
  normalizeControlledYouTubeUrl,
} from "./youtube-provider";
import showroomContentSchema from "../showroom-sdk/showroom-content.schema.json";
import showroomDesignSchema from "../showroom-sdk/showroom-proposal.schema.json";
import showroomRecipeSchema from "../showroom-sdk/showroom-recipe.schema.json";

const opaque = (prefix: string, requestId: number, value: string) =>
  `${prefix}_${crypto
    .createHash("sha256")
    .update(`${requestId}:${value}`)
    .digest("hex")
    .slice(0, 20)}`;

function workspace(user: SessionUser, revisionId: number) {
  if (!recipeStudioEnabled()) {
    throw new ShowroomRecipeError(
      [{ category: "tenant_asset", path: "$", message: "Recipe studio is temporarily unavailable." }],
      404,
    );
  }
  const revision = getContentRevision(revisionId);
  if (!revision) {
    throw new ShowroomRecipeError(
      [{ category: "tenant_asset", path: "$", message: "Recipe workspace not found." }],
      404,
    );
  }
  const request = getRequestDetail(revision.request_id);
  if (
    !request ||
    !request.business_id ||
    user.access_role === "client" ||
    !canAccessRequest(user, request)
  ) {
    throw new ShowroomRecipeError(
      [{ category: "tenant_asset", path: "$", message: "Recipe workspace not found." }],
      404,
    );
  }
  if (revision.status !== "draft") {
    throw new ShowroomRecipeError(
      [{
        category: "cross_document",
        path: "$",
        message: "Only a private draft can accept a recipe.",
      }],
      409,
    );
  }
  const business = getBusinessById(request.business_id);
  const catalog = getCatalogByBusinessId(request.business_id, true);
  if (!business || !catalog) {
    throw new ShowroomRecipeError(
      [{ category: "tenant_asset", path: "$", message: "Business catalog not found." }],
      404,
    );
  }
  if (business.content_version !== revision.base_content_version) {
    throw new ShowroomRecipeError(
      [{
        category: "cross_document",
        path: "$.baseContentVersion",
        message: "The live showroom changed. Create a new revision and export a new brief.",
      }],
      409,
    );
  }
  return { revision, request, business, catalog };
}

function assetMaps(
  requestId: number,
  snapshot: RevisionSnapshotV4,
  attachments: ReturnType<typeof getRequestDetail> extends infer T
    ? T extends { attachments: infer A }
      ? A
      : never
    : never,
) {
  const actualToOpaque = new Map<string, string>();
  const opaqueToActual = new Map<string, string>();
  const descriptors: Array<{
    key: string;
    kind: "image" | "video";
    label: string;
    source: "current_showroom" | "request_attachment" | "controlled_youtube";
    width?: number;
    height?: number;
    rightsAcknowledged?: boolean;
  }> = [];
  const details = new Map<
    string,
    { kind: "image" | "video"; width?: number; height?: number }
  >();
  const admitted = new Map(
    (
      getDb()
        .prepare(
          "SELECT asset_key,request_attachment_id FROM recipe_media_assets WHERE request_id=? AND kind='image'",
        )
        .all(requestId) as Array<{
        asset_key: string;
        request_attachment_id: number;
      }>
    ).map((asset) => [asset.request_attachment_id, asset.asset_key]),
  );
  const current = [
    ["Current logo", snapshot.business.logoRef],
    ["Current hero image", snapshot.business.heroImageRef],
    ["Current browser icon", snapshot.business.faviconRef],
    ...snapshot.products.map(
      (product) => [`Current product · ${product.name}`, product.imageRef],
    ),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) =>
        media.assetKeys.map(
          (assetKey) => [`Current block · ${block.title}`, assetKey] as [string, string],
        ),
      ),
    ),
  ] as Array<[string, string]>;
  for (const [label, ref] of current) {
    if (!ref || actualToOpaque.has(ref)) continue;
    const key = opaque("asset", requestId, ref);
    actualToOpaque.set(ref, key);
    opaqueToActual.set(key, ref);
    descriptors.push({ key, kind: "image", label, source: "current_showroom" });
    details.set(ref, { kind: "image" });
  }
  for (const attachment of attachments || []) {
    const ref = `request-attachment:${attachment.id}`;
    const key = admitted.get(attachment.id) || opaque("asset", requestId, ref);
    actualToOpaque.set(ref, key);
    opaqueToActual.set(key, ref);
    descriptors.push({
      key,
      kind: "image",
      label: attachment.original_name,
      source: "request_attachment",
      width: attachment.width,
      height: attachment.height,
      rightsAcknowledged: true,
    });
    details.set(ref, {
      kind: "image",
      width: attachment.width,
      height: attachment.height,
    });
  }
  const providers = getDb()
    .prepare(
      "SELECT asset_key,label,provider_id FROM recipe_media_assets WHERE request_id=? AND kind='youtube' ORDER BY id",
    )
    .all(requestId) as Array<{
    asset_key: string;
    label: string;
    provider_id: string;
  }>;
  for (const provider of providers) {
    const ref = `youtube:${provider.provider_id}`;
    actualToOpaque.set(ref, provider.asset_key);
    opaqueToActual.set(provider.asset_key, ref);
    descriptors.push({
      key: provider.asset_key,
      kind: "video",
      label: provider.label,
      source: "controlled_youtube",
      rightsAcknowledged: true,
    });
    details.set(ref, { kind: "video" });
  }
  return { actualToOpaque, opaqueToActual, descriptors, details };
}

function mediaLabel(input: unknown, kind: "image" | "video") {
  const label = String(input ?? "")
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, 120);
  if (!label || /(?:<\/?[a-z][^>]*>|javascript:|data:|https?:\/\/)/i.test(label)) {
    throw new ShowroomRecipeError([{
      category: "tenant_asset",
      path: "$.media.label",
      message: `Add a short safe staff label for this ${kind}.`,
    }]);
  }
  return label;
}

export async function admitRecipeImage(
  user: SessionUser,
  revisionId: number,
  file: FormDataEntryValue | null,
  labelInput: unknown,
  rightsAcknowledged: boolean,
) {
  const state = workspace(user, revisionId);
  if (!rightsAcknowledged) {
    throw new ShowroomRecipeError([{
      category: "tenant_asset",
      path: "$.media.rights",
      message: "Confirm that SuqPage may use this image for the client showroom.",
    }]);
  }
  if (!(file instanceof File) || file.size < 1) {
    throw new ShowroomRecipeError([{
      category: "tenant_asset",
      path: "$.media.file",
      message: "Choose a JPEG, PNG, or WebP image.",
    }]);
  }
  const label = mediaLabel(labelInput, "image");
  const store = new FileRequestAttachmentStore();
  const stored = await store.save({
    originalName: file.name,
    claimedType: file.type,
    bytes: Buffer.from(await file.arrayBuffer()),
  });
  try {
    return inTransaction(() => {
      const attachmentId = Number(
        getDb()
          .prepare(
            `INSERT INTO request_attachments(
              request_id,storage_key,original_name,mime_type,byte_size,width,height
            ) VALUES(?,?,?,?,?,?,?)`,
          )
          .run(
            state.request.id,
            stored.storageKey,
            stored.originalName,
            stored.mime,
            stored.buffer.byteLength,
            stored.width,
            stored.height,
          ).lastInsertRowid,
      );
      const assetKey = `asset_${crypto.randomBytes(10).toString("hex")}`;
      getDb()
        .prepare(
          `INSERT INTO recipe_media_assets(
            request_id,asset_key,kind,label,request_attachment_id,
            rights_acknowledged,added_by_user_id
          ) VALUES(?,?,'image',?,?,1,?)`,
        )
        .run(state.request.id, assetKey, label, attachmentId, user.id);
      return {
        requestId: state.request.id,
        revisionId,
        assetKey,
        width: stored.width,
        height: stored.height,
      };
    });
  } catch (error) {
    store.remove([stored.storageKey]);
    throw error;
  }
}

export function admitRecipeYouTube(
  user: SessionUser,
  revisionId: number,
  urlInput: unknown,
  labelInput: unknown,
  rightsAcknowledged: boolean,
) {
  if (!controlledYouTubeAdmissionEnabled()) {
    throw new ShowroomRecipeError(
      [{ category: "tenant_asset", path: "$.media", message: "Controlled video admission is unavailable." }],
      404,
    );
  }
  const state = workspace(user, revisionId);
  if (!rightsAcknowledged) {
    throw new ShowroomRecipeError([{
      category: "tenant_asset",
      path: "$.media.rights",
      message: "Confirm that SuqPage may use this video for the client showroom.",
    }]);
  }
  const label = mediaLabel(labelInput, "video");
  let providerId: string;
  try {
    providerId = normalizeControlledYouTubeUrl(urlInput).providerId;
  } catch (error) {
    throw new ShowroomRecipeError([{
      category: "tenant_asset",
      path: "$.media.url",
      message:
        error instanceof ControlledYouTubeError
          ? error.message
          : "Enter a supported YouTube URL.",
    }]);
  }
  return inTransaction(() => {
    const existing = getDb()
      .prepare(
        "SELECT asset_key FROM recipe_media_assets WHERE request_id=? AND kind='youtube' AND provider_id=? LIMIT 1",
      )
      .get(state.request.id, providerId) as { asset_key: string } | undefined;
    if (existing) {
      return {
        requestId: state.request.id,
        revisionId,
        assetKey: existing.asset_key,
        duplicate: true,
      };
    }
    const assetKey = `asset_${crypto.randomBytes(10).toString("hex")}`;
    getDb()
      .prepare(
        `INSERT INTO recipe_media_assets(
          request_id,asset_key,kind,label,provider_id,
          rights_acknowledged,added_by_user_id
        ) VALUES(?,?,'youtube',?,?,1,?)`,
      )
      .run(state.request.id, assetKey, label, providerId, user.id);
    return { requestId: state.request.id, revisionId, assetKey, duplicate: false };
  });
}

function sourceManifest(requestId: number, request: NonNullable<ReturnType<typeof getRequestDetail>>) {
  const requestKey = opaque("source", requestId, "request-instruction");
  const currentKey = opaque("source", requestId, "current-showroom");
  const aiDraftKey = opaque("source", requestId, "ai-draft");
  const sources = [
    {
      key: requestKey,
      kind: "client_request",
      label: "Client instruction",
      text: request.request_text,
    },
    {
      key: currentKey,
      kind: "current_showroom",
      label: "Authorized current showroom",
      text: "The complete current content document included in this brief.",
    },
    {
      key: aiDraftKey,
      kind: "ai_draft",
      label: "AI-drafted presentation copy",
      text: "May support presentation language only, never contacts, availability, specifications, certifications, pricing, origin, materials, or other factual claims.",
    },
    ...request.events
      .filter((event) =>
        ["client_clarification", "staff_clarification"].includes(event.event_type),
      )
      .map((event) => ({
        key: opaque("source", requestId, `clarification:${event.id}`),
        kind: "clarification",
        label: "Authorized clarification",
        text: event.detail,
      })),
  ];
  return { requestKey, currentKey, aiDraftKey, sources };
}

function mapSnapshotAssets(
  snapshot: RevisionSnapshotV4,
  map: ReadonlyMap<string, string>,
) {
  const replace = (value: string) => (value ? map.get(value) || value : "");
  return {
    ...snapshot,
    business: {
      ...snapshot.business,
      logoRef: replace(snapshot.business.logoRef),
      heroImageRef: replace(snapshot.business.heroImageRef),
      faviconRef: replace(snapshot.business.faviconRef),
    },
    products: snapshot.products.map((product) => ({
      ...product,
      imageRef: replace(product.imageRef),
    })),
    contentBlocks: {
      ...snapshot.contentBlocks,
      blocks: snapshot.contentBlocks.blocks.map((block) => ({
        ...block,
        media: block.media.map((media) => ({
          ...media,
          assetKeys: media.assetKeys.map(replace),
        })),
      })),
    },
  };
}

function relationshipKeyMaps(requestId: number, snapshot: RevisionSnapshotV4) {
  const actualToOpaque = new Map<string, string>();
  const opaqueToActual = new Map<string, string>();
  for (const [kind, keys] of [
    ["collection", snapshot.collections.map((item) => item.key)],
    ["category", snapshot.categories.map((item) => item.key)],
    ["product", snapshot.products.map((item) => item.key)],
  ] as const) {
    for (const key of keys) {
      const portable = opaque(kind, requestId, key);
      actualToOpaque.set(key, portable);
      opaqueToActual.set(portable, key);
    }
  }
  return { actualToOpaque, opaqueToActual };
}

function mapSnapshotRelationshipKeys(
  snapshot: RevisionSnapshotV4,
  map: ReadonlyMap<string, string>,
) {
  const replace = (value: string | null) =>
    value ? map.get(value) || value : null;
  return {
    ...snapshot,
    collections: snapshot.collections.map((item) => ({
      ...item,
      key: replace(item.key)!,
    })),
    categories: snapshot.categories.map((item) => ({
      ...item,
      key: replace(item.key)!,
      collectionKey: replace(item.collectionKey),
    })),
    products: snapshot.products.map((item) => ({
      ...item,
      key: replace(item.key)!,
      collectionKey: replace(item.collectionKey),
      categoryKey: replace(item.categoryKey),
    })),
  };
}

function factProvenance(
  snapshot: RevisionSnapshotV4,
  sourceKey: string,
): RecipeProvenance[] {
  const paths = ["$.content.business.name"];
  for (const field of ["contactEmail", "whatsapp", "telegram", "tiktok"] as const) {
    if (snapshot.business[field]) paths.push(`$.content.business.${field}`);
  }
  snapshot.products.forEach((_product, index) => {
    paths.push(
      `$.content.products[${index}].name`,
      `$.content.products[${index}].description`,
      `$.content.products[${index}].availability`,
    );
  });
  return paths.map((path) => ({ path, sourceKey, kind: "source_fact" }));
}

function exampleRecipe(
  snapshot: RevisionSnapshotV4,
  sourceKey: string,
) {
  const { designManifest, schemaVersion: _schemaVersion, ...content } = snapshot;
  return {
    schemaVersion: SHOWROOM_RECIPE_SCHEMA_VERSION,
    baseContentVersion: 1,
    content: {
      schemaVersion: SHOWROOM_CONTENT_SCHEMA_VERSION,
      ...content,
    },
    design: designManifest,
    summary: "Complete client-ready showroom proposal.",
    rationale: "Uses only reviewed component-bank choices and supplied facts.",
    questions: [],
    warnings: [],
    declaredRemovals: { collections: [], categories: [], products: [] },
    provenance: factProvenance(snapshot, sourceKey),
  };
}

export function buildShowroomRecipeBrief(
  user: SessionUser,
  revisionId: number,
) {
  const state = workspace(user, revisionId);
  const snapshot = requireRevisionSnapshotV4(
    state.revision.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const assets = assetMaps(state.request.id, snapshot, state.request.attachments);
  const relationships = relationshipKeyMaps(state.request.id, snapshot);
  const sources = sourceManifest(state.request.id, state.request);
  const portableSnapshot = mapSnapshotRelationshipKeys(
    mapSnapshotAssets(snapshot, assets.actualToOpaque),
    relationships.actualToOpaque,
  );
  const example = exampleRecipe(portableSnapshot, sources.currentKey);
  example.baseContentVersion = state.revision.base_content_version;
  return {
    workspace: {
      requestId: state.request.id,
      requestReference: state.request.public_ref,
      revisionId: state.revision.id,
      revisionNumber: state.revision.revision_number,
      baseContentVersion: state.revision.base_content_version,
      businessId: state.business.id,
      businessName: state.business.name,
    },
    brief: {
      briefSchemaVersion: 1,
      exportedAt: new Date().toISOString(),
      requestReference: state.request.public_ref,
      baseContentVersion: state.revision.base_content_version,
      requiredRecipeSchemaVersion: SHOWROOM_RECIPE_SCHEMA_VERSION,
      requiredContentSchemaVersion: SHOWROOM_CONTENT_SCHEMA_VERSION,
      schemas: {
        content: showroomContentSchema,
        design: showroomDesignSchema,
        recipe: showroomRecipeSchema,
      },
      componentBank: SHOWROOM_COMPONENT_BANK_LATEST,
      sourceFacts: sources.sources,
      mediaManifest: assets.descriptors,
      currentContent: portableSnapshot,
      instructions: [
        "Return one complete replacement recipe, never a partial patch.",
        "Use only source keys and media keys present in this brief.",
        "Do not add stock, inventory, pricing, code, HTML, CSS, iframe markup, remote image URLs, or database IDs.",
        "Keep unresolved facts in questions; a recipe with questions cannot be imported.",
        "Declare every intentionally removed stable key.",
      ],
      completeExample: example,
    },
  };
}

function normalizeImportedAssets(
  input: unknown,
  opaqueToActual: ReadonlyMap<string, string>,
  relationshipKeys: ReadonlyMap<string, string>,
) {
  let parsed: Record<string, unknown>;
  try {
    parsed = (typeof input === "string" ? JSON.parse(input) : structuredClone(input)) as Record<
      string,
      unknown
    >;
  } catch {
    return input;
  }
  const content = parsed?.content as Record<string, unknown> | undefined;
  const business = content?.business as Record<string, unknown> | undefined;
  const replace = (value: unknown) =>
    typeof value === "string" && value
      ? opaqueToActual.get(value) || value
      : value;
  if (business) {
    for (const field of ["logoRef", "heroImageRef", "faviconRef"]) {
      business[field] = replace(business[field]);
    }
  }
  if (Array.isArray(content?.products)) {
    for (const product of content.products as Array<Record<string, unknown>>) {
      product.imageRef = replace(product.imageRef);
    }
  }
  const blocks = (content?.contentBlocks as Record<string, unknown> | undefined)?.blocks;
  if (Array.isArray(blocks)) {
    for (const block of blocks as Array<Record<string, unknown>>) {
      if (!Array.isArray(block.media)) continue;
      for (const media of block.media as Array<Record<string, unknown>>) {
        if (Array.isArray(media.assetKeys)) {
          media.assetKeys = media.assetKeys.map(replace);
        }
      }
    }
  }
  const replaceKey = (value: unknown) =>
    typeof value === "string" && value
      ? relationshipKeys.get(value) || value
      : value;
  if (Array.isArray(content?.collections)) {
    for (const collection of content.collections as Array<Record<string, unknown>>) {
      collection.key = replaceKey(collection.key);
    }
  }
  if (Array.isArray(content?.categories)) {
    for (const category of content.categories as Array<Record<string, unknown>>) {
      category.key = replaceKey(category.key);
      category.collectionKey = replaceKey(category.collectionKey);
    }
  }
  if (Array.isArray(content?.products)) {
    for (const product of content.products as Array<Record<string, unknown>>) {
      product.key = replaceKey(product.key);
      product.collectionKey = replaceKey(product.collectionKey);
      product.categoryKey = replaceKey(product.categoryKey);
    }
  }
  const removals = parsed.declaredRemovals as Record<string, unknown> | undefined;
  if (removals) {
    for (const name of ["collections", "categories", "products"]) {
      if (Array.isArray(removals[name])) {
        removals[name] = (removals[name] as unknown[]).map(replaceKey);
      }
    }
  }
  return parsed;
}

function synchronizeBusinessHeroContentBlock(
  input: unknown,
  baseSnapshot: RevisionSnapshotV4,
) {
  if (!input || typeof input !== "object") return input;
  const recipe = input as Record<string, unknown>;
  const content = recipe.content as Record<string, unknown> | undefined;
  const business = content?.business as Record<string, unknown> | undefined;
  const contentBlocks = content?.contentBlocks as Record<string, unknown> | undefined;
  const blocks = contentBlocks?.blocks;
  if (!business || !Array.isArray(blocks)) return input;

  const heroBlock = (blocks as Array<Record<string, unknown>>).find(
    (block) => block.key === "hero-main",
  ) || (blocks as Array<Record<string, unknown>>).find(
    (block) => block.type === "hero",
  );
  const baseHeroBlock = baseSnapshot.contentBlocks.blocks.find(
    (block) => block.key === heroBlock?.key,
  ) || baseSnapshot.contentBlocks.blocks.find((block) => block.type === "hero");
  if (!heroBlock || !baseHeroBlock) return input;

  const syncText = (
    blockField: "kicker" | "title" | "body",
    businessField: "tagline" | "heroTitle" | "heroSubtitle",
  ) => {
    const next = business[businessField];
    if (typeof next !== "string") return;
    const current = heroBlock[blockField];
    if (typeof current === "string" && current !== next) {
      heroBlock[blockField] = next;
    }
  };
  syncText("kicker", "tagline");
  syncText("title", "heroTitle");
  syncText("body", "heroSubtitle");

  const heroImageRef = business.heroImageRef;
  if (
    typeof heroImageRef === "string" &&
    Array.isArray(heroBlock.media)
  ) {
    const media = (heroBlock.media as Array<Record<string, unknown>>).find(
      (entry) => entry.slotKey === "hero_image",
    );
    const baseMedia = baseHeroBlock.media.find(
      (entry) => entry.slotKey === "hero_image",
    );
    if (
      media &&
      Array.isArray(media.assetKeys) &&
      baseMedia &&
      JSON.stringify(media.assetKeys) !== JSON.stringify([heroImageRef])
    ) {
      media.assetKeys = heroImageRef ? [heroImageRef] : [];
    }
  }
  return input;
}

export function importShowroomRecipe(
  user: SessionUser,
  revisionId: number,
  input: unknown,
): ValidatedShowroomRecipe {
  const state = workspace(user, revisionId);
  const baseSnapshot = requireRevisionSnapshotV4(
    state.revision.snapshot_json,
    SHOWROOM_COMPONENT_BANK_LATEST,
  );
  const assets = assetMaps(state.request.id, baseSnapshot, state.request.attachments);
  const relationships = relationshipKeyMaps(state.request.id, baseSnapshot);
  const sources = sourceManifest(state.request.id, state.request);
  const normalized = normalizeImportedAssets(
    input,
    assets.opaqueToActual,
    relationships.opaqueToActual,
  );
  synchronizeBusinessHeroContentBlock(normalized, baseSnapshot);
  const validated = validateShowroomRecipe(normalized, {
    baseContentVersion: state.revision.base_content_version,
    baseSnapshot,
    allowedAssetKeys: new Set([
      "",
      ...assets.opaqueToActual.values(),
    ]),
    allowedSourceKeys: new Set(sources.sources.map((source) => source.key)),
    assetDetails: assets.details,
  });
  const saved = saveRecipeDraftRevision(
    user,
    revisionId,
    validated.snapshot,
    validated.recipe.summary,
    validated.importHash,
    {
      recipeSchemaVersion: validated.recipe.schemaVersion,
      contentSchemaVersion: validated.recipe.content.schemaVersion,
      bankRelease: validated.snapshot.designManifest.bankRelease,
      counts: {
        collections: validated.difference.collections.after,
        categories: validated.difference.categories.after,
        products: validated.difference.products.after,
        sections: validated.difference.designSections.after,
      },
      warningCount: validated.recipe.warnings.length,
    },
  );
  return { ...validated, duplicate: saved.duplicate };
}
