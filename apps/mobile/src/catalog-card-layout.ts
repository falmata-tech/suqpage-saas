export const CATALOG_CARD_GAP = 12;
const MIN_CARD_WIDTH = 150;
type CatalogCardStyle =
  | { width: '100%'; flexBasis?: never; flexGrow?: never; minWidth?: never }
  | { width?: never; flexBasis: '47%'; flexGrow: 1; minWidth: 0 };

/** onLayout is pixel-rounded; let Yoga divide its actual remaining row width. */
export function catalogCardStyle(measuredWidth: number, fontScale: number): CatalogCardStyle {
  return Number.isFinite(measuredWidth) && measuredWidth >= MIN_CARD_WIDTH * 2 + CATALOG_CARD_GAP && fontScale <= 1.3
    ? { flexBasis: '47%', flexGrow: 1, minWidth: 0 }
    : { width: '100%' };
}
