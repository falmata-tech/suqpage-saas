import {demoScenario, demoScenarioStage, parseDemoScenarioParameters, type DemoScenarioKey, type DemoScenarioParameters} from './demo-scenarios';

export const MAX_DEMO_CATALOG_BUSINESSES = 64;
export const MAX_DEMO_CATALOG_PRODUCTS = 8;
export type DemoCatalogProductInput = {productId: number; scenarioKey: DemoScenarioKey; parameters: DemoScenarioParameters; initializeUnit?: boolean};
export type DemoCatalogProduct = Omit<DemoCatalogProductInput, 'initializeUnit'> & {scenarioVersion: 1; baselineDescription: string; phaseOffset: number};

export function parseDemoCatalogInputs(raw: unknown): DemoCatalogProductInput[] {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > MAX_DEMO_CATALOG_PRODUCTS) throw Error('Choose a complete bounded demo catalog.');
  const products = raw.map(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !['productId','scenarioKey','parameters','initializeUnit'].includes(key))) throw Error('Invalid demo catalog member.');
    const v = value as Record<string, unknown>;
    if (!Number.isSafeInteger(v.productId) || Number(v.productId) < 1 ||
      v.initializeUnit !== undefined && typeof v.initializeUnit !== 'boolean') throw Error('Invalid demo catalog identity.');
    const parameters = parseDemoScenarioParameters(v.parameters), scenarioKey = String(v.scenarioKey) as DemoScenarioKey;
    demoScenarioStage(scenarioKey, 1, 0, parameters);
    return {productId: Number(v.productId), scenarioKey, parameters, ...(v.initializeUnit === true ? {initializeUnit: true} : {})};
  });
  if (products.some((p,index) => index > 0 && p.productId <= products[index-1].productId)) throw Error('Demo catalog identities must be distinct and sorted.');
  return products;
}

/** Deterministic offsets cover all six phases with a usable product, including
 * catalogs mixing harvest, replenishment and made-to-order production. */
export function demoCatalogPhaseOffsets(inputs: readonly DemoCatalogProductInput[]): number[] {
  if (inputs.length < 2 || inputs.length > MAX_DEMO_CATALOG_PRODUCTS) throw Error('Invalid demo catalog size.');
  const preferred = [0,2,4,1,3,5], covered = new Set<number>(), offsets: number[] = [];
  for (const [index,input] of inputs.entries()) {
    let best = 0, score = -1;
    const choices = index === 0 ? [0] : [...preferred.slice(index%6), ...preferred.slice(0,index%6)];
    for (const offset of choices) {
      const added = Array.from({length:6},(_,stage) => stage).filter(stage => !covered.has(stage) &&
        demoScenarioStage(input.scenarioKey,1,(stage+offset)%6,input.parameters).product.availability !== 'coming_soon');
      if (added.length > score) {best = offset; score = added.length;}
    }
    offsets.push(best);
    for (let stage=0;stage<6;stage++) if (demoScenarioStage(input.scenarioKey,1,(stage+best)%6,input.parameters).product.availability !== 'coming_soon') covered.add(stage);
  }
  if (covered.size !== 6) throw Error('Every demo phase needs an inquiry-eligible product.');
  return offsets;
}

export function parseStoredDemoCatalog(raw: string): DemoCatalogProduct[] {
  if (raw.length > 80000) throw Error('Demo catalog exceeds its bound.');
  const value: unknown = JSON.parse(raw);
  if (Array.isArray(value) && !value.length) return [];
  if (!Array.isArray(value)) throw Error('Invalid stored demo catalog.');
  const inputs = parseDemoCatalogInputs(value.map(v => {
    if (!v || typeof v !== 'object' || Array.isArray(v) ||
      Object.keys(v).some(k => !['productId','scenarioKey','parameters','scenarioVersion','baselineDescription','phaseOffset'].includes(k))) throw Error('Invalid stored demo member.');
    return {productId:v.productId,scenarioKey:v.scenarioKey,parameters:v.parameters};
  }));
  const products = inputs.map((input,index) => {
    const v = value[index] as Record<string, unknown>;
    if (v.scenarioVersion !== 1 || typeof v.baselineDescription !== 'string' || v.baselineDescription.length > 2500 ||
      !Number.isInteger(v.phaseOffset) || Number(v.phaseOffset) < 0 || Number(v.phaseOffset) > 5) throw Error('Invalid stored demo baseline.');
    demoScenario(input.scenarioKey,1);
    return {...input,scenarioVersion:1 as const,baselineDescription:v.baselineDescription,phaseOffset:Number(v.phaseOffset)};
  });
  for (let stage=0;stage<6;stage++) demoCatalogStage(products,stage);
  return products;
}

export function demoCatalogStage(products: readonly DemoCatalogProduct[], stage: number) {
  if (!Number.isInteger(stage) || stage < 0 || stage > 5 || products.length < 2 || products.length > MAX_DEMO_CATALOG_PRODUCTS) throw Error('Invalid demo catalog phase.');
  const plans = products.map(binding => ({binding,plan:demoScenarioStage(binding.scenarioKey,binding.scenarioVersion,(stage+binding.phaseOffset)%6,binding.parameters)}));
  if (!plans.some(({plan}) => ['available','limited'].includes(plan.product.availability))) throw Error('The demo catalog would have no usable product.');
  return plans;
}
