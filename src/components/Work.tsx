import { animate, AnimatePresence, motion, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { config, isLive, type CategoryId } from '../config'
import { FACETS, facetPath, objectLayout, perspective, place, STATE_COUNT, yawOf } from '../lib/objectStates'
import { ONBOARD_FACET, onboardStart, onboarding as onboardingState } from '../lib/onboarding'
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

// Pointer travel (px) that counts as the first intentional drag and ends the onboarding
const ONBOARD_DRAG = 24
// The onboarding orbit: a circle round the mass's vertical axis (object units), at the height just
// under "drag to explore", seen slightly from above, and fixed to the mass like the text, so it turns
// with it. The circle is wider and deeper than the mass, so it passes round it, never through it.
// The stretch drawn is centred under the text and spans ORBIT_LENGTH of its width, fading in from its
// tail, with the arrowhead at its right end.
// It lies level with the eye (no height, no tilt), so however it turns it stays horizontal on screen,
// like the phrase
const ORBIT_R = 2
const ORBIT_Y = 0
const ORBIT_TILT = 0
const ORBIT_LENGTH = 0.9
// ...and how far its tail reaches back, past the start of the phrase
const ORBIT_TAIL = 1.8
// "Drag to explore" is fixed to the same frame as the orbit (object units: its height and how far
// in front of the axis), so the two turn as one piece. It stands out on the orbit itself, clear of
// the mass, just above the line.
const ONBOARD_Y = 0.12
const ONBOARD_Z = ORBIT_R
// How much further than the orbit the phrase turns
const ONBOARD_TURN = 1.6
const ORBIT_SAMPLES = 72
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
  // First entry this visit: "drag to explore" is the name on the facet turned one state before 01's,
  // where the mass first rests, with a still orbit round the mass. The first drag turns it away like
  // any name and the mass comes to rest on 01, whichever way it was dragged; from then on, as always.
  const [onboarding, setOnboarding] = useState(() => !onboardingState.done && !selected)
  const progress = useMotionValue(
    selected
      ? nearestState(object.progress, facetOf(indexOf(selected)))
      : onboarding
        ? onboardStart(object.progress)
        : Math.round(object.progress),
  )
  const [nearest, setNearest] = useState(() => Math.round(progress.get()))
  const [offState, setOffState] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [arrived, setArrived] = useState(false)
  const [overTarget, setOverTarget] = useState(false)
  const moved = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [startedOnboarding] = useState(onboarding)
  // The names (and, until then, the onboarding) wait for the first drag to come to rest on 01
  const [namesReady, setNamesReady] = useState(!onboarding)
  // "Drag to explore" and its orbit, like each name, exist twice: under the canvas and above it
  const onboardFront = useRef<HTMLDivElement>(null)
  const onboardBack = useRef<HTMLDivElement>(null)
  const orbitFront = useRef<SVGSVGElement>(null)
  const orbitBack = useRef<SVGSVGElement>(null)
  // The first drag has begun: from then on the onboarding only ever turns further out of view
  const handedOver = useRef(false)
  const onboardDrag = useRef(false)
  const endOnboarding = () => {
    if (onboardingState.done) return
    onboardingState.finish()
    handedOver.current = true
    setOnboarding(false)
  }
  // Each name exists twice: under the canvas (hidden by the mass) and above it
  const backRefs = useRef<(HTMLDivElement | null)[]>([])
  const frontRefs = useRef<(HTMLDivElement | null)[]>([])

  const active = mod(nearest, STATE_COUNT)
  const category = config.categories[categoryAt(active)]
  const [firstActive] = useState(active)
  const settled = arrived && !dragging && !offState
  // The mass swells under the pointer as always, but while onboarding there's nothing to enter yet
  const overMass = settled && overTarget && !selected
  const hovering = overMass && namesReady
  if (!namesReady && (selected || (!onboarding && settled))) setNamesReady(true)

  const snapTo = (n: number) => {
    animate(progress, n, SNAP)
  }

  useEffect(() => {
    const id = setTimeout(() => setArrived(true), ARRIVAL_MS)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    // The onboarding's resting orientation is taken up at once, not turned to on arrival
    if (object.progress !== progress.get() && startedOnboarding) object.jump = true
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
  }, [progress, startedOnboarding])

  // The names ride the canvas's own frame: same eased turn, sway, tilt and zoom as the mass
  useEffect(() => {
    let lastUnit = 0
    // Once the first drag has turned "drag to explore" away, it can't turn back into view
    let onboardSeen = 1
    // Half the width of "drag to explore", as an angle round the orbit
    let textHalf = 0
    // Its width (CSS px), kept by an observer as its letters open and close, so the frame never
    // has to read layout
    let textWidth = 0
    let measured: HTMLElement | null = null
    const ro = new ResizeObserver(([e]) => (textWidth = (e.target as HTMLElement).offsetWidth))
    // Whether the names were all hidden last frame (the category divided), so nothing is rewritten
    // while they stay hidden
    let hidden = false
    // Touch screens keep the names' shadow at its resting height: lifting it with the turn
    // repaints every name's shadow on every frame of it
    const liftShadows = !matchMedia('(pointer: coarse)').matches
    // The orbit, fixed to the mass at "drag to explore"'s facet: turned exactly as far as that
    // facet (phi), tilted with the mass, and as visible as the text. The part in front of the mass is
    // drawn above the canvas and the part behind it below, where the mass hides it.
    const drawOrbit = (phi: number, tilt: number, cx: number, cy: number, u: number, alpha: number) => {
      const front = orbitFront.current
      const back = orbitBack.current
      if (!front || !back) return
      // Centred under the text: its leading end round the vertical axis (0: toward the viewer,
      // rising to the right) and how far back its tail reaches
      const head = phi + textHalf * ORBIT_LENGTH
      const span = textHalf * (ORBIT_LENGTH + ORBIT_TAIL)

      const pts: [number, number, number][] = []
      for (let s = 0; s <= ORBIT_SAMPLES; s++) {
        const a = head - span + (span * s) / ORBIT_SAMPLES
        const [x, y, z] = place([ORBIT_R * Math.sin(a), ORBIT_Y, ORBIT_R * Math.cos(a)], 0, ORBIT_TILT + tilt)
        const p = perspective(z)
        // Positive in front of the mass's vertical axis
        pts.push([cx + x * p * u, cy - y * p * u, Math.cos(a)])
      }
      const pt = (q: number[]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`
      // One line per layer, split where it passes the side of the mass and joined exactly there
      let f = ''
      let b = ''
      for (let s = 0; s <= ORBIT_SAMPLES; s++) {
        const q = pts[s]
        const inFront = q[2] >= 0
        if (s === 0) {
          if (inFront) f += `M${pt(q)}`
          else b += `M${pt(q)}`
          continue
        }
        const prev = pts[s - 1]
        if (prev[2] >= 0 === inFront) {
          if (inFront) f += `L${pt(q)}`
          else b += `L${pt(q)}`
        } else {
          const t = prev[2] / (prev[2] - q[2])
          const c = [prev[0] + (q[0] - prev[0]) * t, prev[1] + (q[1] - prev[1]) * t]
          if (inFront) {
            b += `L${pt(c)}`
            f += `M${pt(c)}L${pt(q)}`
          } else {
            f += `L${pt(c)}`
            b += `M${pt(c)}L${pt(q)}`
          }
        }
      }
      const [lineF, headF, fadeF] = [front.children[1], front.children[2], front.children[0].firstElementChild!]
      const [lineB, headB, fadeB] = [back.children[1], back.children[2], back.children[0].firstElementChild!]
      lineF.setAttribute('d', span > 0.02 ? f : '')
      lineB.setAttribute('d', span > 0.02 ? b : '')
      // It fades in continuously from its tail toward the arrowhead
      for (const fade of [fadeF, fadeB]) {
        fade.setAttribute('x1', pts[0][0].toFixed(1))
        fade.setAttribute('y1', pts[0][1].toFixed(1))
        fade.setAttribute('x2', pts[ORBIT_SAMPLES][0].toFixed(1))
        fade.setAttribute('y2', pts[ORBIT_SAMPLES][1].toFixed(1))
      }
      // The arrowhead at the leading end, along its direction on screen
      const tip = pts[ORBIT_SAMPLES]
      const before = pts[ORBIT_SAMPLES - 3]
      const dl = Math.hypot(tip[0] - before[0], tip[1] - before[1]) || 1
      const [dx, dy] = [(tip[0] - before[0]) / dl, (tip[1] - before[1]) / dl]
      const size = Math.max(7, u * 0.065)
      const wing = (side: number) => {
        const c = Math.cos(2.6 * side)
        const s = Math.sin(2.6 * side)
        return [tip[0] + (dx * c - dy * s) * size, tip[1] + (dx * s + dy * c) * size]
      }
      const head2 = span > 0.02 ? `M${pt(wing(1))}L${pt(tip)}L${pt(wing(-1))}Z` : ''
      headF.setAttribute('d', tip[2] >= 0 ? head2 : '')
      headB.setAttribute('d', tip[2] < 0 ? head2 : '')
      front.style.opacity = String(alpha)
      back.style.opacity = String(alpha)
    }

    object.onFrame = ({ vw, vh, turn, sway, tilt, zoom, cx, cy, unit, split }) => {
      const portrait = vh > vw
      if (unit !== lastUnit) {
        // Type is sized against the mass; on narrow screens it takes a larger share of it
        sectionRef.current?.style.setProperty('--type', `${unit * (portrait ? 0.33 : 0.3)}px`)
        lastUnit = unit
      }
      const u = unit * zoom
      // Once the category has divided every name is gone: hidden once, then left alone
      const shown = 1 - smoothstep(0.02, 0.35, split)
      if (shown === 0) {
        if (!hidden) {
          hidden = true
          for (const el of [...frontRefs.current, ...backRefs.current, onboardFront.current, onboardBack.current, orbitFront.current, orbitBack.current])
            if (el) el.style.opacity = '0'
        }
        return
      }
      hidden = false
      const textEl = onboardFront.current
      if (textEl !== measured) {
        if (measured) ro.unobserve(measured)
        if (textEl) ro.observe(textEl)
        measured = textEl
      }
      // So the line follows the phrase as its letters open on hover
      if (textEl) {
        const half = textWidth / 2 / unit
        textHalf = Math.asin(Math.min(half / (ORBIT_R * perspective(ONBOARD_Z)), 1))
      }
      FACETS.forEach(({ at, atPortrait }, i) => {
        const front = frontRefs.current[i]
        const back = backRefs.current[i]
        // The onboarding rides its facet exactly as that facet's name would
        const onboardF = i === ONBOARD_FACET ? onboardFront.current : null
        const onboardB = i === ONBOARD_FACET ? onboardBack.current : null
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
        // How far it has risen off the mass, for the shadow it casts there
        if (liftShadows) {
          const risen = (lift / FRONT_LIFT).toFixed(2)
          front.style.setProperty('--lift', risen)
          back.style.setProperty('--lift', risen)
        }
        if (onboardF && onboardB) {
          // "Drag to explore" turns rigidly with the orbit about the mass's axis: same angle, tilt
          // and projection, so the two keep their places relative to each other throughout. It is
          // shown, layered and lit like a name.
          const [ox, oy, oz] = place([ONBOARD_Z * Math.sin(phi), ONBOARD_Y, ONBOARD_Z * Math.cos(phi)], 0, ORBIT_TILT + tilt)
          const op = perspective(oz)
          // The card turns further than the orbit it sits on and is drawn in deeper perspective, so
          // the phrase visibly swings round with the line rather than sliding along it
          const oLean = clamp(phi * ONBOARD_TURN, -Math.PI / 2, Math.PI / 2)
          const oAlpha =
            smoothstep(0.02, 0.1, Math.abs(Math.cos(oLean))) *
            (1 - 0.5 * smoothstep(0, -1, oz)) *
            (1 - smoothstep(0.75, 0.95, Math.abs(phi) / Math.PI)) *
            (1 - smoothstep(0.5, 1, away)) *
            (1 - smoothstep(0.02, 0.35, split))
          if (handedOver.current) onboardSeen = Math.min(onboardSeen, oAlpha)
          const a = handedOver.current ? onboardSeen : oAlpha
          const oFront = smoothstep(-0.1, 0.1, oz)
          const oTransform =
            `translate3d(${cx + ox * op * u}px, ${cy - oy * op * u}px, 0) translate(-50%, -50%) ` +
            `perspective(600px) rotateY(${oLean}rad) scale(${(op / perspective(ONBOARD_Z)) * zoom})`
          onboardF.style.transform = oTransform
          onboardB.style.transform = oTransform
          onboardF.style.opacity = String(a * oFront)
          onboardB.style.opacity = String(a * (1 - oFront))
          // Standing out on the orbit, it's fully risen while it faces the viewer
          if (liftShadows) {
            const oRisen = Math.max(Math.cos(oLean), 0).toFixed(2)
            onboardF.style.setProperty('--lift', oRisen)
            onboardB.style.setProperty('--lift', oRisen)
          }
          drawOrbit(phi, tilt, cx, cy, u, a)
        }
      })
    }
    return () => {
      object.onFrame = null
      ro.disconnect()
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
    object.hover = overMass
  }, [overMass])

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
      if (step && onboarding) {
        // The first turn completes the onboarding and comes to rest on 01
        endOnboarding()
        snapTo(nearestState(progress.get(), facetOf(0)))
      } else if (step) {
        snapTo(Math.round(progress.get()) + step)
      } else if (e.key === 'Enter' && settled && namesReady && e.target === document.body) {
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
    // Until the onboarding has come to rest on 01, a click enters nothing
    const settledAtPress = settled && namesReady
    const onboardingAtPress = onboarding
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
      }
      if (!moved.current) return
      if (onboardingAtPress && !onboardDrag.current && Math.hypot(dx, dy) > ONBOARD_DRAG) {
        onboardDrag.current = true
        endOnboarding()
      }
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
      if (onboardDrag.current) {
        // The onboarding drag always comes to rest on 01, whichever way it went
        onboardDrag.current = false
        snapTo(nearestState(progress.get(), facetOf(0)))
        return
      }
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
    const enterable = layer === 'front' && isActive && settled && namesReady && !selected
    const shown = arrived && namesReady && (!selected || isActive)
    const delay = selected || startedOnboarding || i === firstActive ? 0 : 0.5 + mod(firstActive - i, STATE_COUNT) * 0.15
    return (
      <div
        key={i}
        ref={(el) => {
          refs.current[i] = el
        }}
        data-enter={enterable || undefined}
        className={`lift-shadow absolute left-0 top-0 opacity-0 will-change-transform ${enterable ? 'pointer-events-auto' : ''} ${at[0] < 0 ? 'text-right' : 'text-left'}`}
      >
        <div style={{ opacity: shown ? 1 : 0, transition: `opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s` }}>
          <p className="mb-[0.9em] whitespace-nowrap text-phi-xs font-light uppercase tabular-nums tracking-[0.35em] text-white/50">
            {pad(shownCategory + 1)} / {pad(STATE_COUNT)}
            {layer === 'front' && isActive && (
              <span
                className="text-glow transition-opacity duration-500"
                style={{ opacity: hovering ? 1 : 0 }}
              >
                {'  '}— enter →
              </span>
            )}
          </p>
          <p
            className={`whitespace-nowrap font-display font-bold uppercase leading-[0.9] transition-[letter-spacing,color] duration-700 ${hovering && isActive ? 'text-glow' : 'text-cream'}`}
            style={{ fontSize: 'var(--type, 60px)', letterSpacing: hovering && isActive ? '0.01em' : '-0.01em' }}
          >
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          {/* A category with no finished case study yet */}
          {!config.projects[config.categories[shownCategory].id].some(isLive) && (
            <p className="mt-[1.1em] whitespace-nowrap text-phi-xs font-medium uppercase tracking-[0.35em] text-soon">Coming soon</p>
          )}
        </div>
      </div>
    )
  }

  const cursor = selected ? '' : dragging ? 'cursor-grabbing' : hovering ? 'cursor-pointer' : 'cursor-grab'
  const indices = config.categories.map((_, i) => i)
  const layerExit = { opacity: 0, transition: { duration: 0.4 } }
  const onboardFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.4, ease } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }
  // One half of the orbit: its fade (placed along the line every frame), the line, the arrowhead
  const orbit = (ref: RefObject<SVGSVGElement | null>, layer: 'front' | 'back') => (
    <svg
      ref={ref}
      className={`absolute inset-0 size-full overflow-visible transition-colors duration-700 ${overMass ? 'text-glow' : 'text-cream'}`}
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={`onboard-fade-${layer}`} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="0.45" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path stroke={`url(#onboard-fade-${layer})`} />
      <path fill="currentColor" />
    </svg>
  )
  // "Drag to explore" in the names' own type, on one line, answering the pointer over the mass as
  // a name does: its letters open and it's lit lavender
  const onboardName = (ref: RefObject<HTMLDivElement | null>) => (
    <div ref={ref} className="lift-shadow absolute left-0 top-0 opacity-0 will-change-transform">
      <p
        className={`whitespace-nowrap font-display font-bold uppercase leading-[0.9] transition-[letter-spacing,color] duration-700 ${overMass ? 'text-glow' : 'text-cream'}`}
        // Half a golden step below the names (1 / √1.618)
        style={{ fontSize: 'calc(var(--type, 60px) * 0.786)', letterSpacing: overMass ? '0.01em' : '-0.01em' }}
      >
        Drag to explore
      </p>
    </div>
  )
  const showOnboarding = startedOnboarding && arrived && !namesReady && !selected

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

      <AnimatePresence propagate>
        {selected && (
          <motion.div key={selected} exit={layerExit} className="contents">
            <Projects category={selected} project={project} onProject={(index) => onProject(selected, index)} />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {namesReady ? `${category.name}, ${categoryAt(active) + 1} of ${STATE_COUNT}` : 'Drag to explore'}
      </p>
      <button type="button" className="sr-only" disabled={!!selected || !namesReady} onClick={() => onSelect(category.id)}>
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
              // Not on touch screens: there the phone's own back gesture (or the menu) leaves the category
              className="lift-shadow group pointer-events-auto absolute left-5 top-24 flex items-baseline pointer-coarse:hidden gap-[0.3em] text-phi-sm font-semibold lowercase text-cream transition-colors duration-500 hover:text-glow sm:left-8 sm:top-28"
            >
              {/* the arrow holds still; the words grow a little and their letters open, as the site's labels do */}
              <span aria-hidden>←</span>
              <span className="origin-left tracking-[0em] transition-[letter-spacing,scale] duration-500 ease-out group-hover:scale-[1.06] group-hover:tracking-[0.06em]">
                all work
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* First entry: "drag to explore" on its facet, and the still orbit round the mass. Both
          are drawn every frame with the names: under the canvas where they're behind the mass,
          which hides them wherever it covers them, and above it where they're in front. */}
      <motion.div aria-hidden exit={layerExit} className="pointer-events-none absolute inset-0 z-0">
        <AnimatePresence>
          {showOnboarding && (
            <motion.div key="onboard-back" {...onboardFade} className="absolute inset-0">
              {orbit(orbitBack, 'back')}
              {onboardName(onboardBack)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div aria-hidden exit={layerExit} className="pointer-events-none absolute inset-0 z-[2]">
        <AnimatePresence>
          {showOnboarding && (
            <motion.div key="onboard-front" {...onboardFade} className="absolute inset-0">
              {orbit(orbitFront, 'front')}
              {onboardName(onboardFront)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
