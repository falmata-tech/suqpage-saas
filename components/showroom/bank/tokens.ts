import { SHOWROOM_DESIGN_SYSTEMS } from "@/lib/showroom-design-systems";
import type { BankTokenStyle } from "./types";

const sharedExperienceVariables = {
  "--bank-motion-duration": "560ms",
  "--bank-motion-distance": "18px",
  "--bank-motion-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
  "--bank-decoration-size": "180px",
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
          ...sharedExperienceVariables,
        },
      },
    ]),
  ),
) as Readonly<Record<string, BankTokenStyle>>;

export type ShowroomBankTokenId = keyof typeof SHOWROOM_BANK_TOKEN_STYLES;
