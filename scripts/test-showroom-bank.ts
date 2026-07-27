import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SHOWROOM_BANK_BASE_COMBINATION_FLOOR,
  SHOWROOM_BANK_1_2_COMBINATION_FLOOR,
  SHOWROOM_BANK_COMPONENT_SEEDS,
  SHOWROOM_COMPONENT_BANK,
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
} from "../lib/showroom-bank-release";
import { SHOWROOM_BANK_TOKEN_STYLES } from "../components/showroom/bank/tokens";
import { SHOWROOM_DESIGN_SYSTEMS } from "../lib/showroom-design-systems";
import { SHOWROOM_SLOTS, type ShowroomSlot } from "../lib/showroom-composition";

const minimumCoverage: Record<ShowroomSlot, number> = {
  header: 5,
  hero: 8,
  navigation: 4,
  content: 6,
  catalog: 6,
  trust: 5,
  call_to_action: 4,
  footer: 4,
};

assert.equal(SHOWROOM_COMPONENT_BANK.release, "showroom-bank@1.1.0");
assert.equal(SHOWROOM_COMPONENT_BANK.components.length, 42);
assert.ok(SHOWROOM_COMPONENT_BANK.tokenPacks.length >= 12);
assert.ok(SHOWROOM_BANK_BASE_COMBINATION_FLOOR >= 10_000);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components[0]), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components[0].bindings), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.tokenPacks), true);
assert.equal(SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release, "showroom-bank@1.2.0");
assert.ok(SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.length >= 66);
assert.ok(SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.length >= 18);
assert.ok(SHOWROOM_BANK_1_2_COMBINATION_FLOOR >= 90_000);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE), true);

for (const retained of SHOWROOM_COMPONENT_BANK.components) {
  const candidate = SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.find(
    (component) => component.id === retained.id,
  );
  assert.ok(candidate, `${retained.id} must remain in bank 1.2`);
  const { acceptedContentTypes: _, contentMediaSlots: __, ...retainedContract } = candidate;
  assert.deepEqual(
    retainedContract,
    retained,
    `${retained.id} must retain its exact bank-1.1 contract`,
  );
}

for (const component of SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.slice(
  SHOWROOM_COMPONENT_BANK.components.length,
)) {
  assert.ok(component.properties.some((property) => property.key === "reveal_style"));
  assert.ok(component.properties.some((property) => property.key === "interaction_style"));
}
const film = SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.find(
  (component) => component.id === "content.controlled-film@1",
);
assert.deepEqual(film?.acceptedContentTypes, ["video"]);
assert.deepEqual(film?.contentMediaSlots[0]?.acceptedKinds, ["video"]);

for (const slot of SHOWROOM_SLOTS) {
  const definitions = SHOWROOM_COMPONENT_BANK.components.filter(
    (component) => component.slot === slot,
  );
  assert.ok(
    definitions.length >= minimumCoverage[slot],
    `${slot} must meet its coverage minimum`,
  );
  assert.equal(
    definitions.length,
    SHOWROOM_BANK_COMPONENT_SEEDS[slot].length,
    `${slot} seeds and parsed definitions must have exact parity`,
  );
}

for (const component of SHOWROOM_COMPONENT_BANK.components) {
  assert.ok(
    fs.existsSync(path.join(process.cwd(), component.codeReference)),
    `${component.id} must point to reviewed repository code`,
  );
  assert.ok(component.description.length >= 40);
}

for (const component of SHOWROOM_COMPONENT_BANK.components.filter(
  (entry) => entry.slot === "catalog",
)) {
  assert.ok(component.providesCapabilities.includes("product_detail"));
  assert.ok(component.providesCapabilities.includes("add_to_inquiry"));
  assert.ok(component.providesCapabilities.includes("catalog_search"));
  assert.ok(component.providesCapabilities.includes("category_filter"));
}

for (const component of SHOWROOM_COMPONENT_BANK.components.filter(
  (entry) => entry.slot === "header",
)) {
  assert.ok(component.providesCapabilities.includes("inquiry_cart_trigger"));
}

const registrySource = fs.readFileSync(
  "components/showroom/bank/registry.tsx",
  "utf8",
);
const registryIds = [
  ...registrySource.matchAll(/^\s+"([^"]+@[1-9][0-9]*)": Bank[A-Za-z]+Section,/gm),
].map((match) => match[1]);
const componentIds = SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.map(
  (component) => component.id,
);
assert.deepEqual(
  [...registryIds].sort(),
  [...componentIds].sort(),
  "bank definitions and static registry must have exact parity",
);
assert.equal(new Set(registryIds).size, registryIds.length);

const tokenIds = SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.map((token) => token.id);
assert.deepEqual(
  Object.keys(SHOWROOM_BANK_TOKEN_STYLES).sort(),
  [...tokenIds].sort(),
  "token metadata and scoped styles must have exact parity",
);
assert.deepEqual(
  Object.keys(SHOWROOM_DESIGN_SYSTEMS).sort(),
  [...tokenIds].sort(),
  "every admitted token pack needs machine-readable design-system guidance",
);
const channels = (hex: string) =>
  [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((value) =>
    Number.parseInt(value, 16),
  );
const luminance = (hex: string) => {
  const values = channels(hex).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
};
const contrast = (first: string, second: string) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
for (const system of Object.values(SHOWROOM_DESIGN_SYSTEMS)) {
  assert.ok(contrast(system.colors.text, system.colors.canvas) >= 4.5);
  assert.ok(contrast(system.colors.text, system.colors.surface) >= 4.5);
  assert.ok(
    contrast(system.colors.onSecondary, system.colors.secondary) >= 4.5,
    `${system.id} secondary control contrast`,
  );
  const primary = channels(system.colors.primary);
  const secondary = channels(system.colors.secondary);
  const colorDistance = Math.sqrt(
    primary.reduce(
      (total, value, index) => total + (value - secondary[index]) ** 2,
      0,
    ),
  );
  assert.ok(colorDistance >= 60, `${system.id} needs a distinct secondary family`);
  assert.ok(system.shape.radius <= 8);
  assert.equal(system.layout.containerMax, 1200);
  assert.equal(system.media.productAspect, "4:3");
  assert.equal(system.media.maxProductColumns, 3);
  assert.ok(system.media.allowedHeroIntegrations.length >= 4);
  assert.ok(
    system.media.allowedHeroIntegrations.includes(
      system.media.preferredHeroIntegration,
    ),
  );
}
for (const token of Object.values(SHOWROOM_BANK_TOKEN_STYLES)) {
  for (const variable of [
    "--bank-bg",
    "--bank-surface",
    "--bank-ink",
    "--bank-muted",
    "--bank-accent",
    "--bank-accent-soft",
    "--bank-secondary",
    "--bank-secondary-soft",
    "--bank-on-secondary",
    "--bank-section-alt",
    "--bank-section-strong",
    "--bank-line",
    "--bank-radius",
    "--bank-display",
    "--bank-motion-duration",
    "--bank-motion-distance",
    "--bank-motion-ease",
    "--bank-decoration-size",
  ]) {
    assert.equal(
      typeof (token.variables as Record<string, string>)[variable],
      "string",
    );
  }
  assert.ok(
    Number.parseFloat(
      (token.variables as Record<string, string>)["--bank-radius"],
    ) <= 8,
  );
}

const componentSources = [
  "components/showroom/bank/sections.tsx",
  "components/showroom/bank/registry.tsx",
  "components/showroom/bank/tokens.ts",
].map((file) => fs.readFileSync(file, "utf8"));
const componentSource = componentSources.join("\n");
for (const [category, pattern] of [
  ["database import", /(?:from|import)\s*\(?["'][^"']*(?:\/db|node:sqlite)/],
  ["network fetch", /\bfetch\s*\(/],
  ["dynamic import", /\bimport\s*\(/],
  ["document mutation", /\bdocument\./],
  ["window mutation", /\bwindow\./],
  ["raw markup", /dangerouslySetInnerHTML/],
] as const) {
  assert.doesNotMatch(componentSource, pattern, `bank components cannot use ${category}`);
}

const cssSource = fs.readFileSync(
  "components/showroom/bank/bank.module.css",
  "utf8",
);
assert.doesNotMatch(cssSource, /:global/);
assert.doesNotMatch(cssSource, /position\s*:\s*fixed/i);
assert.doesNotMatch(cssSource, /(^|[},\n])\s*(?:html|body|\*)\b/i);
assert.match(cssSource, /\.section\s*\{/);
assert.match(cssSource, /@media \(max-width: 480px\)/);
assert.doesNotMatch(cssSource, /\.heroProducts\b/);
assert.doesNotMatch(cssSource, /border-radius:\s*(?:50%\s+50%|48%\s+48%|40%\s+40%|100px\s+0\s+100px)/);
assert.match(cssSource, /\.hero\[data-media-integration="split_bleed"\]/);
assert.match(cssSource, /\.hero\[data-media-integration="edge_fade"\]/);
assert.match(cssSource, /\.hero\[data-media-integration="ambient_overlay"\]/);
assert.match(cssSource, /\.hero\[data-media-integration="editorial_overlap"\]/);
assert.match(cssSource, /\.hero\[data-media-integration="product_stage"\]/);
assert.doesNotMatch(cssSource, /\.storyImage[\s\S]{0,180}border:\s*1px/);
assert.match(
  cssSource,
  /\.catalogFilters button\[aria-pressed="true"\][\s\S]*?background:\s*var\(--bank-secondary\);[\s\S]*?color:\s*var\(--bank-on-secondary\);/,
);
const sectionSource = fs.readFileSync(
  "components/showroom/bank/sections.tsx",
  "utf8",
);
assert.doesNotMatch(sectionSource, /heroProducts|featured\.map/);
assert.doesNotMatch(sectionSource, /product\.name\.slice/);
assert.match(sectionSource, /placeholderTexture/);
assert.match(sectionSource, /href="#showroom-catalog"/);
assert.match(sectionSource, /data-media-integration/);

const combinedDescriptions = [
  ...SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.map((entry) => entry.description),
  ...SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.map((entry) => entry.description),
].join(" ");
for (const industry of [
  "agriculture",
  "coffee",
  "honey",
  "furniture",
  "artisan",
  "manufactur",
  "import",
  "wholesale",
  "beauty",
  "technology",
]) {
  assert.match(
    combinedDescriptions.toLowerCase(),
    new RegExp(industry),
    `bank guidance must cover ${industry}`,
  );
}

const routeSource = fs.readFileSync(
  "app/dashboard/design-bank/page.tsx",
  "utf8",
);
assert.match(routeSource, /hasCapability\(user, "design-bank:view"\)/);
assert.match(routeSource, /redirect\("\/dashboard"\)/);
assert.match(routeSource, /DesignBankLaboratory/);
const shellSource = fs.readFileSync("components/DashboardShell.tsx", "utf8");
assert.match(shellSource, /(?:href=|href:\s*)"\/dashboard\/design-bank"/);
assert.match(shellSource, /hasCapability\(user, "design-bank:view"\)/);

console.log(
  `Showroom bank ${SHOWROOM_COMPONENT_BANK.release} admitted: ` +
    `${SHOWROOM_COMPONENT_BANK.components.length} components, ` +
    `${SHOWROOM_COMPONENT_BANK.tokenPacks.length} token systems, ` +
    `${SHOWROOM_BANK_BASE_COMBINATION_FLOOR} base combinations.`,
);
console.log(
  `Candidate ${SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release}: ` +
    `${SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.length} components, ` +
    `${SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.length} token systems, ` +
    `${SHOWROOM_BANK_1_2_COMBINATION_FLOOR} required-slot combinations.`,
);
