import type { CSSProperties, ReactNode } from "react";
import { privacyEnhancedYouTubeEmbedUrl } from "@/lib/youtube-provider";
import { heroMediaIntegrationForComponent } from "@/lib/showroom-guidance";
import styles from "./bank.module.css";
import type {
  BankPresentationContext,
  BankProductView,
  BankSectionRendererProps,
} from "./types";

const availabilityLabels: Record<BankProductView["availability"], string> = {
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
  coming_soon: "Coming soon",
};

function variantName(componentId: string): string {
  return componentId.split("@")[0].split(".").slice(1).join("-");
}

function SectionRoot({
  slot,
  variant,
  label,
  experience,
  properties,
  mediaIntegration,
  children,
}: {
  slot: string;
  variant: string;
  label: string;
  experience: BankSectionRendererProps["experience"];
  properties?: BankSectionRendererProps["properties"];
  mediaIntegration?: string;
  children: ReactNode;
}) {
  const style = {
    "--bank-section-columns":
      typeof properties?.columns === "number"
        ? String(properties.columns)
        : undefined,
    "--bank-hero-height":
      typeof properties?.height === "number"
        ? `${properties.height}px`
        : undefined,
  } as CSSProperties;
  return (
    <section
      id={slot === "catalog" ? "showroom-catalog" : undefined}
      className={`${styles.section} ${styles[slot] || ""}`}
      data-slot={slot}
      data-variant={variant}
      data-media-integration={mediaIntegration}
      data-density={
        typeof properties?.density === "string"
          ? properties.density
          : undefined
      }
      data-alignment={
        typeof properties?.alignment === "string"
          ? properties.alignment
          : undefined
      }
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      data-reveal={
        typeof properties?.reveal_style === "string"
          ? properties.reveal_style
          : undefined
      }
      data-interaction={
        typeof properties?.interaction_style === "string"
          ? properties.interaction_style
          : undefined
      }
      aria-label={label}
      style={style}
    >
      {children}
    </section>
  );
}

function ProductVisual({ product }: { product: BankProductView }) {
  return product.imageRef ? (
    <img className={styles.productImage} src={product.imageRef} alt={product.name} />
  ) : (
    <div className={styles.productPlaceholder} aria-hidden="true">
      <span className={styles.placeholderTexture} />
    </div>
  );
}

function mediaAsset(
  block: BankSectionRendererProps["contentBlock"],
  slotKey?: string,
) {
  const media = slotKey
    ? block?.media.find((entry) => entry.slotKey === slotKey)
    : block?.media[0];
  return media?.assetKeys[0] || "";
}

function blockItems(block: BankSectionRendererProps["contentBlock"]) {
  if (!block || !("items" in block)) return [];
  return block.items;
}

function VideoFrame({ block }: { block: BankSectionRendererProps["contentBlock"] }) {
  const asset = mediaAsset(block, "video");
  if (!asset) return null;
  let src = "";
  try {
    src = privacyEnhancedYouTubeEmbedUrl(asset);
  } catch {
    return null;
  }
  return (
    <div className={styles.videoFrame}>
      <iframe
        src={src}
        title={block?.title || "Showroom video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function BrandMark({ context }: { context: BankPresentationContext }) {
  return (
    <span className={styles.brandMark}>
      {context.business.logoRef ? (
        <img
          className={styles.brandLogo}
          src={context.business.logoRef}
          alt=""
        />
      ) : (
        <span className={styles.brandGlyph} aria-hidden="true">
          {context.business.name.slice(0, 1)}
        </span>
      )}
      <span>{context.business.name}</span>
    </span>
  );
}

export function BankHeaderSection({
  context,
  definition,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  return (
    <header
      className={`${styles.section} ${styles.header}`}
      data-variant={variant}
      data-density={
        typeof properties?.density === "string"
          ? properties.density
          : undefined
      }
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      data-reveal={
        typeof properties?.reveal_style === "string"
          ? properties.reveal_style
          : undefined
      }
      data-interaction={
        typeof properties?.interaction_style === "string"
          ? properties.interaction_style
          : undefined
      }
      aria-label={`${definition.name} preview`}
    >
      <BrandMark context={context} />
      {properties?.show_tagline !== false ? (
        <span className={styles.headerTagline}>{context.business.tagline}</span>
      ) : null}
      <nav className={styles.headerNav} aria-label="Showroom preview">
        <a href="#showroom-catalog" onClick={() => context.onCategoryChange("all")}>
          Catalog
        </a>
        <button type="button" onClick={context.onOpenCart}>
          Inquiry <span aria-label={`${context.cartCount} selected items`}>{context.cartCount}</span>
        </button>
      </nav>
    </header>
  );
}

export function BankHeroSection({
  context,
  definition,
  contentBlock,
  experience,
  properties,
  mediaIntegration: selectedMediaIntegration,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const heroImage = mediaAsset(contentBlock, "hero_image") || context.business.heroImageRef;
  const mediaIntegration =
    selectedMediaIntegration ||
    heroMediaIntegrationForComponent(definition.id) ||
    undefined;
  return (
    <SectionRoot
      slot="hero"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
      mediaIntegration={mediaIntegration}
    >
      <div className={styles.heroCopy}>
        <span className={styles.kicker}>{contentBlock?.kicker || context.business.tagline}</span>
        <h2>{contentBlock?.title || context.business.heroTitle}</h2>
        <p>{contentBlock?.body || context.business.heroSubtitle}</p>
        <a href="#showroom-catalog" onClick={() => context.onCategoryChange("all")}>
          Explore products
        </a>
      </div>
      <div className={styles.heroVisual} aria-label="Featured product presentation">
        {heroImage ? (
          <img src={heroImage} alt="" />
        ) : (
          <div className={styles.heroTexture} aria-hidden="true" />
        )}
      </div>
    </SectionRoot>
  );
}

export function BankNavigationSection({
  context,
  definition,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const items = context.categories.length
    ? context.categories
    : context.collections.map(({ key, name }) => ({ key, name }));
  return (
    <SectionRoot
      slot="navigation"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
    >
      <div className={styles.navigationLabel}>Browse the catalog</div>
      <nav className={styles.categoryNav} aria-label="Product categories">
        <button
          type="button"
          aria-pressed={context.selectedCategory === "all"}
          onClick={() => context.onCategoryChange("all")}
        >
          All products
        </button>
        {items.map((item, index) => (
          <button
            type="button"
            key={item.key}
            aria-pressed={context.selectedCategory === item.key}
            onClick={() => context.onCategoryChange(item.key)}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </SectionRoot>
  );
}

export function BankContentSection({
  context,
  definition,
  contentBlock,
  experience,
  properties,
  mediaIntegration: selectedMediaIntegration,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const statements = blockItems(contentBlock).length
    ? blockItems(contentBlock).map((item) =>
        "label" in item
          ? { title: item.label, body: item.value }
          : { title: item.title, body: item.body },
      )
    : context.collections.slice(0, 3).map((statement) => ({
        title: statement.name,
        body: statement.description,
      }));
  const storyImage = mediaAsset(contentBlock, "story_image");
  if (contentBlock?.type === "video") {
    return (
      <SectionRoot
        slot="content"
        variant={variant}
        label={`${definition.name} preview`}
        experience={experience}
        properties={properties}
        mediaIntegration={selectedMediaIntegration || "edge_fade"}
      >
        <div className={styles.contentHeading}>
          <span className={styles.kicker}>{contentBlock.kicker || definition.name}</span>
          <h2>{contentBlock.title}</h2>
          <p>{contentBlock.body}</p>
        </div>
        <div className={styles.contentBody}>
          <VideoFrame block={contentBlock} />
          {contentBlock.transcript ? <p>{contentBlock.transcript}</p> : null}
        </div>
      </SectionRoot>
    );
  }
  return (
    <SectionRoot
      slot="content"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
      mediaIntegration={selectedMediaIntegration || "edge_fade"}
    >
      <div className={styles.contentHeading}>
        <span className={styles.kicker}>{contentBlock?.kicker || definition.name}</span>
        <h2>{contentBlock?.title || context.business.name}</h2>
      </div>
      <div className={styles.contentBody}>
        {storyImage ? (
          <div className={styles.storyVisual}>
            <img className={styles.storyImage} src={storyImage} alt="" />
          </div>
        ) : null}
        <p>{contentBlock?.body || context.business.description}</p>
        <ol>
          {statements.map((statement, index) => (
            <li key={`${statement.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{statement.title}</strong>
                <p>{statement.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionRoot>
  );
}

function CatalogControls({
  context,
  showSearch,
  showFilters,
}: {
  context: BankPresentationContext;
  showSearch: boolean;
  showFilters: boolean;
}) {
  return (
    <div className={styles.catalogControls}>
      {showSearch ? (
        <label>
          <span>Search products</span>
          <input
            value={context.query}
            onChange={(event) => context.onQueryChange(event.target.value)}
            placeholder="Search the catalog"
          />
        </label>
      ) : null}
      {showFilters ? (
        <div className={styles.catalogFilters} aria-label="Catalog filters">
          <button
            type="button"
            aria-pressed={context.selectedCategory === "all"}
            onClick={() => context.onCategoryChange("all")}
          >
            All
          </button>
          {context.categories.slice(0, 4).map((category) => (
            <button
              type="button"
              key={category.key}
              aria-pressed={context.selectedCategory === category.key}
              onClick={() => context.onCategoryChange(category.key)}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BankCatalogSection({
  context,
  definition,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const normalizedQuery = context.query.trim().toLowerCase();
  const products = context.products.filter(
    (product) =>
      !normalizedQuery ||
      `${product.name} ${product.eyebrow} ${product.description}`
        .toLowerCase()
        .includes(normalizedQuery),
  );
  return (
    <SectionRoot
      slot="catalog"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
    >
      <div className={styles.catalogHeading}>
        <div>
          <span className={styles.kicker}>Product showroom</span>
          <h2>Explore {context.business.name}</h2>
        </div>
        <CatalogControls
          context={context}
          showSearch={properties?.show_search !== false}
          showFilters={properties?.show_filters !== false}
        />
      </div>
      <div className={styles.productGrid}>
        {products.slice(0, 6).map((product) => (
          <article className={`${styles.productCard} sr-card`} key={product.key}>
            <button
              type="button"
              className={styles.productOpen}
              onClick={() => context.onOpenProduct(product)}
              aria-label={`View ${product.name}`}
            >
              <ProductVisual product={product} />
            </button>
            <div className={styles.productCopy}>
              <div>
                <span>{product.eyebrow}</span>
                <h3>{product.name}</h3>
              </div>
              <p>{product.description}</p>
              <div className={styles.productActions}>
                <span data-availability={product.availability}>
                  {availabilityLabels[product.availability]}
                </span>
                <button type="button" onClick={() => context.onAddProduct(product)}>
                  Add to inquiry
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionRoot>
  );
}

export function BankTrustSection({
  context,
  definition,
  contentBlock,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const facts = blockItems(contentBlock).length
    ? blockItems(contentBlock).map((item) =>
        "label" in item ? `${item.label}: ${item.value}` : `${item.title}: ${item.body}`,
      )
    : [
        context.business.description,
        context.collections[0]?.description,
        context.business.contactLabel,
      ].filter((entry): entry is string => Boolean(entry));
  return (
    <SectionRoot
      slot="trust"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
    >
      <div className={styles.trustIntro}>
        <span className={styles.kicker}>{contentBlock?.kicker || definition.name}</span>
        <h2>{contentBlock?.title || `Information from ${context.business.name}`}</h2>
        {contentBlock?.body ? <p>{contentBlock.body}</p> : null}
      </div>
      <div className={styles.trustGrid}>
        {facts.map((fact, index) => (
          <article key={`${fact}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{fact}</p>
          </article>
        ))}
      </div>
    </SectionRoot>
  );
}

const ctaCopy: Record<string, { eyebrow: string; title: string; button: string }> = {
  inquiry: {
    eyebrow: "Product inquiry",
    title: "Bring the right products into one clear conversation.",
    button: "Start an inquiry",
  },
  wholesale: {
    eyebrow: "Quantity requirements",
    title: "Ask about products, quantities, and business requirements.",
    button: "Discuss requirements",
  },
  "sample-question": {
    eyebrow: "Product references",
    title: "Ask whether a sample or additional product reference is available.",
    button: "Ask the business",
  },
  consultation: {
    eyebrow: "Selection support",
    title: "Share the product specifications or project needs you are considering.",
    button: "Start a conversation",
  },
  "magazine-close": {
    eyebrow: "Continue the story",
    title: "Bring the pieces that caught your eye into one conversation.",
    button: "Build your inquiry",
  },
  "technical-brief": {
    eyebrow: "Project brief",
    title: "Share the products and requirements your project needs.",
    button: "Prepare a brief",
  },
};

export function BankCallToActionSection({
  context,
  definition,
  contentBlock,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const copy = ctaCopy[variant] || ctaCopy.inquiry;
  const button =
    contentBlock?.type === "call_to_action" ? contentBlock.actionLabel : copy.button;
  return (
    <SectionRoot
      slot="callToAction"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
      properties={properties}
    >
      <div>
        <span className={styles.kicker}>{contentBlock?.kicker || copy.eyebrow}</span>
        <h2>{contentBlock?.title || copy.title}</h2>
        <p>{contentBlock?.body || context.business.contactLabel}</p>
      </div>
      <button type="button" onClick={context.onOpenCart}>
        {button}
      </button>
    </SectionRoot>
  );
}

export function BankFooterSection({
  context,
  definition,
  experience,
  properties,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  return (
    <footer
      className={`${styles.section} ${styles.footer}`}
      data-variant={variant}
      data-alignment={
        typeof properties?.alignment === "string"
          ? properties.alignment
          : undefined
      }
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      data-reveal={
        typeof properties?.reveal_style === "string"
          ? properties.reveal_style
          : undefined
      }
      data-interaction={
        typeof properties?.interaction_style === "string"
          ? properties.interaction_style
          : undefined
      }
      aria-label={`${definition.name} preview`}
    >
      <div>
        <BrandMark context={context} />
        {properties?.show_tagline !== false ? (
          <p>{context.business.tagline}</p>
        ) : null}
      </div>
      <nav aria-label="Footer catalog">
        {context.collections.slice(0, 4).map((collection) => (
          <button
            type="button"
            key={collection.key}
            onClick={() => context.onCategoryChange(collection.key)}
          >
            {collection.name}
          </button>
        ))}
      </nav>
      <div>
        <span>Product inquiries</span>
        <strong>{context.business.contactLabel}</strong>
      </div>
    </footer>
  );
}
