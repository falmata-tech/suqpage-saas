"use client";
import type { DesignProps } from "../components/showroom/designs";

export const designManifest = {
  key: "replace-with-design-key",
  name: "Client Showroom Name",
  version: 1,
  features: ["dynamic-catalog", "search", "categories", "product-options", "inquiry-cart", "social-routing"]
};

export default function CustomShowroom(props: DesignProps) {
  const { catalog, products, openProduct, addProduct, openCart, cartCount } = props;
  return (
    <main>
      {/* CUSTOM DESIGN: Replace the visual implementation completely. */}
      <header>
        <img src={catalog.business.logo_path} alt="" />
        <strong>{catalog.business.name}</strong>
        {/* REQUIRED SMART CONNECTION */}
        <button onClick={openCart}>Inquiry ({cartCount})</button>
      </header>

      <section>
        <h1>{catalog.business.hero_title}</h1>
        <p>{catalog.business.hero_subtitle}</p>
        <img src={catalog.business.hero_image_path} alt={catalog.business.name} />
      </section>

      <section>
        {products.map((product) => (
          <article key={product.id}>
            <button onClick={() => openProduct(product)}>
              <img src={product.image_path} alt={product.name} />
            </button>
            <h2>{product.name}</h2>
            {/* REQUIRED SMART CONNECTION */}
            <button onClick={() => addProduct(product)}>Add to inquiry</button>
          </article>
        ))}
      </section>
    </main>
  );
}
