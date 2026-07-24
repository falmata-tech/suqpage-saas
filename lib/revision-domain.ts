import {
  isLegacyShowroomDesignKey,
  parsePublishedDesignManifest,
  resolveDesignManifest,
} from "./showroom-manifests";
import type { ShowroomDesignProposal } from "./showroom-composition";
import type { Business, Catalog, Category, Collection, Product } from "./types";

export const REVISION_SCHEMA_VERSION = 3;
export const MAX_REVISION_BYTES = 1024 * 1024;

const availability = new Set([
  "available",
  "limited",
  "unavailable",
  "coming_soon",
]);
const keyPattern = /^[A-Za-z0-9_-]{1,80}$/;
const imagePattern =
  /^(?:\/uploads\/seed\/[A-Za-z0-9._/-]+|\/media\/[A-Za-z0-9.-]+|request-attachment:\d+)?$/;
const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export type RevisionBusiness = {
  name: string;
  designKey: string;
  tagline: string;
  description: string;
  logoRef: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageRef: string;
  contactEmail: string;
  whatsapp: string;
  telegram: string;
  tiktok: string;
  siteTitle: string;
  siteDescription: string;
  faviconRef: string;
};

export type RevisionCollection = {
  key: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
};

export type RevisionCategory = {
  key: string;
  collectionKey: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

export type RevisionOptionGroup = { name: string; values: string[] };

export type RevisionProduct = {
  key: string;
  collectionKey: string | null;
  categoryKey: string | null;
  name: string;
  slug: string;
  eyebrow: string;
  description: string;
  imageRef: string;
  availability: Product["availability"];
  published: boolean;
  sortOrder: number;
  optionGroups: RevisionOptionGroup[];
};

type RevisionContent = {
  business: RevisionBusiness;
  collections: RevisionCollection[];
  categories: RevisionCategory[];
  products: RevisionProduct[];
};

export type RevisionSnapshotV1 = RevisionContent & {
  schemaVersion: 1;
};

export type RevisionSnapshotV2 = RevisionContent & {
  schemaVersion: 2;
  designManifest: ShowroomDesignProposal;
};

export type RevisionSnapshotV3 = RevisionContent & {
  schemaVersion: 3;
  designManifest: ShowroomDesignProposal;
};

export type RevisionSnapshot =
  | RevisionSnapshotV1
  | RevisionSnapshotV2
  | RevisionSnapshotV3;

export class RevisionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const clean = (value: unknown, max: number) =>
  String(value ?? "").trim().replace(controlPattern, "").slice(0, max);

const integer = (value: unknown, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new RevisionError("A revision number is outside its allowed range.");
  }
  return parsed;
};

const slug = (value: unknown, name: string) =>
  clean(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") ||
  clean(name, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const key = (value: unknown) => {
  const result = clean(value, 80);
  if (!keyPattern.test(result)) {
    throw new RevisionError("A revision item key is invalid.");
  }
  return result;
};

const image = (value: unknown) => {
  const result = clean(value, 300);
  if (!imagePattern.test(result) || result.includes("..")) {
    throw new RevisionError("A revision image reference is invalid.");
  }
  return result;
};

function onlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string,
) {
  if (Object.keys(value).some((entry) => !allowed.includes(entry))) {
    throw new RevisionError(`${label} contains an unsupported field.`);
  }
}

export function parseRevisionContent(
  raw: Record<string, unknown>,
  schemaVersion: 1 | 2 | 3 | 4,
): RevisionContent {
  if (typeof raw.business !== "object" || !raw.business) {
    throw new RevisionError("The revision schema is invalid.");
  }
  const sourceBusiness = raw.business as Record<string, unknown>;
  onlyKeys(
    sourceBusiness,
    [
      "name",
      "designKey",
      "tagline",
      "description",
      "logoRef",
      "heroTitle",
      "heroSubtitle",
      "heroImageRef",
      "contactEmail",
      "whatsapp",
      "telegram",
      "tiktok",
      "siteTitle",
      "siteDescription",
      "faviconRef",
    ],
    "Revision business",
  );
  const designKey = clean(sourceBusiness.designKey, 40);
  if (
    (schemaVersion === 1 && !isLegacyShowroomDesignKey(designKey)) ||
    (schemaVersion !== 1 && designKey !== "composition")
  ) {
    throw new RevisionError(
      schemaVersion === 1
        ? "The legacy showroom design is not supported."
        : "Composed revisions must use the composition renderer.",
    );
  }
  const name = clean(sourceBusiness.name, 100);
  if (!name) throw new RevisionError("Business name is required.");
  const business: RevisionBusiness = {
    name,
    designKey,
    tagline: clean(sourceBusiness.tagline, 180),
    description: clean(sourceBusiness.description, 1200),
    logoRef: image(sourceBusiness.logoRef),
    heroTitle: clean(sourceBusiness.heroTitle, 180),
    heroSubtitle: clean(sourceBusiness.heroSubtitle, 300),
    heroImageRef: image(sourceBusiness.heroImageRef),
    contactEmail: clean(sourceBusiness.contactEmail, 160),
    whatsapp: clean(sourceBusiness.whatsapp, 40).replace(/\D/g, ""),
    telegram: clean(sourceBusiness.telegram, 80).replace(/^@/, ""),
    tiktok: clean(sourceBusiness.tiktok, 80).replace(/^@/, ""),
    siteTitle: clean(sourceBusiness.siteTitle, 120),
    siteDescription: clean(sourceBusiness.siteDescription, 240),
    faviconRef: image(sourceBusiness.faviconRef),
  };
  if (
    business.contactEmail &&
    !/^\S+@\S+\.\S+$/.test(business.contactEmail)
  ) {
    throw new RevisionError("Enter a valid notification email.");
  }

  const rawCollections = Array.isArray(raw.collections) ? raw.collections : [];
  const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];
  const rawProducts = Array.isArray(raw.products) ? raw.products : [];
  if (
    rawCollections.length > 100 ||
    rawCategories.length > 200 ||
    rawProducts.length > 500
  ) {
    throw new RevisionError("The revision exceeds catalog item limits.", 413);
  }

  const collections = rawCollections.map((item) => {
    const value = item as Record<string, unknown>;
    onlyKeys(
      value,
      ["key", "name", "slug", "description", "sortOrder", "active"],
      "Revision collection",
    );
    const itemName = clean(value.name, 100);
    if (!itemName) throw new RevisionError("Every collection needs a name.");
    return {
      key: key(value.key),
      name: itemName,
      slug: slug(value.slug, itemName),
      description: clean(value.description, 500),
      sortOrder: integer(value.sortOrder, -100000, 100000),
      active: Boolean(value.active),
    };
  });
  const collectionKeys = new Set(collections.map((item) => item.key));
  if (
    collectionKeys.size !== collections.length ||
    new Set(collections.map((item) => item.slug)).size !== collections.length
  ) {
    throw new RevisionError("Collection keys and slugs must be unique.");
  }

  const categories = rawCategories.map((item) => {
    const value = item as Record<string, unknown>;
    onlyKeys(
      value,
      ["key", "collectionKey", "name", "slug", "sortOrder", "active"],
      "Revision category",
    );
    const itemName = clean(value.name, 100);
    if (!itemName) throw new RevisionError("Every category needs a name.");
    const collectionKey = value.collectionKey ? key(value.collectionKey) : null;
    if (collectionKey && !collectionKeys.has(collectionKey)) {
      throw new RevisionError("A category references a missing collection.");
    }
    return {
      key: key(value.key),
      collectionKey,
      name: itemName,
      slug: slug(value.slug, itemName),
      sortOrder: integer(value.sortOrder, -100000, 100000),
      active: Boolean(value.active),
    };
  });
  const categoryKeys = new Set(categories.map((item) => item.key));
  if (
    categoryKeys.size !== categories.length ||
    new Set(categories.map((item) => item.slug)).size !== categories.length
  ) {
    throw new RevisionError("Category keys and slugs must be unique.");
  }

  const products = rawProducts.map((item) => {
    const value = item as Record<string, unknown>;
    onlyKeys(
      value,
      [
        "key",
        "collectionKey",
        "categoryKey",
        "name",
        "slug",
        "eyebrow",
        "description",
        "imageRef",
        "availability",
        "published",
        "sortOrder",
        "optionGroups",
        ...(schemaVersion < 3 ? ["stockCount"] : []),
      ],
      "Revision product",
    );
    const itemName = clean(value.name, 140);
    if (!itemName) throw new RevisionError("Every product needs a name.");
    const collectionKey = value.collectionKey ? key(value.collectionKey) : null;
    const categoryKey = value.categoryKey ? key(value.categoryKey) : null;
    if (collectionKey && !collectionKeys.has(collectionKey)) {
      throw new RevisionError("A product references a missing collection.");
    }
    if (categoryKey && !categoryKeys.has(categoryKey)) {
      throw new RevisionError("A product references a missing category.");
    }
    const rawGroups = Array.isArray(value.optionGroups)
      ? value.optionGroups
      : [];
    if (rawGroups.length > 4) {
      throw new RevisionError("A product may have at most four option groups.");
    }
    const optionGroups = rawGroups.map((group) => {
      const source = group as Record<string, unknown>;
      onlyKeys(source, ["name", "values"], "Revision option group");
      const groupName = clean(source.name, 80);
      const values = Array.isArray(source.values)
        ? [
            ...new Set(
              source.values.map((entry) => clean(entry, 100)).filter(Boolean),
            ),
          ]
        : [];
      if (!groupName || !values.length || values.length > 50) {
        throw new RevisionError(
          "Each option group needs a name and 1–50 values.",
        );
      }
      return { name: groupName, values };
    });
    const productAvailability = clean(
      value.availability,
      30,
    ) as Product["availability"];
    if (!availability.has(productAvailability)) {
      throw new RevisionError("Choose a valid product availability.");
    }
    if (schemaVersion < 3 && value.stockCount !== undefined) {
      integer(value.stockCount, 0, 100000);
    }
    return {
      key: key(value.key),
      collectionKey,
      categoryKey,
      name: itemName,
      slug: slug(value.slug, itemName),
      eyebrow: clean(value.eyebrow, 100),
      description: clean(value.description, 3000),
      imageRef: image(value.imageRef),
      availability: productAvailability,
      published: Boolean(value.published),
      sortOrder: integer(value.sortOrder, -100000, 100000),
      optionGroups,
    };
  });
  if (
    new Set(products.map((item) => item.key)).size !== products.length ||
    new Set(products.map((item) => item.slug)).size !== products.length
  ) {
    throw new RevisionError("Product keys and slugs must be unique.");
  }

  return { business, collections, categories, products };
}

export function parseRevisionSnapshot(input: unknown): RevisionSnapshot {
  let serialized: string;
  try {
    serialized = typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    throw new RevisionError("The revision data is invalid.");
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_REVISION_BYTES) {
    throw new RevisionError("The revision is larger than 1 MiB.", 413);
  }
  let raw: Record<string, unknown>;
  try {
    raw = (typeof input === "string" ? JSON.parse(input) : input) as Record<
      string,
      unknown
    >;
  } catch {
    throw new RevisionError("The revision data is invalid.");
  }
  if (
    !raw ||
    (raw.schemaVersion !== 1 &&
      raw.schemaVersion !== 2 &&
      raw.schemaVersion !== 3)
  ) {
    throw new RevisionError("The revision schema is invalid.");
  }
  const schemaVersion = raw.schemaVersion;
  onlyKeys(
    raw,
    schemaVersion === 1
      ? ["schemaVersion", "business", "collections", "categories", "products"]
      : [
          "schemaVersion",
          "business",
          "designManifest",
          "collections",
          "categories",
          "products",
        ],
    "Revision snapshot",
  );
  const content = parseRevisionContent(raw, schemaVersion);
  if (schemaVersion === 1) {
    return { schemaVersion: 1, ...content };
  }
  let designManifest: ShowroomDesignProposal;
  try {
    designManifest = parsePublishedDesignManifest(raw.designManifest);
  } catch {
    throw new RevisionError("The revision design manifest is invalid.");
  }
  return {
    schemaVersion,
    ...content,
    designManifest,
  };
}

export function upgradeRevisionSnapshotToV2(
  snapshotInput: unknown,
): RevisionSnapshotV2 {
  const snapshot = parseRevisionSnapshot(snapshotInput);
  if (snapshot.schemaVersion === 2) return snapshot;
  const designManifest =
    snapshot.schemaVersion === 3
      ? snapshot.designManifest
      : resolveDesignManifest(snapshot.business.designKey);
  return parseRevisionSnapshot({
    ...snapshot,
    schemaVersion: 2,
    business: { ...snapshot.business, designKey: "composition" },
    designManifest,
  }) as RevisionSnapshotV2;
}

export function requireRevisionSnapshotV2(input: unknown): RevisionSnapshotV2 {
  const snapshot = parseRevisionSnapshot(input);
  if (snapshot.schemaVersion !== 2) {
    throw new RevisionError("New revision writes require schema version 2.");
  }
  return snapshot;
}

export function upgradeRevisionSnapshotToV3(
  snapshotInput: unknown,
): RevisionSnapshotV3 {
  const snapshot = parseRevisionSnapshot(snapshotInput);
  if (snapshot.schemaVersion === 3) return snapshot;
  const designManifest =
    snapshot.schemaVersion === 2
      ? snapshot.designManifest
      : resolveDesignManifest(snapshot.business.designKey);
  return parseRevisionSnapshot({
    ...snapshot,
    schemaVersion: 3,
    business: { ...snapshot.business, designKey: "composition" },
    designManifest,
  }) as RevisionSnapshotV3;
}

export function requireRevisionSnapshotV3(input: unknown): RevisionSnapshotV3 {
  const snapshot = parseRevisionSnapshot(input);
  if (snapshot.schemaVersion !== 3) {
    throw new RevisionError("New revision writes require schema version 3.");
  }
  return snapshot;
}

export function catalogToRevisionSnapshot(catalog: Catalog): RevisionSnapshotV3 {
  const collectionKey = (id: number) => `collection-${id}`;
  const categoryKey = (id: number) => `category-${id}`;
  let storedManifest: unknown;
  if (catalog.business.design_key === "composition") {
    try {
      storedManifest = JSON.parse(catalog.business.design_manifest_json);
    } catch {
      throw new RevisionError("The live showroom design manifest is invalid.");
    }
  }
  let designManifest: ShowroomDesignProposal;
  try {
    designManifest = resolveDesignManifest(
      catalog.business.design_key,
      storedManifest,
    );
  } catch {
    throw new RevisionError("The live showroom design manifest is invalid.");
  }
  return parseRevisionSnapshot({
    schemaVersion: REVISION_SCHEMA_VERSION,
    business: {
      name: catalog.business.name,
      designKey: "composition",
      tagline: catalog.business.tagline,
      description: catalog.business.description,
      logoRef: catalog.business.logo_path,
      heroTitle: catalog.business.hero_title,
      heroSubtitle: catalog.business.hero_subtitle,
      heroImageRef: catalog.business.hero_image_path,
      contactEmail: catalog.business.contact_email,
      whatsapp: catalog.business.whatsapp,
      telegram: catalog.business.telegram,
      tiktok: catalog.business.tiktok,
      siteTitle: catalog.business.site_title,
      siteDescription: catalog.business.site_description,
      faviconRef: catalog.business.favicon_path,
    },
    designManifest,
    collections: catalog.collections.map((item) => ({
      key: collectionKey(item.id),
      name: item.name,
      slug: item.slug,
      description: item.description,
      sortOrder: item.sort_order,
      active: Boolean(item.is_active),
    })),
    categories: catalog.categories.map((item) => ({
      key: categoryKey(item.id),
      collectionKey: item.collection_id
        ? collectionKey(item.collection_id)
        : null,
      name: item.name,
      slug: item.slug,
      sortOrder: item.sort_order,
      active: Boolean(item.is_active),
    })),
    products: catalog.products.map((item) => ({
      key: `product-${item.id}`,
      collectionKey: item.collection_id
        ? collectionKey(item.collection_id)
        : null,
      categoryKey: item.category_id ? categoryKey(item.category_id) : null,
      name: item.name,
      slug: item.slug,
      eyebrow: item.eyebrow,
      description: item.description,
      imageRef: item.image_path,
      availability: item.availability,
      published: Boolean(item.is_published),
      sortOrder: item.sort_order,
      optionGroups: (item.option_groups || []).map((group) => ({
        name: group.name,
        values: group.values.map((entry) => entry.value),
      })),
    })),
  }) as RevisionSnapshotV3;
}

export function snapshotToCatalog(
  snapshotInput: RevisionSnapshot,
  business: Business,
  resolveImage = (value: string) => value,
): Catalog {
  const snapshot =
    snapshotInput.schemaVersion === 3
      ? snapshotInput
      : upgradeRevisionSnapshotToV3(snapshotInput);
  const collectionIds = new Map(
    snapshot.collections.map((item, index) => [item.key, index + 1]),
  );
  const categoryIds = new Map(
    snapshot.categories.map((item, index) => [item.key, index + 1]),
  );
  const collections: Collection[] = snapshot.collections.map((item, index) => ({
    id: index + 1,
    business_id: business.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    sort_order: item.sortOrder,
    is_active: item.active ? 1 : 0,
  }));
  const categories: Category[] = snapshot.categories.map((item, index) => ({
    id: index + 1,
    business_id: business.id,
    collection_id: item.collectionKey
      ? collectionIds.get(item.collectionKey) || null
      : null,
    name: item.name,
    slug: item.slug,
    sort_order: item.sortOrder,
    is_active: item.active ? 1 : 0,
  }));
  const products: Product[] = snapshot.products.map((item, index) => ({
    id: index + 1,
    business_id: business.id,
    collection_id: item.collectionKey
      ? collectionIds.get(item.collectionKey) || null
      : null,
    category_id: item.categoryKey
      ? categoryIds.get(item.categoryKey) || null
      : null,
    name: item.name,
    slug: item.slug,
    eyebrow: item.eyebrow,
    description: item.description,
    image_path: resolveImage(item.imageRef),
    availability: item.availability,
    is_published: item.published ? 1 : 0,
    sort_order: item.sortOrder,
    collection_name: item.collectionKey
      ? snapshot.collections.find((entry) => entry.key === item.collectionKey)
          ?.name
      : undefined,
    category_name: item.categoryKey
      ? snapshot.categories.find((entry) => entry.key === item.categoryKey)?.name
      : undefined,
    option_groups: item.optionGroups.map((group, groupIndex) => ({
      id: groupIndex + 1,
      product_id: index + 1,
      name: group.name,
      position: groupIndex,
      values: group.values.map((value, valueIndex) => ({
        id: valueIndex + 1,
        option_group_id: groupIndex + 1,
        value,
      })),
    })),
  }));
  return {
    business: {
      ...business,
      name: snapshot.business.name,
      design_key: "composition",
      design_manifest_json: JSON.stringify(snapshot.designManifest),
      tagline: snapshot.business.tagline,
      description: snapshot.business.description,
      logo_path: resolveImage(snapshot.business.logoRef),
      hero_title: snapshot.business.heroTitle,
      hero_subtitle: snapshot.business.heroSubtitle,
      hero_image_path: resolveImage(snapshot.business.heroImageRef),
      contact_email: snapshot.business.contactEmail,
      whatsapp: snapshot.business.whatsapp,
      telegram: snapshot.business.telegram,
      tiktok: snapshot.business.tiktok,
      site_title: snapshot.business.siteTitle,
      site_description: snapshot.business.siteDescription,
      favicon_path: resolveImage(snapshot.business.faviconRef),
    },
    collections,
    categories,
    products,
  };
}
