import { animate, AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { config, type CategoryId } from '../config'
import { FACETS, facetPath, objectLayout, perspective, place, STATE_COUNT, yawOf } from '../lib/objectStates'
import { object } from '../lib/scene'
import { Projects } from './Projects'

const ease = [0.22, 1, 0.36, 1] as const
const mod = (n: number, m: number) => ((n % m) + m) % m
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const smoothstep = (lo: number, hi: number, v: number) => {
  const x = clamp((v - lo) / (hi - lo), 0, 1)
  return x * x * (3 - 2 * x)
}
const pad = (n: number) => String(n).padStart(2, '0')
// How far from a designed state still counts as resting on it
const SETTLE = 0.04
// Time for the object to arrive from the Hero before the names surface around it
const ARRIVAL_MS = 1400
const SNAP = { type: 'spring', stiffness: 60, damping: 16, restDelta: 0.001 } as const
// How far (object units) the resting name floats forward off the mass, toward the viewer
const FRONT_LIFT = 0.3

// How far below the mass's centre the drag hint sits, in mass units (its outline reaches ~1.5)
const HINT_GAP = 1.75
const indexOf = (id: CategoryId) => config.categories.findIndex((c) => c.id === id)
// The categories run the other way round the turn: dragging right turns the mass's front to
// the right, which lowers the progress, and that must bring the next category (01 → 02 → 03 →
// 04 → 01). So the facet facing the viewer at state n shows category -n, and back.
const categoryAt = (facet: number) => mod(-facet, STATE_COUNT)
const facetOf = (category: number) => mod(-category, STATE_COUNT)
// The integer state showing category `index` that is closest to `p`
const nearestState = (p: number, index: number) => Math.round((p - index) / STATE_COUNT) * STATE_COUNT + index

function isOverObject(x: number, y: number) {
  const { cx, cy, unit } = objectLayout(window.innerWidth, window.innerHeight)
  return Math.hypot(x - cx, y - cy) < unit * 1.15
}

// The mass, or the name currently facing the viewer
function isEnterTarget(ev: { clientX: number; clientY: number; target: EventTarget | null }) {
  return isOverObject(ev.clientX, ev.clientY) || !!(ev.target instanceof Element && ev.target.closest('[data-enter]'))
}

interface Props {
  selected: CategoryId | null
  // Entered project of the selected category (index), or null
  project: number | null
  onSelect: (id: CategoryId) => void
  onClose: () => void
  onProject: (id: CategoryId, index: number | null) => void
}

export function Work({ selected, project, onSelect, onClose, onProject }: Props) {
  const progress = useMotionValue(selected ? nearestState(object.progress, facetOf(indexOf(selected))) : Math.round(object.progress))
  const [nearest, setNearest] = useState(() => Math.round(progress.get()))
  const [offState, setOffState] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [arrived, setArrived] = useState(false)
  const [explored, setExplored] = useState(false)
  const [overTarget, setOverTarget] = useState(false)
  const moved = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  // The drag hint's place: under the mass's resting position (not its live float or zoom), so
  // it never moves; recomputed only when the window changes size
  const hintAt = () => {
    const { cy, unit } = objectLayout(window.innerWidth, window.innerHeight)
    return Math.round(cy + unit * HINT_GAP)
  }
  const [hintTop, setHintTop] = useState(hintAt)
  useEffect(() => {
    const onResize = () => setHintTop(hintAt())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // Each name exists twice: under the canvas (hidden by the mass) and above it
  const backRefs = useRef<(HTMLDivElement | null)[]>([])
  const frontRefs = useRef<(HTMLDivElement | null)[]>([])

  const active = mod(nearest, STATE_COUNT)
  const category = config.categories[categoryAt(active)]
  const [firstActive] = useState(active)
  const settled = arrived && !dragging && !offState
  const hovering = settled && overTarget && !selected

  const snapTo = (n: number) => {
    animate(progress, n, SNAP)
  }

  useEffect(() => {
    const id = setTimeout(() => setArrived(true), ARRIVAL_MS)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    object.progress = progress.get()
    const unsubscribe = progress.on('change', (v) => {
      object.progress = v
      setNearest(Math.round(v))
      setOffState(Math.abs(v - Math.round(v)) > SETTLE)
    })
    return () => {
      unsubscribe()
      object.tilt = 0
      object.hover = false
    }
  }, [progress])

  // The names ride the canvas's own frame: same eased turn, sway, tilt and zoom as the mass
  useEffect(() => {
    let lastUnit = 0
    object.onFrame = ({ turn, sway, tilt, zoom, cx, cy, unit, split }) => {
      const portrait = window.innerHeight > window.innerWidth
      if (unit !== lastUnit) {
        // Type is sized against the mass; on narrow screens it takes a larger share of it
        sectionRef.current?.style.setProperty('--type', `${unit * (portrait ? 0.33 : 0.3)}px`)
        lastUnit = unit
      }
      const u = unit * zoom
      FACETS.forEach(({ at, atPortrait }, i) => {
        const front = frontRefs.current[i]
        const back = backRefs.current[i]
        if (!front || !back) return
        // Angle of this facet from the viewer, wrapped so names behind never render mirrored
        const phi = yawOf(mod(turn - i + 2, STATE_COUNT) - 2) + sway
        const { pos, lean } = facetPath(i, phi, portrait)
        const [x, y, z] = place(pos, 0, tilt)
        const p = perspective(z)
        // How many states this name is from the current turn (0 = resting on it)
        const away = Math.abs(mod(turn - i + 2, STATE_COUNT) - 2)
        // Arriving at the front, the name lifts off the mass toward the viewer, along its line
        // of sight so it stays on the same spot of the screen; leaving, it settles back onto
        // its path. Being nearer, it's drawn slightly larger.
        const lift = FRONT_LIFT * (1 - smoothstep(0, 0.25, away))
        const scale = (perspective(z + lift) / perspective((portrait ? atPortrait : at)[2])) * zoom
        // On screen, in object units from the mass's centre
        const sx = x * p
        const sy = y * p
        // The mass does the hiding. Opacity only removes the hairline of a card seen exactly
        // edge-on, dims one receding behind the mass, and keeps anything directly behind it
        // from reading through
        // Only the category being left and the one being approached are ever shown: a
        // name a whole state or more from the current turn is hidden
        const alpha =
          smoothstep(0.02, 0.1, Math.abs(Math.cos(lean))) *
          (1 - 0.5 * smoothstep(0, -1, z)) *
          (1 - smoothstep(0.75, 0.95, Math.abs(phi) / Math.PI)) *
          (1 - smoothstep(0.5, 1, away)) *
          // ...and the category's name gives way as its mass divides into projects
          (1 - smoothstep(0.02, 0.35, split))
        // The layer swap happens at the side, where the card is edge-on, so it can't be seen
        const inFront = smoothstep(-0.1, 0.1, z)
        const transform =
          `translate3d(${cx + sx * u}px, ${cy - sy * u}px, 0) translate(-50%, -50%) ` +
          `perspective(1000px) rotateY(${lean}rad) scale(${scale})`
        front.style.transform = transform
        back.style.transform = transform
        front.style.opacity = String(alpha * inFront)
        back.style.opacity = String(alpha * (1 - inFront))
      })
    }
    return () => {
      object.onFrame = null
    }
  }, [])

  // Selected: the mass comes to rest exactly on the category, then divides into its projects
  useEffect(() => {
    object.open = selected !== null
    if (selected) {
      object.projects = config.projects[selected].length
      object.category = selected
      const target = nearestState(progress.get(), facetOf(indexOf(selected)))
      if (progress.get() !== target) animate(progress, target, SNAP)
    }
    return () => {
      object.open = false
    }
  }, [selected, progress])

  useEffect(() => {
    object.focus = project ?? -1
    return () => {
      object.focus = -1
    }
  }, [project])

  useEffect(() => {
    object.hover = hovering
  }, [hovering])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected) {
        // One level back: out of the project, or the fragments merge into the category again
        if (e.key === 'Escape') {
          if (project !== null) onProject(selected, null)
          else onClose()
        }
        return
      }
      // Right/down: the next category; left/up: the previous one (the same way as dragging)
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? -1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? 1 : 0
      if (step) {
        setExplored(true)
        snapTo(Math.round(progress.get()) + step)
      } else if (e.key === 'Enter' && settled && e.target === document.body) {
        onSelect(category.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || selected) return
    progress.stop()
    moved.current = false
    const settledAtPress = settled
    const startX = e.clientX
    const startY = e.clientY
    const startP = progress.get()
    // One state per ~third of the screen width
    const pxPerState = Math.max(260, window.innerWidth * 0.3)

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved.current && Math.hypot(dx, dy) > 6) {
        moved.current = true
        setDragging(true)
        setExplored(true)
      }
      if (!moved.current) return
      progress.set(startP - dx / pxPerState)
      object.tilt = clamp(dy / 500, -0.4, 0.4)
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      object.tilt = 0
      if (!moved.current) {
        if (settledAtPress && ev.type === 'pointerup' && isEnterTarget(ev)) onSelect(category.id)
        else snapTo(Math.round(progress.get()))
        return
      }
      setDragging(false)
      // Throw: a fast release carries on to the following state
      snapTo(Math.round(progress.get() + clamp(progress.getVelocity() * 0.25, -1.5, 1.5)))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // Facet i: placed for its orientation of the mass, showing the category mapped to it
  const name = (i: number, layer: 'back' | 'front') => {
    const { at } = FACETS[i]
    const shownCategory = categoryAt(i)
    const { lines } = FACETS[shownCategory]
    const refs = layer === 'front' ? frontRefs : backRefs
    const isActive = i === active
    const enterable = layer === 'front' && isActive && settled && !selected
    const shown = arrived && (!selected || isActive)
    const delay = selected || i === firstActive ? 0 : 0.5 + mod(firstActive - i, STATE_COUNT) * 0.15
    return (
      <div
        key={i}
        ref={(el) => {
          refs.current[i] = el
        }}
        data-enter={enterable || undefined}
        className={`absolute left-0 top-0 opacity-0 will-change-transform ${enterable ? 'pointer-events-auto' : ''} ${at[0] < 0 ? 'text-right' : 'text-left'}`}
      >
        <div style={{ opacity: shown ? 1 : 0, transition: `opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s` }}>
          <p className="mb-[0.9em] whitespace-nowrap text-[10px] font-light uppercase tabular-nums tracking-[0.35em] text-white/50 sm:text-[11px]">
            {pad(shownCategory + 1)} / {pad(STATE_COUNT)}
            {layer === 'front' && isActive && (
              <span
                className="text-cream transition-opacity duration-500"
                style={{ opacity: hovering ? 1 : 0 }}
              >
                {'  '}— enter →
              </span>
            )}
          </p>
          <p
            className="whitespace-nowrap font-display font-bold uppercase leading-[0.9] text-cream transition-[letter-spacing] duration-700"
            style={{ fontSize: 'var(--type, 60px)', letterSpacing: hovering && isActive ? '0.01em' : '-0.01em' }}
          >
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    )
  }

  const cursor = selected ? '' : dragging ? 'cursor-grabbing' : hovering ? 'cursor-pointer' : 'cursor-grab'
  const indices = config.categories.map((_, i) => i)
  const layerExit = { opacity: 0, transition: { duration: 0.4 } }

  // No opacity or transform on the section itself: either would make it a stacking
  // context and pull both name layers to one side of the canvas.
  return (
    <section
      ref={sectionRef}
      aria-label="Work"
      className={`absolute inset-0 touch-none select-none ${cursor}`}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => !dragging && setOverTarget(isEnterTarget(e))}
      onPointerLeave={() => setOverTarget(false)}
    >
      <motion.div aria-hidden exit={layerExit} className="pointer-events-none absolute inset-0 z-0">
        {indices.map((i) => name(i, 'back'))}
      </motion.div>
      <motion.div aria-hidden exit={layerExit} className="pointer-events-none absolute inset-0 z-[2]">
        {indices.map((i) => name(i, 'front'))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div key={selected} exit={layerExit} className="contents">
            <Projects category={selected} project={project} onProject={(index) => onProject(selected, index)} />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {category.name}, {categoryAt(active) + 1} of {STATE_COUNT}
      </p>
      <button type="button" className="sr-only" disabled={!!selected} onClick={() => onSelect(category.id)}>
        Enter {category.name}
      </button>

      <motion.div exit={layerExit} className="pointer-events-none absolute inset-0 z-20">
        <AnimatePresence>
          {selected && project === null && (
            <motion.button
              type="button"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 1.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="pointer-events-auto absolute left-5 top-24 text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:left-8 sm:top-28 sm:text-lg"
            >
              ← all work
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* The drag hint: a still unit set just under the mass's resting place, in the layer behind
          the canvas, so the mass and fragments cover it wherever they pass over it */}
      <motion.div aria-hidden exit={layerExit} className="pointer-events-none absolute inset-x-0 z-0 flex justify-center" style={{ top: hintTop }}>
        <AnimatePresence>
          {arrived && !explored && !selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 1.2, delay: 1.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="flex flex-col items-center gap-3 text-white/35"
            >
              {/* A turn around the mass's vertical axis: a flat arc, travelling to the right */}
              <svg viewBox="0 0 48 17" className="block h-[17px] w-12" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M41 4.2C37.6 2.2 31.3 1 24 1 12.4 1 3 3.9 3 7.5S12.4 14 24 14c5.6 0 10.7-.7 14.4-1.8" strokeLinecap="round" />
                <path d="M35.2 10.1l3.4 2.1-2.6 2.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[10px] font-light uppercase leading-none tracking-[0.4em]">drag to explore</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
