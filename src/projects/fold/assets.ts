// Every photograph the FOLD case study uses, by slot. Each slot is a file in
// public/projects/fold/. The files there now are INTERIM: low-resolution extracts from the
// approved case-study board (around 200–470 px wide). Final photography replaces them by saving
// over the same filename — no code changes. Recommended sizes are for the final files.
// See public/projects/fold/README.md.
export const PHOTOS = {
  croissantMacro: { file: 'croissant-macro.jpg', alt: 'Laminated croissant torn open, layers and crumbs in warm side light', size: '2400 × 1650' },
  pastryTear: { file: 'pastry-tear.jpg', alt: 'A hand tearing a pastry apart, cheese stretching between the halves', size: '1600 × 2550' },
  sandwichWrap: { file: 'sandwich-wrap.jpg', alt: 'Layered sandwich half-wrapped in printed FOLD paper', size: '2400 × 1780' },
  lattePour: { file: 'latte-pour.jpg', alt: 'Milk poured into a latte in a FOLD cup', size: '1600 × 2340' },
  icedCoffeeCroissant: { file: 'iced-coffee-croissant.jpg', alt: 'Iced coffee in a FOLD cup beside a croissant', size: '1800 × 1860' },
  icedCoffee: { file: 'iced-coffee.jpg', alt: 'Iced coffee in a clear FOLD cup', size: '1500 × 1780' },
  cupHot: { file: 'cup-hot.jpg', alt: 'White FOLD takeaway cup', size: '1800 × 1500' },
  kraftBag: { file: 'kraft-bag.jpg', alt: 'Kraft FOLD carrier bag', size: '1500 × 1420' },
  boxesStack: { file: 'boxes-stack.jpg', alt: 'Stacked FOLD pastry boxes with folded signal-orange corners', size: '2000 × 1490' },
  boxOrange: { file: 'box-orange.jpg', alt: 'FOLD box with its corner folded back in signal orange', size: '1500 × 1560' },
  boxOpen: { file: 'box-open.jpg', alt: 'Open FOLD box with pastries inside', size: '1600 × 1760' },
  napkins: { file: 'napkins.jpg', alt: 'Printed FOLD napkins', size: '1500 × 1560' },
  napkinsStack: { file: 'napkins-stack.jpg', alt: 'A stack of FOLD napkins in hard sunlight', size: '1500 × 2040' },
  stickers: { file: 'stickers.jpg', alt: 'Signal-orange FOLD stickers peeling from their backing', size: '1500 × 1590' },
  pastryBag: { file: 'pastry-bag-sticker.jpg', alt: 'Pastry bag sealed with a FOLD sticker', size: '1500 × 1550' },
  wrapPaper: { file: 'wrap-paper.jpg', alt: 'Pastry folded into printed FOLD wrapping paper', size: '1500 × 2040' },
  tote: { file: 'tote.jpg', alt: 'Canvas FOLD tote bag', size: '1500 × 2060' },
  storefront: { file: 'storefront.jpg', alt: 'FOLD storefront with signage over a glazed street front', size: '2800 × 1570' },
  counter: { file: 'counter.jpg', alt: 'FOLD counter and pastry display', size: '2400 × 1810' },
  aFrame: { file: 'a-frame.jpg', alt: 'FOLD A-frame street sign', size: '1600 × 1820' },
  posterGoodThings: { file: 'poster-good-things.jpg', alt: 'Poster: Good things inside', size: '1400 × 2010' },
  windowCampaign: { file: 'window-campaign.jpg', alt: 'Window posters: One more layer, Made to come apart', size: '2600 × 1870' },
  phoneUi: { file: 'phone-ui.jpg', alt: 'FOLD website on a phone', size: '1500 × 1910' },
} as const

export type PhotoKey = keyof typeof PHOTOS
export const photoSrc = (key: PhotoKey) => `/projects/fold/${PHOTOS[key].file}`
