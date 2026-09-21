import type { OfferingKind } from './offerings';

export type DemoOfferingDetails = {
  description: string; kind: OfferingKind; unit?: string; highlights?: string[];
  options?: ReadonlyArray<{ name: string; values: readonly string[] }>;
};

// Seed/correction policy only; never rewrite customer descriptions during saves.
export function simplifyDemoOffering(input: DemoOfferingDetails): {
  description: string; kind: 'standard_product' | 'service';
} {
  const sentences = [input.description.trim()];
  if (input.unit) sentences.push(`Offered by ${input.unit}.`);
  if (input.highlights?.length) sentences.push(`${input.highlights.join('. ')}.`);
  for (const option of input.options || []) {
    if (option.values.length) sentences.push(`${option.name}: ${option.values.join(', ')}.`);
  }
  const description = [...new Set(sentences)].join(' ').replace(/\s+/g, ' ').trim();
  if (!description || description.length > 3000) throw Error('Review this demo description before simplifying it.');
  return { description, kind: input.kind === 'service' || input.kind === 'manufacturing_capability' ? 'service' : 'standard_product' };
}
