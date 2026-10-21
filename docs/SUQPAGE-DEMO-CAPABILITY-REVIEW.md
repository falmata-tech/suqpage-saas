# Demo capability review — 2026-09-20

Scope: S12, FE-023/BE-022/DEP-019; extends the local FE-048 candidate. No hosted
deployment or external contact delivery is claimed.

| Surface | Finding | Local completion |
|---|---|---|
| Public contact section | All 66 lacked website/TikTok/Instagram/Facebook; 61 lacked WhatsApp; 62 lacked Telegram | All 66 now have eight validated contact actions |
| Product/service inquiry | Missing contacts hid messaging channels | Published contacts drive WhatsApp, Telegram and SMS drafts, alongside copy and Suqpage inbox |
| Page/media/catalog | Covers, business videos, logos, descriptions and 264 offering images/video were complete | Preserved; Product/Service presentation remains simple |
| Owner dashboard | 32 demos had no client account; 61 had no inquiry | Added missing fictional local owner accounts and grouped inquiry examples |
| Support | 36 demos had no conversation history | Added clearly fictional closed conversations and example replies |
| Insights/account | Existing visits and subscription records present | Preserved; no fake customer payments or account-security changes |
| Search/map | All 66 demos and 264 offerings available; city points separated | Existing query, category, paging and location behavior preserved |
| Featured | Seven industry days and five sponsors | Verify portfolio-wide coverage; do not make every business sponsored |

The user explicitly supplied `@alhayabrand` even if the account is not real.
Telegram, TikTok, Instagram and Facebook use `alhayabrand`. Existing fictional
public emails/phones remain; WhatsApp uses each demo public phone; website uses
`https://example.com`. These links demonstrate the interface and message drafting,
not verified accounts or delivery. No external messages were sent.

One offering intentionally has no price to demonstrate **Ask for price**.
Removed capacity/minimum-order/lead-time/options are intentional simplifications.
Ordinary videos are not marked as genuine live broadcasts. Historical custom-page
requests, review queues and advanced recipe controls remain retired from live UI.
New customer starter defaults are unchanged; shared demo contacts are seed data,
not a runtime fallback for other businesses.

## Data operation and evidence

Protected backup and before-state are in `.local/demo-capability/`, ignored and
not for publication. Native backup validation passed before the exact-handle
transaction. It updated 66 demo page contact objects and added 32 missing demo
owners, 61 inquiry examples and 36 support examples. A follow-up completed only
those new support examples with 36 fictional replies. Existing account, product,
inquiry, support and non-demo business rows were verified unchanged. Private
credentials for new local demo accounts remain in a protected ignored file.

The first transaction attempt hit an incorrect audit-event table name and rolled
back. The corrected attempt required an identical before-state and committed only
after preservation checks. No retained database reset or schema change occurred.

`scripts/test-simple-demo-seed.ts` passes for all 66 fresh demos: basic offering
fields, area mode, eight contact links, three messaging drafts, client accounts,
inquiry items, support and insights. `scripts/demo-public-contacts.ts` is used only
by demo seeding/tests. The retained local read-only audit reports no missing page,
media or contact fields; the one optional-price example remains intentional.

Typecheck, 151-spec validation and whitespace checks pass. Fourteen focused browser captures pass in `.local/demo-capability-review/`: contact
sections and single/group inquiry drafts at 1440/390/320, phone disclosure only
after Send on Suqpage, Featured and owner/admin screens, overflow and scoped axe.
These use a disposable PostgreSQL schema and local test sessions. The temporary
app was stopped and its config removed.

Read-only HTTP checks on the retained local app passed for all 66 public pages,
each rendering all four requested social links. All seven Featured days have
entries (7/10/10/8/11/11/11); split-word Indigo/Selam search returns the expected
demo products within the five-row page. Visual approval,
full gates, commit and hosted rollout remain pending.

Local review: http://127.0.0.1:3102/@selam-weave and
http://127.0.0.1:3102/?industry=all; authenticated owner/admin screens use /dashboard.

## Verified rollout — 2026-09-21

Source `be134a247c8ea54b18b882f9e2368058f7fbc0ee` is published as Netlify `6ab0d349f099639821fa0f9a` at https://suqpage.com.
Full check, release, operations, all nine isolated provider browser scenarios,
artifact privacy and production dependency audit pass. Production schema 47,
64 updated demo pages/256 offerings, all 64 public routes, live search at
1440/390/320, email-only entry, private-route denial, health and www redirects
are independently verified. Mapped focused tests and earlier desktop/phone
reviews remain applicable; the owner approved this release.

Earlier dated pending-approval/local-only notes are superseded by this rollout.
No real external email was sent and no authenticated hosted account was used
for testing; those admission checks remain separate from local provider evidence.
Demo contact destinations are examples, not verified delivery channels.
See docs/SUQPAGE-RELEASE-2026-09-21.md for backup, rollback and limitations.
