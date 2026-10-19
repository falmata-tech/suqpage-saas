---
id: ADR-0031
title: Explicit Gmail SMTP for low-volume transactional mail
status: accepted
date: 2026-10-19
deciders: [product, engineering, security]
related: [BE-018, BE-050, BE-058, DEP-043, DEP-048, ADR-0026, ADR-0028]
---

# ADR-0031 — Explicit Gmail SMTP for transactional mail

## Context and decision

The owner already uses a Gmail app password for Supabase Auth and does not want
another sending account for MirtPage's first release. Supabase's SMTP settings
send Auth mail only; the independent shipment-code, initial-details and overdue
staff-alert outboxes cannot use them as a general mail API. The current application
adapters use Resend in hosted environments and Mailpit in local previews.

Keep the durable outboxes, typed send ports, existing Resend mode and guarded
Mailpit mode. Add an explicitly selected `gmail-smtp` hosted mode for those three
transactional message types, using TLS to the fixed `smtp.gmail.com:465` endpoint.
It has its own server-only Gmail username and app-password settings. The From
address must be that exact Gmail account; the display name is MirtPage. Never
read or copy Supabase's masked SMTP credential. No Gmail secret may enter source,
mobile builds, browser variables, logs, diagnostics or test snapshots.

The mode is selected with `MIRTPAGE_TRANSACTIONAL_EMAIL_PROVIDER=gmail-smtp`.
An unknown selection fails closed; omission preserves the current Resend mode.
Local Mailpit selection stays bound to the existing exact loopback guards and
never falls through to Gmail. Preserve canonical HTTPS origin and remote
database/Auth guards before any hosted send. Validate recipients and headers,
require verified TLS, bound SMTP connection/greeting/socket timeouts, avoid
transport pooling in ephemeral functions, and return generic outcome categories.
Keep saved jobs, leases, retry limits, expiry, fresh authorization and the existing
stable job identity/Message-ID. Do not make SMTP calls inside SQL transactions.

Gmail SMTP offers no provider idempotency key. A timeout after Gmail accepts a
message can therefore produce a duplicate on the bounded outbox retry; a stable
Message-ID may help clients thread mail but is not an exactly-once guarantee.
Provider acceptance is never presented as inbox delivery. This is suitable for
the small initial test, subject to Gmail's account limits; growth requires a
separately reviewed transactional provider and verified sending domain.

## Rollout and verification

This decision authorizes source implementation only. Production setup needs a
server-side production-context secret entered directly into Netlify, a fresh
deploy, and a labelled real-address send/receive check. The existing Supabase
Auth SMTP configuration remains unchanged. A second Gmail app password for the
same account is preferred so Netlify access can be revoked independently.
Missing credentials defer jobs without pretending they were sent. Test valid and
invalid target/configuration/header inputs, TLS settings, SMTP accepted/rejected/
temporary/auth/timeout outcomes, stable Message-ID, no local-provider fallback,
and unchanged Resend/Mailpit behavior. Rollback selects the previous Resend mode
or disables external delivery; queued jobs remain for later reviewed recovery.

Primary provider references:
https://supabase.com/docs/guides/auth/auth-smtp
https://support.google.com/mail/answer/185833
https://support.google.com/mail/answer/22839
https://nodemailer.com/smtp
https://docs.netlify.com/build/functions/environment-variables/
