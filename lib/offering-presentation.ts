export const MAX_OFFERING_PRICE_MINOR = 999_999_999;
export const MAX_OFFERING_HIGHLIGHTS = 6;

const controlPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function normalizeOfferingPriceMinor(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_OFFERING_PRICE_MINOR) {
    throw new Error("Price must be a valid non-negative ETB amount.");
  }
  return parsed;
}

export function normalizeOfferingUnit(value: unknown): string {
  const normalized = String(value ?? "").trim().replace(controlPattern, "").replace(/\s+/g, " ");
  if (normalized.length > 40) throw new Error("Quantity unit is too long.");
  return normalized;
}

export function normalizeOfferingHighlights(value: unknown): string[] {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];
  const normalized = entries
    .map((entry) => String(entry ?? "").trim().replace(controlPattern, "").replace(/\s+/g, " "))
    .filter(Boolean);
  if (normalized.some((entry) => entry.length > 80)) {
    throw new Error("Each offering highlight must be 80 characters or fewer.");
  }
  const unique = [...new Set(normalized)];
  if (unique.length > MAX_OFFERING_HIGHLIGHTS) {
    throw new Error("Use no more than six offering highlights.");
  }
  return unique;
}

export function parseOfferingHighlightsJson(value: unknown): string[] {
  if (!value) return [];
  try {
    return normalizeOfferingHighlights(JSON.parse(String(value)));
  } catch {
    return [];
  }
}

export function formatEtbPrice(priceMinor: number | null): string {
  if (priceMinor === null) return "";
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: priceMinor % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(priceMinor / 100);
}
