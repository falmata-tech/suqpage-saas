---
id: FE-032
title: Unified business directory and task-oriented workspace
status: in_progress
related: [FE-003, FE-017, FE-018, FE-026, FE-031, FE-035, BE-015, BE-017, BE-023, DEP-023]
owners: [product, frontend, operations, design]
last_updated: 2026-08-11
change_level: L2
---

# FE-032 - Unified business directory and task-oriented workspace

## Problem and outcome

The administration interface exposes Businesses, Clients, Discovery profiles,
Monthly accounts, Client overview, and Account and insights as competing places.
Those names mirror persistence records instead of the work an administrator is
trying to complete. A business, its authorized people, its marketplace
projection, its renewal record, and its visit aggregates must remain separate
authoritative records, but staff should not have to understand those boundaries
to manage one MirtPage customer.

MirtPage needs one scalable Businesses directory and one task-oriented Business
workspace. Cross-business queues remain global; business-specific work remains
inside the selected business context.

## Scope

- Make Businesses the only cross-business customer directory.
- Present the automatically created owner sign-in inside Business details
  rather than as a second customer directory or unexplained top-level task.
- Present the discovery projection as Marketplace within its business rather
  than as a separate profile directory.
- Expose previously hidden Business details in the selected workspace.
- Present privacy-conscious Showroom visits on the business Overview while
  keeping Renewal as its own administrative task.
- Keep Showroom requests, Support, Staff, Renewals, and Design library as global queues
  where staff genuinely work across businesses.
- Preserve old Clients, Discovery, and Marketplace administration URLs as safe
  redirects to the Businesses directory or selected Marketplace workspace.
- Keep server pagination, role checks, tenant isolation, and all persistence
  records unchanged in authority.

## Contracts

- The administrator sidebar has no Clients or Discovery profiles destination.
  It exposes Overview, Businesses, Requests, Support, Renewals, Staff, and Design
  library in concise task groups.
- The Businesses directory is server paginated and searchable by business,
  handle, client identity, email, city, zone, or region. Each row summarizes
  publication, access, marketplace readiness, and request count, then offers one
  primary Open workspace action.
- Selecting a business establishes a visible Business workspace context.
  Navigation groups Overview, Business details, Showroom project, Offerings when
  authorized, and View showroom as showroom tasks; Marketplace and Customer
  inquiries as customer activity; and Renewal as business administration.
- **Showroom project** is the stable business-workspace destination for setup,
  updates, revisions, review, and history. Neither **Design requests** nor the
  vague label **Showroom work** is shown as the business mental model.
- The Showroom project page has one prominent state-aware action: **Create
  showroom** for a never-published business, **Update showroom** for an
  established business, or **Continue showroom setup/update** when active work
  exists. It presents the current project first and paginates terminal work
  under **Showroom history**.
- Starting a first showroom presents the setup intake. Starting an established
  update presents only a requested-change field; it does not repeat business
  classification, catalog-size, or photography-readiness onboarding.
- Inside an active update, staff see **Edit current showroom** as the primary
  bounded-change action and **AI-assisted redesign** as the complete-design
  alternative. An existing draft resumes through either tool rather than
  creating another project or revision.
- The global operations destination remains **Showroom requests** because staff
  use it as a cross-business intake and assignment queue. Opening a business
  from that queue restores its Business workspace context.
- Client, marketplace, subscription, analytics, and business records are not
  merged. UI composition never replaces server-side capability and tenant
  checks.
- Business details preserves the selected Business workspace on navigation and
  save. For administrators, its Owner sign-in disclosure lists only client
  users for that business; password recovery revokes that user's sessions and
  returns to the same Business details screen.
- Business details is the single editing home for operational identity and
  settings: business name, logo, browser icon, notification email, WhatsApp,
  Telegram, TikTok, live-session state/destination, page title, and search/share
  description. It does not edit hero media, showroom narrative, process media,
  products, components, layout, or palette.
- Current logo and browser-icon media are visible beside their replacement
  controls. A saved replacement uses the configured public media adapter and is
  immediately reflected by public and private showroom rendering.
- Business Overview contains privacy-conscious aggregate visit totals together
  with the business's actionable work. Renewal contains service-period state,
  manual renewal controls for operations, and bounded renewal history.
- The client Overview exposes the current showroom project's next step once as
  its primary action. A secondary project destination is labeled **Project
  history** and reads as a record, not as a competing way to continue the same
  active setup or update.
- Old `/dashboard/admin/clients` and `/dashboard/admin/discovery` collection
  links redirect to `/dashboard/admin/businesses` while preserving supported
  search and status filters. A selected legacy discovery profile redirects to
  the same business's Marketplace workspace.
- Desktop and mobile navigation use the same task names. At 320 and 390 CSS
  pixels, the workspace has no horizontal document overflow and the mobile
  drawer distinguishes business work from leaving the business.

## Scenarios

```gherkin
Scenario: Administrator manages one business
  GIVEN an administrator finds a business in the Businesses directory
  WHEN they open its workspace
  THEN business-specific tasks are grouped under that business name
  AND no separate Clients or Discovery directory is required

Scenario: Administrator recovers owner access
  GIVEN a business has an authorized client user
  WHEN the administrator opens Business details and resets that user's password
  THEN all sessions for that user are revoked
  AND the administrator returns to the same Business details screen

Scenario: Staff changes an operational business setting
  GIVEN a business has an open showroom revision
  WHEN authorized staff replace its logo or change a contact, live, or search setting in Business details
  THEN the setting updates without entering the design workflow
  AND a later revision publication or rollback preserves that newer setting

Scenario: A business has no current showroom project
  GIVEN an administrator opens a business with no active setup or update
  WHEN they select Showroom project
  THEN the workspace distinguishes initial setup from a later update
  AND offers one business-scoped Create showroom or Update showroom action

Scenario: A business has active showroom work
  GIVEN a business has one non-terminal showroom project
  WHEN staff or the owner opens Showroom project
  THEN the current project appears before history
  AND the primary action continues that project instead of starting another

Scenario: Staff updates an established showroom
  GIVEN an established business has one current update project
  WHEN assigned staff open its authoring actions
  THEN they can edit the current showroom directly or enter AI-assisted redesign
  AND both actions remain inside the selected Business workspace and same draft revision

Scenario: Staff distinguishes performance from renewal
  GIVEN a business has visits and a manual service-period record
  WHEN an authorized user opens the business Overview or Renewal
  THEN visit totals appear on Overview
  AND renewal records remain in the separate Renewal task

Scenario: Legacy administration link is followed
  GIVEN a saved Clients or Discovery administration URL
  WHEN an authorized administrator opens it
  THEN MirtPage redirects to the equivalent Businesses or Marketplace context
  AND no customer, access, or marketplace data is changed
```

## Quality impact

- Security and tenant isolation: existing business, role, and capability checks
  remain authoritative; Access queries add an explicit business predicate.
- Data integrity: no migration or destructive record merge is introduced.
- Accessibility and responsive behavior: semantic navigation, labeled tables,
  touch-sized actions, deterministic redirects, and no narrow-screen overflow.
- Performance: one bounded Businesses query replaces repeated customer and
  marketplace directories; no unbounded client list is added to a workspace.
- Failure recovery: password reset, marketplace editing, renewal, and business
  settings return to the selected business context.

## Test plan

| Criterion | Evidence |
|---|---|
| Unified directory and search projection | scalable-query and navigation tests |
| Business-scoped owner access and password recovery | security and acceptance tests |
| Single settings owner and stale-overwrite prevention | revision, recipe, and focused browser tests |
| Visits and Renewal separation | account-health and browser tests |
| Legacy redirects | route integration and acceptance tests |
| Desktop, 390px, and 320px behavior | focused Playwright captures and overflow assertions |

## Rollout and rollback

The change composes existing records through new routes and redirects. Rollback
restores the former navigation and collection pages without changing business,
user, discovery, subscription, analytics, request, or media data.

## Readiness checklist

- [x] One canonical directory and workspace defined
- [x] Global queues distinguished from business tasks
- [x] Persistence boundaries and permissions preserved
- [x] Legacy-link behavior defined
- [x] Responsive, performance, and rollback impacts defined
- [x] Observable scenarios and evidence mapped
