# Simple posting and local startup review

Local candidate, verified 2026-09-19. Controlling specs: FE-047, BE-040,
DEP-037 and DEP-027. Visual approval and full release gates remain pending.

## Review

Open `http://127.0.0.1:3102/dashboard/products/new` while signed in as an owner.
The editor has image, name, optional YouTube video, optional ETB price and one
description. Image replacement/removal stays inside the image controls. Staff
retain detailed controls. Existing services, options, categories, availability,
visibility and legacy associations survive owner edits. New items use the existing
standard-product storage default; type is not inferred from the description.

Desktop and 390/320px evidence is under `.local/business-starter-review/`.
The browser fixture proves exactly five content fields, populated starters,
create/save/reload, metadata preservation, private page denial and safe previews.
Nineteen captures and three accessibility scans pass. Fixtures use isolated local
sessions; they do not prove hosted Auth delivery. Generic starter artwork is
illustrative sample content, not business photography.

## Local startup

After the existing initial setup, run:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3102
```

The launcher validates loopback settings before service commands, reuses healthy
PostgreSQL/Auth, opens Docker Desktop on macOS if stopped, and starts local
Supabase if needed. Bounded failures give local recovery instructions. It never
resets, seeds, migrates or changes hosted configuration. Initial installation and
local runtime configuration remain explicit. Other systems need a running Docker
engine. Stopping Next leaves database services running.

Startup state-machine tests cover ready/stopped/resumed/failure/timeout paths;
actual launcher tests cover CLI precedence, origin and invalid-target rejection.
A real launcher on temporary port 3105 and the existing app on 3102 both returned
HTTP 200 for health and the rendered public page. The temporary server was stopped.
Cold Docker boot was simulated in tests, without stopping other running projects.

## Text search

All whitespace-separated terms must match one offering together with its business
name, handle, description or reviewed location, in any order. Unicode NFKC and
case-insensitive matching handle equivalent written text; wildcard characters are
literal. Exact/prefix title ranking remains, with five-row backend pages and the
same eligibility predicate for totals. Hidden items and private businesses remain
excluded. Terms from two different products cannot be combined into a false hit.

Focused discovery/pagination tests cover reordered words, mixed case, Ethiopic
text, equivalent Unicode accents, literal percent/underscore, private content and
stable pagination. Product upkeep tests cover preserved metadata, foreign tenant,
stale version and duplicate submission. Typecheck and 148-spec validation pass.

## Multilingual search options (researched, not integrated)

For launch, use this deterministic text search and collect examples of missed
queries. A subsequent reviewed synonym dictionary could connect business terms
and local-language aliases without AI. PostgreSQL also offers full-text dictionaries
and trigram similarity for typo tolerance and indexing; those extensions are not
added by this change. See the official [dictionary documentation](https://www.postgresql.org/docs/17/textsearch-dictionaries.html)
and [pg_trgm documentation](https://www.postgresql.org/docs/17/pgtrgm.html).

Cross-language meaning matching needs more than Unicode normalization. A possible
later hybrid combines keyword results with text embeddings generated from public
offering/business/location text. [Cohere documents multilingual semantic search](https://docs.cohere.com/docs/semantic-search-embed)
and [lists Amharic among supported languages](https://docs.cohere.com/docs/supported-languages),
while warning that quality varies by language. Its cited list does not establish
Afaan Oromo or Afar support. Evaluate representative local-language queries before
choosing a provider. No subscription, provider call, text export, translation or
image/video analysis has been introduced. Self-hosting an embedding model is also
possible, but still uses AI and requires model/runtime operations.

## Remaining gates

Owner visual approval, full check/build/release/acceptance, reviewed task commit
and verified rollout remain. No production change or commit is claimed. Earlier
service/place/starter and first-page publication tasks retain their separate gates.

The 2026-09-20 FE-048 candidate adds Product/Service selection and direct owner
publication/location Save. See `SUQPAGE-SELF-SERVICE-REVIEW.md` for current evidence;
the five-field-only screenshots above are the earlier checkpoint.
