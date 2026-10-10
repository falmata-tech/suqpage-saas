# Business support and transport dispatch

## Catalog policy and reports

The owner prohibits violent imagery, nudity/sexually explicit content and
age-restricted goods/services, including alcohol, tobacco/nicotine/vaping,
weapons, recreational drugs, gambling and adult products/services. The public
rule is at https://suqpage.com/terms. Ordinary cooking/industrial tools are not
weapons solely because they are sharp; review their actual intended use/listing.

Use Dashboard → Reports (/dashboard/reports). A support agent can claim a report;
managers can assign it. Review the actual product/page and media, not just a
keyword or a seller's unrelated business name. Prohibited goods and Abusive
content are the existing report reasons. Keep reporter details private.

For a confirmed violation, an administrator uses the existing authorized product
unpublish or business suspension controls. Support agents do not gain general
business-edit rights. Verify that the reported public content is actually gone
before marking the report Resolved; the backend rejects resolution while it is
still visible. Dismiss only after reviewing a report and finding no violation.

The policy is enforced when violations are found. Do not promise that every
upload or linked video is automatically checked, that publication means approval,
or that catalog reporting is a universal chat-moderation feature. Transport-only
agents and business owners cannot access the private Reports queue. No new carrier,
commission or staff permissions are introduced by this policy.

S57 is local pending visual review and release. Use the existing Suqpage staff
workspace; carriers and logistics companies operate outside this platform.

## Prepare the team

In Support → Manage agents, enable dispatchers/brokers with **Transport dispatch**
(or **All requests**) and set their open-case limit. Business-support-only agents
cannot access transport work. Managers can change assignment; a scope change is
blocked until incompatible active cases are reassigned.

## Handle transport and delivery requests

1. Visitors choose **Transport & delivery → Live chat**, enter pickup, destination,
   name and phone, and optionally describe their goods. No account or email is
   needed. The conversation waits for a staff reply; automatic assignment does
   not mean an agent is online or a booking has been confirmed.
2. Enabled dispatchers with capacity receive requests automatically; otherwise
   they wait in Support → Transport & delivery. Claim eligible waiting work or
   ask a manager to assign/reassign it. Review the route, goods and callback number.
3. Send **Reply** to the customer. **Internal note** stays private. Find a carrier
   externally, agree arrangements with the customer, and save **Transport company**
   and its contact. Carrier details and commission discussions are not automatically
   shared. Record commercial agreements in internal notes; there is no commission
   accounting, payment, booking integration or automatic provider notification.
4. **Active**, **Chat history**, and **Resolved** separate live requests, ended chats,
   and finished follow-up. Search by name, phone, route or reference. A visitor's
   End chat frees capacity but keeps their route, number and messages. Staff may
   call and add notes without reopening. Mark resolved when no further work remains.
5. Reopen restores the assignment/capacity workflow. Starting another request
   preserves the earlier history. X dismisses the window without ending the chat.

Business owners retain Dashboard → Support with private attachments. General guest
support stays closed. Historical buying requests retain their original labels,
messages and private notes, and can still be handled in the transport-scoped queue.
Only explicitly visitor-visible replies are returned by either live channel.
Keep the inbox open for updates; do not promise instant availability.

## S57 rollout

Apply migration 59 before updated web/mobile code: it extends the resolution
constraint to closed transport requests. No messages are backfilled or deleted.
Rollback may retain the additive schema and all history. Hosted migration and
release remain pending. No external messages were sent during local verification.

## Release and rollback

Production schema 58 preserves optional buying classifications, default-private
message visibility and a separate resolved timestamp. Existing staff notes are never backfilled as public replies.
The 2026-09-27 release applied migrations 51–58 after a protected backup, restore
rehearsal and release gates. Original-column fingerprints were preserved. Retain rows,
assignments, tokens and audit history. A rollback must keep schema 58 and use
application code that recognizes buying cases and keeps general public support retired; do not relabel or delete them.

Evidence: all six `npm run test:support` suites; real intake/retry/live conversation browser
checks at 320/390/1440; real staff claim/note/close/reopen/reassign checks. Private
screenshots and receipts: `.local/live-buying-review/`.

While open and visible, buying conversations refresh every five seconds; failed
refreshes back off to thirty seconds and show a connection warning. Inbox/thread
refresh also pauses when the browser is hidden. Assignment does not mean an agent
is online. No background push, SMS notification, immediate-response promise or
cross-device guest recovery is provided. Cookies expiring or being cleared lose
browser access; staff retain the case and callback number.

## Owner video requests

Owners choose **Request a video** in the page editor or on a saved product, then
submit a source link and optional message. Requests appear in Business support
with normal agent assignment, conversation history and owner replies. Existing
or example media stays visible while review is pending. Staff should open only
links they trust; Suqpage never fetches or uploads the submitted source.

Open the assigned request, enter the YouTube link, add a reply and choose
**Approve video**. Videos from any YouTube channel are allowed after staff review;
Suqpage does not need its own channel or a channel configuration setting. Staff
may use the submitted YouTube URL directly, or upload a source file externally
and enter the resulting URL. There is no automatic upload or channel check.
Choose **Decline** with a reply when the video should not be used.

The first product approval replaces the example; later approvals add a video up
to the four-video limit. Owners can remove old media. Changed/deleted targets must
be requested again; unrelated text, photos, publication status and unpublished
page changes are preserved. Approval is recorded with the staff identity and an
owner reply. Normal product/page saves cannot bypass this review.

S48 evidence: `scripts/test-video-requests.ts` and
`scripts/capture-video-requests.ts`; private previews in
`.local/video-request-review/`. Migration 58 is additive and server-only. Retain
its records on rollback and use application code that still enforces review.
