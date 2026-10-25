---
id: DEP-051
title: AfricMade presentation rollout on the current domain and Android identity
status: ready
related: [FE-070, FE-049, FE-041, BE-014, BE-059, DEP-044, DEP-049]
owners: [product, frontend, operations]
last_updated: 2026-10-24
change_level: L4
---

# DEP-051 — AfricMade presentation rollout

## Problem and outcome

Ship the AfricMade name, copy, logo, app artwork and metadata on the existing
website at `https://mirtpage.com`, then create one locally signed Android build
from the same admitted source. Preserve the current domain, Auth/Firebase/Expo
project identifiers, `com.mirtpage.app` package, deep-link handling, signing key,
database, accounts, demo businesses, contacts and historical data. Do not claim
that source branding alone changes a managed service's sender name or an existing
Play listing. A new Google Play submission and managed-service renames are later
separate steps; no public app release or new package is inferred here.

The user's requested logo and icon approval is the only routine visual owner
gate. The rest of the changed UI receives agent-led Chrome desktop/phone and
Expo review. Any operation-specific provider guard that refuses a hosted write
remains binding; do not bypass it. The presentation rebrand itself needs no
database migration. FE-041/BE-014 S173 adds product order-size declarations in
the same proposed release, so its additive schema migration 80 must be guarded,
qualified and applied before web or native clients that read or write that field.

## Scenarios

1. GIVEN a fresh web visitor on `mirtpage.com` WHEN they open Market, About,
   Featured, a showroom and an enquiry THEN the visible platform identity is
   AfricMade, content remains compact, and actual supplier/product information
   stays prominent. Canonical URLs still use the temporary domain.
2. GIVEN a fresh native user WHEN they open Market, a showroom, enquiry, account
   and transport THEN artwork, launch screen, app name and copy use AfricMade;
   runtime/API target and installed package remain the admitted identifiers.
3. GIVEN an existing account, tenant or conversation WHEN the updated clients
   load it THEN content, authorization, links and message delivery retain their
   previous behavior. Product enquiry choices and editable drafts remain as
   before; default text stays brief and never invents prices or lead times. No
automatic sharing of supplier enquiries occurs.
4. GIVEN an English, Amharic or Afaan Oromo user WHEN they use core public and
   account tasks THEN the new story and labels are understandable, readable and
   consistent across web/native. Unsupported locale catalogs remain compatible.
5. GIVEN the release source and logo are approved WHEN website and local Android
   gates pass THEN publish the exact web artifact, verify live routes/assets and
   build one signed local AAB with a derived test APK. Report web delivery,
   Android static qualification, physical-device behavior and Play delivery as
   separate evidence.

## Test plan

Use FE-070's localized-copy and SEO assertions, BE-059's notification/mail
compatibility tests and DEP-049's current web/native release checks. Assert the
new public name while explicitly asserting unchanged URL, package, API, tenant
data and provider IDs. Run actual Chrome desktop/phone and Expo tasks in each
active language, inspect small icons/splash, then one source-matched web release
gate and Android bundle inspection. Record any missing physical-device evidence.

## Rollout and recovery

Freeze a clean branch from the verified default source and preserve unrelated
worktrees. Audit public text/assets and stable identifiers before edits. Update
FE-070/FE-049/BE-059 contracts, then source and focused tests. Review the exact
logo/icon with the owner; run actual browser/Expo tasks and full gates once source
is frozen. Integrate through the repository GitHub workflow and bind CI to the
current head before publishing. Retain the previous Netlify deploy as rollback;
an unexpected hosted mutation stops further writes under DEP-029/DEP-049.
For Android, use the existing release policy and signer, fresh dependency audit,
one-source build and independent artifact inspection under DEP-044. A previous
one-build tooling exception does not automatically cover this artifact.
The 2026-10-24 minimal-showroom logo replacement uses newly versioned canonical
asset URLs while old public URLs serve the same new image. The website and next
local Android artifact must come from one merged, source-matched tree; the prior
maker-and-cube v5 bundle cannot qualify this new artwork. Preserve the live
deploy until the exact replacement artifact passes its required gates.
