import {DEMO_MARKET_ASSIGNMENTS} from './demo-market-assignments';

/** Order is also used for the default category of an unclassified listing. */
export const PRIMARY_INDUSTRY_SQL = `COALESCE((
  SELECT i.industry_key
  FROM business_industries i
  WHERE i.business_id=b.id
  ORDER BY CASE i.industry_key
    WHEN 'electronics' THEN 0
    WHEN 'beauty-wellness' THEN 1
    WHEN 'agriculture-growers' THEN 2
    WHEN 'food-farming' THEN 3
    WHEN 'machinery-tools' THEN 4
    WHEN 'home-living' THEN 5
    WHEN 'fashion-textiles' THEN 6
    ELSE 999
  END,i.industry_key
  LIMIT 1
),'all')`;

// SQL literals here are derived solely from the source-controlled taxonomy.
const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";
const values = (rows: readonly (readonly string[])[]) =>
  rows.map(row => '(' + row.map(literal).join(',') + ')').join(',\n');
const assignments = DEMO_MARKET_ASSIGNMENTS.flatMap(([handle, industry, group, names]) =>
  Array.from(names, name => [handle, industry, group, name] as const));

const aliases = new Map<string, readonly [string, string, string]>();
for (const [, industry, group] of DEMO_MARKET_ASSIGNMENTS) {
  aliases.set(industry + ':' + group, [industry, group.toLowerCase(), group]);
}
for (const alias of [
  ['beauty-wellness', 'oils', 'Skin & body care'],
  ['food-farming', 'fruit', 'Fruit, vegetables & herbs'],
  ['food-farming', 'vegetables', 'Fruit, vegetables & herbs'],
  ['home-living', 'candles', 'Candles & decor'],
] as const) {
  aliases.set(alias[0] + ':' + alias[1], alias);
}

/** Include after joining the product and its seller (aliases product and b). */
export const MARKET_TAXONOMY_JOIN = `
  LEFT JOIN (VALUES ${values(assignments)}) AS reviewed(handle, industry, subcategory, product_name)
    ON b.is_demo=1 AND reviewed.handle=b.handle AND reviewed.product_name=product.name
  CROSS JOIN LATERAL (SELECT COALESCE(reviewed.industry, ${PRIMARY_INDUSTRY_SQL}) AS industry) department
  LEFT JOIN categories market_shelf ON market_shelf.id=product.category_id
    AND market_shelf.business_id=b.id AND market_shelf.is_active=1
  LEFT JOIN (VALUES ${values([...aliases.values()])}) AS standard(industry, shelf, subcategory)
    ON standard.industry=department.industry AND standard.shelf=lower(trim(market_shelf.name))
`;

export const MARKET_SUBCATEGORY_SQL = 'COALESCE(reviewed.subcategory, standard.subcategory)';
