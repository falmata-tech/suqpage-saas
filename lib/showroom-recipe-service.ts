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
import { catalogToRevisionSnapshotV4 } from "./revision-v4-defaults";
import {
  getContentRevision,
  saveRecipeDraftRevision,
} from "./revision-service";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "./showroom-bank-release";
import {
  SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2,
  SHOWROOM_SECTION_SURFACE_ROLES,
  SHOWROOM_DESIGN_SCHEMA_VERSION_V2,
} from "./showroom-composition-v2";
import { SHOWROOM_CONTENT_BLOCK_SCHEMA_VERSION } from "./showroom-content-blocks";
import { SHOWROOM_DESIGN_SYSTEMS } from "./showroom-design-systems";
import {
  evaluateCompositionFitness,
  guidanceForComponent,
  SHOWROOM_DESIGN_PROCESS,
  SHOWROOM_MEDIA_TREATMENTS,
  SHOWROOM_TEMPLATES,
} from "./showroom-guidance";
import {
  SHOWROOM_CONTENT_SCHEMA_VERSION,
  SHOWROOM_RECIPE_SCHEMA_VERSION,
  ShowroomRecipeError,
  validateShowroomRecipe,
  type ValidatedShowroomRecipe,
} from "./showroom-recipe-domain";
import type { Catalog, SessionUser } from "./types";
import {
  ControlledYouTubeError,
  normalizeControlledYouTubeUrl,
} from "./youtube-provider";
import showroomContentSchema from "../showroom-sdk/showroom-content.schema.json";
import showroomContentBlocksSchema from "../showroom-sdk/showroom-content-blocks.schema.json";
import showroomDesignSchema from "../showroom-sdk/showroom-proposal-v2.schema.json";
import showroomComponentBankSchema from "../showroom-sdk/component-bank-v2.schema.json";
import showroomRecipeSchema from "../showroom-sdk/showroom-recipe.schema.json";
import showroomDesignSystemSchema from "../showroom-sdk/showroom-design-system.schema.json";
import { PRODUCT_DETAIL_PATTERN_DEFINITIONS } from "./product-detail-patterns";

export const SHOWROOM_RECIPE_BRIEF_CONTRACTS = Object.freeze({
  brief: "suqpage.recipe-brief@1",
  recipe: "suqpage.showroom-recipe@1",
  content: "suqpage.showroom-content@1",
  contentBlocks: "suqpage.showroom-content-blocks@1",
  design: "suqpage.showroom-design@2",
  componentBankSchema: "suqpage.component-bank@2",
  componentBankRelease: SHOWROOM_COMPONENT_BANK_LATEST.release,
  designSystems: "suqpage.showroom-design-systems@2",
});

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
  const currentImages = [
    ["Current logo", snapshot.business.logoRef],
    ["Current hero image", snapshot.business.heroImageRef],
    ["Current browser icon", snapshot.business.faviconRef],
    ...snapshot.products.map(
      (product) => [`Current product · ${product.name}`, product.imageRef],
    ),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) =>
        media.assetKeys.filter((assetKey) => !assetKey.startsWith("youtube:")).map(
          (assetKey) => [`Current block · ${block.title}`, assetKey] as [string, string],
        ),
      ),
    ),
  ] as Array<[string, string]>;
  for (const [label, ref] of currentImages) {
    if (!ref || actualToOpaque.has(ref)) continue;
    const key = opaque("asset", requestId, ref);
    actualToOpaque.set(ref, key);
    opaqueToActual.set(key, ref);
    descriptors.push({ key, kind: "image", label, source: "current_showroom" });
    details.set(ref, { kind: "image" });
  }
  const currentVideos = [
    ["Current process video", snapshot.business.processVideoRef],
    ...snapshot.products.map(
      (product) => [`Current product video · ${product.name}`, product.videoRef],
    ),
    ...snapshot.contentBlocks.blocks.flatMap((block) =>
      block.media.flatMap((media) =>
        media.assetKeys.filter((assetKey) => assetKey.startsWith("youtube:")).map(
          (assetKey) => [`Current block video · ${block.title}`, assetKey] as [string, string],
        ),
      ),
    ),
  ] as Array<[string, string]>;
  for (const [label, ref] of currentVideos) {
    if (!ref || actualToOpaque.has(ref)) continue;
    const key = opaque("asset", requestId, ref);
    actualToOpaque.set(ref, key);
    opaqueToActual.set(key, ref);
    descriptors.push({ key, kind: "video", label, source: "current_showroom" });
    details.set(ref, { kind: "video" });
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
        attachmentId,
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
      processVideoRef: replace(snapshot.business.processVideoRef),
    },
    products: snapshot.products.map((product) => ({
      ...product,
      imageRef: replace(product.imageRef),
      videoRef: replace(product.videoRef),
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
    collections: [],
    categories: snapshot.categories.map((item) => ({
      ...item,
      key: replace(item.key)!,
      collectionKey: null,
    })),
    products: snapshot.products.map((item) => ({
      ...item,
      key: replace(item.key)!,
      collectionKey: null,
      categoryKey: replace(item.categoryKey),
    })),
  };
}

function syntheticReferenceCatalog(): Catalog {
  return {
    business: {
      id: 9000,
      handle: "structural-reference-only",
      name: "Reference Goods Studio",
      design_key: "composition",
      design_manifest_json: "",
      content_blocks_json: "",
      tagline: "Synthetic structure, not client content",
      description:
        "An invented showroom used only to demonstrate the portable recipe contract.",
      logo_path: "",
      hero_title: "A complete example for structure only",
      hero_subtitle:
        "Replace every value, count, key, media choice, and design choice using the client brief.",
      hero_image_path: "",
      contact_email: "",
      whatsapp: "",
      telegram: "",
      tiktok: "",
      process_video_ref: "",
      is_live: 0,
      live_platform: "",
      live_url: "",
      status: "draft",
      site_title: "Reference Goods Studio",
      site_description: "Synthetic showroom recipe reference.",
      favicon_path: "",
      content_version: 1,
    },
    collections: [],
    categories: [
      {
        id: 9020,
        business_id: 9000,
        collection_id: null,
        name: "Reference Category",
        slug: "reference-category",
        sort_order: 0,
        is_active: 1,
      },
      {
        id: 9021,
        business_id: 9000,
        collection_id: null,
        name: "Second Reference Category",
        slug: "second-reference-category",
        sort_order: 1,
        is_active: 1,
      },
    ],
    products: [
      {
        id: 9030,
        business_id: 9000,
        collection_id: null,
        category_id: 9020,
        name: "Reference Item One",
        slug: "reference-item-one",
        eyebrow: "Synthetic example",
        description: "Demonstrates relationships, options, and descriptive availability.",
        image_path: "",
        video_ref: "",
        price_minor: null,
        currency: "ETB",
        quantity_unit: "",
        highlights_json: "[]",
        highlights: [],
        availability: "available",
        offering_kind: "made_to_order",
        quantity_mode: "optional",
        capacity_summary: "Capacity agreed after specification review",
        minimum_order_summary: "Minimum order depends on the selected format",
        lead_time_summary: "Lead time confirmed with the production brief",
        is_published: 1,
        sort_order: 0,
        option_groups: [
          {
            id: 9040,
            product_id: 9030,
            name: "Example option",
            position: 0,
            values: [
              { id: 9050, option_group_id: 9040, value: "Option A" },
              { id: 9051, option_group_id: 9040, value: "Option B" },
            ],
          },
        ],
      },
      {
        id: 9031,
        business_id: 9000,
        collection_id: null,
        category_id: 9021,
        name: "Reference Item Two",
        slug: "reference-item-two",
        eyebrow: "Synthetic example",
        description: "Demonstrates a second category and a different availability state.",
        image_path: "",
        video_ref: "",
        price_minor: null,
        currency: "ETB",
        quantity_unit: "",
        highlights_json: "[]",
        highlights: [],
        availability: "coming_soon",
        offering_kind: "production_supply",
        quantity_mode: "optional",
        capacity_summary: "Seasonal supply",
        minimum_order_summary: "",
        lead_time_summary: "Next cycle to be confirmed",
        is_published: 1,
        sort_order: 1,
        option_groups: [],
      },
    ],
  };
}

function syntheticExampleRecipe() {
  const snapshot = catalogToRevisionSnapshotV4(syntheticReferenceCatalog());
  const { designManifest, schemaVersion: _schemaVersion, ...content } = snapshot;
  return {
    schemaVersion: SHOWROOM_RECIPE_SCHEMA_VERSION,
    baseContentVersion: 1,
    content: {
      schemaVersion: SHOWROOM_CONTENT_SCHEMA_VERSION,
      ...content,
    },
    design: designManifest,
    summary: "Synthetic complete recipe demonstrating difficult contract structures.",
    rationale:
      "Structural reference only; derive all real values and design decisions from the client-specific brief.",
    questions: [],
    warnings: [],
    mediaPlan: snapshot.products
      .filter((product) => !product.imageRef)
      .map((product) => ({
        key: `media-${product.key}`,
        ownerType: "product" as const,
        ownerKey: product.key,
        slotKey: "product_image",
        label: `${product.name} photography`,
        purpose: `Add an authorized factual image for ${product.name}.`,
        required: false,
        aspectRatio: "landscape" as const,
        altText: product.name,
        classification: "factual" as const,
      })),
    declaredRemovals: { collections: [], categories: [], products: [] },
    provenance: [],
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
  const example = syntheticExampleRecipe();
  const componentById = new Map(
    SHOWROOM_COMPONENT_BANK_LATEST.components.map((component) => [
      component.id,
      component,
    ]),
  );
  const blockAssignments = portableSnapshot.contentBlocks.blocks.map((block) => ({
    blockKey: block.key,
    blockType: block.type,
    compatibleComponents: SHOWROOM_COMPONENT_BANK_LATEST.components
      .filter((component) => component.acceptedContentTypes.includes(block.type))
      .map((component) => component.id),
  }));
  const allowedMediaDestinations = [
    { ownerType: "business", ownerKey: "business", slotKey: "logo", label: "Business logo" },
    { ownerType: "business", ownerKey: "business", slotKey: "hero_image", label: "Business hero image" },
    { ownerType: "business", ownerKey: "business", slotKey: "favicon", label: "Browser icon" },
    ...portableSnapshot.products.map((product) => ({
      ownerType: "product",
      ownerKey: product.key,
      slotKey: "product_image",
      label: `${product.name} image`,
    })),
    ...portableSnapshot.designManifest.sections.flatMap((section) => {
      if (!section.contentBlockKey) return [];
      const component = componentById.get(section.component);
      if (!component) return [];
      return component.contentMediaSlots
        .filter((slot) => slot.acceptedKinds.includes("image"))
        .map((slot) => ({
          ownerType: "block",
          ownerKey: section.contentBlockKey!,
          slotKey: slot.key,
          label: slot.label,
        }));
    }),
  ];
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
      contractManifest: SHOWROOM_RECIPE_BRIEF_CONTRACTS,
      exportedAt: new Date().toISOString(),
      requestReference: state.request.public_ref,
      baseContentVersion: state.revision.base_content_version,
      requiredRecipeSchemaVersion: SHOWROOM_RECIPE_SCHEMA_VERSION,
      requiredContentSchemaVersion: SHOWROOM_CONTENT_SCHEMA_VERSION,
      requiredContentBlocksSchemaVersion: SHOWROOM_CONTENT_BLOCK_SCHEMA_VERSION,
      requiredDesignSchemaVersion: SHOWROOM_DESIGN_SCHEMA_VERSION_V2,
      requiredComponentBankSchemaVersion:
        SHOWROOM_COMPONENT_BANK_SCHEMA_VERSION_V2,
      schemas: {
        content: showroomContentSchema,
        contentBlocks: showroomContentBlocksSchema,
        design: showroomDesignSchema,
        componentBank: showroomComponentBankSchema,
        designSystem: showroomDesignSystemSchema,
        recipe: showroomRecipeSchema,
      },
      componentBank: SHOWROOM_COMPONENT_BANK_LATEST,
      designSystems: Object.values(SHOWROOM_DESIGN_SYSTEMS),
      compositionGuidance: {
        designProcess: SHOWROOM_DESIGN_PROCESS,
        selectionPolicy: {
          identifiersAreSuitabilitySignals: false,
          prohibitedSignals: ["industry", "business_archetype"],
          decisionOrder: SHOWROOM_DESIGN_PROCESS.decisionOrder,
          instruction:
            "Choose by objective fit. Legacy IDs are stable references only and must not be interpreted as industry recommendations.",
        },
        templates: SHOWROOM_TEMPLATES,
        canonicalNormalShowroom: {
          sectionOrder: [
            "header",
            "hero",
            "about_story",
            "process",
            "products",
            "inquiry_call_to_action",
            "footer",
          ],
          surfaceRoleOptions: SHOWROOM_SECTION_SURFACE_ROLES,
          surfaceSequenceRequired: false,
          extraSectionsAllowed: false,
        },
        mediaTreatments: SHOWROOM_MEDIA_TREATMENTS,
        productDetailPatterns: PRODUCT_DETAIL_PATTERN_DEFINITIONS,
        components: Object.fromEntries(
          SHOWROOM_COMPONENT_BANK_LATEST.components.map((component) => [
            component.id,
            guidanceForComponent(component),
          ]),
        ),
      },
      blockAssignmentChecklist: blockAssignments,
      allowedMediaDestinations,
      sourceFacts: sources.sources,
      mediaManifest: assets.descriptors,
      currentContent: portableSnapshot,
      instructions: [
        "Treat each @version in contractManifest as belonging only to its named contract. Return recipe@1 containing content@1, content-blocks@1, and design@2; do not normalize or align independent version numbers.",
        "completeExample is a synthetic structural reference only. Never copy its business text, counts, stable keys, source/media keys, token pack, template, or component choices. Its seven-role section order is canonical and must be preserved. Build the actual recipe from currentContent, sourceFacts, mediaManifest, blockAssignmentChecklist, and allowedMediaDestinations.",
        "Return one complete replacement recipe, never a partial patch.",
        "You may freely write provisional business, product, and section copy for this private candidate. provenance is optional review metadata and may be an empty array. When you do cite a source_fact, use only source keys present in this brief.",
        "Do not add stock, inventory, checkout behavior, code, HTML, CSS, iframe markup, remote image URLs, or database IDs. Optional priceMinor is informational ETB context only.",
        "Use questions and warnings as non-blocking notes for staff review. They do not prevent private import.",
        "Assign every contentBlocks block key to exactly one compatible design section contentBlockKey. Use blockAssignmentChecklist to verify there are no unassigned or duplicate keys.",
        "Product category is the only active catalog grouping. Return content.collections as an empty array, declaredRemovals.collections as an empty array, and every category/product collectionKey as null. Never use a collection as navigation, story, process, trust, footer, or composition content.",
        "Treat content.products as the compatibility transport for public offerings. Classify each entry from supplied facts as standard_product, made_to_order, manufacturing_capability, or production_supply. Set quantityMode to optional for every offering. Desired quantity is optional buyer intent and never stock.",
        "For every offering return optional priceMinor in ETB minor units, currency ETB, merchant-defined quantityUnit, zero to six concise highlights, and an admitted videoRef or an empty string. Do not invent a price presented as verified fact; provisional fixture or draft values must be reviewable.",
        "You may draft capacity, minimum-order, lead-time, availability, and marketing copy when the intake is incomplete, but state it provisionally and flag consequential assumptions in warnings for human review.",
        "Choose dynamic catalog and media counts. For intended unresolved photography, copy ownerType, ownerKey, and slotKey exactly from allowedMediaDestinations into mediaPlan and leave the destination image reference empty. Product images always use slotKey product_image. Optional no-media fallbacks may be deliberate, but do not infer that mediaPlan must be empty from an example.",
        "Follow compositionGuidance.designProcess in order. Choose objective content needs and commerce shape, then one page template, then one admitted design foundation and compatible section anatomy before choosing component IDs.",
        "Use compositionGuidance.canonicalNormalShowroom exactly for section roles and order: header, hero, about/story, process, products, inquiry call-to-action, footer. Do not add standalone navigation, trust, information, video, or decorative filler sections. Choose any admitted surfaceRole per section; no exact color-role sequence is required.",
        "For unrestricted colors, keep tokenPack as the typography, spacing, geometry, density, and media foundation and add design.customPalette with every color role from the design schema. Use six-digit hex values and readable foreground/background pairs. Omit customPalette only when an admitted palette already fits.",
        "Choose mediaIntegration from compositionGuidance.mediaTreatments by its described visual result and prerequisites, not by component or industry names. natural is the neutral default; surface_blend is the homepage-like full-section treatment; ambient_overlay is legacy-only. Use signature treatments deliberately; several are allowed when the complete preview remains coherent.",
        "Use each component's renderedAnatomy, idealWhen, avoidWhen, content limits, and compatibleMediaIntegrations. Do not infer visual behavior from the component ID and do not choose a component whose renderer anatomy contradicts the available content or media.",
        "Choose header and footer independently by their rendered anatomy and available content. Do not default to one familiar pair, and do not infer suitability from an industry; the footer does not need to mirror the header.",
        "Choose design.productDetailPattern from compositionGuidance.productDetailPatterns by layout, media behavior, density, and content fit. Do not infer the choice from an industry label.",
        "Keep adjacent about/story and process sections compositionally distinct through alignment, density, media, typography, or surface contrast. Avoid plaid, pinstripes, graph-paper grids, and repeated straight divider motifs.",
        "Catalog filters are the only category-browsing owner in a normal showroom. Keep hero factual media free of product-link overlays.",
        "Before returning JSON, evaluate the complete design against the composition rules: exact canonical role order, useful catalog controls only, no repeated adjacent anatomy, deliberate but freely chosen semantic surfaces and media treatments, compatible media prerequisites, and an appropriate catalog density.",
        "Declare every intentionally removed stable key.",
      ],
      examplePolicy: {
        purpose: "synthetic_structural_reference",
        importable: false,
        copyOnly: "JSON shape and contract patterns",
        replaceFromClientBrief: [
          "all content values and counts",
          "all relationship and block keys",
          "all source and media keys",
          "the token pack, components, and properties",
        ],
      },
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
    for (const field of ["logoRef", "heroImageRef", "faviconRef", "processVideoRef"]) {
      business[field] = replace(business[field]);
    }
  }
  if (Array.isArray(content?.products)) {
    for (const product of content.products as Array<Record<string, unknown>>) {
      product.imageRef = replace(product.imageRef);
      product.videoRef = replace(product.videoRef);
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
  if (Array.isArray(parsed.mediaPlan)) {
    for (const slot of parsed.mediaPlan as Array<Record<string, unknown>>) {
      if (slot.ownerType === "product") {
        slot.ownerKey = replaceKey(slot.ownerKey);
      }
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
      warningCount:
        validated.recipe.warnings.length + validated.recipe.questions.length,
      mediaPlan: validated.recipe.mediaPlan,
      fitness: evaluateCompositionFitness(validated.snapshot),
    },
  );
  return { ...validated, duplicate: saved.duplicate };
}
