# FOLD — case-study assets

The FOLD case study lives in `src/projects/fold/`. Photographs are mapped in
`assets.ts`; system specimens and social posts are mapped in `FoldCaseStudy.tsx`.

## Narrative and captions

Folding is the inspiration for the identity, not a claim that every object has
the same closure. The system combines a compact wordmark, warm material tones,
angular red-orange graphics and a clear type hierarchy. Describe printed motifs
as graphics, not as physical folds unless the photograph actually shows one.

This is a personal hospitality concept. Scale studies are illustrative, not
measured production specifications. The ordering interface is an interactive
demo: its prices and pickup times are examples, with no real payment or order
submission.

## Photography

The opening uses `hero-ground.jpg` and the transparent `hero-cup.webp`.
The remaining groups are the idea (02, `city-*.jpg`), wordmark applications
(04, `mark-*.jpg`), packaging (05), physical space (06) and print/menu (07).
See `assets.ts` for filenames, descriptive alt text and intended dimensions.

## System specimens (03)

The signal, wordmark, materials and type cards use raster specimens. The pattern card uses
`system-pattern.webp`, a new photographic specimen generated with built-in imagegen using
`print-menu-cover.jpg` as a visual reference for the angular printed motif:

> Overhead macro product photograph of a new, full-bleed square sheet of uncoated paper printed with the FOLD angular pattern. Use the menu cover only as reference for the sharp folded-plane geometry and cream, orange, red, burgundy and ink palette. Extend the interlocking diagonal planes across the whole square, with a large cream area and visible paper fibres, imperfect ink absorption, warm natural light and soft shadows. No menu, wordmark, text, props, outer sheet edges or watermark.

- `system-wordmark-v2.webp`
- `system-materials.webp`
- `system-type-v2.webp`

The material strip uses `material-{paper,kraft,concrete,ink,signal}.webp`.
Its hex labels are digital colour references, not sampled measurements of the
photographed textures. Orange, red and deep red support the main signal colour
in the angular graphics.

The two revised specimens are rendered from the canonical mark and actual font
files, rather than generated approximations of the lettering. Rebuild with:

```sh
node production/pipeline/fold-specimens.mjs
```

The renderer uses the existing pipeline Sharp dependency. Font sources and OFL
licenses are in `production/pipeline/assets/fold-fonts/`.

## Wordmark and type

`fold-wordmark.svg` and `PATH` / `VIEWBOX` in `wordmark.ts` share the locked
master geometry: heavy stems, curved counters, close spacing and subtly softened
outer corners. Counters are even-odd subpaths. The wordmark is never typed.

Anton is the headline face; IBM Plex Mono handles utility details; Inter handles
reading text. The case-study fonts load through `src/projects/index.ts`, while
the site's Inter family loads in `index.html`.

## Social (08)

Nine static image posts, each framed at 4:5 with its
own campaign caption and alt text. Four highlights reuse project photography.

Post 02 uses `social/post-02-v2.jpg`: “MADE TO MOVE.”, a 1080 × 1350 campaign image
created with built-in imagegen using the existing hero cup and campaign art as
references. It replaces the video in the feed; the original film files are
retained but no longer loaded by a post. The final prompt is recorded in
`production/pipeline/assets/fold-social/post-02.md`.

Posts 04 and 06 use `social/post-04-v2.jpg` and `social/post-06-v2.jpg`:
“ONE MORE LAYER.” features a torn croissant against dark paper, while “GOOD
THINGS INSIDE.” features the canonical rectangular FOLD pastry box in warm light.
Both are 1080 × 1350 static artworks created with built-in imagegen. Their
original images are retained; prompts and references are recorded in
`production/pipeline/assets/fold-social/posts-04-06.md`.

The revised `social/post-08-v3.jpg` replaces the unsupported claim that all
packaging closes the same way. It now reads “DIFFERENT FORMS. ONE IDENTITY.”
The original `post-08-v2.jpg` is retained but is not used by the feed.

### Image edit provenance — 2026-10-11

Built-in imagegen, not the API/CLI fallback. Edit target:
`public/projects/fold/social/post-08-v2.jpg`.
Final site asset: `public/projects/fold/social/post-08-v3.jpg`.
The returned PNG was encoded as a quality-92 JPEG for the website.

Final prompt:

> Use case: text-localization. Edit target: the attached FOLD packaging campaign image. Change ONLY the small cream subheading on the left beneath ONE MORE LAYER. Replace PACKAGING / THAT CLOSES / THE SAME WAY with the exact text on three lines: DIFFERENT FORMS. / ONE / IDENTITY. Keep this replacement in the same small condensed cream uppercase type, same location and approximate occupied area. Preserve the large ONE MORE LAYER. headline exactly, including its orange full stop. Preserve every product, all FOLD logos and product lettering, the bag handles, box, napkins, croissants, paper shapes, textures, lighting, shadows, composition and 4:5 portrait framing. No other changes. The copy must say DIFFERENT FORMS. ONE IDENTITY. and must not claim identical packaging closures.
