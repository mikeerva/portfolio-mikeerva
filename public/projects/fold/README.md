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
| croissant-macro.jpg | Laminated croissant torn open, layers, crumbs | 2400 × 1650 |
| pastry-tear.jpg | Hand tearing a pastry, cheese stretching | 1600 × 2550 |
| sandwich-wrap.jpg | Layered sandwich in printed FOLD paper | 2400 × 1780 |
| latte-pour.jpg | Latte pour into a FOLD cup | 1600 × 2340 |
| iced-coffee-croissant.jpg | Iced coffee and croissant | 1800 × 1860 |
| iced-coffee.jpg | Iced coffee, clear FOLD cup | 1500 × 1780 |
| cup-hot.jpg | White FOLD takeaway cup | 1800 × 1500 |
| kraft-bag.jpg | Kraft FOLD carrier bag | 1500 × 1420 |
| boxes-stack.jpg | Stacked boxes, folded orange corners | 2000 × 1490 |
| box-orange.jpg | Box with corner folded back | 1500 × 1560 |
| box-open.jpg | Open box with pastries | 1600 × 1760 |
| napkins.jpg | Printed napkins | 1500 × 1560 |
| napkins-stack.jpg | Napkin stack in hard light | 1500 × 2040 |
| stickers.jpg | Orange FOLD stickers peeling | 1500 × 1590 |
| pastry-bag-sticker.jpg | Pastry bag sealed with a sticker | 1500 × 1550 |
| wrap-paper.jpg | Pastry folded into FOLD wrapping | 1500 × 2040 |
| tote.jpg | Canvas tote | 1500 × 2060 |
| storefront.jpg | Storefront and signage | 2800 × 1570 |
| counter.jpg | Counter and pastry display | 2400 × 1810 |
| a-frame.jpg | A-frame street sign | 1600 × 1820 |
| poster-good-things.jpg | Poster: Good things inside | 1400 × 2010 |
| window-campaign.jpg | Window posters | 2600 × 1870 |
| phone-ui.jpg | Website on a phone (reference only) | 1500 × 1910 |

## Wordmark

`fold-wordmark.svg` is an **interim vector trace** of the locked wordmark, taken from the
kraft-bag application on the board so it can be shown at any size. It keeps the O → L and
L → D relationships but carries slight unevenness from the printed source. When the official
vector exists, replace `PATH` / `VIEWBOX` in `src/projects/fold/wordmark.ts` (and this file).

## Typefaces

Headlines: Anton. Utility lines: IBM Plex Mono. Both from Google Fonts (see `index.html`).
The wordmark itself is never set in a typeface.
