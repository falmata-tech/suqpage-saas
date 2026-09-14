# Suqpage naming and compatibility

Controlling contracts: BE-036, DEP-032 and ADR-0021. The canonical product name is
Suqpage. Source symbols, new environment keys, package/container labels, public
asset paths, developer documents and the master brief use that name.

## Intentional retained identifiers

| Identifier | Reason and upgrade behavior |
| --- | --- |
| `MIRTPAGE_*`, `NEXT_PUBLIC_MIRTPAGE_*` | Read aliases in `lib/platform-environment.mjs`. Explicit `SUQPAGE_*` values, including empty/disabled values, win. Existing hosted credentials need no copying or rotation. |
| `mirtpage_session`, `mirtpage_visitor`, `mirtpage_public_support` | Read compatibility only. New cookies use Suqpage; logout revokes both supplied local session tokens and clears both names. |
| `mirtpage-cart:<handle>` and two discovery navigation keys | Migrate on read to the same business's Suqpage key. Existing canonical state wins; private previews are excluded; blocked storage preserves the old value. |
| `africmade-pwa-*`, `mirtpage-pwa-*` | Obsolete cache cleanup, never new cache creation. |
| Old `/brand`, `/landing`, `/uploads/seed/mirtpage` asset URLs | Exact rewrites in `lib/platform-assets.ts` keep bookmarks and stored references working. New assets use Suqpage paths. |
| `https://africmade.netlify.app` | Actual deployed origin, pinned in guarded Auth operations. A new hostname needs an owned alias and coordinated redirect review under DEP-029. No invented domain is substituted. |
| `mirtpage-media` | Existing private Supabase Storage bucket. Replacing its name without copying objects and updating stored references would break media. |
| Local Supabase `project_id = "mirtpage"` | Identifies the existing local containers/volumes. Keep it to retain local accounts and data. Disposable test projects use Suqpage. |
| Docker volume `suqpage-saas_mirtpage_data` | Explicit legacy physical volume behind the canonical Compose volume key; `SUQPAGE_DATA_VOLUME` can select an existing alternative. No volume deletion or recreation. |
| Hosted PostgreSQL login `mirtpage_runtime` | Provisioned role and connection credential; retained for the current deployment. New provisioning names use `suqpage_runtime`. Database `postgres` and application tables already have neutral names. |
| Existing `@mirtpage.local` / `@demo.mirtpage.local` seed account addresses | Stable fixture identities and retained login emails, per owner instruction. No account, tenant or Auth identity rewriting. |
| JSON Schema `$id` values under `https://mirtpage.com/schemas/` | Stable published schema identifiers, not customer navigation links or network requests. Existing imports retain their identity; schema titles and generated briefs use Suqpage. |
| Historical deployment evidence and negative regression fixtures | Describe actual prior configuration or intentionally reject old branding. They must not be presented as new settings. |
| Ignored backups and prior generated artifacts | Immutable restore members/hashes and historical evidence. No bytes, filenames, manifests, credentials or customer data are rewritten. |

## Database change

Migration 44 changes the platform-owned default for
`support_conversations.requester_label` to `Suqpage client`. It does not update
existing support rows, tenant labels, account emails or identity links. Migration
45 updates the subscription default and creation trigger, and replaces only exact
old standard plan names with `Suqpage monthly`. Custom names, amounts and dates
remain intact. Reapplication is
a no-op. Earlier application versions can use this additive schema unchanged.
The previous deployment remains the application rollback; restoring the old
label is unnecessary for functional rollback.

## Verification

`npm run test:platform-naming` verifies environment precedence, cookie readers,
logout token coverage, tenant-scoped state migration, asset targets and migration
44–45 with unchanged business rows and expected standard-plan labels. The browser acceptance case restores a real
legacy inquiry cart and requests bookmarked assets. Full check, release,
operations, backup rehearsal and container evidence is recorded in the active
checklist and traceability map when complete.
