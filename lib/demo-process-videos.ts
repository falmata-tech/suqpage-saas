export type DemoProcessVideo = {
  ref: `youtube:${string}`;
  label: string;
};

const PROCESS_VIDEOS = {
  apparel: { ref: "youtube:wJV9EDe_sFc", label: "Garment production process" },
  ceramics: { ref: "youtube:NJMPGgcDylY", label: "Ceramics production process" },
  electronics: { ref: "youtube:rRbIS71ZVpU", label: "Electronics assembly process" },
  farming: { ref: "youtube:a2c1vNB-Bpg", label: "Farm production and packing" },
  furniture: { ref: "youtube:pLL4PW4LZT8", label: "Furniture production process" },
  grain: { ref: "youtube:ftMC5TSJSBg", label: "Grain milling process" },
  honey: { ref: "youtube:gkqKw1n6VQg", label: "Honey production process" },
  metal: { ref: "youtube:G034cOM2th8", label: "Metal production process" },
  paper: { ref: "youtube:IaFy4gizZXk", label: "Paper and packaging production" },
  pasta: { ref: "youtube:2H4PO4yVIsI", label: "Pasta production process" },
  soap: { ref: "youtube:WHyh9auBmA0", label: "Soap and personal-care production" },
  coffee: { ref: "youtube:Az0W61hotLM", label: "Coffee processing" },
  water: { ref: "youtube:_ZybbjLgOuQ", label: "Bottled-water production" },
} as const satisfies Record<string, DemoProcessVideo>;

const rules: Array<[RegExp, DemoProcessVideo]> = [
  [/\b(pasta)\b/i, PROCESS_VIDEOS.pasta],
  [/\b(bottled water)\b/i, PROCESS_VIDEOS.water],
  [/\b(coffee)\b/i, PROCESS_VIDEOS.coffee],
  [/\b(honey|apiary|beeswax)\b/i, PROCESS_VIDEOS.honey],
  [/\b(flour|grain|mill|spice)\b/i, PROCESS_VIDEOS.grain],
  [/\b(soap|hygiene|botanical|herbal|body care|hair care|natural oils?|balms?)\b/i, PROCESS_VIDEOS.soap],
  [/\b(ceramic|clay|pottery)\b/i, PROCESS_VIDEOS.ceramics],
  [/\b(paper|packaging)\b/i, PROCESS_VIDEOS.paper],
  [/\b(garment|workwear|uniform|textile|weav|loom|cloth|fabric|bag)\b/i, PROCESS_VIDEOS.apparel],
  [/\b(furniture|timber|joinery|wood|basket)\b/i, PROCESS_VIDEOS.furniture],
  [/\b(farm|grow|seed|orchard|nursery|produce)\b/i, PROCESS_VIDEOS.farming],
  [/\b(electri|electronic|circuit|device|solar|radio|cable|sensor|meter|lighting|appliance)\b/i, PROCESS_VIDEOS.electronics],
  [/\b(metal|rebar|weld|machine|fabrication|equipment|tool|building product)\b/i, PROCESS_VIDEOS.metal],
];

export function demoProcessVideoFor(...values: string[]): DemoProcessVideo {
  const description = values.join(" ");
  return rules.find(([pattern]) => pattern.test(description))?.[1] || PROCESS_VIDEOS.apparel;
}

export const DEMO_PROCESS_VIDEOS = Object.freeze(PROCESS_VIDEOS);
