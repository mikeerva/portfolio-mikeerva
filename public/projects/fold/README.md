# FOLD — case-study assets

Everything the FOLD case study (`src/projects/fold/`) loads from this folder.

## Status: interim

No production photography exists yet, and no image generation was available when the case
study was built. So every image here is an **interim extract from the approved FOLD
case-study board** — one tile of the board each, at the board's resolution (roughly
200–470 px wide). They are correct in content and art direction but **soft at the sizes the
case study shows them**.

**To replace one:** save the final photograph over the file with the **same name**. Nothing
in the code needs to change. Recommended sizes (and the alt text the page uses) are listed in
`src/projects/fold/assets.ts`.

| File | Shows | Recommended |
| --- | --- | --- |
| croissant-macro.jpg | Laminated croissant torn open, layers, crumbs (07, the order app) | 2400 × 1650 |

Final photography, already in place: the opening hero (`hero-ground.jpg` and the cut-out
`hero-cup.png`), `city-carry.jpg` and `city-cup-bag.jpg` (01), the wordmark in use
(`mark-*.jpg`, 02), packaging (03): the lead `pack-boxes.jpg` and the range — `cup-hot.jpg`,
`kraft-bag.jpg`, `box-orange.jpg`, `pastry-bag-sticker.jpg`, `napkins.jpg`, `stickers.jpg`,
`box-open.jpg`, `wrap-paper.jpg`; the physical space (04): `storefront.jpg` (2:1, shown at its
own proportions, never cropped), `counter.jpg` (4:3) and `a-frame.jpg` (3:4); and menu / print
(05): `print-*.jpg`.

## Social media (06)

The feed in the phone is nine posts, each **4:5, master 1080 × 1350**. They are placeholders
for now. To fill one, put the file in `social/` here and replace its entry in `SOCIAL_POSTS`
(`src/projects/fold/FoldCaseStudy.tsx`) — an image (`type: 'image'`) or a muted, looping video
(`type: 'video'`, with an optional poster frame). The scroll journey measures itself.

## Wordmark

`fold-wordmark.svg` is the wordmark, **rebuilt as clean geometry** from the designer's master
drawing: proportions, weights and spacing measured from it; straight edges straight, curves
true arcs, outer corners softened by one small radius, inner corners sharp. It is a single
path with its counters cut out (even-odd), so it takes any colour. The page uses the same
path, from `PATH` / `VIEWBOX` in `src/projects/fold/wordmark.ts`.

## Typefaces

Headlines: Anton. Utility lines: IBM Plex Mono. Both from Google Fonts (see `index.html`).
The wordmark itself is never set in a typeface.
