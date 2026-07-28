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

export type BankAvailability =
  | "available"
  | "limited"
  | "unavailable"
  | "coming_soon";

export type BankBusinessView = {
  name: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  logoRef: string;
  heroImageRef: string;
  contactLabel: string;
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
  availability: BankAvailability;
};

export type BankPresentationContext = {
  business: BankBusinessView;
  categories: BankCategoryView[];
  products: BankProductView[];
  query: string;
  selectedCategory: string;
  cartCount: number;
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
