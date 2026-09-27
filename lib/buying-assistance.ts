// Retained optional values for existing records and older request retries.
export type BuyingService = "purchase" | "business_check" | "quality_check";
export function isCallbackRequest(category: string) {
  return category === "buying_assistance" || category === "shipment_observation";
}
export function buyingService(value: unknown): BuyingService | null {
  return value === "purchase" || value === "business_check" || value === "quality_check" ? value : null;
}
