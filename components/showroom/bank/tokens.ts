import { SHOWROOM_DESIGN_SYSTEMS } from "@/lib/showroom-design-systems";
import type { BankTokenStyle } from "./types";

const sharedExperienceVariables = {
  "--bank-motion-duration": "560ms",
  "--bank-motion-distance": "18px",
  "--bank-motion-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
  "--bank-decoration-size": "180px",
} as const;

const typographyVariables = {
  compact: {
    "--bank-display-size": "3.35rem",
    "--bank-heading-size": "2.35rem",
    "--bank-body-size": "0.84rem",
  },
  standard: {
    "--bank-display-size": "3.8rem",
    "--bank-heading-size": "2.65rem",
    "--bank-body-size": "0.9rem",
  },
  expressive: {
    "--bank-display-size": "4.25rem",
    "--bank-heading-size": "2.95rem",
    "--bank-body-size": "0.96rem",
  },
} as const;

const densityVariables = {
  compact: {
    "--bank-grid-gap": "8px",
    "--bank-control-gap": "6px",
  },
  comfortable: {
    "--bank-grid-gap": "12px",
    "--bank-control-gap": "8px",
  },
  spacious: {
    "--bank-grid-gap": "18px",
    "--bank-control-gap": "10px",
  },
} as const;

export const SHOWROOM_BANK_TOKEN_STYLES = Object.freeze(
  Object.fromEntries(
    Object.values(SHOWROOM_DESIGN_SYSTEMS).map((system) => [
      system.id,
      {
        id: system.id,
        label: system.label,
        variables: {
          "--bank-bg": system.colors.canvas,
          "--bank-surface": system.colors.surface,
          "--bank-ink": system.colors.text,
          "--bank-muted": system.colors.textMuted,
          "--bank-accent": system.colors.primary,
          "--bank-accent-soft": system.colors.primarySoft,
          "--bank-secondary": system.colors.secondary,
          "--bank-secondary-soft": system.colors.secondarySoft,
          "--bank-on-secondary": system.colors.onSecondary,
          "--bank-section-alt": system.colors.secondarySoft,
          "--bank-section-strong": system.colors.secondary,
          "--bank-line": system.colors.border,
          "--bank-radius": `${system.shape.radius}px`,
          "--bank-display": system.typography.displayStack,
          "--bank-body": system.typography.bodyStack,
          "--bank-container-max": `${system.layout.containerMax}px`,
          "--bank-section-mobile": `${system.spacing.sectionMobile}px`,
          "--bank-section-desktop": `${system.spacing.sectionDesktop}px`,
          "--bank-hero-max-height": `${system.media.maxHeroHeight}px`,
          "--bank-product-columns": String(system.media.maxProductColumns),
          "--bank-hero-aspect": system.media.heroAspect.replace(":", " / "),
          "--bank-product-aspect": system.media.productAspect.replace(":", " / "),
          "--bank-media-fit": system.media.fit,
          ...typographyVariables[system.typography.scale],
          ...densityVariables[system.layout.density],
          ...sharedExperienceVariables,
        },
      },
    ]),
  ),
) as Readonly<Record<string, BankTokenStyle>>;

export type ShowroomBankTokenId = keyof typeof SHOWROOM_BANK_TOKEN_STYLES;
