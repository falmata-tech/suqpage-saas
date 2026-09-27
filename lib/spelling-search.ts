import { discoveryCategoryKey } from "./discovery-contract";
import { indexedSearchText } from './search-index';
import { normalizeSearchText, searchTermGroups } from './search-terms';

export type SpellingMatch = { kind: 'product' | 'business'; id: number; businessId: number; score: number };
export interface SpellingSearchPort {
  all<T extends Record<string, unknown>>(sql: string, values?: Array<string | number>): Promise<T[]>;
}
export type SpellingScope = { query: string; industry: string; city: string; region: string; scale: string; exactBusinessIds: readonly number[] };
const CANDIDATES_PER_FIELD = 32;
export const MAX_SPELLING_MATCHES = 100;
const MIN_SIMILARITY = 0.25;

export function spellingTerms(query: string) {
  return searchTermGroups(query).map((variants, index) => ({
    word: variants[0], variants,
    patterns: variants.map(term => `%${term.replace(/[\\%_]/g, '\\$&')}%`),
    fuzzy: index < 8 && /^[\p{L}\p{N}]{3,}$/u.test(variants[0]),
  }));
}
const eligible = `b.status='active' AND p.is_excluded=0 AND p.approved_at>0
  AND (scope.industry='all' OR EXISTS(SELECT 1 FROM business_industries i WHERE i.business_id=b.id AND i.industry_key=ANY(string_to_array(scope.industry,','))))
  AND (scope.city='' OR lower(p.city)=lower(scope.city)) AND (scope.region='' OR lower(p.region)=lower(scope.region))
  AND (scope.scale='' OR p.production_scale=scope.scale)
  AND EXISTS(SELECT 1 FROM products listed WHERE listed.business_id=b.id AND listed.is_published=1)`;
const businessJoin = `JOIN business_discovery_profiles p ON p.business_id=b.id CROSS JOIN scope`;
const publicationJoin = `LEFT JOIN owner_page_publications publication ON publication.business_id=b.id
  AND publication.revision=(SELECT max(revision) FROM owner_page_publications WHERE business_id=b.id)`;
const businessFields = ['b.name','b.handle','b.tagline',"COALESCE(publication.content_json::jsonb->>'about',b.description)",'p.city','p.zone','p.region'];
const seedSources = [
  { from: `products product JOIN businesses b ON b.id=product.business_id ${businessJoin}`, id: 'product.id', text: indexedSearchText(['product.name','product.description']), extra: 'AND product.is_published=1' },
  { from: `businesses b ${businessJoin}`, id: 'NULL::bigint', text: indexedSearchText(['b.name','b.handle','b.tagline','b.description']), extra: '' },
  { from: `businesses b ${businessJoin}`, id: 'NULL::bigint', text: indexedSearchText(['p.city','p.zone','p.region']), extra: '' },
  { from: `owner_page_publications publication JOIN businesses b ON b.id=publication.business_id ${businessJoin}`, id: 'NULL::bigint', text: indexedSearchText(["publication.content_json::jsonb->>'about'"]), extra: 'AND publication.revision=(SELECT max(revision) FROM owner_page_publications WHERE business_id=b.id)' },
];

// KNN probes are bounded before scoring; no full catalog is transferred to JS.
export const SPELLING_SEARCH_SQL = `WITH scope AS MATERIALIZED (
  SELECT ?::text industry,?::text city,?::text region,?::text scale,ARRAY(SELECT jsonb_array_elements_text(?::jsonb)::bigint) exact_businesses
), terms AS MATERIALIZED (
  SELECT term->>'word' word,ARRAY(SELECT jsonb_array_elements_text(term->'variants')) variants,
    ARRAY(SELECT jsonb_array_elements_text(term->'patterns')) patterns,(term->>'fuzzy')::boolean fuzzy
  FROM jsonb_array_elements(?::jsonb) term
), seeds AS MATERIALIZED (
  ${seedSources.map(source => `SELECT nearest.business_id,nearest.product_id FROM terms term
    CROSS JOIN LATERAL (SELECT b.id business_id,${source.id} product_id
      FROM ${source.from} WHERE term.fuzzy AND ${eligible} ${source.extra}
      ORDER BY ${source.text} OPERATOR(extensions.<->>) term.word
      LIMIT ${CANDIDATES_PER_FIELD}) nearest`).join('\nUNION\n')}
), candidate_products AS MATERIALIZED (
  SELECT product.id,product.business_id FROM products product
  WHERE product.is_published=1 AND product.id IN(SELECT product_id FROM seeds)
  UNION
  SELECT product.id,seed.business_id FROM (SELECT DISTINCT business_id FROM seeds WHERE product_id IS NULL) seed
  CROSS JOIN LATERAL (SELECT id FROM products WHERE business_id=seed.business_id AND is_published=1
    ORDER BY id LIMIT ${CANDIDATES_PER_FIELD}) product
), documents AS (
  SELECT 'product' kind,product.id,b.id business_id,product.name,
    ${indexedSearchText(['product.name','product.description',...businessFields])} document
  FROM candidate_products candidate JOIN products product ON product.id=candidate.id
  JOIN businesses b ON b.id=product.business_id ${businessJoin} ${publicationJoin} WHERE ${eligible}
  UNION ALL
  SELECT 'business',b.id,b.id,b.name,${indexedSearchText(businessFields)}
  FROM businesses b ${businessJoin} ${publicationJoin}
  WHERE b.id IN(SELECT business_id FROM seeds) AND ${eligible}
), scored AS MATERIALIZED (
  SELECT d.kind,d.id,d.business_id,d.name,quality.score,quality.exact
  FROM documents d CROSS JOIN LATERAL (
    SELECT avg(term_score) score,min(term_score) weakest,bool_and(normal) exact FROM (
      SELECT document ILIKE ANY(term.patterns) normal,
        CASE WHEN document ILIKE ANY(term.patterns) THEN 1::real
          WHEN term.fuzzy THEN COALESCE((SELECT max(extensions.word_similarity(v,document)) FROM unnest(term.variants) v
            WHERE extensions.word_similarity(v,document)>=${MIN_SIMILARITY} AND EXISTS (
              SELECT 1 FROM regexp_split_to_table(document,'[^[:alnum:]]+') token
              WHERE length(token) BETWEEN greatest(1,length(v)-2) AND least(255,length(v)+2)
                AND extensions.levenshtein_less_equal(left(token,255),left(v,255),CASE WHEN length(v)<=5 THEN 1 ELSE 2 END)
                  <=CASE WHEN length(v)<=5 THEN 1 ELSE 2 END)),0::real)
          ELSE 0::real END term_score FROM terms term
    ) scores
  ) quality WHERE quality.weakest>=${MIN_SIMILARITY}
), combined AS (
  SELECT kind,id,business_id,name,score FROM scored WHERE kind='product' AND NOT exact
  UNION ALL
  SELECT 'business',s.business_id,s.business_id,b.name,max(s.score)
  FROM scored s JOIN businesses b ON b.id=s.business_id CROSS JOIN scope
  WHERE NOT(s.business_id=ANY(scope.exact_businesses)) GROUP BY s.business_id,b.name
)
SELECT kind,id,business_id AS "businessId",score FROM (
  SELECT *,row_number() OVER(PARTITION BY kind ORDER BY score DESC,lower(name),id) position FROM combined
) ranked WHERE position<=${MAX_SPELLING_MATCHES}
ORDER BY score DESC,lower(name),kind,id`;

export async function findSpellingMatches(scope: SpellingScope, port: SpellingSearchPort): Promise<SpellingMatch[]> {
  const terms = spellingTerms(scope.query);
  if (!normalizeSearchText(scope.query) || !terms.some(term => term.fuzzy)) return [];
  return port.all<SpellingMatch>(SPELLING_SEARCH_SQL,[discoveryCategoryKey(scope.industry),scope.city,scope.region,scope.scale,JSON.stringify(scope.exactBusinessIds),JSON.stringify(terms)]);
}
