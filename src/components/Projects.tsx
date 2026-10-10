import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type UIEvent } from 'react'
import { config, isLive, type CategoryId } from '../config'
import { PANEL_LEAVE_S, PANEL_RADIUS, panelRect, panelReveal } from '../lib/projects'
import { object } from '../lib/scene'
import { ProjectView } from './ProjectView'
import { preloadCaseStudy } from '../projects'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')
// Extra reach (px) around a project's label that still counts as pointing at the project
const LABEL_PAD = 14
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const smoothstep = (lo: number, hi: number, v: number) => {
  const x = clamp((v - lo) / (hi - lo), 0, 1)
  return x * x * (3 - 2 * x)
}

interface Props {
  category: CategoryId
  // Entered project (index), or null while exploring the fragments
  project: number | null
  onProject: (index: number | null) => void
}

// The selected category's projects: a label beside each fragment the mass divided into,
// pointer/tap selection of fragments, and the project reached by entering one. Everything
// here rides the canvas's frame, so it moves exactly with the fragments.
export function Projects({ category, project, onProject }: Props) {
  const projects = config.projects[category]
  const names = projects.map((p) => p.name)
  const categoryName = config.categories.find((c) => c.id === category)!.name
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  // Latest fragments on screen and division progress, for hit testing between frames
  const fragments = useRef<Float32Array>(new Float32Array(0))
  const explorable = useRef(false)
  const [hovered, setHovered] = useState(-1)
  // The project the page shows: none until one is entered, then the last entered one while
  // leaving it. Building a case study is heavy (a large page, its images), so it never happens
  // in the background while the mass divides, only once a project is chosen.
  // Built at once on entering, while the fragment holds still before it tears open
  const [shown, setShown] = useState<number | null>(project)
  if (project !== null && project !== shown) setShown(project)

  // Once the mass has divided, the category's finished case studies are fetched while nothing
  // else is happening, so entering one (a tap: phones have no hover to start it) only builds it
  useEffect(() => {
    const ids = projects.filter(isLive).map((p) => p.id)
    let idle = 0
    const timer = window.setTimeout(() => {
      const run = () => ids.forEach(preloadCaseStudy)
      if ('requestIdleCallback' in window) idle = requestIdleCallback(run, { timeout: 2000 })
      else run()
    }, 3000)
    return () => {
      clearTimeout(timer)
      if (idle) cancelIdleCallback(idle)
    }
  }, [projects])

  // Leaving (category closed or Work left): the labels fade and the panel closes before they're
  // removed. Their wrapper is display: contents to keep the layering with the canvas, so it can't.
  const isPresent = useIsPresent()
  const leftAt = useRef<number | null>(null)
  useEffect(() => {
    if (!isPresent && leftAt.current === null) leftAt.current = performance.now()
  }, [isPresent])

  useEffect(() => {
    // The panel's styles as last written, reset whenever a project mounts a new panel
    const blank = { left: '', top: '', width: '', height: '', clipPath: '', opacity: '', pointerEvents: '' }
    let written = { ...blank }
    let writtenTo: HTMLDivElement | null = null
    // Each label's width (CSS px), kept by an observer, so the frame never has to read layout
    const widths = new Map<Element, number>()
    const ro = new ResizeObserver((entries) => entries.forEach((e) => widths.set(e.target, (e.target as HTMLElement).offsetWidth)))
    // Whether the labels were all hidden last frame, so nothing is rewritten while they stay so
    let labelsHidden = false
    object.onProjectsFrame = ({ vw, vh, split, enter, fragments: f }) => {
      fragments.current = f
      const leave = leftAt.current === null ? 1 : 1 - smoothstep(0, PANEL_LEAVE_S * 1000, performance.now() - leftAt.current)
      explorable.current = split >= 1 && enter === 0 && leave === 1
      const portrait = vh > vw
      // Labels arrive once the fragments have parted, and leave as soon as one is entered
      const present = smoothstep(0.72, 1, split) * (1 - smoothstep(0, 0.25, enter)) * leave
      const skipLabels = present === 0 && labelsHidden
      labelsHidden = present === 0
      if (!skipLabels) labelRefs.current.forEach((el, g) => {
        if (!el) return
        if (!widths.has(el)) {
          widths.set(el, el.offsetWidth)
          ro.observe(el)
        }
        const width = widths.get(el)!
        const [x, y, r] = [f[g * 3], f[g * 3 + 1], f[g * 3 + 2]]
        const side = x < vw / 2 ? -1 : 1
        // ...kept on screen when its fragment sits near an edge
        const edge = 16 + (portrait ? width / 2 : width)
        const lx = portrait
          ? Math.min(Math.max(x, edge), vw - edge)
          : side < 0
            ? Math.max(x - r * 0.6, edge)
            : Math.min(x + r * 0.6, vw - edge)
        const ly = portrait ? y + r * 0.9 : y + r * 0.55
        const shift = portrait ? '-50%' : side < 0 ? '-100%' : '0%'
        el.style.transform = `translate3d(${lx}px, ${ly}px, 0) translateX(${shift})`
        el.style.textAlign = portrait ? 'center' : side < 0 ? 'right' : 'left'
        el.style.opacity = String(present)
      })
      // The panel opens from its centre line once the fragment has torn wide enough, and closes
      // back into it; the canvas reveals the same rectangle, so the masses sit over or behind it
      // Leaving, it closes into the same line, on the canvas's curve for its cut-out
      const reveal = panelReveal(enter)
      const panel = panelRef.current
      if (panel) {
        // The same size the canvas cuts the panel's opening from, so the two always line up
        const r = panelRect(vw, vh)
        const clip = ((1 - Math.min(reveal, leave)) * 50).toFixed(2)
        if (writtenTo !== panel) {
          writtenTo = panel
          written = { ...blank }
        }
        // Written only when changed: each write re-lays out or repaints the whole case study
        const set = (key: keyof typeof written, value: string) => {
          if (written[key] === value) return
          written[key] = value
          panel.style[key] = value
        }
        set('left', `${r.left}px`)
        set('top', `${r.top}px`)
        set('width', `${r.width}px`)
        set('height', `${r.height}px`)
        set('clipPath', r.portrait ? `inset(${clip}% 0 round ${PANEL_RADIUS}px)` : `inset(0 ${clip}% round ${PANEL_RADIUS}px)`)
        set('opacity', String(smoothstep(0, 0.3, reveal) * smoothstep(0, 0.1, leave)))
        set('pointerEvents', reveal > 0.95 && leave === 1 ? 'auto' : 'none')
        object.panelOpen = reveal >= 1 && leave === 1
      } else object.panelOpen = false
      const world = worldRef.current
      if (world) world.style.opacity = String(smoothstep(0.4, 1, reveal) * leave)
    }
    return () => {
      object.onProjectsFrame = null
      object.hoverProject = -1
      object.panelOpen = false
      ro.disconnect()
    }
  }, [])

  // The project under a point, or -1: its fragment or its label, which act as one target. The
  // label's box is padded so moving between the two never leaves the project.
  const hit = (x: number, y: number) => {
    const f = fragments.current
    let best = -1
    let bestD = Infinity
    for (let g = 0; g < names.length; g++) {
      const d = Math.hypot(x - f[g * 3], y - f[g * 3 + 1])
      if (d < f[g * 3 + 2] * 0.85 && d < bestD) {
        best = g
        bestD = d
      }
    }
    if (best >= 0) return best
    for (let g = 0; g < names.length; g++) {
      const box = labelRefs.current[g]?.getBoundingClientRect()
      if (!box) continue
      if (x > box.left - LABEL_PAD && x < box.right + LABEL_PAD && y > box.top - LABEL_PAD && y < box.bottom + LABEL_PAD)
        return g
      // ...and the area between the fragment and its label, so crossing the gap keeps it: the
      // band swept from the fragment's centre to every point of the label
      const [fx, fy, r] = [f[g * 3], f[g * 3 + 1], f[g * 3 + 2]]
      const reach = Math.max(r * 0.45, LABEL_PAD * 2)
      for (const [bx, by] of [
        [box.left, box.top],
        [box.right, box.top],
        [box.left, box.bottom],
        [box.right, box.bottom],
        [(box.left + box.right) / 2, (box.top + box.bottom) / 2],
      ]) {
        const nx = bx - fx
        const ny = by - fy
        const along = Math.min(Math.max(((x - fx) * nx + (y - fy) * ny) / (nx * nx + ny * ny || 1), 0), 1)
        if (Math.hypot(x - fx - nx * along, y - fy - ny * along) < reach) return g
      }
    }
    return -1
  }

  // How far through the case study the reader is (0..1), for the world around the panel to
  // follow later: shared with the canvas loop and set as --project-progress on the world layer
  const onPanelScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const progress = el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1)
    object.projectScroll = progress
    worldRef.current?.style.setProperty('--project-progress', progress.toFixed(4))
  }

  const hover = (g: number) => {
    object.hoverProject = g
    if (g !== hovered) {
      setHovered(g)
      // Its case study starts loading while the pointer is still deciding
      if (g >= 0 && isLive(projects[g])) preloadCaseStudy(projects[g].id)
    }
  }
  const onMove = (e: ReactPointerEvent) => hover(explorable.current && project === null ? hit(e.clientX, e.clientY) : -1)
  // A project whose case study isn't finished stays where it is: its "coming soon" line answers
  // the click by lighting up and opening its letters for a moment
  const [nudged, setNudged] = useState(-1)
  const nudgeTimer = useRef(0)
  useEffect(() => () => clearTimeout(nudgeTimer.current), [])
  const enter = (g: number) => {
    if (!isLive(projects[g])) {
      setNudged(g)
      clearTimeout(nudgeTimer.current)
      nudgeTimer.current = window.setTimeout(() => setNudged(-1), 1400)
      return
    }
    hover(-1)
    onProject(g)
  }
  const onClick = (e: ReactPointerEvent) => {
    // Only the main button enters: the mouse's back/forward buttons (and right-click) are left to
    // the browser, so back from here goes back instead of entering the project under the pointer
    if (e.button !== 0 || !explorable.current || project !== null) return
    const g = hit(e.clientX, e.clientY)
    if (g >= 0) enter(g)
  }

  return (
    <>
      <div
        className={`absolute inset-0 z-[3] ${project === null && hovered >= 0 ? 'cursor-pointer' : ''} ${project !== null ? 'pointer-events-none' : ''}`}
        onPointerMove={onMove}
        onPointerLeave={() => hover(-1)}
        onPointerUp={onClick}
      >
        {names.map((name, g) => (
          <div
            key={g}
            ref={(el) => {
              labelRefs.current[g] = el
            }}
            aria-hidden
            className="lift-shadow pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
          >
            <div
              className="transition-opacity duration-500"
              style={{ opacity: hovered === -1 || hovered === g ? 1 : 0.55 }}
            >
              <p className="mb-[0.7em] whitespace-nowrap text-phi-xs font-light uppercase tabular-nums tracking-[0.35em] text-white/50">
                {pad(g + 1)} / {pad(names.length)}
              </p>
              <p
                className={`whitespace-nowrap font-display text-phi-md font-bold uppercase leading-none transition-[letter-spacing,color] duration-500 ${hovered === g ? 'text-glow' : 'text-cream'}`}
                style={{ letterSpacing: hovered === g ? '0.02em' : '-0.01em' }}
              >
                {name}
              </p>
              <p className="mt-[0.6em] whitespace-nowrap text-phi-xs font-light text-white/50">{projects[g].discipline ?? categoryName}</p>
              {!isLive(projects[g]) && (
                <p
                  className={`mt-[1.1em] whitespace-nowrap text-phi-xs font-light uppercase transition-[letter-spacing,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${nudged === g ? 'text-glow' : hovered === g ? 'text-white/70' : 'text-white/40'}`}
                  style={{ letterSpacing: nudged === g ? '0.45em' : '0.35em' }}
                >
                  Case study —{' '}
                  <span className={`font-medium transition-colors duration-700 ${nudged === g ? 'text-glow' : 'text-soon'}`}>
                    coming soon
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
        {/* Keyboard and screen readers: the fragments as plain buttons */}
        <ul className="sr-only">
          {names.map((name, g) => (
            <li key={g}>
              <button type="button" disabled={project !== null || !isLive(projects[g])} onClick={() => enter(g)}>
                {name}, {categoryName}, project {g + 1} of {names.length}
                {isLive(projects[g]) ? '' : ', case study coming soon'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* The project, in the opening its fragment tears */}
      {shown !== null && (
        <ProjectView key={shown} project={projects[shown]} panelRef={panelRef} worldRef={worldRef} onScroll={onPanelScroll} />
      )}
      <AnimatePresence>
        {project !== null && (
          <motion.button
            type="button"
            onClick={() => onProject(null)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 2.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="lift-shadow group absolute left-5 top-24 z-20 flex items-baseline gap-[0.3em] text-phi-sm font-semibold lowercase text-cream transition-colors duration-500 hover:text-glow sm:left-8 sm:top-28"
          >
            {/* the arrow holds still; the word grows a little and its letters open, as the site's labels do */}
            <span aria-hidden>←</span>
            <span className="origin-left tracking-[0em] transition-[letter-spacing,scale] duration-500 ease-out group-hover:scale-[1.06] group-hover:tracking-[0.06em]">
              back
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
