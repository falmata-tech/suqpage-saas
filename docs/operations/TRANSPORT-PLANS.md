> S138 supersedes the anonymous case-bound publication described below. Use
> [Transport tracking](TRANSPORT-TRACKING.md) for the new local candidate. Earlier
> plans/data remain private; old anonymous APIs no longer authorize access.

# Ordered transport plans

BE-057 / FE-068 / DEP-047 define the S137 candidate. Local implementation and
focused verification do not approve a hosted release or a new Android binary.

## Staff workflow

Open **Transport**, choose a request, then **Transport plan**. The current
assigned transport agent or a manager can select **Edit plan**. Add each leg in
travel order: provider name, transport method, origin and destination. Methods
are air, truck, van, car and motorcycle. Move legs up or down, remove them, or add
another, up to twelve. Repeated provider names are allowed.

**Save plan** makes the route visible to the requester. **Cancel** preserves the
saved plan; an unsaved draft uses the existing discard confirmation. An ended
chat still permits plan editing without reopening or joining the conversation.
The separate private handoff/contact form is unchanged.

**Copy plan link** copies the same read-only link each time. Sharing is manual.
Anyone who receives it can view the route. **Replace plan link** requires
confirmation and invalidates the old link; copy and share the replacement.
Concurrent edits return a conflict rather than silently overwriting another
person's plan. Reload the saved plan before making the intended changes again.

## Requester workflow

Visitor and business transport conversations show **View transport plan** after
staff save one. This opens a separate view with **Back to conversation**; the
unsent message remains available. Viewing a plan does not mark hidden chat
messages read. The public share page requires no login and grants no chat access.

Each numbered stage shows its provider, method, origin and destination. Stage
numbers show the planned order. They do not claim where the goods currently are,
who holds them, completed travel or an arrival date. Scan-event integration is a
separate future feature.

Open, active shared pages revalidate every five seconds with an ETag. Hidden or
background pages pause; transient failures retain the last good route and back
off, while a revoked link clears it. Changes therefore appear automatically
without introducing a new real-time provider. No capability is persisted by this
reader, sent in its URL query/path, or included in public metadata/analytics.

## Local verification and rollout boundary

The canonical loopback database was backed up and migrated from69 to70, with
before/after protected-row fingerprints. A narrow new-table ACL correction
removed excess inherited privileges; it did not alter older tables or hosted
configuration. Protected receipts are under `.local/transport-plan-s137/` and
are excluded from Git/builds. Do not publish backups, session material, raw
capability links or screenshots exposing private conversations.

Actual browser evidence, visual approval, full checks and release evidence are
separate checklist states. Expo browser tests do not prove installed Android
association, native lifecycle/accessibility or future scan integration.
