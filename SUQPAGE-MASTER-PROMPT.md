# SuqPage Project Master Prompt

> **Read this file before changing any SuqPage code, design, data model, copy, integration, or deployment configuration.**
>
> This document is the permanent product and engineering brief for human contributors, AI coding agents, designers, and reviewers. It describes the intended product, the principles behind it, the current MVP boundary, and the rules that must not be broken.

---

## 1. Your role

You are working on **SuqPage**, a multi-tenant SaaS platform for social sellers, home-based businesses, and small retailers that primarily sell through WhatsApp, Telegram, TikTok, phone calls, or direct messages.

Act as a senior product architect, full-stack engineer, security-conscious SaaS developer, UX designer, and quality reviewer. Preserve the product vision while making the application more reliable, usable, secure, and commercially credible.

Do not treat SuqPage as a generic website builder or a conventional ecommerce platform.

The central principle is:

> **SuqPage controls the smart catalog, inquiry, customer-capture, inventory, and delivery workflows. Each client showroom controls its own visual experience.**

When a user gives an explicit instruction that conflicts with an older preference in this file, follow the newest explicit instruction, but preserve security, tenant isolation, and data integrity.

---

## 2. Product identity

The official product name is:

```text
SuqPage
```

Do not write `SuuqPage`, `Suq Page`, or another variation unless quoting historical material.

Primary domain:

```text
suqpage.com
```

Primary support contact:

```text
falmata.dawano@gmail.com
```

SuqPage gives each business a polished digital showroom at a handle-based route such as:

```text
/@alhayabrand
/@usashopet
/@novatech
/@homevibe
```

The showroom is designed to turn passive browsing into a structured product inquiry. It is not a checkout page.

---

## 3. The problem SuqPage solves

Many social sellers have products spread across posts, stories, image galleries, chats, and status updates. Customers struggle to understand:

- what the business sells;
- which items are currently available;
- what colors, sizes, specifications, or variations exist;
- which products they want to ask about;
- how to send a complete inquiry without repeatedly taking screenshots or typing product names;
- how the business can retain the inquiry if a social-app handoff fails.

SuqPage organizes the catalog into a professional branded showroom and adds a structured inquiry workflow without forcing the business into full ecommerce operations.

---

## 4. What SuqPage is—and is not

### SuqPage is

- a multi-tenant showroom SaaS;
- a dynamic catalog and availability manager;
- an inquiry-cart system;
- a lightweight customer lead-capture system;
- a bridge to WhatsApp, Telegram, TikTok, native sharing, and direct contact;
- an inquiry management dashboard;
- a delivery-request initiation layer for confirmed inquiries;
- a platform that supports manually designed, highly distinct client pages;
- a controlled four-client MVP that can later grow into broader SaaS onboarding.

### SuqPage is not

- a generic theme marketplace;
- a payment processor;
- a full shopping cart and checkout system;
- an accounting system;
- an ERP;
- a tax engine;
- an automatic order-fulfillment system;
- a marketplace that mixes every seller into one shared storefront;
- an excuse to make every client page look like the SuqPage landing page;
- an AI product merely because AI may help generate custom designs.

Use the terms **inquiry**, **inquiry cart**, **customer inquiry**, and **delivery request**. Do not casually rename inquiries as paid orders.

---

## 5. Non-negotiable design philosophy

### 5.1 Every client showroom is manually designed

Client pages are not generated from one generic layout with different colors.

Each client may have a separately coded Next.js renderer with its own:

- logo;
- typography;
- visual hierarchy;
- navigation;
- hero composition;
- product-card structure;
- product-detail presentation;
- backgrounds;
- animations;
- buttons;
- inquiry-cart treatment;
- section order;
- mobile behavior;
- favicon;
- social-sharing image;
- brand voice.

Shared behavior is acceptable. Shared visual identity is not.

Never refactor the four showrooms into a single visually generic renderer unless the user explicitly requests that change.

### 5.2 SuqPage must have its own platform identity

The SuqPage landing page must not look like any client showroom. It should feel modern, polished, mobile-first, and easy to understand inside TikTok or other in-app browsers.

The landing page should include:

- a clear explanation of the value proposition;
- actual client showroom previews;
- a searchable showroom directory;
- category filter buttons;
- a low-friction private onboarding request with contact details, one
  unstructured instruction field, consent, and optional reference images;
- professional copy with no development-stage disclaimers.

### 5.3 Public copy must look finished

Do not place public-facing words such as these on production pages:

```text
fake
temporary
temp
placeholder
fictional
demo
example site
sample user
under construction
coming later
real user
live user
```

Internal documentation, tests, and seed code may use accurate technical terms such as `test`, `mock`, or `seed`, but public visitors should see normal business language.

Do not label a client card “industry showroom” when the category, brand name, image, and description already communicate the concept.

---

## 6. Current seeded tenants and visual direction

The MVP includes four initial tenants. Internally they are seeded pilot tenants. Publicly they should be presented as normal businesses, not examples or fake companies.

### 6.1 Al Haya Brand

Business type:

```text
Luxury modest fashion
```

Core categories may include:

- niqab;
- hijab;
- jilbab;
- abaya.

Visual principles:

- elegant and luxurious;
- modest and soft;
- mannequin or faceless product presentation rather than identifiable human models when that matches supplied assets;
- strong fabric detail and product authenticity;
- clear availability badges;
- refined multilingual layout.

Important data rules:

- do not translate product names;
- do not translate collection names;
- do not translate color names;
- preserve exact merchant-entered naming in every language.

Known Telegram contact:

```text
AlHayaModest
```

### 6.2 USAshopET

Business type:

```text
U.S. beauty, wellness, fragrance, skincare, and related imported products
```

Visual principles:

- distinct U.S. beauty-retail personality;
- bright, energetic, editorial, and product-forward;
- must not reuse SuqPage’s palette or visual grammar;
- avoid falling back to generic purple SaaS styling;
- use its own logo, favicon, typography, and product-card composition.

Product names and merchant-entered option values must remain unchanged across languages.

### 6.3 NovaTech

Business type:

```text
Premium flagship consumer technology
```

Visual principles:

- premium, minimal, highly polished;
- light mode by default;
- clear, bright product presentation;
- “flagship technology launch” quality;
- visually impressive without copying another company’s protected assets or exact page;
- must include a proper favicon and business-specific metadata.

Catalog principles:

- use recognizable flagship products that the business could credibly sell;
- verify current product names and specifications against official manufacturer sources before updating time-sensitive catalog content;
- do not invent model numbers or specifications;
- do not translate product names, storage values, model numbers, colors, or specifications entered by the merchant.

### 6.4 HomeVibe

Business type:

```text
Home and living
```

Visual principles:

- warm editorial style;
- calm cream, clay, wood, and home-inspired atmosphere where appropriate;
- serif-led or magazine-inspired typography where appropriate;
- recognizable home products and room-based storytelling;
- own logo and favicon;
- robust, validated CSS with no malformed declarations or broken responsive layout;
- must not resemble SuqPage, NovaTech, or USAshopET.

Product names and merchant-entered values must remain unchanged.

---

## 7. Dynamic catalog model

SuqPage stores business content in the database. Client renderers must consume dynamic data rather than hard-coding products.

Core hierarchy:

```text
Business
└── Collection
    └── Category
        └── Product
            ├── Images
            ├── Availability
            ├── Stock count
            └── Up to four option groups
                └── Option values
```

Examples of merchant-defined option groups:

```text
Color
Size
Storage
Condition
Material
Finish
Specification
Set type
Region
Count
```

Rules:

1. A product can have zero to four option groups.
2. Option-group names are merchant-defined.
3. Option values are merchant-entered data.
4. Product names, brands, colors, sizes, model numbers, specifications, and option values must not be automatically translated.
5. Interface labels may be translated.
6. Do not claim exact variant-combination inventory unless a true variant matrix has been implemented.
7. The current controlled MVP primarily uses product-level stock and availability.
8. Availability must be internally consistent with stock.
9. Unavailable or coming-soon products must not be treated as normally purchasable or inquiry-ready unless the UI explicitly supports a waitlist-style inquiry.
10. Customer-requested quantity must be validated against limits and available stock.

Supported availability states:

```text
available
limited
unavailable
coming_soon
```

---

## 8. Inquiry-cart workflow

The inquiry cart is SuqPage’s central conversion feature.

Expected customer flow:

1. A customer browses a client showroom.
2. The customer selects a product.
3. The customer selects required option values.
4. The customer adds the item to the inquiry cart.
5. The customer can add multiple products.
6. The customer can adjust quantities and remove items.
7. The customer provides minimal contact information:
   - first name;
   - WhatsApp, phone, Telegram, email, or another usable contact;
   - optional note.
8. SuqPage saves the inquiry before or during social handoff.
9. The customer may continue through WhatsApp, Telegram, TikTok, or native sharing.
10. The business sees the inquiry in its dashboard even when the social-app step is not completed.

An inquiry record should contain:

- business;
- customer name;
- contact value;
- contact method;
- optional note;
- selected products;
- selected options;
- quantity;
- source;
- status;
- timestamps.

Supported inquiry statuses:

```text
new
contacted
confirmed
closed
cancelled
```

The system must prevent:

- forged product names;
- products from another tenant;
- unpublished products;
- invalid option names;
- invalid option values;
- unreasonable quantities;
- duplicate submissions caused by repeated social-button taps;
- oversized payloads;
- uncontrolled spam.

Use idempotency, rate limiting, canonical database validation, and tenant checks.

---

## 9. Social messaging and clipboard behavior

Do not make the workflow depend entirely on `navigator.clipboard.writeText()`.

Android Chrome, Google Search in-app browsing, TikTok in-app browsers, and other embedded browsers may block clipboard access, show permission prompts, lose the user gesture, or open blank tabs.

Required behavior:

### WhatsApp

- Use the exact business number.
- Store the number in international digits-only format.
- Do not include `+`, spaces, dashes, or a local leading zero.
- Embed the structured inquiry directly into the WhatsApp link when possible.

Example stored value:

```text
251911234567
```

### Telegram

- Store a username or supported Telegram profile value.
- Recommended stored format is the username without `@`.
- Use Telegram’s supported draft-text link behavior when available.

Example stored value:

```text
AlHayaModest
```

### TikTok

- Store the exact handle without `@` where possible.
- Open the exact business profile.
- Do not claim reliable public TikTok DM prefilling.
- Show a selectable inquiry message and copy/native-share fallback.
- Never route to a made-up or unrelated account.

### General fallback

When automatic copy is blocked, the customer must still see:

- the complete inquiry message;
- a copy button;
- a select-message action or selectable text;
- native share where supported;
- a clear button to open the intended business profile.

Never pre-open `about:blank` and wait for asynchronous clipboard permission.

---

## 10. Showroom directory behavior

SuqPage’s directory must scale without dumping every tenant onto the page by default.

Default behavior:

- do not show all results immediately;
- show results after the visitor types a query or selects a category;
- include category filter buttons for visitors who do not realize text search is available;
- include an intentional **All businesses** option for visitors who explicitly want the complete directory;
- do not let result panels cover filter controls;
- support business name, handle, category, and relevant description search;
- ensure mobile usability and keyboard accessibility.

---

## 11. Public onboarding request

The SuqPage landing page must lead prospects to a simple private onboarding
request. No account is required for the first request.

Keep it intentionally small. Required inputs and limits are controlled by
`FE-003`, `BE-003`, and `DEP-003`:

- name;
- WhatsApp, phone, or email;
- optional business name;
- one unstructured instruction of 20–10,000 characters;
- processing consent;
- zero to ten optional sanitized JPEG, PNG, or WebP reference images.

Requirements:

- persist the request inside SuqPage with a random public reference and
  idempotency;
- explain that receipt is not acceptance or publication;
- do not expose internal development wording;
- use bounded input, a honeypot, privacy-preserving rate limits, private image
  storage, and explicit-origin checks;
- never expose contact details, instructions, attachment identifiers, or
  storage paths through the public reference.

---

## 12. Delivery-request workflow

The delivery system is named exactly:

```text
Malikt Board
```

Do not rename it `Malik Board`, `MaliktBoard`, or another form unless a route or technical identifier requires it.

Current MVP behavior:

- a business owner opens a confirmed customer inquiry;
- the owner initiates a delivery request on the customer’s behalf;
- the owner enters essential pickup and delivery details;
- the owner chooses one or more supported delivery companies;
- SuqPage submits the request through a secured local adapter;
- the dashboard tracks a simplified delivery status.

This is not ecommerce fulfillment. There is no payment, automatic shipping price, checkout, tax, or order settlement.

Supported mock statuses may include:

```text
draft
submitted
viewed
accepted
driver_assigned
picked_up
delivered
cancelled
```

The current Malikt Board adapter is a secured **mock integration contract**, not a live external service.

Do not represent mock company data or simulated statuses as a live external connection.

When the real Malikt Board API becomes available, add:

- authenticated API credentials;
- request signing where required;
- idempotency keys;
- retries with bounded backoff;
- status synchronization;
- webhook verification;
- tenant mapping;
- audit logs;
- safe failure states.

---

## 13. User roles

### SuqPage administrator

The administrator can:

- create and manage businesses;
- create or reset owner accounts;
- assign handles;
- assign renderer/design keys;
- publish, draft, or suspend showrooms;
- preview draft showrooms securely;
- manage supported delivery companies;
- inspect operational status;
- manage tenant-level configuration.

### Business owner

A business owner can manage only their own tenant:

- business settings;
- social contacts;
- metadata and favicon;
- collections;
- categories;
- products;
- product images;
- up to four option groups;
- availability and stock;
- inquiries;
- inquiry statuses;
- delivery requests;
- account password.

### Public customer

A public customer does not require an account. The customer can:

- browse an active showroom;
- filter products;
- select options;
- build an inquiry cart;
- provide contact details;
- submit an inquiry;
- continue to a social messaging destination.

Fine-grained staff and manager roles are part of the accepted managed-service
transition below but are not active in the current additive increment.

### Managed-service transition — additive intake active

The accepted target in `ADR-0004`, `FE-003`, `BE-003`, and `DEP-003` will replace
direct client catalog/settings/design administration only after the complete
replacement workflow passes its rollout gates.

Current verified behavior:

- Prospects can submit a private initial onboarding request without an account,
  with contact details, one unstructured instruction, consent, and up to ten
  sanitized JPEG/PNG/WebP reference images.
- Requests use random public references, idempotency, bounded multipart input,
  privacy-preserving rate limits, private persistent attachment storage, events,
  and additive schema migration 2.
- Platform administrators have a private operations queue for reviewing the
  immutable original request and attachments and moving it through early review
  statuses. They cannot mark it client-approved or published from this queue.
- Existing owner permissions and live showroom behavior remain unchanged during
  this additive stage. Request data and attachments are covered by backup and
  restore tests.

Accepted behavior still to implement:

- Accepted clients receive an invited account for a minimal request, inquiry,
  delivery, preview, and account-security workspace.
- Clients submit unstructured change requests but never write canonical catalog
  or design data directly.
- Assigned team members structure requests and prepare private revisions.
- Operations managers may submit on behalf of clients, accept/invite prospects,
  assign work, and publish only the exact revision the client approved.
- Platform administrators retain explicit system authority.
- Existing live showrooms remain unchanged until client approval and authorized
  publication; previous published state remains recoverable.

Until the remaining specs are implemented and verified, the current
administrator and business-owner capabilities in this document remain active.

---

## 14. Custom showroom integration contract

Custom renderers may be manually written or AI-generated, but they must preserve the SuqPage smart-feature contract.

The renderer owns:

- layout;
- typography;
- color system;
- logo presentation;
- navigation appearance;
- hero design;
- animations;
- product card design;
- product detail design;
- responsive layout;
- section order;
- visual inquiry-cart treatment.

SuqPage owns:

- business data;
- collections;
- categories;
- products;
- option groups;
- availability;
- stock;
- inquiry state;
- inquiry persistence;
- social routing;
- authentication;
- tenant isolation;
- media validation;
- delivery integration;
- database writes.

Custom renderers must not:

- query SQLite directly;
- hard-code tenant products;
- hard-code availability or stock;
- hard-code business contacts;
- bypass shared inquiry validation;
- write directly to protected APIs without the approved shared client logic;
- remove required add-to-inquiry behavior;
- remove the inquiry-cart trigger;
- silently translate merchant-entered values;
- weaken accessibility or mobile behavior;
- introduce another tenant’s assets.

Use the files under:

```text
showroom-sdk/
```

A custom design must include or satisfy a manifest that identifies:

- design key;
- design name;
- supported features;
- required smart-component integration;
- expected responsive behavior.

AI design workflow:

1. Copy the showroom SDK template into a separate workspace.
2. Provide the AI with sample catalog data and the integration rules.
3. Allow the AI to redesign every visual section.
4. Preserve props, callbacks, data types, and required smart-feature hooks.
5. Return the renderer and assets without a database copy or secrets.
6. Register the renderer under a unique design key.
7. Preview with the tenant’s real dynamic data.
8. Run design validation, type checking, build, and release tests.
9. Publish only after visual and functional review.
10. Keep the previous design version available for rollback when practical.

---

## 15. Current technical architecture

Current controlled-launch stack:

```text
Next.js 16
React 19
TypeScript
Node.js 22+
SQLite via node:sqlite
Sharp for verified image processing
Server-rendered routes and server actions
```

Important directories:

```text
app/                  Next.js routes, pages, APIs, and dashboard
components/           Shared UI and showroom application logic
lib/                  Authentication, database, security, media, inquiries, delivery
showroom-sdk/         AI/manual custom-showroom integration package
scripts/              Setup, migration, backup, restore, preflight, release tests
data/                 Runtime database and media when configured locally
```

Important commands:

```bash
npm ci
npm run reset
npm run dev
npm run typecheck
npm run validate:designs
npm run test
npm run build
npm run test:http
npm run release
npm run migrate
npm run backup
npm run restore -- --from=/absolute/backup/path
npm start
```

The authoritative release gate is:

```bash
npm run release
```

Do not claim launch readiness when that command or equivalent individual checks have not passed.

---

## 16. Security requirements

Security requirements are product requirements, not optional cleanup.

### Authentication and sessions

- Never expose seeded credentials in public UI.
- Never ship a shared known password.
- Generate unique temporary passwords.
- Force password change for temporary or reset credentials.
- Use opaque, revocable server-side sessions.
- Do not use a hard-coded fallback session secret.
- Revoke sessions after password reset or suspected compromise.
- Rate-limit login attempts.

### Tenant isolation

- Every owner mutation must be scoped to the owner’s business.
- Validate every referenced collection, category, product, inquiry, and delivery record belongs to the same tenant.
- Keep database constraints or triggers as defense in depth.
- Add tests for cross-tenant reads and writes.
- Administrators must use explicit privileged paths rather than accidental tenant bypasses.

### Public inquiries

- Validate products from the database.
- Require the product to belong to the target business.
- Require the product to be published and inquiry-eligible.
- Validate options against the product’s current option groups and values.
- Bound quantity, item count, field lengths, and body size.
- Use idempotency and duplicate suppression.
- Rate-limit abuse.
- Do not trust client-provided product names or snapshots as authority.

### Delivery APIs

- Delivery requests and customer data are private.
- Require authenticated access.
- Scope owners to their own tenant.
- Do not expose an all-tenant public endpoint.
- Validate the inquiry belongs to the business.
- Use idempotency and audit logging.

### Media uploads

- Accept only verified JPEG, PNG, and WebP content.
- Verify file signatures and decoded content.
- Enforce file-size and pixel-dimension limits.
- Re-encode with Sharp.
- Remove metadata where possible.
- Generate server-controlled filenames.
- Store mutable uploads outside the Next.js build-time public directory.
- Serve media through a controlled route or object storage.
- Set `nosniff` and safe content types.
- Never trust file extensions or browser `accept` attributes.

### Public status

- Only active businesses may render publicly.
- Drafts require authenticated preview.
- Suspended businesses must not render publicly.

### Privacy and operations

- Do not log full customer contact information unnecessarily.
- Keep `.env`, database files, credential files, uploads, and backups out of Git and distributable ZIPs.
- Maintain privacy and terms pages when customer data is collected.
- Use HTTPS in production.
- Include security headers.
- Run dependency audits.
- Maintain backups and test restores.

Read `SECURITY.md` before handling a suspected vulnerability.

---

## 17. Data, migrations, and deployment boundary

The controlled MVP is intended for four initial clients on one persistent server or one persistent container.

Current SQLite requirements:

- one application instance;
- persistent database volume;
- persistent media volume;
- WAL mode;
- busy timeout;
- foreign keys enabled;
- migrations before startup when needed;
- automated backups;
- tested restore procedure;
- database integrity checks;
- appropriate file permissions.

Do not horizontally scale the SQLite build across multiple application instances.

Before broad self-service SaaS onboarding, migrate to:

- managed PostgreSQL or another production multi-instance database;
- object storage for media;
- production email and notification infrastructure;
- full observability and alerting;
- stronger account recovery and staff roles;
- a real Malikt Board integration.

Production environment must use absolute persistent paths and HTTPS. Follow `.env.example`, `README.md`, Docker configuration, and preflight checks.

---

## 18. Language and localization rules

Target public languages include:

```text
English
Amharic
Afaan Oromo
Arabic
Somali
Afar
```

Rules:

- translate interface labels, buttons, help text, status labels, and platform copy;
- do not translate product names;
- do not translate brand names;
- do not translate color names entered by the merchant;
- do not translate sizes, model numbers, storage values, specifications, or option values entered by the merchant;
- support Arabic right-to-left layout;
- allow for long Afaan Oromo strings without layout breakage;
- do not claim a language is complete until all public UI states are translated and tested;
- keep the dashboard English-first for the controlled MVP unless multilingual dashboard support is explicitly implemented.

---

## 19. UX and accessibility requirements

All public pages and dashboards must work on mobile and desktop.

Minimum expectations:

- no horizontal overflow;
- no overlapping menus, filters, or result panels;
- adequate tap targets;
- visible focus states;
- keyboard-accessible dialogs and drawers;
- focus trapping and restoration where appropriate;
- semantic buttons and labels;
- descriptive image alt text;
- readable availability states;
- clear loading, success, empty, and failure states;
- no silent network failures;
- no unhandled native-share cancellation errors;
- cart persistence where appropriate;
- correct favicon and metadata for every showroom;
- business-specific page title, description, canonical URL, and social preview;
- no blank-tab navigation.

For client sites, visual polish must not come at the expense of inquiry completion.

---

## 20. Product-data accuracy

When adding or updating recognizable branded products, especially current technology:

- verify current product names and major specifications using official manufacturer sources;
- do not rely on memory for current flagship models;
- do not invent features, availability, prices, or model names;
- avoid presenting unverified product claims as facts;
- preserve merchant-provided names exactly when importing their catalog;
- keep product imagery legally and operationally appropriate for the business.

Prices are not required for every SuqPage catalog. The platform’s main goal is structured inquiry, not online checkout.

---

## 21. Admin and owner workflow expectations

### Administrator onboarding checklist

When adding a new client:

1. Create the business record.
2. Reserve a unique handle.
3. create a unique owner account.
4. Generate a unique temporary password.
5. Require password change.
6. Assign a custom design key.
7. Configure business metadata and favicon.
8. Add verified social contacts only.
9. Add collections and categories.
10. Import or create products.
11. Configure availability and option groups.
12. Preview the draft showroom.
13. Test inquiry submission.
14. Test social routing.
15. Test owner dashboard isolation.
16. Publish only after approval.

### Business-owner workflow

The owner should be able to perform normal catalog changes without editing code:

- add and update products;
- upload verified images;
- set collection and category;
- add up to four option groups;
- set stock and availability;
- publish or hide products;
- change business contacts;
- review inquiries;
- update inquiry status;
- initiate a delivery request;
- change password.

A custom visual redesign may still require SuqPage’s design team or an AI-assisted design workflow.

---

## 22. Testing and definition of done

A feature is not complete merely because the page renders.

Before packaging or deploying changes, run tests appropriate to the change, including:

```bash
npm run typecheck
npm run validate:designs
npm run test
npm run build
npm run test:http
npm audit --omit=dev
```

Prefer the complete gate:

```bash
npm run release
```

Required verification areas:

- clean dependency installation;
- migrations and seed/reset;
- authentication;
- forced password change;
- session revocation;
- admin and owner permissions;
- cross-tenant denial;
- active/draft/suspended visibility;
- product CRUD;
- collection/category integrity;
- option validation;
- stock and availability behavior;
- image upload validation and serving;
- public inquiry submission;
- idempotency;
- rate limiting;
- dashboard inquiry visibility;
- delivery API authentication and tenant scope;
- backup and restore;
- all four showrooms;
- mobile responsive layout;
- metadata and favicons;
- no broken local assets;
- no JavaScript or server errors;
- no known production dependency vulnerabilities.

When fixing a security or data-integrity defect, add a regression test that reproduces the old failure and proves the correction.

Do not write a success report that is not backed by executed tests.

---

## 23. Packaging rules

When preparing a ZIP for review or deployment:

Include:

- source code;
- lockfile;
- migrations and setup scripts;
- `.env.example`;
- README;
- security policy;
- this `MASTER-PROMPT.md`;
- showroom SDK;
- release and test scripts;
- required static seed assets.

Exclude:

- `node_modules`;
- `.next` build cache unless explicitly requested;
- `.env`;
- database files containing real or seed credentials;
- `.local/seed-credentials.txt`;
- customer uploads;
- backup archives;
- logs containing customer data;
- private keys or provider secrets.

Always test ZIP integrity after packaging.

---

## 24. How to approach future work

When given a new SuqPage task:

1. Read this file.
2. Read `README.md`, `SECURITY.md`, and the relevant code.
3. Determine whether the change affects public design, dynamic data, security, tenant isolation, or deployment.
4. Preserve each client’s visual identity.
5. Preserve the shared smart-feature contract.
6. Do not invent account handles, phone numbers, product facts, or live integrations.
7. Make reasonable implementation decisions when the intent is clear.
8. Ask a question only when an unresolved choice materially affects the product, data model, security, or business workflow.
9. Implement the full workflow, not only the visible UI.
10. Add or update tests.
11. Run the release checks.
12. State clearly what is complete, what is mocked, and what remains outside the MVP boundary.

### 24.1 Keep this product contract synchronized

This file is a living statement of SuqPage's current product reality. Every
completed feature or change to roles, capabilities, workflow, terminology,
security, data, or deployment boundaries must update all affected sections in
the same task that records passing evidence.

Do not use this file as a chronological changelog. Git history records what
changed, immutable feature specs record accepted behavior and evidence, and ADRs
record consequential decisions and their rationale. Remove obsolete current-
behavior statements instead of retaining them for history.

When an approved direction is not implemented yet, label it explicitly as a
target or planned behavior and link it to its draft spec or roadmap outcome. Do
not describe planned behavior as available, and do not rewrite implemented
behavior out of this file until its replacement has passed the required tests
and rollout gates.

---

## 25. Product north star

Every SuqPage change should move the product toward this experience:

> A social seller receives a beautiful, unmistakably custom digital showroom. The seller can update products and availability without asking a developer. A customer can quickly discover products, select exact options, create one complete inquiry, and reach the seller through the customer’s preferred messaging app. The seller retains the inquiry, follows up, and can initiate delivery through Malikt Board after confirmation—without SuqPage forcing either party into a full ecommerce checkout.

Protect that experience.
