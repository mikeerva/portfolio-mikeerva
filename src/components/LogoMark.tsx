import { motion, type Variants } from 'framer-motion'
import { useEffect, useRef } from 'react'

const PATHS = [
  'M 140 190 C 140 165, 160 156, 190 157 C 290 160, 360 230, 430 330 C 500 430, 540 500, 600 530 C 650 555, 700 552, 760 545 C 790 542, 805 560, 790 585 C 740 670, 580 810, 470 860 C 320 925, 175 860, 145 700 C 140 680, 140 660, 140 640 Z',
  'M 1445 820 C 1445 870, 1380 900, 1320 898 C 1200 895, 1130 840, 1060 740 C 990 640, 950 560, 880 545 C 840 535, 810 540, 795 543 C 770 545, 760 525, 780 495 C 840 400, 1050 200, 1230 183 C 1360 172, 1440 260, 1445 400 Z',
]

const ease = [0.65, 0, 0.35, 1] as const
const DRAW = 0.55
const STAGGER = 0.18

// Arriving, each form traces its outline then fills; leaving, the same in reverse, last form first
const variants = (delay: number): Variants => ({
  hidden: (i: number) => {
    const at = (PATHS.length - 1 - i) * STAGGER
    return {
      pathLength: 0,
      fillOpacity: 0,
      strokeOpacity: 1,
      transition: {
        strokeOpacity: { duration: 0.15, delay: at },
        fillOpacity: { duration: 0.25, ease, delay: at },
        pathLength: { duration: DRAW * 0.8, ease, delay: at + 0.2 },
      },
    }
  },
  shown: (i: number) => {
    const at = delay + i * STAGGER
    return {
      pathLength: 1,
      fillOpacity: 1,
      strokeOpacity: 0,
      transition: {
        pathLength: { duration: DRAW, ease, delay: at },
        fillOpacity: { duration: 0.35, ease, delay: at + DRAW * 0.7 },
        strokeOpacity: { duration: 0.3, delay: at + DRAW },
      },
    }
  },
})

interface Props {
  className?: string
  // true/false: drawn in / out. 'inherit': follows the `hidden` / `shown` variant of a motion ancestor
  reveal: boolean | 'inherit'
  delay?: number
  // Outline width in viewBox units, so it reads about the same at any rendered size
  stroke?: number
  // Each form drifts on its own: a slow rise and fall, sway and turn, at its own rates
  drift?: boolean
}

// Each form's centre (viewBox units), its rates and phase, for drifting
const DRIFT = [
  { cx: 470, cy: 540, rise: 0.43, sway: 0.29, turn: 0.21, phase: 0 },
  { cx: 1100, cy: 535, rise: 0.37, sway: 0.33, turn: 0.26, phase: 2.2 },
]
// How far each drifts (viewBox units; ~0.33 px each at the Hero's size) and turns (degrees)
const RISE = 4.5
const SWAY = 2.5
const TURN = 0.4

/** The brand mark: two interlocking forms. Sized by `className`, coloured by `currentColor`. */
export function LogoMark({ className = '', reveal, delay = 0, stroke = 8, drift = false }: Props) {
  const v = variants(delay)
  const forms = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    if (!drift || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = (now - start) / 1000
      DRIFT.forEach(({ cx, cy, rise, sway, turn, phase }, i) => {
        const x = Math.sin(t * sway + phase) * SWAY
        const y = -Math.sin(t * rise + phase) * RISE
        const r = Math.sin(t * turn + phase * 1.3) * TURN
        forms.current[i]?.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(3)} ${cx} ${cy})`)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [drift])

  return (
    <motion.svg
      viewBox="135 150 1315 755"
      className={`w-auto overflow-visible ${className}`}
      fill="currentColor"
      aria-hidden
      {...(reveal === 'inherit' ? {} : { initial: 'hidden', animate: reveal ? 'shown' : 'hidden' })}
    >
      {PATHS.map((d, i) => (
        <g
          key={i}
          ref={(el) => {
            forms.current[i] = el
          }}
        >
          <motion.path d={d} custom={i} variants={v} stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
        </g>
      ))}
    </motion.svg>
  )
}
