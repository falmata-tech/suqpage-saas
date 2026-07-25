import {
  MAX_REVISION_BYTES,
  RevisionError,
  parseRevisionContent,
  type RevisionBusiness,
  type RevisionCategory,
  type RevisionCollection,
  type RevisionProduct,
} from "./revision-domain";
import {
  parseShowroomDesignProposalV2,
  type ShowroomComponentBankV2,
  type ShowroomDesignProposalV2,
} from "./showroom-composition-v2";
import {
  parseShowroomContentBlocks,
  type ShowroomContentBlocksDocument,
} from "./showroom-content-blocks";

export const REVISION_SCHEMA_VERSION_V4 = 4;

export type RevisionSnapshotV4 = {
  schemaVersion: 4;
  business: RevisionBusiness;
  collections: RevisionCollection[];
  categories: RevisionCategory[];
  products: RevisionProduct[];
  contentBlocks: ShowroomContentBlocksDocument;
  designManifest: ShowroomDesignProposalV2;
};

function inputRecord(input: unknown): Record<string, unknown> {
  let serialized: string;
  try {
    serialized = typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    throw new RevisionError("The revision data is invalid.");
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_REVISION_BYTES) {
    throw new RevisionError("The revision is larger than 1 MiB.", 413);
  }
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new RevisionError("The revision data is invalid.");
  }
}

export function parseRevisionSnapshotV4(
  input: unknown,
  bank: ShowroomComponentBankV2,
): RevisionSnapshotV4 {
  const raw = inputRecord(input);
  const allowed = [
    "schemaVersion",
    "business",
    "collections",
    "categories",
    "products",
    "contentBlocks",
    "designManifest",
  ];
  if (
    raw.schemaVersion !== REVISION_SCHEMA_VERSION_V4 ||
    Object.keys(raw).some((key) => !allowed.includes(key))
  ) {
    throw new RevisionError("The revision-v4 schema is invalid.");
  }
  const content = parseRevisionContent(raw, REVISION_SCHEMA_VERSION_V4);
  let contentBlocks: ShowroomContentBlocksDocument;
  let designManifest: ShowroomDesignProposalV2;
  try {
    contentBlocks = parseShowroomContentBlocks(raw.contentBlocks, "managed");
    designManifest = parseShowroomDesignProposalV2(
      raw.designManifest,
      bank,
      contentBlocks,
    );
  } catch (error) {
    throw new RevisionError(
      error instanceof Error ? error.message : "The revision-v4 composition is invalid.",
    );
  }
  return {
    schemaVersion: REVISION_SCHEMA_VERSION_V4,
    ...content,
    contentBlocks,
    designManifest,
  };
}

export function requireRevisionSnapshotV4(
  input: unknown,
  bank: ShowroomComponentBankV2,
): RevisionSnapshotV4 {
  return parseRevisionSnapshotV4(input, bank);
}
