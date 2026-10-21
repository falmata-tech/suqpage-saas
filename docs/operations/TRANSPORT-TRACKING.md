# Shipment tracking: local candidate

BE-058 / FE-069 / DEP-048 / ADR-0028. This work is local, not a new production
deployment or Android release. The screen shows an arranged sequence of transport
providers; it does not claim a current carrier, scanned location or arrival date.

## Visitor or business owner

1. Open the transport chat window and choose **Tracking**. Starting a chat is not
   required. A business owner can use the same link from Account → Transport.
2. Enter the email to which the agent will assign the shipment. Choose **Send
   code**, enter the six digits from that email, then **Verify code**.
3. **Your shipments** shows plans assigned to that exact verified email. Open a
   plan for its ordered providers, transport methods and each leg's From/To.
   **Back to shipments** returns to the list; more than one plan is supported.
4. **Sign out** closes only tracking access. It does not sign out the business
   account or end a transport chat. Email links require the same verification.

No Suqpage business account is created by tracking verification. Email aliases
remain distinct; spelling and +suffix must match what the agent enters.

## Transport staff and administrators

1. Use the existing web staff login, then **Tracking → New shipment**. Support-only
   agents cannot access this workspace; authorized transport agents and managers
   can manage the team's plans independently of chat assignment or status.
2. Enter the recipient's requested email. They do not need to verify it before
   you create the shipment. They verify their own code only when viewing Tracking;
   never ask for that code.
3. Optionally name the shipment. Add the providers in travel order, with method,
   origin and destination per stage. **Submit shipment** saves one independent
   plan and queues its initial details email. A double click/retry cannot create
   another shipment. A later deliberate New shipment can create another plan.
4. Detail opens read-only. **Edit plan → Save changes** updates the plan; **Cancel**
   discards the draft after confirmation. A competing save requires a deliberate
   reload/review; an open draft never silently adopts a newer version.
5. **Copy tracking link** can be shared in chat. Queued, sending, provider accepted
   and deferred/failed email states are distinct. Acceptance is not delivery or
   proof that the recipient read it. Ordinary plan edits do not resend email.
6. A manager can explicitly revoke access to one shipment. Other shipments and
   chat history remain intact. This is not a delete or recipient transfer.

The old conversation-plan screen and Transport company form are retired in the
local candidate. Tracking is a separate staff menu; a chat is only a way to agree
details or share the link. Old plans are never automatically assigned to guessed
emails. S144 separately authorizes scoped old-plan/company data cleanup in local
and live; its verified operation receipt determines completion in each target.

## Local preview testing

- Web: `http://127.0.0.1:3102`; Tracking: `/tracking`.
- Expo mobile preview: `http://localhost:8082`; enter through Transport → Tracking.
- Local email inbox: `http://127.0.0.1:54324` (Mailpit). Local verification and
  shipment emails stay here; no external inbox delivery is asserted.
- Use the existing protected local role guide for admin, transport, support and
  business test accounts. Recipient testing needs no additional account: use a
  dedicated test address that has never verified. Create two plans first, confirm
  their local initial emails, then verify its Mailpit code to see both plans. Test a second independent address for denial.

Verify two submissions appear as two plans, Cancel changes nothing, Save updates
the active recipient detail, another email cannot open the link, and tracking
sign-out preserves account/chat state. Never modify real customer conversations
or the owner-created legacy plan to manufacture test evidence.

## Infrastructure and release boundaries

Local schema72 allows a recipient row with a null verification timestamp so staff
can submit first. It never fabricates verification; only a successful code check
sets that timestamp and permits a recipient session. Protected backup, migration
inventory and unchanged earlier-table content readback are retained. Tracking-only challenges/sessions use bounded
expiry/cleanup. Durable email jobs have leases, bounded retry and stable provider
idempotency; no HTTP send holds a database transaction. The immediate after-response
attempt and scheduled worker retry both use existing guarded Mailpit/Resend ports.
Secrets, codes, sessions, recipient addresses and raw evidence stay out of logs
and Git. A locator is not an access credential. Every list/detail authorization
is checked before304. Hidden pages stop repeated polling; active detail reads are
conditional and single flight. Existing accounts/chats provide no tracking scope.

Actual Chrome/Expo evidence, explicit visual approval, full checks and later
production backup/rollout are separate gates. Do not infer production email,
Android installation, OS App Links or push proof from a browser preview.
