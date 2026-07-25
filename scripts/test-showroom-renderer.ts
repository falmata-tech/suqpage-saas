import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SHOWROOM_COMPONENT_BANK,
  SHOWROOM_COMPONENT_BANK_1_1,
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
  listShowroomComponentBanks,
  resolveShowroomComponentBank,
} from "../lib/showroom-bank-release";
import {
  LEGACY_SHOWROOM_DESIGN_KEYS,
  curatedManifestForLegacyDesign,
  parsePublishedDesignManifest,
} from "../lib/showroom-manifests";

const source = fs.readFileSync(
  path.join(process.cwd(), "components/showroom/bank/CompositionShowroom.tsx"),
  "utf8",
);
const appSource = fs.readFileSync(
  path.join(process.cwd(), "components/showroom/ShowroomApp.tsx"),
  "utf8",
);
const registrySource = fs.readFileSync(
  path.join(process.cwd(), "components/showroom/bank/registry.tsx"),
  "utf8",
);

assert.equal(SHOWROOM_COMPONENT_BANK, SHOWROOM_COMPONENT_BANK_1_1);
assert.equal(resolveShowroomComponentBank("showroom-bank@1.1.0"), SHOWROOM_COMPONENT_BANK_1_1);
assert.equal(
  resolveShowroomComponentBank("showroom-bank@1.2.0").release,
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.release,
);
assert.deepEqual(
  listShowroomComponentBanks().map((bank) => bank.release),
  ["showroom-bank@1.1.0", "showroom-bank@1.2.0"],
);

for (const designKey of LEGACY_SHOWROOM_DESIGN_KEYS) {
  const manifest = curatedManifestForLegacyDesign(designKey);
  assert.deepEqual(parsePublishedDesignManifest(manifest), manifest);
  assert.equal(manifest.bankRelease, SHOWROOM_COMPONENT_BANK.release);
  assert.equal(manifest.sections.length, 8);
  for (const section of manifest.sections) {
    assert.match(registrySource, new RegExp(`"${section.component.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.ok(
      SHOWROOM_COMPONENT_BANK.components.some(
        (component) => component.id === section.component,
      ),
    );
  }
}

assert.doesNotMatch(source, /\bimport\s*\(/);
assert.doesNotMatch(source, /dangerouslySetInnerHTML|eval\s*\(|new Function/);
assert.match(source, /onOpenProduct: productAction\(props\.openProduct\)/);
assert.match(source, /onAddProduct: productAction\(props\.addProduct\)/);
assert.match(source, /onOpenCart: props\.openCart/);
assert.match(source, /properties=\{section\.properties\}/);
assert.match(appSource, /parsePublishedDesignManifest/);
assert.match(appSource, /InvalidComposition/);
assert.doesNotMatch(
  appSource,
  /compositionManifest[\s\S]{0,200}\|\|\s*NovaTechDesign/,
);

console.log(
  "Deterministic static composition renderer and fail-closed callback boundary tests passed.",
);
