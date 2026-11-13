# AfricMade engineering readiness

Current assessment: 2026-11-12, controlled by DEP-002, DEP-052 and BE-065.
The repository is `falmata-tech/suqpage-saas`; AfricMade is the current product
name. Historical Suqpage/MirtPage provider and protocol identifiers remain
intentional compatibility boundaries. Resume the active checklist, not an old
release transcript.

## Verified baseline

| Area | Verified state | Remaining qualification |
| --- | --- | --- |
| Source | Main `120f480` includes the rebrand, owner email workflow, restored business Inbox and latest headline; five GitHub jobs passed in `40819547526` | Current housekeeping changes are on their own local task branch; they have not been published to GitHub |
| Stack | Root Next.js 16.4.2; Expo 57/RN 0.86.3 under apps/mobile; shared contracts; exact Node 24.18.1 | Use the pinned runtime, not the host's newer 24.x binary |
| Netlify | Existing africmade project now linked to this repo/main; root build, .next, native Next adapter 5.16.6; first Git build completed in 53s | Published current main; automatic publication on; actual next-merge trigger remains a separate observation |
| Environments | Production variables retained; branch deploys and PR previews disabled; fork builds retain approval policy | No isolated hosted preview Supabase exists; never copy production secrets into preview contexts |
| Supabase | Exact africmade project sjeiiqxgscuqajpgddcc, eu-west-1, ACTIVE_HEALTHY; application ledger 80; one private storage bucket | Database correction and final advisor readback are recorded with BE-065; Auth remains separately guarded |
| PostgreSQL | Real 17.10 fixture service built from verified official sources; native installation/seeding and migration 81 regression passed | A standalone SQL service does not supply managed Auth/Storage |
| Build | Clean 124-package root/contracts install; production audit 0 vulnerabilities; actual maintained Netlify build; exact packaged handler/Sharp initialize on Linux | Local offline edge bundler reported an unreachable remote type import; hosted build successfully bundled the edge function without that failure |
| GitHub | Main protected; existing five-job workflow green; four open Dependabot PRs | Connector cannot read detailed main protection (403); historic strict-check settings must not be represented as a fresh full readback |
| Recovery | Previous production deployment retained; protected Netlify before-state and exact database metadata/ACL before-images retained | Provider backup retention, complete Auth/Storage recovery exercise and alert delivery remain unverified |

## Application compared with the specification

The desktop Chrome review exercised actual public pages and controls without
sending customer inquiries, chats, codes or messages. Temporary inquiry-list
selections were removed after review.

| Workflow | Observed behavior | Contract / limit |
| --- | --- | --- |
| About | Buyer and supplier narratives, ownership and current brand | Current public positioning; no checkout |
| Daily Featured | Four scheduled Thursday businesses, EAT timing, five sponsor placements and business preview | Real schedule read from the hosted database; scheduled presentation is not proof of a TikTok broadcast |
| Showroom | Fictional business label, four products, product filtering and product details | Real database-backed catalog and loaded product media |
| Inquiry list | Add/remove item, contact options and unsent Inbox form | FE-075/BE-062 restored Inbox supersedes the older retirement prose |
| Direct inquiry | Only the opened product appears; saved list retains its separate original selection | No message was submitted |
| Transport | SharedTrucks Logistics provider intake and CargoChatter presentation credit | FE-076/BE-063: AfricMade team routes today's queue; provider-tenant dispatch is deferred |
| Shipment access | Separate recipient email/code entry with disabled empty submit | No OTP sent or recipient records accessed |

This is a bounded desktop review. Phone layouts, authenticated owner/staff/admin
writes, Expo, physical Android, actual email/push delivery and map behavior were
not newly qualified. Automated map reviews require synthetic tiles; no live OSM
tiles were fetched for this review.

## Local setup and verification limits

The standard development path remains the README's Docker/Supabase bootstrap,
followed by the guarded development launcher. This host lacks Docker and Supabase
CLI. The full source check reached the provider-backed account-erasure regression
and stopped because local Auth/Storage was absent; it did not pass end to end.
Browser acceptance, container/restore gates and full release qualification remain
unrun here. Focused SQL, security, types and workflow results belong in traceability.

For this workspace, the verified Node binary is under the ignored local tools
directory. Run project commands with that binary on PATH and `NODE_PATH` unset
for the command: the host's ambient shared dependency path otherwise makes the
web-install boundary detect unrelated host packages. Do not weaken the guard or
change global environment settings. The native test database is loopback-only,
uses generated protected credentials and disposable random schemas. This host
isolates command network namespaces, so start the test service and its consumers
inside one command/session; this limitation does not apply to ordinary local
Docker development. Stop the test service after its suite.

## Next work

1. Publish the reviewed local housekeeping branch and open its pull request.
   The owner's standing authorization covers routine publication, related fixes
   and protected merge; complete them without another approval prompt and
   without bypassing the five checks or required reviews.
2. Qualify this source through normal CI on a Docker-capable runner; complete
   owner/staff/admin and phone/Expo workflows when the local provider stack exists.
3. Keep the signed AfricMade Android/Play/device work in S188 visible. A web deploy
   or Expo preview does not qualify the next signed binary.
4. Review the four Dependabot PRs separately, retaining old branches until unique
   work and artifact lineage are established. Do not bulk-update or delete them.
5. Establish backup freshness/restore ownership and external health-alert receipt
   using existing provider capabilities before adding services or paid plans.

No credential rotation, broad RLS/index changes, extra publisher, provider account
replacement or other-product change is part of this housekeeping patch. The nine
mutable trigger paths and unnecessary API-role grants have a finite, tested
correction under BE-065. The password-protection advisor is kept distinct from
the product's OTP-only Auth policy and review-login exception.
