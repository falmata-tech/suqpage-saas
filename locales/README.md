# AfricMade interface writing

Write for the action on screen, not the English sentence structure. English,
Amharic and Afaan Oromo are the active interface languages across public pages
and the owner/admin workspace (FE-049 / FE-052). Somali and Tigrinya catalogs are
retained for compatibility and rollback, but are not selectable. Afar was never
enabled. Restored inactive or unknown preferences render English without
rewriting saved records. `enabledLocales` controls presentation; `locales` and
the stored Locale union describe retained identifiers.

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
- Live support is for signed-in business owners. Public visitors can chat with
  the transport team about moving their purchases; general guest support stays
  closed. Starting a transport chat is not a confirmed booking. Keep the native
  explanation and the recognizable `(Live Chat)` label together.
- Keep AfricMade and merchant names unchanged. Never translate merchant content,
  handles, phone numbers, URLs, prices or saved status/role values.
- Preserve useful English terms when an unfamiliar coined translation would
  confuse people. Do not add filler text, internal notes or pricing claims.

Edit `interface.tsv`, then run `node scripts/build-ui-messages.mjs` and
`npm run test:localization`. Use aliases only when both contexts mean the same
thing. Review full screens at 320px, 390px and desktop widths: a catalog coverage
check cannot establish that wording is natural or that a label fits its control.

The current contextual revision is agent-authored. Native-speaker review is not
claimed; feedback can improve wording without changing stored merchant data.

## S145 / FE-070 — historical MirtPage presentation

This section records an earlier, superseded wording decision. AfricMade is the
current untranslated platform name; FE-070 and the master prompt control its
current public narrative. The earlier proposition was a
business digital showroom: the business and its story, products and optional
collections, followed by direct contact through its social accounts. Amharic
uses ዲጂታል ማሳያ ገጽ; Afaan Oromo explains fuula agarsiisa dijitaalaa. The
proposition does not describe the showroom as an internet page. A farm, factory,
workshop, supplier or retailer can present tangible products; the supporting
About sections carry those examples instead of crowding the Market heading.
Availability, capacity and timing remain the business's declarations, not
verified inventory or delivery promises. Preserve existing audience tabs,
short actions and literal merchant content.

New local narrative is authored for active en/am/om. Inactive so/ti retain their
catalogs and may use explicit English compatibility entries for new paragraphs;
they are not enabled or presented as newly reviewed translations. Existing
technical identifiers, historical copy rows, provider settings and published
media retain their own rollout status. Changing the local catalog does not
rename an Android package, provider project, existing record or deployed app.
Independent first-language review and final visual approval are not claimed.

The following S132/S133 references informed earlier wording choices; they do
not make the superseded internet-page formulation a current requirement.

Primary references consulted for that earlier draft:

- [Google Material writing guidance](https://m1.material.io/style/writing.html)
  and [communication guidance](https://codelabs.developers.google.com/codelabs/material-communication-guidance):
  clear actions, concise explanations and benefits without exaggerated claims.
- Ethio telecom's official Oromo [social-media page](https://www.ethiotelecom.et/kuufama-miidiyaa-hawaasaa/?lang=om),
  [telebirr information](https://www.ethiotelecom.et/teeleebirrii/?lang=om) and
  [customer instructions](https://www.ethiotelecom.et/gaaffilee-irra-deddeebianii-kaan/?lang=om):
  regional usage of miidiyaa hawaasaa, fuula, daldaltoota and oomisha, with
  respectful plural instructions. Current retrieval used indexed excerpts;
  direct page fetches timed out. These are terminology examples, not a software
  terminology standard or proof that our sentences were reviewed locally.
- The earlier Microsoft Amharic guide below remains a structural reference.
  Its download was not machine-readable in the current web fetch. Do not copy
  bureaucratic phrasing or claim a fresh full-document review.

Stock labels describe the business's declaration. Transport wording names goods,
pickup and destination, rather than passenger travel or guaranteed delivery.
Short controls retain familiar actions; About and the intake explanation carry
the additional context. Catalog coverage and component tests are technical
evidence; independent first-language review and actual final layout approval
remain separate. Prepared marketing text names only the three active languages;
existing promotional images are stale until rebuilt and reviewed.

## Researched wording decisions — S101 / FE-049

Reviewed October 15, 2026. These references inform the draft; they do not certify
our sentences or represent interviews with Suqpage users. Dictionary coverage,
typechecks and screenshots prove technical behavior, not linguistic fluency.

| Language | Primary references consulted | Application in this interface |
| --- | --- | --- |
| Amharic | [Microsoft Amharic guide](https://download.microsoft.com/download/6/2/a/62a993f1-d3b2-4f28-b3e7-22965eb91426/amh-eth-styleguide.pdf), [Google account instructions](https://support.google.com/googleplay/android-developer/answer/10627869?hl=am) | Explain the showroom as a business page on the internet. Use familiar ምርት, አገልግሎት, መለያ and ገጽ. Name the action and use respectful forms in the revised journeys. |
| Afaan Oromo | Ethio telecom's [service instructions](https://www.ethiotelecom.et/tajaajila-jalqabuuf/?lang=om) and [telebirr information](https://www.ethiotelecom.et/teeleebirrii/?lang=om), retrieved through indexed excerpts | Use fuula for a page, oomisha for products and tajaajila for services. Explain the organized internet page rather than coin a showroom noun. Revised instructions use respectful forms such as filadhaa, ilaalaa and galchaa. No authoritative Oromo software style guide was found. |
| Somali | [Microsoft Somali guide](https://download.microsoft.com/download/fcfc6c16-87ce-4226-a728-821c5ac400bc/som-SOM-StyleGuide.pdf), [Somali Ministry of Commerce navigation](https://moci.gov.so/khariidadda-bogga/) | Use bog, alaab, adeeg and ganacsi consistently. Split long English sentences; explain what the customer can do. Prefer task verbs such as dooro, eeg and la xiriir to literal marketing metaphors. |
| Tigrinya | [Microsoft Tigrinya guide](https://download.microsoft.com/download/1/6/1/16111696-2ae4-40dc-a5b5-b441e246c767/tir-eth-styleguide.pdf), [UNHCR Tigrinya explanations](https://help.unhcr.org/global/ti/resettlement/) | Explain the online business page, use clear question/action phrasing, and distinguish ሓበሬታ, ሕቶ and ርክብ. Revised actions use respectful forms. Retain familiar video/platform names. |

[Microsoft's global-writing guidance](https://learn.microsoft.com/en-us/style-guide/global-communications/)
and [W3C's localization guidance](https://www.w3.org/International/questions/qa-i18n)
support adapting the explanation to its audience rather than substituting words.
The historical Amharic/Tigrinya guides contain conflicting register advice and
some unsuitable examples; they are structural references, not text to import.
The Somali guide explicitly advises against literal translation and permits
splitting/merging sentences. Regional usage is evidence, not a single universal
East African dialect or permission to imitate banking/government language.

The revised Market heading explains the digital setting; its description carries
the social-post problem, nearby/distant businesses and direct availability
questions. About separates customer browsing from business presentation and
sharing. An inquiry list contains selected products, not a list of questions or
a shopping cart. Publish means making the page visible to customers, not printing
it. Stock is merchant-listed; capacity/timing are descriptions or questions, not
verified inventory or new structured features. Brands and merchant content stay
literal. Check those meanings in full screens, not isolated strings.

Scope: shared Market/About/map/account copy and the unclear discovery, product,
inquiry, setup, page editing, transport and staff labels identified in the audit.
Prepared campaign/store source text follows the same wording. Legal paragraphs,
unused historical strings and unchanged labels are not represented as a complete
human linguistic review. A first-language speaker should still review the actual
screens and tell us what each action means before a linguistic-quality claim.


S105 keeps transport and owner-support vocabulary. Product-contact messages now
use contextual greetings/questions in the selected interface language, leaving
merchant names/options/quantities literal. Social service names remain recognizable.
English/Amharic/Afaan Oromo/Somali/Tigrinya contact and shared narrative states have
local browser evidence under .local/social-contact-s105/. This is authored copy,
not a claim of independent native-speaker approval or a published Android update.

S112 presents products only in active catalogs. A shop, farm, workshop or factory
can show tangible goods already prepared or goods made after an order. Supply
labels explain that distinction: the localized question asks whether the product
is ready now or made after ordering, rather than translating “supply” as a freight
operation. Availability remains the business's declaration. An unavailable custom
product says that orders are not being accepted, never that it is ready to send.
Retained historical services are described privately as listings no longer shown
to the public. They are not silently converted or translated into products.

Market, About, account tasks and prepared five-language social captions use the
same product-only meaning. English and Amharic Play listing sources follow it;
their existing locale scope is unchanged. Transport, owner support and legal
service terminology remain meaningful in their own contexts. Source text changes
do not update already generated artwork, published listings or installed apps.
