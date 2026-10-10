# FOLD — case-study assets

Everything the FOLD case study (`src/projects/fold/`) loads from this folder.

## Status: production set

This folder contains the current FOLD case-study image set. The source of truth is the
filename mapping in `src/projects/fold/assets.ts`; replace an asset in place when a newer
approved version is available so the layout and case-study code do not need to change.

**To replace one:** save the final photograph over the file with the **same name**. Nothing
in the code needs to change. Recommended sizes (and the alt text the page uses) are listed in
`src/projects/fold/assets.ts`.

| File | Shows | Recommended |
| --- | --- | --- |
| croissant-macro.jpg | Laminated croissant torn open, layers, crumbs (07, the order app) | 2400 × 1650 |

The current set includes the opening hero (`hero-ground.jpg` and the cut-out
`hero-cup.webp`), `city-carry.jpg` and `city-cup-bag.jpg` (01), the wordmark in use
(`mark-*.jpg`, 02), packaging (03): the lead `pack-boxes.jpg` and the range — `cup-hot.jpg`,
`kraft-bag.jpg`, `box-orange.jpg`, `pastry-bag-sticker.jpg`, `napkins.jpg`, `stickers.jpg`,
`box-open.jpg`, `wrap-paper.jpg`; the physical space (04): `storefront.jpg` (2:1, shown at its
own proportions, never cropped), `counter.jpg` (4:3) and `a-frame.jpg` (3:4); and menu / print
(05): `print-*.jpg`.

## Social media (06)

The feed has nine **4:5** image posts with individual campaign captions. Files and copy are
defined in `SOCIAL_POSTS` (`src/projects/fold/FoldCaseStudy.tsx`); each entry includes `caption`
and descriptive `alt` text. Updated product-reference versions use `-v2` filenames.
Video entries are also supported (`type: 'video'`, with an optional poster frame).
The scroll journey measures the feed, including captions and expanded highlights.

Four highlights — Coffee, Bakery, To go and Athens — reuse approved project photography.
Their covers and short stories are defined in `SOCIAL_HIGHLIGHTS`. Each opens inline and can
be closed with its close button; keyboard focus returns to the corresponding cover.

## Wordmark

`fold-wordmark.svg` is the wordmark, **rebuilt as clean geometry** from the designer's master
drawing: proportions, weights and spacing measured from it; straight edges straight, curves
true arcs, outer corners softened by one small radius, inner corners sharp. It is a single
path with its counters cut out (even-odd), so it takes any colour. The page uses the same
path, from `PATH` / `VIEWBOX` in `src/projects/fold/wordmark.ts`.

## Typefaces

Headlines: Anton. Utility lines: IBM Plex Mono. Both from Google Fonts (see `index.html`).
The wordmark itself is never set in a typeface.
