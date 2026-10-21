import type { Catalog, Product } from "../types";
import type {
  Shop,
  Offering,
  MapShop,
  Market,
} from "../../packages/contracts/src";
import type { ShopPageContent } from "../owner-page-domain";
import type { DiscoveryShowroom, MarketplaceDiscoveryView } from "../discovery";
import { productMedia } from "../product-media";
import { legacyPublicContacts } from "../business-profile-contacts";
import { DISCOVERY_INDUSTRIES } from "../discovery-contract";
import {isPublicProduct} from '../offerings';
import {approvedDemoContactMethods} from '../demo-inquiry-policy';
import {showroomCategories,showroomProductCategory} from '../showroom-categories';
export function offeringDto(p: Product): Offering {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    kind: p.offering_kind || "standard_product",
    priceMinor: p.price_minor,
    media: productMedia(p),
    published: Boolean(p.is_published),
    availability: p.availability,
    quantityMode: p.quantity_mode || "optional",
    options: (p.option_groups || []).map((g) => ({
      name: g.name,
      values: g.values.map((v) => v.value),
    })),
  };
}
export function shopDto(c: Catalog, p: ShopPageContent, includeRetired = false): Shop {
  const b = c.business;
  const categories = showroomCategories(c);
  return {
    id: b.id,
    handle: b.handle,
    name: b.name,
    about: p.about || p.introduction,
    cover: p.heroImage,
    logo: b.logo_path,
    videoUrl: p.videoUrl,
    accentColor: p.accentColor,
    contacts: p.contacts ?? legacyPublicContacts(b),
    products: c.products.filter(product=>includeRetired||Boolean(product.is_published)&&isPublicProduct(product)).map(product => {
      const category = showroomProductCategory(b.id, categories, product);
      return {...offeringDto(product), ...(category ? {categoryId:category.id,categoryName:category.name} : {})};
    }),
    ...(categories.length ? {categories:categories.map(({id,name})=>({id,name}))} : {}),
    version: b.content_version,
    status: b.status,
    isDemo: Boolean(b.is_demo),
    approvedDemoContactMethods: approvedDemoContactMethods(b.is_demo, p.contacts ?? legacyPublicContacts(b), process.env.SUQPAGE_DEMO_INQUIRY_PHONE),
  };
}
export function mapShopDto(s: DiscoveryShowroom): MapShop {
  return {
    id: s.id,
    handle: s.handle,
    name: s.name,
    description: s.description,
    heroImagePath: s.heroImagePath,
    countryCode:s.countryCode,cityId:s.cityId,
    city: s.city,
    region: s.region,
    latitude: s.latitude,
    longitude: s.longitude,
    locationMode: s.locationMode,
    isDemo: s.isDemo,
    isLive: s.isLive,
  };
}
export function marketDto(v: MarketplaceDiscoveryView): Market {
  const products = v.searchProducts.map((p) => ({
    kind: "product" as const,
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.imagePath,
    handle: p.businessHandle,
    businessName: p.businessName,
    city: p.city,
    region: p.region,
    offeringKind:p.offeringKind,
    availability:p.availability,
  }));
  const businesses = v.searchBusinesses.map((b) => ({
    kind: "business" as const,
    id: b.id,
    name: b.name,
    description: b.description,
    image: b.heroImagePath,
    handle: b.handle,
    businessName: b.name,
  }));
  const all = [...products, ...businesses];
  const order = v.searchOrder;
  return {
    items: order
      ? order.flatMap((o) =>
          all.filter((i) => i.id === o.id && i.kind === o.kind),
        )
      : all,
    showrooms: v.showrooms.map(s => ({ ...mapShopDto(s), isFeatured: s.id === v.featuredNowBusinessId })),
    nearbyGroups: v.nearbyGroups.map(g => ({ key: g.key, city: g.city, latitude: g.latitude, longitude: g.longitude, showroomIds: g.showroomIds })),
    categories: DISCOVERY_INDUSTRIES.map((c) => ({
      key: c.key,
      label: c.shortLabel,
    })),
    places: v.places.map((p) => ({ key: p.key, label: p.label,countryCode:p.countryCode })),
    countries:v.countries,
    page: v.resultPage.page,
    pages: v.resultPage.totalPages,
    total: v.resultPage.totalItems,
  };
}
