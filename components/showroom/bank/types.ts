import type { CSSProperties, ComponentType } from "react";
import type {
  ShowroomComponentDefinition,
  ShowroomPrimitive,
  ShowroomSlot,
} from "@/lib/showroom-composition";
import type { ShowroomContentBlock } from "@/lib/showroom-content-blocks";
import type { ShowroomExperienceSettings } from "@/lib/showroom-experience";
import type { SectionMediaIntegration } from "@/lib/showroom-design-systems";
import type { SectionSurfaceRole } from "@/lib/showroom-composition-v2";
import type { OfferingKind, QuantityMode } from "@/lib/offerings";
import type { LivePlatform } from "@/lib/live-showroom";

export type BankAvailability =
  | "available"
  | "limited"
  | "unavailable"
  | "coming_soon";

export type BankBusinessView = {
  handle: string;
  name: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  logoRef: string;
  heroImageRef: string;
  contactLabel: string;
  processVideoRef: string;
  isLive: boolean;
  livePlatform: LivePlatform | "";
  liveUrl: string;
};

export type BankCategoryView = {
  key: string;
  name: string;
};

export type BankProductView = {
  key: string;
  name: string;
  eyebrow: string;
  description: string;
  imageRef: string;
  videoRef: string;
  priceMinor: number | null;
  quantityUnit: string;
  highlights: string[];
  availability: BankAvailability;
  offeringKind: OfferingKind;
  quantityMode: QuantityMode;
  capacitySummary: string;
  minimumOrderSummary: string;
  leadTimeSummary: string;
};

export type BankPresentationContext = {
  business: BankBusinessView;
  categories: BankCategoryView[];
  products: BankProductView[];
  query: string;
  selectedCategory: string;
  cartCount: number;
  sectionAnchorIds: {
    home: string;
    story: string;
    offerings: string;
    contact: string;
  };
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOpenProduct: (product: BankProductView) => void;
  onAddProduct: (product: BankProductView) => void;
  onOpenCart: () => void;
};

export type BankTokenStyle = {
  id: string;
  label: string;
  variables: CSSProperties & Record<`--bank-${string}`, string>;
};

export type BankSectionRendererProps = {
  context: BankPresentationContext;
  definition: ShowroomComponentDefinition;
  contentBlock?: ShowroomContentBlock;
  experience: ShowroomExperienceSettings;
  properties?: Record<string, ShowroomPrimitive>;
  mediaIntegration?: SectionMediaIntegration | null;
  surfaceRole?: SectionSurfaceRole;
};

export type BankSectionRenderer = ComponentType<BankSectionRendererProps>;

export type BankRegistry = Record<string, BankSectionRenderer>;

export type BankCoverage = Record<ShowroomSlot, number>;
