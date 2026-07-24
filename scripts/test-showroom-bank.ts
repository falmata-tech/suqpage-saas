import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SHOWROOM_BANK_BASE_COMBINATION_FLOOR,
  SHOWROOM_BANK_COMPONENT_SEEDS,
  SHOWROOM_COMPONENT_BANK,
} from "../lib/showroom-bank-release";
import { SHOWROOM_BANK_TOKEN_STYLES } from "../components/showroom/bank/tokens";
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

assert.equal(SHOWROOM_COMPONENT_BANK.release, "showroom-bank@1.0.0");
assert.equal(SHOWROOM_COMPONENT_BANK.components.length, 42);
assert.ok(SHOWROOM_COMPONENT_BANK.tokenPacks.length >= 12);
assert.ok(SHOWROOM_BANK_BASE_COMBINATION_FLOOR >= 10_000);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components[0]), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.components[0].bindings), true);
assert.equal(Object.isFrozen(SHOWROOM_COMPONENT_BANK.tokenPacks), true);

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
const componentIds = SHOWROOM_COMPONENT_BANK.components.map(
  (component) => component.id,
);
assert.deepEqual(
  [...registryIds].sort(),
  [...componentIds].sort(),
  "bank definitions and static registry must have exact parity",
);
assert.equal(new Set(registryIds).size, registryIds.length);

const tokenIds = SHOWROOM_COMPONENT_BANK.tokenPacks.map((token) => token.id);
assert.deepEqual(
  Object.keys(SHOWROOM_BANK_TOKEN_STYLES).sort(),
  [...tokenIds].sort(),
  "token metadata and scoped styles must have exact parity",
);
for (const token of Object.values(SHOWROOM_BANK_TOKEN_STYLES)) {
  for (const variable of [
    "--bank-bg",
    "--bank-surface",
    "--bank-ink",
    "--bank-muted",
    "--bank-accent",
    "--bank-accent-soft",
    "--bank-line",
    "--bank-radius",
    "--bank-display",
  ]) {
    assert.equal(
      typeof (token.variables as Record<string, string>)[variable],
      "string",
    );
  }
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

const combinedDescriptions = [
  ...SHOWROOM_COMPONENT_BANK.components.map((entry) => entry.description),
  ...SHOWROOM_COMPONENT_BANK.tokenPacks.map((entry) => entry.description),
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
assert.match(shellSource, /href="\/dashboard\/design-bank"/);
assert.match(shellSource, /hasCapability\(user, "design-bank:view"\)/);

console.log(
  `Showroom bank ${SHOWROOM_COMPONENT_BANK.release} admitted: ` +
    `${SHOWROOM_COMPONENT_BANK.components.length} components, ` +
    `${SHOWROOM_COMPONENT_BANK.tokenPacks.length} token systems, ` +
    `${SHOWROOM_BANK_BASE_COMBINATION_FLOOR} base combinations.`,
);
