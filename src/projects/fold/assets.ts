// Every photograph the FOLD case study uses, by slot. Each slot is a file in
// public/projects/fold/. Approved replacements can be saved over the same filename — no code
// changes are needed. The dimensions below are the intended production sizes.
// See public/projects/fold/README.md.
export const PHOTOS = {
  // FINAL production photograph (the opening hero), in two layers: the ground, and the cup cut
  // out of it (a transparent PNG) so it can drift on its own over the ground
  heroGround: { file: 'hero-ground.jpg', alt: '', size: '1677 × 938' },
  heroCup: { file: 'hero-cup.webp', alt: 'A FOLD iced-coffee cup tipping in mid-air against black', size: '753 × 1117' },
  // The wordmark in use (02 — The wordmark)
  markSticker: { file: 'mark-sticker.jpg', alt: 'A signal-orange FOLD sticker on a weathered street pole', size: '1080 × 1450' },
  markCup: { file: 'mark-cup.jpg', alt: 'A white FOLD takeaway cup with the folded corner in hard sunlight', size: '1080 × 1450' },
  markBag: { file: 'mark-bag.jpg', alt: 'A kraft FOLD paper bag stamped with the wordmark and folded corner', size: '1080 × 1450' },
  markReceipt: { file: 'mark-receipt.jpg', alt: 'A crumpled FOLD receipt: specialty coffee, brunch, all day, Athens, est. 2024', size: '1080 × 1450' },
  // The lead photograph (03 — Packaging)
  packBoxes: { file: 'pack-boxes.jpg', alt: 'Two stacked kraft FOLD boxes wrapped in signal-orange folds, in low sunlight', size: '1312 × 1199' },
  // FINAL production photographs (01 — The idea)
  cityCarry: { file: 'city-carry.jpg', alt: 'A hand carrying a FOLD takeaway cup down a sunlit Athens street, traffic blurred behind', size: '1024 × 1536' },
  cityCupBag: { file: 'city-cup-bag.jpg', alt: 'A FOLD paper cup and kraft takeaway bag on a weathered street bench, Athens in the background', size: '1024 × 1536' },
  croissantMacro: { file: 'croissant-macro.jpg', alt: 'Laminated croissant torn open, layers and crumbs in warm side light', size: '2400 × 1650' },
  // The range (03 — Packaging)
  cupHot: { file: 'cup-hot.jpg', alt: 'A FOLD takeaway cup with a straw on a stone counter', size: '1358 × 1159' },
  kraftBag: { file: 'kraft-bag.jpg', alt: 'A kraft FOLD carrier bag with the wordmark, descriptor and folded corner', size: '1358 × 1159' },
  boxOrange: { file: 'box-orange.jpg', alt: 'A closed FOLD box wrapped in signal-orange folds, sealed with a round sticker', size: '1358 × 1159' },
  boxOpen: { file: 'box-open.jpg', alt: 'An open FOLD pastry box, a pastry inside on printed tissue', size: '1358 × 1159' },
  napkins: { file: 'napkins.jpg', alt: 'A stack of printed FOLD napkins', size: '1358 × 1159' },
  stickers: { file: 'stickers.jpg', alt: 'A stack of round signal-orange FOLD stickers, one peeling from its backing', size: '1358 × 1159' },
  pastryBag: { file: 'pastry-bag-sticker.jpg', alt: 'A FOLD pastry bag sealed with a sticker, a pastry inside', size: '1358 × 1159' },
  wrapPaper: { file: 'wrap-paper.jpg', alt: 'A sandwich folded into printed FOLD wrapping paper', size: '1254 × 1254' },
  // Menu / print (05)
  printMenuCover: { file: 'print-menu-cover.jpg', alt: 'The FOLD menu cover: the wordmark, the descriptor and folded signal corners on uncoated paper', size: '1024 × 1536' },
  printMenuSpread: { file: 'print-menu-spread.jpg', alt: 'The FOLD menu opened: coffee, brunch, bakery and all-day sections with prices', size: '1536 × 1024' },
  printReceipt: { file: 'print-receipt.jpg', alt: 'A FOLD receipt on a stone counter, set in mono, signed off “Good things ahead.”', size: '1536 × 1024' },
  printLoyalty: { file: 'print-loyalty.jpg', alt: 'The FOLD loyalty card, front and back: eight folds, one coffee', size: '1024 × 1536' },
  printPoster: { file: 'print-poster.jpg', alt: 'A framed FOLD poster: “Good things ahead.”, Athens every day', size: '1024 × 1536' },
  printTee: { file: 'print-tee.jpg', alt: 'A cream FOLD staff T-shirt with the wordmark and folded signal planes, over a chair', size: '1312 × 1199' },
  // Physical space (04)
  storefront: { file: 'storefront.jpg', alt: 'The FOLD storefront: the wordmark and folded corners over a glazed street front, tables outside', size: '1774 × 887' },
  counter: { file: 'counter.jpg', alt: 'The FOLD counter: wall graphics, the menu board and a lit pastry display', size: '1448 × 1086' },
  aFrame: { file: 'a-frame.jpg', alt: 'A FOLD A-frame sign on the pavement outside the café', size: '1086 × 1448' },
} as const

export type PhotoKey = keyof typeof PHOTOS
export const photoSrc = (key: PhotoKey) => `/projects/fold/${PHOTOS[key].file}`
