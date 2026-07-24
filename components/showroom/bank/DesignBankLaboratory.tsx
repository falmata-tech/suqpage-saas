"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  SHOWROOM_SLOTS,
  type ShowroomComponentBank,
  type ShowroomSlot,
} from "@/lib/showroom-composition";
import {
  DEFAULT_SHOWROOM_EXPERIENCE,
  SHOWROOM_DECORATIVE_DEPTHS,
  SHOWROOM_MOTION_INTENSITIES,
  SHOWROOM_PREVIEW_DEVICES,
  type ShowroomDecorativeDepth,
  type ShowroomMotionIntensity,
  type ShowroomPreviewDevice,
} from "@/lib/showroom-experience";
import { SHOWROOM_BANK_REGISTRY } from "./registry";
import styles from "./bank.module.css";
import { SHOWROOM_BANK_TOKEN_STYLES, type ShowroomBankTokenId } from "./tokens";
import type { BankPresentationContext } from "./types";

const slotLabels: Record<ShowroomSlot, string> = {
  header: "Headers",
  hero: "Heroes",
  navigation: "Navigation",
  content: "Story / content",
  catalog: "Catalogs",
  trust: "Trust / information",
  call_to_action: "Calls to action",
  footer: "Footers",
};

const laboratoryFixture = {
  business: {
    name: "Field & Form Cooperative",
    tagline: "Products shaped by material, place, and practical craft",
    description:
      "We bring together carefully prepared food goods, workshop-made objects, furnishing materials, and production-ready equipment. Every product entry preserves the supplied name, description, availability, and inquiry path.",
    heroTitle: "Useful products, clearly presented.",
    heroSubtitle:
      "A flexible showroom can feel precise, warm, technical, editorial, or energetic while the underlying catalog and inquiry behavior remain dependable.",
    logoRef: "",
    heroImageRef: "",
    contactLabel: "Choose products to prepare one structured inquiry",
  },
  collections: [
    {
      key: "harvest",
      name: "Harvest goods",
      description: "Food and agricultural products prepared for clear product inquiry.",
    },
    {
      key: "workshop",
      name: "Workshop",
      description: "Furniture, textiles, artisan work, tools, and material-led goods.",
    },
    {
      key: "production",
      name: "Production",
      description: "Equipment, parts, packaging, and manufacturing-oriented products.",
    },
  ],
  categories: [
    { key: "food", name: "Food goods" },
    { key: "home", name: "Home and furniture" },
    { key: "maker", name: "Artisan and maker" },
    { key: "industrial", name: "Industrial" },
  ],
  products: [
    {
      key: "forest-honey",
      name: "Highland Forest Honey",
      eyebrow: "Harvest goods",
      description: "A product description supplied by the business remains exact.",
      imageRef: "",
      availability: "available" as const,
    },
    {
      key: "coffee-lot",
      name: "Single-Origin Coffee Lot",
      eyebrow: "Coffee selection",
      description: "Structured details can support both retail and quantity inquiries.",
      imageRef: "",
      availability: "limited" as const,
    },
    {
      key: "lounge-chair",
      name: "Hand-Finished Lounge Chair",
      eyebrow: "Furniture",
      description: "Material and finish information stays attached to the product.",
      imageRef: "",
      availability: "available" as const,
    },
    {
      key: "woven-basket",
      name: "Woven Storage Basket",
      eyebrow: "Artisan work",
      description: "A visual catalog can retain long merchant-entered product names.",
      imageRef: "",
      availability: "coming_soon" as const,
    },
    {
      key: "transfer-pump",
      name: "Stainless Transfer Pump",
      eyebrow: "Production equipment",
      description: "Technical products can use the same inquiry-first platform behavior.",
      imageRef: "",
      availability: "available" as const,
    },
    {
      key: "botanical-oil",
      name: "Botanical Body Oil",
      eyebrow: "Personal care",
      description: "Editorial treatments remain separate from factual product authority.",
      imageRef: "",
      availability: "unavailable" as const,
    },
  ],
};

export default function DesignBankLaboratory({
  bank,
  combinationFloor,
}: {
  bank: ShowroomComponentBank;
  combinationFloor: number;
}) {
  const [slot, setSlot] = useState<ShowroomSlot | "all">("all");
  const [tokenId, setTokenId] =
    useState<ShowroomBankTokenId>("harvest-earth");
  const [motionIntensity, setMotionIntensity] =
    useState<ShowroomMotionIntensity>(
      DEFAULT_SHOWROOM_EXPERIENCE.motionIntensity,
    );
  const [decorativeDepth, setDecorativeDepth] =
    useState<ShowroomDecorativeDepth>(
      DEFAULT_SHOWROOM_EXPERIENCE.decorativeDepth,
    );
  const [previewDevice, setPreviewDevice] =
    useState<ShowroomPreviewDevice>("responsive");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notice, setNotice] = useState(
    "Preview controls are isolated and never create a customer inquiry.",
  );
  const token = SHOWROOM_BANK_TOKEN_STYLES[tokenId];
  const definitions = useMemo(
    () =>
      slot === "all"
        ? bank.components
        : bank.components.filter((component) => component.slot === slot),
    [bank.components, slot],
  );
  const context: BankPresentationContext = {
    ...laboratoryFixture,
    query,
    selectedCategory,
    cartCount: 3,
    onQueryChange: setQuery,
    onCategoryChange: setSelectedCategory,
    onOpenProduct: (product) =>
      setNotice(`Previewed “${product.name}”. No client or catalog data changed.`),
    onAddProduct: (product) =>
      setNotice(`Tested inquiry action for “${product.name}”. Nothing was saved.`),
    onOpenCart: () =>
      setNotice("Tested the inquiry trigger. The laboratory has no inquiry storage."),
  };
  const experience = { motionIntensity, decorativeDepth };

  return (
    <div className={styles.laboratory}>
      <div className={styles.labSummary} aria-label="Component bank coverage">
        <div className={styles.labMetric}>
          <strong>{bank.components.length}</strong>
          <span>reviewed component variants</span>
        </div>
        <div className={styles.labMetric}>
          <strong>{bank.tokenPacks.length}</strong>
          <span>cross-industry token systems</span>
        </div>
        <div className={styles.labMetric}>
          <strong>{SHOWROOM_SLOTS.length}</strong>
          <span>supported component families</span>
        </div>
        <div className={styles.labMetric}>
          <strong>{combinationFloor.toLocaleString()}</strong>
          <span>base combinations before optional sections</span>
        </div>
      </div>

      <div className={styles.labControls}>
        <div className={styles.familyControl}>
          <span className="eyebrow">Filter component family</span>
          <div className={styles.slotFilters} aria-label="Component family filter">
            <button
              type="button"
              aria-pressed={slot === "all"}
              onClick={() => setSlot("all")}
            >
              All {bank.components.length}
            </button>
            {SHOWROOM_SLOTS.map((entry) => {
              const count = bank.components.filter(
                (component) => component.slot === entry,
              ).length;
              return (
                <button
                  type="button"
                  key={entry}
                  aria-pressed={slot === entry}
                  onClick={() => setSlot(entry)}
                >
                  {slotLabels[entry]} {count}
                </button>
              );
            })}
          </div>
        </div>
        <label className={styles.tokenSelect}>
          Preview token system
          <select
            value={tokenId}
            onChange={(event) =>
              setTokenId(event.target.value as ShowroomBankTokenId)
            }
          >
            {Object.values(SHOWROOM_BANK_TOKEN_STYLES).map((entry) => (
              <option value={entry.id} key={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.tokenSelect}>
          Motion intensity
          <select
            value={motionIntensity}
            onChange={(event) =>
              setMotionIntensity(event.target.value as ShowroomMotionIntensity)
            }
          >
            {SHOWROOM_MOTION_INTENSITIES.map((entry) => (
              <option value={entry} key={entry}>
                {entry[0].toUpperCase() + entry.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.tokenSelect}>
          Decorative depth
          <select
            value={decorativeDepth}
            onChange={(event) =>
              setDecorativeDepth(event.target.value as ShowroomDecorativeDepth)
            }
          >
            {SHOWROOM_DECORATIVE_DEPTHS.map((entry) => (
              <option value={entry} key={entry}>
                {entry[0].toUpperCase() + entry.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className={styles.deviceControl}>
          <legend>Preview width</legend>
          <div>
            {SHOWROOM_PREVIEW_DEVICES.map((entry) => (
              <button
                type="button"
                key={entry}
                aria-pressed={previewDevice === entry}
                onClick={() => setPreviewDevice(entry)}
              >
                {entry === "mobile" ? "Mobile · 390 px" : "Responsive"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.labNotice} role="status" aria-live="polite">
        {notice}
      </div>

      <div className={styles.componentGrid}>
        {definitions.map((definition) => {
          const Renderer = SHOWROOM_BANK_REGISTRY[definition.id];
          if (!Renderer) return null;
          return (
            <article className={styles.componentCard} key={definition.id}>
              <header className={styles.componentMeta}>
                <div>
                  <h2>{definition.name}</h2>
                  <span className={styles.slotBadge}>
                    {slotLabels[definition.slot]}
                  </span>
                </div>
                <code>{definition.id}</code>
                <p>{definition.description}</p>
                <div className={styles.experienceBadges} aria-label="Experience guarantees">
                  <span>Mobile first</span>
                  <span>Touch ready</span>
                  <span>Reduced motion safe</span>
                </div>
                {definition.mediaSlots.length ? (
                  <div
                    className={styles.experienceBadges}
                    aria-label="Media slot contract"
                  >
                    {definition.mediaSlots.map((mediaSlot) => (
                      <span key={mediaSlot.key}>
                        {mediaSlot.label} ·{" "}
                        {mediaSlot.required ? "required" : "optional"} ·{" "}
                        {mediaSlot.acceptedKinds.join("/")} ·{" "}
                        {mediaSlot.aspectRatio}
                      </span>
                    ))}
                  </div>
                ) : (
                  <small>No section-specific media required.</small>
                )}
              </header>
              <div
                className={styles.previewFrame}
                data-preview-device={previewDevice}
                style={token.variables as CSSProperties}
              >
                <div className={styles.previewCanvas}>
                  <Renderer
                    context={context}
                    definition={definition}
                    experience={experience}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
