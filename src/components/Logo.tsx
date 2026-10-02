import { config } from '../config'

type Corners = [tl: number, tr: number, br: number, bl: number]

/** Rectangle path with an individual radius per corner. */
function rr(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: Corners) {
  return `M${x + tl},${y}H${x + w - tr}A${tr},${tr} 0 0 1 ${x + w},${y + tr}V${y + h - br}A${br},${br} 0 0 1 ${x + w - br},${y + h}H${x + bl}A${bl},${bl} 0 0 1 ${x},${y + h - bl}V${y + tl}A${tl},${tl} 0 0 1 ${x + tl},${y}Z`
}

// Each letter is solid rounded blocks; the slits are cut out with a mask
const SHAPES = [
  // M — two humps
  rr(0, 0, 54, 120, [27, 27, 10, 10]),
  rr(46, 0, 54, 120, [27, 27, 10, 10]),
  // I
  rr(112, 0, 40, 120, [20, 20, 10, 10]),
  // K — block with a wedge cut from the right
  rr(164, 0, 90, 120, [19, 26, 10, 10]),
  // E
  rr(266, 0, 85, 120, [24, 14, 14, 24]),
]

const CUTS = [
  rr(43, 62, 14, 70, [7, 7, 0, 0]), // M middle
  rr(304, 30, 60, 16, [8, 0, 0, 8]), // E upper
  rr(304, 74, 60, 16, [8, 0, 0, 8]), // E lower
]

export function Logo() {
  return (
    <h1 className="select-none">
      <span className="sr-only">{config.name}</span>
      <svg viewBox="0 0 351 120" className="w-[clamp(180px,30vw,420px)] text-cream" aria-hidden>
        <mask id="logo-cuts">
          <rect width="351" height="120" fill="white" />
          {CUTS.map((d) => (
            <path key={d} d={d} fill="black" />
          ))}
          <path d="M258,32L212,60L258,88Z" fill="black" stroke="black" strokeWidth="12" strokeLinejoin="round" />
        </mask>
        <g mask="url(#logo-cuts)" fill="currentColor">
          {SHAPES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </h1>
  )
}
