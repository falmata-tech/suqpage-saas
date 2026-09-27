# Suqpage interface writing

Write for the action on screen, not the English sentence structure. This applies
to English, Amharic, Afaan Oromo, Somali and Tigrinya across public pages and the
owner/admin workspace (FE-049 / FE-052).

- Write public positioning as finished customer-facing copy. Describe the benefit
  directly; do not reproduce planning discussions or turn audience segments into
  a series of rhetorical questions.
- Keep button labels short and use familiar verbs. An inquiry asks the business
  a question; it is not a purchase, booking or completed delivery.
- Explain Publish as making the page visible to customers. Save on an already
  live page applies changes immediately. A private page may still be accessible
  to staff with the owner's permission; never translate private as “only you.”
- Business workspace means business management, not an office building. Cover
  image means the main page photo, not a book cover. Public contacts are the
  details customers can use to reach the business.
- Live support is for signed-in business owners in their dashboard. Public
  visitors have Buying assistance chat; general guest support stays closed.
- Buying assistance covers buying on behalf of a customer, checking a business
  and checking product quality. Submitting starts a conversation with optional phone follow-up; it does not confirm
  a purchase, guarantee quality or award a seller certification. Historical
  transport requests retain their original meaning.
- Keep Suqpage and merchant names unchanged. Never translate merchant content,
  handles, phone numbers, URLs, prices or saved status/role values.
- Preserve useful English terms when an unfamiliar coined translation would
  confuse people. Do not add filler text, internal notes or pricing claims.

Edit `interface.tsv`, then run `node scripts/build-ui-messages.mjs` and
`npm run test:localization`. Use aliases only when both contexts mean the same
thing. Review full screens at 320px, 390px and desktop widths: a catalog coverage
check cannot establish that wording is natural or that a label fits its control.

The current contextual revision is agent-authored. Native-speaker review is not
claimed; feedback can improve wording without changing stored merchant data.
