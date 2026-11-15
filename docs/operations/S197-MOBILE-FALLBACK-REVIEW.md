# S197 public-demo video asset review

The 66 public fictional showrooms have 264 products. Fifteen business stories
already use first-party MP4s; the separately packaged Liya Soap Kitchen story
and four products add five assets. This batch prepares one story and four
product-specific MP4s for each of the other 50 TikTok-using businesses: **250
new videos for 50 stories and 200 products**, 22,893,463 bytes in total. The
static allowlist contains 270 exact assets after the Liya merge.

The bounded 390px phone Chromium sweep reached visible `Video unavailable`
fallback for 16 distinct TikTok refs across 39 businesses. Thirteen other
distinct refs were inconclusive; none advanced playback in that environment.
`S197-MOBILE-FALLBACK-ASSETS.json` distinguishes the confirmed and inconclusive
businesses. The finite media correction covers all 51 external-video
businesses, including Liya. This asset package does not change their public
media refs.

Each story is a ten-second montage of that business's approved hero and four
offering visuals. Each product is an eight-second clip of its matching owned
artwork. Six source portfolio images showed a different item or gave the named
item too little visual emphasis, so products 45, 49, 50 and 153–155 use new
exact-title diagrams in their clips and story montages. The diagrams have no
extra badges, example captions or process claims. Eight current products have
video-only media, including those six; this package does not add gallery photos.
The six diagrams, their reproducible source and demonstration-rights rows are
included. No third-party clip was downloaded or rehosted.

All 50 heroes and 200 product associations were visually reviewed in ten
contact sheets. The six diagrams had a second visual review, including an
independent reviewer. The files are silent portrait H.264 MP4s, 720×1280 at
24fps, with fast-start metadata; each is under 1MB. The renderer validates
source-rights rows, exact duration/codec/dimensions, file size and SHA-256;
its `--verify` mode decodes every frame. The catalog test checks all 270
packaged bytes and business bindings. Phone Chromium playback passed for
JPEG- and WebP-derived clips over local HTTP range delivery. A temporary local
Next page using the actual `ProductMediaGallery` and `FirstPartyDemoVideo`
components also confirmed photo-first ordering, click-to-play advancing past
three seconds, return to photo, and a diagram-only product clip advancing past
three seconds. That temporary fixture and screenshots remain local and are not
in this package.

Before hosted correction, verify the deployed static files and range playback,
then refresh exact current media and version guards. Forty-nine businesses
have simulator enrollment and use `media_correction` requests; businesses 50
and 62 have no enrollment and use separate `unenrolled_media_correction`
requests on the same disabled private queue, with ordinary catalog/page writes.
The selected-field before/after media plan is private and
retains current product image entries in their exact positions. Native Android
playback remains a separate device check.
