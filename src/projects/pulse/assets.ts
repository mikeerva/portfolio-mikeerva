// Every visual the PULSE case study shows, by slot. All of them are rendered in Blender from the
// approved 3D master (production/pulse-approved/) by the pipeline in production/pipeline/ and
// published to public/projects/pulse/ by its publish step. If a file is ever missing, its slot
// falls back to a designed placeholder drawn from this entry (its ID, crop, where the subject
// sits, what must stay clear and the format). See public/projects/pulse/README.md.
//
// Frames. The project panel is ~1.24–1.4 : 1 on desktop and ~3 : 5 on phones (it swaps axes in
// portrait), so a slot that fills the panel has two assets: a 3 : 2 desktop master whose centre
// 5 : 4 is safe, and a separate 3 : 5 portrait composition. Inline slots use one asset.
//
// Coordinates. `subject` is where the subject sits, in % of the ASSET [x, y, w, h]; the
// placeholder draws it through the same cover crop the final image gets, so it lands where the
// subject will. `clear` zones are in % of the SLOT as displayed: type laid over it, and the two
// panel corners the portfolio's purple forms cross in front of (top right and bottom left, in
// both orientations — approximate, check against the live frame).

import { RING_TRACE } from './ring-trace'

export type Box = [x: number, y: number, w: number, h: number]
export interface Zone {
  box: Box
  label: string
}
export interface Frame {
  // The still: the image itself, or a loop's poster (its best frame, not its first)
  file: string
  // A loop's video, MP4 (H.264)
  video?: string
  ratio: string
  // Production size, px
  size: [number, number]
  // object-position when the slot crops it
  focus?: string
  subject?: Box
  // The Signature Ring as it runs through this frame, in asset px (02's trace is drawn on it)
  ring?: string
  clear?: Zone[]
  // Where the placeholder sets its label block, when this frame needs it somewhere else
  infoAt?: InfoAt
}
export type InfoAt = 'tl' | 'br' | 'r' | 'mid'
export interface Slot {
  id: string
  chapter: string
  kind: 'still' | 'loop' | 'render'
  alt: string
  brief: string
  motion?: string
  // Desktop (or the only frame), and the separate portrait composition for full-panel slots
  frame: Frame
  portrait?: Frame
  // Where the placeholder sets its label block
  infoAt?: InfoAt
}

const FRAME_DESK: Zone[] = [
  { box: [86, 0, 14, 16], label: 'Portfolio frame' },
  { box: [0, 84, 14, 16], label: 'Portfolio frame' },
]
const FRAME_PORTRAIT: Zone[] = [
  { box: [78, 0, 22, 12], label: 'Portfolio frame' },
  { box: [0, 88, 22, 12], label: 'Portfolio frame' },
]

export const FORMAT: Record<Slot['kind'], string> = {
  still: 'Still · AVIF',
  loop: 'Loop · MP4 H.264 muted + AVIF poster',
  render: 'Render · AVIF with alpha',
}

export const SLOTS = {
  // ------------------------------------------------------------ 01 Silence
  hero: {
    id: 'PULSE_HERO_01',
    chapter: '01 Silence',
    kind: 'loop',
    alt: 'PULSE 01 on dark basalt in near-total darkness, one strip of light tracing its Signature Ring',
    brief: 'PULSE 01, 3/4 view, on dark basalt in near-total darkness. One strip light travels around it; the Signature Ring writes itself in light.',
    motion: 'Locked camera, product still. The strip light travels from behind, around and across; then the dark holds. 7 s, starting on the poster frame so the video takes over from it without a jump.',
    frame: {
      file: 'hero-01.avif',
      video: 'hero-01.mp4',
      ratio: '3:2',
      size: [2400, 1600],
      focus: '62% 50%',
      subject: [44, 22, 30, 52],
      clear: [{ box: [0, 0, 38, 100], label: 'Type' }, { box: [70, 82, 30, 18], label: 'Meta' }, ...FRAME_DESK],
    },
    portrait: {
      file: 'hero-01-m.avif',
      video: 'hero-01-m.mp4',
      ratio: '3:5',
      size: [1200, 2000],
      focus: '50% 70%',
      subject: [14, 44, 72, 30],
      clear: [{ box: [0, 0, 100, 40], label: 'Type' }, ...FRAME_PORTRAIT],
      infoAt: 'mid',
    },
    infoAt: 'r',
  },

  // ------------------------------------------------------------ 02 The Ring
  ringMacro: {
    id: 'PULSE_RING_MACRO_01',
    chapter: '02 The Ring',
    kind: 'still',
    alt: 'Extreme macro of the ear cup: the warm satin Signature Ring as one bright curve around the graphite faceplate',
    brief: 'Extreme macro of the ear-cup corner. The Ring is one warm bright curve; graphite faceplate in soft focus.',
    motion: 'Still. The page traces an SVG line along the photographed Ring (measured from the 3D master by the pipeline), then the photograph falls away and the line stays.',
    frame: {
      file: 'ring-macro-01.avif',
      ratio: '3:2',
      size: RING_TRACE.desktop.size,
      ring: RING_TRACE.desktop.d,
      clear: [{ box: [62, 70, 32, 14], label: 'Captions' }, ...FRAME_DESK],
    },
    portrait: {
      file: 'ring-macro-01-m.avif',
      ratio: '3:5',
      size: RING_TRACE.portrait.size,
      ring: RING_TRACE.portrait.d,
      clear: [{ box: [0, 0, 100, 18], label: 'Captions' }, ...FRAME_PORTRAIT],
    },
    infoAt: 'r',
  },
  mat1: {
    id: 'PULSE_MAT_01',
    chapter: '02 The Ring',
    kind: 'still',
    alt: 'Macro of the deep black PULSE 01 cushion, its soft squircle opening in raking light',
    brief: 'Cushion macro: deep black leather, the soft squircle opening, raking light.',
    frame: { file: 'mat-01.avif', ratio: '4:5', size: [1440, 1800], subject: [8, 10, 84, 80] },
  },
  mat2: {
    id: 'PULSE_MAT_02',
    chapter: '02 The Ring',
    kind: 'still',
    alt: 'The flat architectural connector, where the dark metal headband meets the ear cup',
    brief: 'The connector: where the dark brushed metal of the headband meets the cup.',
    frame: { file: 'mat-02.avif', ratio: '4:5', size: [1440, 1800], subject: [20, 10, 60, 70] },
  },
  mat3: {
    id: 'PULSE_MAT_03',
    chapter: '02 The Ring',
    kind: 'still',
    alt: 'The PULSE wordmark on the outer ear cup, beside the corner of the Signature Ring',
    brief: 'The approved wordmark on the outer cup, the corner of the Ring beside it.',
    frame: { file: 'mat-03.avif', ratio: '4:5', size: [1440, 1800], subject: [24, 30, 52, 30] },
  },

  // ------------------------------------------------------------ 03 Sound becomes physical
  phys1: {
    id: 'PULSE_PHYS_01',
    chapter: '03 Physical',
    kind: 'loop',
    alt: 'A heavy dark curtain behind PULSE 01 on a stone bench, displaced by a pressure wave in the shape of the Signature Ring',
    brief: 'Heavy dark linen behind PULSE 01 on a basalt bench. Everything real except one thing: the pressure wave.',
    motion: 'A Ring-shaped wave leaves the headphones, travels out through the fabric and decays; then the curtain hangs still. 5.5 s loop.',
    frame: { file: 'phys-01.avif', video: 'phys-01.mp4', ratio: '4:5', size: [1440, 1800], subject: [26, 42, 48, 30] },
  },
  phys2: {
    id: 'PULSE_PHYS_02',
    chapter: '03 Physical',
    kind: 'still',
    alt: 'Dust suspended in a shaft of light, pushed back from PULSE 01 to a boundary in the shape of the Signature Ring',
    brief: 'A shaft of light in a dark room, dust suspended in it, pushed back from the headphones to a Ring-shaped boundary.',
    frame: { file: 'phys-02.avif', ratio: '4:5', size: [1440, 1800], subject: [40, 60, 30, 20] },
  },
  phys3: {
    id: 'PULSE_PHYS_03',
    chapter: '03 Physical',
    kind: 'still',
    alt: 'PULSE 01 standing in a thin film of water on black stone, frozen in concentric Ring-shaped ripples',
    brief: 'A thin film of water on black stone around PULSE 01, frozen in concentric Ring-shaped ripples.',
    frame: { file: 'phys-03.avif', ratio: '4:5', size: [1440, 1800], subject: [26, 30, 48, 30] },
  },

  // ------------------------------------------------------------ 04 Campaign
  campSpace: {
    id: 'PULSE_CAMP_SPACE_01',
    chapter: '04 Campaign',
    kind: 'still',
    alt: 'A concrete hall lit only through a skylight in the shape of the Signature Ring; the light falls on one plinth where PULSE 01 rests',
    brief: 'A concrete hall lit only through a Ring-shaped skylight. The light falls on one plinth, where the headphones rest.',
    frame: {
      file: 'camp-space-01.avif',
      ratio: '3:2',
      size: [2400, 1600],
      subject: [40, 50, 20, 40],
      clear: [{ box: [62, 30, 32, 26], label: 'Headline' }, ...FRAME_DESK],
    },
    portrait: {
      file: 'camp-space-01-m.avif',
      ratio: '3:5',
      size: [1200, 2000],
      subject: [30, 58, 40, 24],
      clear: [{ box: [6, 4, 88, 20], label: 'Headline' }, ...FRAME_PORTRAIT],
      infoAt: 'mid',
    },
  },
  campArch: {
    id: 'PULSE_CAMP_ARCH_01',
    chapter: '04 Campaign',
    kind: 'still',
    alt: 'The hall from low and wide: pilasters, the shaft of light from the Ring-shaped opening, the plinth in its pool of light',
    brief: 'The hall from low and wide: the shaft from the Ring-shaped opening, the plinth in its pool of light.',
    frame: { file: 'camp-arch-01.avif', ratio: '2:1', size: [2880, 1440], subject: [44, 50, 12, 30] },
    portrait: { file: 'camp-arch-01-m.avif', ratio: '4:5', size: [1440, 1800], subject: [36, 50, 28, 40] },
  },
  campProduct: {
    id: 'PULSE_CAMP_PRODUCT_01',
    chapter: '04 Campaign',
    kind: 'still',
    alt: 'PULSE 01 suspended in darkness inside a shell of stone dust pushed out to the shape of the Signature Ring',
    brief: 'PULSE 01 suspended in darkness, stone dust pushed out around it to the shape of the Ring.',
    frame: { file: 'camp-product-01.avif', ratio: '4:5', size: [1440, 1800], subject: [20, 26, 60, 44] },
  },

  // ------------------------------------------------------------ 05 Identity: the product master
  viewFront: {
    id: 'PULSE_VIEW_FRONT',
    chapter: '05 Identity',
    kind: 'render',
    alt: 'PULSE 01, front view',
    brief: 'Product master: front view, the approved studio light, transparent background.',
    frame: { file: 'view-front.avif', ratio: '1:1', size: [1400, 1400], subject: [12, 10, 76, 80] },
  },
  viewSide: {
    id: 'PULSE_VIEW_SIDE',
    chapter: '05 Identity',
    kind: 'render',
    alt: 'PULSE 01, side view: the outer ear cup, its Signature Ring and wordmark',
    brief: 'Product master: side view, the Ring and wordmark square to camera.',
    frame: { file: 'view-side.avif', ratio: '1:1', size: [1400, 1400], subject: [26, 8, 48, 84] },
  },
  viewBack: {
    id: 'PULSE_VIEW_BACK',
    chapter: '05 Identity',
    kind: 'render',
    alt: 'PULSE 01, back view',
    brief: 'Product master: back view.',
    frame: { file: 'view-back.avif', ratio: '1:1', size: [1400, 1400], subject: [12, 10, 76, 80] },
  },
  view34: {
    id: 'PULSE_VIEW_34',
    chapter: '05 Identity',
    kind: 'render',
    alt: 'PULSE 01, three-quarter view',
    brief: 'Product master: 3/4 view.',
    frame: { file: 'view-34.avif', ratio: '1:1', size: [1400, 1400], subject: [14, 8, 72, 84] },
  },

  // ------------------------------------------------------------ 06 Silence
  final: {
    id: 'PULSE_FINAL_01',
    chapter: '06 Silence',
    kind: 'still',
    alt: 'PULSE 01 in profile in darkness, the Signature Ring a single warm line of light',
    brief: 'PULSE 01 in profile, the set and light of the hero. Almost all black; the Ring reads as one line of light.',
    frame: {
      file: 'final-01.avif',
      ratio: '3:2',
      size: [2400, 1600],
      subject: [40, 24, 20, 52],
      clear: [{ box: [26, 72, 48, 20], label: 'Type' }, ...FRAME_DESK],
    },
    portrait: {
      file: 'final-01-m.avif',
      ratio: '3:5',
      size: [1200, 2000],
      subject: [26, 30, 48, 34],
      clear: [{ box: [8, 68, 84, 20], label: 'Type' }, ...FRAME_PORTRAIT],
    },
    infoAt: 'r',
  },
} satisfies Record<string, Slot>

export type SlotKey = keyof typeof SLOTS
export const assetSrc = (file: string) => `/projects/pulse/${file}`
