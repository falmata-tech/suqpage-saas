# AfricMade engineering readiness

S189 assessment: 2026-11-12; delivery status reconciled 2026-11-14 under
DEP-002, DEP-052 and BE-065.
The repository is `falmata-tech/suqpage-saas`; AfricMade is the current product
name. Historical Suqpage/MirtPage provider and protocol identifiers remain
intentional compatibility boundaries. Resume the active checklist, not an old
release transcript.

## Verified baseline

| Area | Verified state | Remaining qualification |
| --- | --- | --- |
| Source | S189 merged in PR #58 as main `5557d5e`, with all five required PR and post-merge jobs passing; the current main also retains the S197 handoff from PR #70 | S197 media review and S191 signed Android successor remain separate work |
| Stack | Root Next.js 16.4.2; Expo 57/RN 0.86.3 under apps/mobile; shared contracts; CI pins Node 24.18.1 | Current local Node 24.22.1 meets the declared engine range; use the CI pin for source-bound release qualification |
| Netlify | Existing africmade project builds protected main with the maintained Next adapter; PR #58 automatically published deploy `6af656dfc37bdf4701b82d65` in 44s | Read-only health on 2026-11-14 reported source `0f099021`; PR/branch previews remain disabled without an isolated backend |
| Environments | Production variables retained; branch deploys and PR previews disabled; fork builds retain approval policy | No isolated hosted preview Supabase exists; never copy production secrets into preview contexts |
| Supabase | Exact africmade project sjeiiqxgscuqajpgddcc, eu-west-1, ACTIVE_HEALTHY; S196 records application ledger 83 and one private storage bucket | BE-065 records the guarded security correction; Auth remains separately guarded |
| PostgreSQL | Real 17.10 fixture service passed native installation/seeding and migration 81 regression; the current workspace has the local Docker/Supabase stack running | Earlier standalone SQL evidence did not supply managed Auth/Storage; current local services do not prove full release gates |
| Build | S189's clean root/contracts install and web-only audit reported 0 vulnerabilities; the maintained Netlify build and packaged handler/Sharp initialized on Linux | Later dependency changes need their own audit; the local offline edge type-import warning was absent from the hosted build |
| GitHub | Main protected; the five-job PR/main workflow passed for PR #58; four Dependabot PRs remain open | Detailed main protection readback is denied (403); do not infer later settings from historical checks |
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
followed by the guarded development launcher. The original S189 review host
lacked Docker and local managed Auth/Storage: its full source check stopped at
provider-backed account erasure and was not a pass. PR #58 later passed the
required managed CI jobs, including provider browser, container and PostgreSQL
checks. That evidence does not qualify a fresh full release or native device.

This workspace now has Docker, the local Supabase stack, Node 24.22.1, and a
locally installed pinned Supabase CLI 2.111.0 under the ignored `.local/tooling/`
directory. Local API health returns 200. The local CLI needs its workspace path
and writable config/cache settings when invoked; no credential or hosted target
is implied by its installation. Use the repository's guarded launchers and
disposable fixtures rather than a production target. Earlier isolated SQL and
network-namespace diagnostics remain historical evidence from the prior host.

## Next work

1. Resume S197's exact public-demo video review and portrait playback fix. Keep
   unreviewed external media out of production, and use the protected finite
   correction only after the complete source and identity plan is qualified.
2. Keep S191's signed AfricMade Android/Play/device work visible. Expo web
   preview does not qualify the next signed binary or physical-device behavior.
3. Complete S192 support-mailbox setup only after the owner completes the guarded
   Google sign-in/app-password step; verify exact provider targets and before-states.
4. Review the four Dependabot PRs separately, retaining old branches until unique
   work and artifact lineage are established. Do not bulk-update or delete them.
5. Establish backup freshness/restore ownership and external health-alert receipt
   using existing provider capabilities before adding services or paid plans.

S189 did not rotate credentials, add a publisher, replace provider accounts or
change other products. BE-065 records the finite, tested correction to nine
mutable trigger paths and unnecessary API-role grants. The password-protection
advisor remains distinct from the product's OTP-only Auth policy and review-login
exception.
