import type { ReactNode } from "react";
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
  children,
}: {
  slot: string;
  variant: string;
  label: string;
  experience: BankSectionRendererProps["experience"];
  children: ReactNode;
}) {
  return (
    <section
      className={`${styles.section} ${styles[slot] || ""}`}
      data-variant={variant}
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      aria-label={label}
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
      <span>{product.name.slice(0, 1)}</span>
    </div>
  );
}

function BrandMark({ context }: { context: BankPresentationContext }) {
  return (
    <span className={styles.brandMark}>
      <span className={styles.brandGlyph} aria-hidden="true">
        {context.business.name.slice(0, 1)}
      </span>
      <span>{context.business.name}</span>
    </span>
  );
}

export function BankHeaderSection({
  context,
  definition,
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  return (
    <header
      className={`${styles.section} ${styles.header}`}
      data-variant={variant}
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      aria-label={`${definition.name} preview`}
    >
      <BrandMark context={context} />
      <span className={styles.headerTagline}>{context.business.tagline}</span>
      <nav className={styles.headerNav} aria-label="Showroom preview">
        <button type="button" onClick={() => context.onCategoryChange("all")}>
          Catalog
        </button>
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
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const featured = context.products.slice(0, 3);
  return (
    <SectionRoot
      slot="hero"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
    >
      <div className={styles.heroCopy}>
        <span className={styles.kicker}>{context.business.tagline}</span>
        <h2>{context.business.heroTitle}</h2>
        <p>{context.business.heroSubtitle}</p>
        <button type="button" onClick={() => context.onCategoryChange("all")}>
          Explore products
        </button>
      </div>
      <div className={styles.heroVisual} aria-label="Featured product presentation">
        {context.business.heroImageRef ? (
          <img src={context.business.heroImageRef} alt="" />
        ) : (
          <div className={styles.heroTexture} aria-hidden="true" />
        )}
        <div className={styles.heroProducts}>
          {featured.map((product) => (
            <button
              type="button"
              key={product.key}
              onClick={() => context.onOpenProduct(product)}
            >
              <span>{product.eyebrow}</span>
              <strong>{product.name}</strong>
            </button>
          ))}
        </div>
      </div>
    </SectionRoot>
  );
}

export function BankNavigationSection({
  context,
  definition,
  experience,
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
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const statements = context.collections.slice(0, 3);
  return (
    <SectionRoot
      slot="content"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
    >
      <div className={styles.contentHeading}>
        <span className={styles.kicker}>{definition.name}</span>
        <h2>{context.business.name}</h2>
      </div>
      <div className={styles.contentBody}>
        <p>{context.business.description}</p>
        <ol>
          {statements.map((statement, index) => (
            <li key={statement.key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{statement.name}</strong>
                <p>{statement.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionRoot>
  );
}

function CatalogControls({ context }: { context: BankPresentationContext }) {
  return (
    <div className={styles.catalogControls}>
      <label>
        <span>Search products</span>
        <input
          value={context.query}
          onChange={(event) => context.onQueryChange(event.target.value)}
          placeholder="Search the catalog"
        />
      </label>
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
    </div>
  );
}

export function BankCatalogSection({
  context,
  definition,
  experience,
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
    >
      <div className={styles.catalogHeading}>
        <div>
          <span className={styles.kicker}>Product showroom</span>
          <h2>Explore {context.business.name}</h2>
        </div>
        <CatalogControls context={context} />
      </div>
      <div className={styles.productGrid}>
        {products.slice(0, 6).map((product) => (
          <article className={styles.productCard} key={product.key}>
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
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const facts = [
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
    >
      <div className={styles.trustIntro}>
        <span className={styles.kicker}>{definition.name}</span>
        <h2>Information from {context.business.name}</h2>
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
};

export function BankCallToActionSection({
  context,
  definition,
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  const copy = ctaCopy[variant] || ctaCopy.inquiry;
  return (
    <SectionRoot
      slot="callToAction"
      variant={variant}
      label={`${definition.name} preview`}
      experience={experience}
    >
      <div>
        <span className={styles.kicker}>{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{context.business.contactLabel}</p>
      </div>
      <button type="button" onClick={context.onOpenCart}>
        {copy.button}
      </button>
    </SectionRoot>
  );
}

export function BankFooterSection({
  context,
  definition,
  experience,
}: BankSectionRendererProps) {
  const variant = variantName(definition.id);
  return (
    <footer
      className={`${styles.section} ${styles.footer}`}
      data-variant={variant}
      data-motion={experience.motionIntensity}
      data-decoration={experience.decorativeDepth}
      aria-label={`${definition.name} preview`}
    >
      <div>
        <BrandMark context={context} />
        <p>{context.business.tagline}</p>
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
