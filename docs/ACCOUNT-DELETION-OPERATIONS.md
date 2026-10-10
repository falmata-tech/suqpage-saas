# Fulfil a verified Suqpage account-deletion request

BE-053 extends FE-055's existing email request channel. This is an operator
procedure, not a public deletion API or permission to purge accounts during a
release. The October 9 rehearsal uses disposable local identities and real local
Supabase/PostgreSQL/storage; no customer account is removed.

1. Receive the request at falmata.dawano@gmail.com. Verify possession of the
   account email through a fresh sign-in/identity check. Match the immutable
   Supabase UUID, linked application user and page handle. A guessed address or
   forwarded email is not sufficient. Record a private request reference. Ask
   for guest conversation references separately if those should be included.
2. Independently verify the selected environment, project and database. Take a
   protected recoverable database/media backup and hash it. Never download a
   customer's data into public logs, Git or an app-build directory.
3. Run `planOwnerErasure` in scripts/operations/account-erasure.ts with the exact
   user ID, provider UUID and normalized account email. Store the private plan
   with owner-only permissions. This is read-only; it includes row counts and a
   digest. Staff, shared businesses, mismatched identities and cross-business
   request dependencies require a separate reviewed operation. Never bypass a
   refusal, disable a FK or assign history to another user.
4. Review the exact plan and backup with the owner. Inventory associated uploaded
   objects using the media-reference manifest and the `page-<businessId>-` and
   `product-private-<businessId>-` namespaces, including unreferenced uploads.
   Page through provider lists until exhausted; never assume the first 1,000
   entries are complete. Preserve objects still referenced by another tenant or
   recipe. Record any mandatory legal/security retention separately and explain
   the actual scope to the requester before applying.
5. Remove the exact Supabase Auth UUID through the bounded administrator/provider
   adapter and independently verify its absence. This prevents an old token from
   starting setup again while its app binding is removed. Store that progress in
   the protected receipt. A timeout/error stops the operation for recovery review.
   Apply `eraseOwnerRows` only with that approved digest, verified request reference
   and actual backup hash. It reloads the target/data, checks drift and atomically
   removes tenant/owner app data, histories, sessions, invitations and associated
   alert preferences/subscriptions. After commit, the old session has no owner
   authority. Supply an `ErasureIdentityPort` that actually calls managed
   `getUserById` and accepts only a verified not-found response, never a fixed
   Boolean or metadata claim. A changed plan must be regenerated and reviewed; never replay an
   outdated approval or treat a failed transaction as success.
6. Remove the inventoried uploaded objects only after confirming they have no
   remaining reference. Verify each object's absence through the storage adapter.
   Recheck that the Auth UUID is absent and its prior session cannot read owner
   APIs. The operation is not complete while app data, Auth or media remains.
7. Keep a protected progress/verification receipt. Do not retain the deleted
   content in the receipt. A provider failure or ambiguous timeout stops further
   writes; report the exact partial state and request direction on recovery.
   Confirm fulfilment to the requester only after all components are verified.

Restricted backups remain outside the live service. Track deletions separately
from the customer data; any restore must reapply them before reopening access.
Review and retire retained copies under the applicable backup/retention policy;
do not promise immediate removal of independently retained provider copies.
Guest chats without an account link require verified reference/session ownership
and a separately scoped plan. Staff-account deletion is outside this recipe.

Run `npm run test:account-erasure` for the local rehearsal. It proves exact-target,
staff/shared-tenant/drift/approval/backup guards; real app/Auth/media erasure,
orphan-prefix inventory, revoked app authority, preserved shared media and unchanged
other-tenant records. Its fixture backup marker is test-only and never authorizes
a real apply. Complete release gates and store disclosures remain separate.
