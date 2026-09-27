# Help and Buying assistance staff workflow

FE-019 / BE-018 · S31–S47 approved for release; S48 video-request visual review
and refreshed release gates pending.

## Prepare the team

Open **Support → Manage agents**. Enable each team member, select **Business support**,
**Buying assistance**, or **All requests**, and set their shared open
case limit. Existing transport-scoped staff now handle Buying assistance as well
as historical transport cases. Change assignments before narrowing a busy agent's
scope. The internal `transport` scope and queue URL remain compatibility keys.

## Handle buying requests

1. Visitors choose **Buying assistance → Live chat**, enter their message, name and phone,
   and choose **Start chat**. Buying assistance is one service; there is no service selector.
   The request opens a text conversation showing **Waiting for our team** until
   a public staff reply appears. Auto-assignment alone does not imply a reply or
   staff presence. Replies appear automatically while the chat is open. There is no payment step.
2. The system assigns requests to an enabled Buying assistance agent with capacity.
   Otherwise the request waits in **Support → Buying assistance**. Staff can claim
   eligible waiting work. They cannot take someone else's assigned case.
3. Open the case to see the request details and phone. Choose **Reply** to
   message the customer, or **Internal note** to record private work, then Send.
   Existing notes remain private. Buying replies are text-only. Phone follow-up
   remains available when the visitor leaves the browser.
4. Buying assistance has **Active**, **Chat history**, and **Resolved** lists.
   Search by name, phone or reference. The original request appears in the list;
   open it for the contact number, request summary and conversation. Managers see
   all cases; team members retain their assigned cases and eligible waiting work.
5. Visitor **End chat** moves the case to **Chat history**, releases live-chat
   capacity and preserves contacts/messages/notes. The dismiss X only hides the
   chat. Staff can use the phone link and **Add note** to record a call without
   reopening public messaging. Record outcomes such as “No longer interested” in
   a private note, then choose **Mark resolved** when follow-up is finished.
6. **Mark resolved** moves the case to **Resolved**, closes any active chat and
   records the decision once. It does not delete history. **Reopen** clears the
   resolution and follows existing assignment/capacity checks. Managers can
   reassign open cases. Closed requests offer visitors **Send another request**;
   starting one preserves the previous case.

General support is available only to signed-in business owners through Dashboard →
Support. Buying assistance alone accepts guest messages. Owners can start conversations, read/reply and attach files. Public pages
have only Buying assistance; the old guest chat endpoints and public files are
retired. Business-support-only agents do not receive buying work. Historical guest
records remain available to authorized staff; further messages remain private notes unless explicitly sent as buying replies. Managers see both queues; team members see eligible waiting
work and their own assigned history. Keep the inbox open to monitor new requests;
there is no automatic phone/SMS notification or promised response time.

## Historical transport cases

These remain correctly labeled **Transport** in the Buying assistance queue, with
original routes and private company-handoff history. Assigned staff can still
manage them. They are not converted to purchase or quality-check requests.
The legacy public transport and Help APIs are retired, including old cookie-based
chat recovery. Buying conversation recovery uses its own HttpOnly cookie. No historical
requests are automatically closed or deleted.

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
