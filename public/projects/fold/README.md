# FOLD — personal concept

FOLD is a personal hospitality identity concept, confirmed by the designer. Applications
visualise the proposed brand world; they are not evidence of a commissioned or built venue.

## Current presentation

- Opening: the two-layer cup hero.
- Idea: project brief, intended audience, scope and city-use photography.
- Wordmark: the master drawing, with actual O–L (12.2 units) and L–D (12.3 units) gaps.
- Visual system (02B): Anton / IBM Plex Mono / Inter, palette, fold construction, vector seal,
  lockup and receipt. All wordmarks use `FoldPrimitives.tsx` and `wordmark.ts`.
- Packaging: lead photograph, interactive closed / fold / open concept, explanatory net,
  and four selected applications (cup, carrier, pastry bag, wrap).
- Space: storefront, counter, A-frame and materials.
- Print: menu spread, loyalty card and staff tee.
- Social: five selected posts (four images and one live vector/type composition).
- Order prototype, motion principles, closing.

The packaging net is an illustrative structural proposal, not a production dieline. Closure
tabs, material thickness and tolerances require a physical prototype. It is distinct from
the photographed lid-and-seal box applications. No production-ready claim is made.

## Assets and logo fidelity

`src/projects/fold/assets.ts` maps available photography; not every available file appears in
the current edit. Older images and alternate social masters are preserved for future use.
The old four-photo wordmark scale strip is replaced by vector artwork, avoiding unverified
millimetre-size claims. Redundant print and social shots are omitted from the presentation.

`fold-wordmark.svg` and `src/projects/fold/wordmark.ts` contain the same master path. The
geometry is reused in all new flat artwork, phone branding, packaging drawings and motion.
The wordmark motion uses translation and clipping, never horizontal stretching.

Retained raster mockups were visually inspected for lettering, orientation and cropping.
Their baked-in wordmarks are illustrative: exact geometric matching cannot be certified
from perspective photographs. No claim is made that these bitmaps were reprojected or
retouched to the master. Exact artwork is shown separately in the visual-system section.

## Social media

`SOCIAL_POSTS` in `FoldCaseStudy.tsx` is the presentation source of truth:

1. `social/post-01.jpg` — morning coffee.
2. `social/post-02.jpg` — people / Athens.
3. Vector wordmark and live type — Good things inside.
4. `box-open.jpg` — a quiet product detail.
5. `social/post-09-v2.jpg` — evening / neighbourhood.

Coffee, Bakery, To go and Athens highlights retain their inline stories and keyboard focus
return. The feed measures its travel from rendered content, including captions and highlights.

## Loading and type

The hero loads immediately. Other photos retain the existing `PhotosReady` gate and start
loading after the project panel opens. Do not restore lazy loading without testing scroll
arrival; it was previously changed to avoid visibly late images.

Case-study fonts load through `src/projects/index.ts`. Headlines use Anton, utility labels
IBM Plex Mono, and body copy Inter. The logo is always vector geometry, never typeset text.
