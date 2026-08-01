"use client";

import type { CSSProperties } from "react";
import { resolveShowroomComponentBank } from "@/lib/showroom-bank-release";
import type { ShowroomDesignProposal } from "@/lib/showroom-composition";
import type { ShowroomDesignProposalV2 } from "@/lib/showroom-composition-v2";
import type { ShowroomContentBlocksDocument } from "@/lib/showroom-content-blocks";
import type {
  ShowroomDecorativeDepth,
  ShowroomMotionIntensity,
} from "@/lib/showroom-experience";
import type { Product } from "@/lib/types";
import type { DesignProps } from "../designs";
import styles from "./bank.module.css";
import { SHOWROOM_BANK_REGISTRY } from "./registry";
import { showroomTokenVariables } from "./tokens";
import type { BankPresentationContext, BankProductView } from "./types";

function currentSurfaceRole(
  role: ShowroomDesignProposalV2["sections"][number]["surfaceRole"],
  slot: string,
) {
  if (role !== "soft") return role;
  if (slot === "hero") return "accent-soft";
  if (slot === "content" || slot === "trust") return "secondary-soft";
  return role;
}

function contactLabel(props: DesignProps): string {
  const business = props.catalog.business;
  if (business.whatsapp) return `WhatsApp ${business.whatsapp}`;
  if (business.telegram) return `Telegram @${business.telegram}`;
  if (business.contact_email) return business.contact_email;
  if (business.tiktok) return `TikTok @${business.tiktok}`;
  return "Build an inquiry and the business will confirm the next step.";
}

function toBankProduct(product: Product): BankProductView {
  return {
    key: String(product.id),
    name: product.name,
    eyebrow: product.eyebrow || product.category_name || "",
    description: product.description,
    imageRef: product.image_path,
    videoRef: product.video_ref,
    priceMinor: product.price_minor,
    quantityUnit: product.quantity_unit,
    highlights: product.highlights,
    availability: product.availability,
    offeringKind: product.offering_kind,
    quantityMode: product.quantity_mode,
    capacitySummary: product.capacity_summary,
    minimumOrderSummary: product.minimum_order_summary,
    leadTimeSummary: product.lead_time_summary,
  };
}

export function CompositionShowroom({
  manifest,
  contentBlocks,
  ...props
}: DesignProps & {
  manifest: ShowroomDesignProposal | ShowroomDesignProposalV2;
  contentBlocks?: ShowroomContentBlocksDocument;
}) {
  let bank;
  try {
    bank = resolveShowroomComponentBank(manifest.bankRelease);
  } catch {
    return <InvalidComposition />;
  }
  const definitionById = new Map(
    bank.components.map((definition) => [definition.id, definition]),
  );
  const productByKey = new Map(
    props.catalog.products.map((product) => [String(product.id), product]),
  );
  const tokenVariables = showroomTokenVariables(manifest);
  if (!tokenVariables) {
    return <InvalidComposition />;
  }

  const selectedCategory =
    props.filter === "all" ? "all" : `category:${props.filter}`;
  const changeCategory = (value: string) => {
    props.setFilter(
      value.startsWith("category:") ? value.slice("category:".length) : "all",
    );
  };
  const productAction =
    (action: (product: Product) => void) => (product: BankProductView) => {
      const canonical = productByKey.get(product.key);
      if (canonical) action(canonical);
    };
  const context: BankPresentationContext = {
    business: {
      handle: props.catalog.business.handle,
      name: props.catalog.business.name,
      tagline: props.catalog.business.tagline,
      description: props.catalog.business.description,
      heroTitle: props.catalog.business.hero_title,
      heroSubtitle: props.catalog.business.hero_subtitle,
      logoRef: props.catalog.business.logo_path,
      heroImageRef: props.catalog.business.hero_image_path,
      contactLabel: contactLabel(props),
      processVideoRef: props.catalog.business.process_video_ref,
      isLive: Boolean(props.catalog.business.is_live),
      livePlatform: props.catalog.business.live_platform,
      liveUrl: props.catalog.business.live_url,
    },
    categories: props.catalog.categories
      .filter((category) => category.is_active)
      .map((category) => ({
        key: `category:${category.id}`,
        name: category.name,
      })),
    products: props.products.map(toBankProduct),
    query: props.query,
    selectedCategory,
    cartCount: props.cartCount,
    onQueryChange: props.setQuery,
    onCategoryChange: changeCategory,
    onOpenProduct: productAction(props.openProduct),
    onAddProduct: productAction(props.addProduct),
    onOpenCart: props.openCart,
  };

  return (
    <div
      className={`showroom ${styles.compositionRoot}`}
      style={tokenVariables as CSSProperties}
      data-bank-release={manifest.bankRelease}
      data-token-pack={manifest.tokenPack}
      data-custom-palette={
        "customPalette" in manifest && manifest.customPalette ? "true" : undefined
      }
      data-composition-schema={manifest.schemaVersion}
      data-product-detail-pattern={
        "productDetailPattern" in manifest
          ? manifest.productDetailPattern
          : "editorial"
      }
    >
      {manifest.sections.map((section) => {
        const definition = definitionById.get(section.component);
        const Renderer = SHOWROOM_BANK_REGISTRY[section.component];
        if (!definition || !Renderer) return null;
        const contentBlock =
          "contentBlockKey" in section && section.contentBlockKey
            ? contentBlocks?.blocks.find(
                (block) => block.key === section.contentBlockKey,
              )
            : undefined;
        return (
          <Renderer
            key={section.key}
            context={context}
            definition={definition}
            contentBlock={contentBlock}
            experience={{
              motionIntensity: section.properties
                .motion_intensity as ShowroomMotionIntensity,
              decorativeDepth: section.properties
                .decorative_depth as ShowroomDecorativeDepth,
            }}
            properties={section.properties}
            mediaIntegration={
              "mediaIntegration" in section ? section.mediaIntegration : null
            }
            surfaceRole={
              "surfaceRole" in section
                ? currentSurfaceRole(section.surfaceRole, definition.slot)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

export function InvalidComposition() {
  return (
    <main className={styles.invalidComposition} role="alert">
      <div>
        <p>Showroom temporarily unavailable</p>
        <h1>This design could not be verified.</h1>
        <p>
          No substitute design was loaded. Please try again later or contact
          SuqPage support.
        </p>
      </div>
    </main>
  );
}
