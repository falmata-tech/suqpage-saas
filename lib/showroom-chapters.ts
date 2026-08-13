import type {
  ShowroomContentBlock,
  ShowroomContentBlocksDocument,
} from "./showroom-content-blocks";
import type { ShowroomDesignProposalV2 } from "./showroom-composition-v2";

const DEFAULT_PROCESS_ITEMS = [
  {
    title: "Understand the requirement",
    body: "Review the product, dimensions, finish, quantity, or other supplied needs.",
  },
  {
    title: "Confirm the work",
    body: "Agree on the relevant options, production details, and practical next step.",
  },
  {
    title: "Continue directly",
    body: "Use one inquiry to confirm timing, availability, and follow-up with the business.",
  },
];

function uniqueText(values: string[]) {
  const retained: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const normalized = value.toLocaleLowerCase();
    if (retained.some((entry) => entry.toLocaleLowerCase() === normalized)) continue;
    retained.push(value);
  }
  return retained.join("\n\n").slice(0, 3000);
}

function uniqueItems(
  blocks: Array<Extract<ShowroomContentBlock, { type: "highlights" }>>,
) {
  const seen = new Set<string>();
  return blocks.flatMap((block) => block.items).filter((item) => {
    const key = `${item.title.trim().toLocaleLowerCase()}\u0000${item.body.trim().toLocaleLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

export function canonicalizeShowroomChapters(
  content: ShowroomContentBlocksDocument,
  design: ShowroomDesignProposalV2,
): {
  contentBlocks: ShowroomContentBlocksDocument;
  designManifest: ShowroomDesignProposalV2;
} {
  const stories = content.blocks.filter(
    (block): block is Extract<ShowroomContentBlock, { type: "story" }> =>
      block.type === "story",
  );
  const highlights = content.blocks.filter(
    (block): block is Extract<ShowroomContentBlock, { type: "highlights" }> =>
      block.type === "highlights",
  );
  if (!stories.length && highlights.length <= 1) {
    return { contentBlocks: content, designManifest: design };
  }

  const targetSource = highlights[0] || stories[0];
  if (!targetSource) return { contentBlocks: content, designManifest: design };
  const retainedItems = uniqueItems(highlights);
  const targetKey = targetSource.key;
  const target: Extract<ShowroomContentBlock, { type: "highlights" }> = {
    key: targetKey,
    type: "highlights",
    kicker: targetSource.kicker,
    title: targetSource.title,
    body: uniqueText([
      ...stories.map((block) => block.body),
      ...highlights.map((block) => block.body),
    ]),
    media:
      highlights.find((block) => block.media.length)?.media ||
      stories.find((block) => block.media.length)?.media ||
      [],
    items: retainedItems.length ? retainedItems : DEFAULT_PROCESS_ITEMS,
  };
  const supersededKeys = new Set([
    ...stories.map((block) => block.key),
    ...highlights.map((block) => block.key),
  ]);
  supersededKeys.delete(targetKey);

  return {
    contentBlocks: {
      schemaVersion: 1,
      blocks: content.blocks
        .filter((block) => !supersededKeys.has(block.key))
        .map((block) => block.key === targetKey ? target : { ...block }),
    },
    designManifest: {
      ...design,
      sections: design.sections
        .filter((section) => !section.contentBlockKey || !supersededKeys.has(section.contentBlockKey))
        .map((section) => ({ ...section })),
    },
  };
}
