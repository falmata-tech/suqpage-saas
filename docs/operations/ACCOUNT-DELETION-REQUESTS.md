# Account deletion requests

FE-055 / S60 introduces a clear entry to the existing email request channel.
It does not automate account deletion. The candidate web page is
`/account-deletion`; native Account and Account security open native instructions.
Both use the existing privacy contact, `falmata.dawano@gmail.com`, with the subject
`Suqpage account deletion request`. A mail composer is not proof of delivery.

## Handling a request

1. Check the privacy-contact mailbox and assign a responsible administrator.
   Confirm receipt by replying to the request; do not ask for passwords, login
   codes or screenshots of credentials.
2. Verify the requesting person's control of the actual account email through
   the existing identity process. A sender header, business handle, public phone
   or screenshot alone is not sufficient authority to delete an account.
3. Resolve the canonical Auth identity and linked user/tenant. Inspect ownership,
   other tenant users and shared inquiry/support history before proposing changes.
   Do not delete an entire shared tenant simply because one member requests removal.
4. Prepare an exact scoped removal plan for account/profile/contact records,
   Supabase Auth, sessions, owned page/product media, revisions and associated
   records. Include private Storage and any provider copies. Identify data that
   must legitimately remain, the reason, and its retention period; explain that
   to the requester before proceeding. Do not promise an invented retention SLA.
5. Have an authorized administrator review the plan and execute it using the
   normal backup, target-verification, privacy and data-integrity controls. Never
   record customer details or deletion SQL containing identifiers in Git or logs.
6. Verify access revocation, public disappearance where applicable, provider/media
   removal and preservation of other users' data. Confirm completion to the
   requester only after verification. Retain only the necessary protected
   operational record and handle backup expiry under the approved retention policy.

## Remaining public-store prerequisite

This is an operating checklist, not evidence of a tested erasure implementation.
The owner must confirm mailbox coverage, retention rules and a complete removal
procedure exercised against disposable data before claiming public-store
compliance. No live request has been sent and no customer account has been removed
during S60. No general guest live-support channel is reopened.

Google permits a customer-service email request path from a clearly identified
web resource linked in the app. Its requirement also covers associated data,
identity-safe fulfilment and disclosed retention; discoverability alone is not
enough. See [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
