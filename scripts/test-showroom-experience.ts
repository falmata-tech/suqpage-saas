import assert from "node:assert/strict";
import fs from "node:fs";
import {
  SHOWROOM_COMPONENT_BANK,
  SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE,
} from "../lib/showroom-bank-release";
import {
  DEFAULT_SHOWROOM_EXPERIENCE,
  SHOWROOM_DECORATIVE_DEPTHS,
  SHOWROOM_MOTION_INTENSITIES,
  SHOWROOM_PREVIEW_DEVICES,
} from "../lib/showroom-experience";
import {
  ShowroomCompositionError,
  parseShowroomDesignProposal,
  type ShowroomPrimitive,
} from "../lib/showroom-composition";
import { SHOWROOM_BANK_TOKEN_STYLES } from "../components/showroom/bank/tokens";

assert.deepEqual(SHOWROOM_MOTION_INTENSITIES, [
  "quiet",
  "balanced",
  "expressive",
]);
assert.deepEqual(SHOWROOM_DECORATIVE_DEPTHS, [
  "clean",
  "subtle",
  "signature",
]);
assert.deepEqual(SHOWROOM_PREVIEW_DEVICES, ["responsive", "mobile"]);
assert.deepEqual(DEFAULT_SHOWROOM_EXPERIENCE, {
  motionIntensity: "balanced",
  decorativeDepth: "subtle",
});
assert.equal(Object.isFrozen(DEFAULT_SHOWROOM_EXPERIENCE), true);

for (const component of SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components) {
  const motion = component.properties.find(
    (property) => property.key === "motion_intensity",
  );
  const decoration = component.properties.find(
    (property) => property.key === "decorative_depth",
  );
  assert.deepEqual(motion, {
    key: "motion_intensity",
    label: "Motion intensity",
    type: "enum",
    required: true,
    values: [...SHOWROOM_MOTION_INTENSITIES],
  });
  assert.deepEqual(decoration, {
    key: "decorative_depth",
    label: "Decorative depth",
    type: "enum",
    required: true,
    values: [...SHOWROOM_DECORATIVE_DEPTHS],
  });
}

for (const component of SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.slice(
  SHOWROOM_COMPONENT_BANK.components.length,
)) {
  assert.deepEqual(
    component.properties.find((property) => property.key === "reveal_style"),
    {
      key: "reveal_style",
      label: "Entrance treatment",
      type: "enum",
      required: true,
      values: ["fade-rise", "soft-clip", "staggered"],
    },
  );
  assert.deepEqual(
    component.properties.find((property) => property.key === "interaction_style"),
    {
      key: "interaction_style",
      label: "Touch and pointer treatment",
      type: "enum",
      required: true,
      values: ["quiet-lift", "edge-trace", "tactile-press"],
    },
  );
}

for (const token of Object.values(SHOWROOM_BANK_TOKEN_STYLES)) {
  for (const variable of [
    "--bank-motion-duration",
    "--bank-motion-distance",
    "--bank-motion-ease",
    "--bank-decoration-size",
  ]) {
    assert.equal(
      typeof (token.variables as Record<string, string>)[variable],
      "string",
      `${token.id} must define ${variable}`,
    );
  }
}

const requiredComponents = SHOWROOM_COMPONENT_BANK.requiredSlots.map((slot) => {
  const component = SHOWROOM_COMPONENT_BANK.components.find(
    (entry) => entry.slot === slot,
  );
  assert.ok(component, `Bank must provide ${slot}`);
  return component;
});
const sections = requiredComponents.map((component, index) => {
  const properties: Record<string, ShowroomPrimitive> = {};
  for (const property of component.properties) {
    if (property.key === "motion_intensity") properties[property.key] = "balanced";
    if (property.key === "decorative_depth") properties[property.key] = "subtle";
    if (property.required && properties[property.key] === undefined) {
      if (property.type === "enum") properties[property.key] = property.values[0];
      if (property.type === "boolean") properties[property.key] = false;
      if (property.type === "integer") properties[property.key] = property.min;
    }
  }
  return {
    key: `${component.slot}-${index + 1}`,
    component: component.id,
    properties,
    bindings: Object.fromEntries(
      component.bindings
        .filter((binding) => binding.required)
        .map((binding) => [binding.key, binding.allowedSources[0]]),
    ),
  };
});
const validProposal = {
  schemaVersion: 1,
  bankRelease: SHOWROOM_COMPONENT_BANK.release,
  tokenPack: SHOWROOM_COMPONENT_BANK.tokenPacks[0].id,
  rationale: "A bounded mobile-first presentation proposal.",
  questions: [],
  warnings: [],
  sections,
};
assert.equal(
  parseShowroomDesignProposal(validProposal, SHOWROOM_COMPONENT_BANK).sections
    .length,
  requiredComponents.length,
);
assert.throws(
  () =>
    parseShowroomDesignProposal(
      {
        ...validProposal,
        sections: validProposal.sections.map((section, index) =>
          index === 0
            ? {
                ...section,
                properties: {
                  ...section.properties,
                  animation_duration: "12s",
                },
              }
            : section,
        ),
      },
      SHOWROOM_COMPONENT_BANK,
    ),
  (error: unknown) =>
    error instanceof ShowroomCompositionError &&
    error.code === "unknown_field",
);

const componentSource = [
  "components/showroom/bank/sections.tsx",
  "components/showroom/bank/DesignBankLaboratory.tsx",
].map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const [category, pattern] of [
  ["timer", /\bset(?:Timeout|Interval)\s*\(/],
  ["animation frame", /\brequestAnimationFrame\s*\(/],
  ["intersection observer", /\bIntersectionObserver\b/],
  ["dynamic class input", /\bclassName\s*=\s*\{context\./],
] as const) {
  assert.doesNotMatch(
    componentSource,
    pattern,
    `experience components cannot use a runtime ${category}`,
  );
}

const cssSource = fs.readFileSync(
  "components/showroom/bank/bank.module.css",
  "utf8",
);
assert.match(cssSource, /container:\s*bank-preview\s*\/\s*inline-size/);
assert.match(cssSource, /@container bank-preview \(max-width: 480px\)/);
assert.match(cssSource, /\.hero\[data-variant\][\s\S]*grid-template-columns:\s*1fr/);
assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(cssSource, /animation-name:\s*none\s*!important/);
assert.match(cssSource, /min-height:\s*44px/);
assert.match(cssSource, /scroll-snap-type:\s*inline/);
assert.match(cssSource, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(cssSource, /env\(safe-area-inset-bottom\)/);
assert.match(cssSource, /data-reveal="soft-clip"/);
assert.match(cssSource, /data-interaction="tactile-press"/);
assert.match(cssSource, /data-variant="beauty-orbit"/);
assert.match(cssSource, /data-variant="textile-swatch"/);
assert.match(cssSource, /data-variant="technology-cinematic"/);
assert.match(cssSource, /data-variant="room-scene"/);
assert.match(cssSource, /data-variant="ingredient-monograph"/);
assert.match(cssSource, /@keyframes bank-soft-clip/);
assert.doesNotMatch(cssSource, /position\s*:\s*fixed/i);
assert.doesNotMatch(cssSource, /:global/);

const laboratorySource = fs.readFileSync(
  "components/showroom/bank/DesignBankLaboratory.tsx",
  "utf8",
);
for (const label of [
  "Motion intensity",
  "Decorative depth",
  "Preview width",
  "Mobile · 390 px",
  "Reduced motion safe",
]) {
  assert.match(laboratorySource, new RegExp(label.replace("·", "\\·")));
}

console.log(
  `Showroom experience admitted for ${SHOWROOM_COMPONENT_BANK.components.length} ` +
    `components and ${SHOWROOM_COMPONENT_BANK.tokenPacks.length} token systems; ` +
    `candidate creativity checked for ${SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.components.length} ` +
    `components and ${SHOWROOM_COMPONENT_BANK_1_2_CANDIDATE.tokenPacks.length} token systems.`,
);
