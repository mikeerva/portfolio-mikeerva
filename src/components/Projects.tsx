import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type UIEvent } from 'react'
import { config, type CategoryId } from '../config'
import { PANEL_RADIUS, panelRect, panelReveal } from '../lib/projects'
import { object } from '../lib/scene'
import { ProjectView } from './ProjectView'

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
  // The project the page shows: stays the last entered one while leaving it
  const [shown, setShown] = useState(project ?? 0)
  if (project !== null && project !== shown) setShown(project)

  useEffect(() => {
    object.onProjectsFrame = ({ split, enter, fragments: f }) => {
      fragments.current = f
      explorable.current = split >= 1 && enter === 0
      const portrait = window.innerHeight > window.innerWidth
      // Labels arrive once the fragments have parted, and leave as soon as one is entered
      const present = smoothstep(0.72, 1, split) * (1 - smoothstep(0, 0.25, enter))
      labelRefs.current.forEach((el, g) => {
        if (!el) return
        const [x, y, r] = [f[g * 3], f[g * 3 + 1], f[g * 3 + 2]]
        const side = x < window.innerWidth / 2 ? -1 : 1
        // ...kept on screen when its fragment sits near an edge
        const edge = 16 + (portrait ? el.offsetWidth / 2 : el.offsetWidth)
        const lx = portrait
          ? Math.min(Math.max(x, edge), window.innerWidth - edge)
          : side < 0
            ? Math.max(x - r * 0.6, edge)
            : Math.min(x + r * 0.6, window.innerWidth - edge)
        const ly = portrait ? y + r * 0.9 : y + r * 0.55
        const shift = portrait ? '-50%' : side < 0 ? '-100%' : '0%'
        el.style.transform = `translate3d(${lx}px, ${ly}px, 0) translateX(${shift})`
        el.style.textAlign = portrait ? 'center' : side < 0 ? 'right' : 'left'
        el.style.opacity = String(present)
      })
      // The panel opens from its centre line once the fragment has torn wide enough, and closes
      // back into it; the canvas reveals the same rectangle, so the masses sit over or behind it
      const reveal = panelReveal(enter)
      const panel = panelRef.current
      if (panel) {
        const r = panelRect(window.innerWidth, window.innerHeight)
        const clip = ((1 - reveal) * 50).toFixed(2)
        panel.style.left = `${r.left}px`
        panel.style.top = `${r.top}px`
        panel.style.width = `${r.width}px`
        panel.style.height = `${r.height}px`
        panel.style.clipPath = r.portrait ? `inset(${clip}% 0 round ${PANEL_RADIUS}px)` : `inset(0 ${clip}% round ${PANEL_RADIUS}px)`
        panel.style.opacity = String(smoothstep(0, 0.3, reveal))
        panel.style.pointerEvents = reveal > 0.95 ? 'auto' : 'none'
      }
      const world = worldRef.current
      if (world) world.style.opacity = String(smoothstep(0.4, 1, reveal))
    }
    return () => {
      object.onProjectsFrame = null
      object.hoverProject = -1
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
    if (g !== hovered) setHovered(g)
  }
  const onMove = (e: ReactPointerEvent) => hover(explorable.current && project === null ? hit(e.clientX, e.clientY) : -1)
  const onClick = (e: ReactPointerEvent) => {
    if (!explorable.current || project !== null) return
    const g = hit(e.clientX, e.clientY)
    if (g >= 0) {
      hover(-1)
      onProject(g)
    }
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
            className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
          >
            <div
              className="transition-opacity duration-500"
              style={{ opacity: hovered === -1 || hovered === g ? 1 : 0.55 }}
            >
              <p className="mb-[0.7em] whitespace-nowrap text-[10px] font-light uppercase tabular-nums tracking-[0.35em] text-white/50 sm:text-[11px]">
                {pad(g + 1)} / {pad(names.length)}
              </p>
              <p
                className="whitespace-nowrap font-display text-xl font-bold uppercase leading-none text-cream transition-[letter-spacing] duration-500 sm:text-2xl"
                style={{ letterSpacing: hovered === g ? '0.02em' : '-0.01em' }}
              >
                {name}
              </p>
              <p className="mt-[0.6em] whitespace-nowrap text-[11px] font-light text-white/50 sm:text-xs">{projects[g].discipline ?? categoryName}</p>
            </div>
          </div>
        ))}
        {/* Keyboard and screen readers: the fragments as plain buttons */}
        <ul className="sr-only">
          {names.map((name, g) => (
            <li key={g}>
              <button type="button" disabled={project !== null} onClick={() => onProject(g)}>
                {name}, {categoryName}, project {g + 1} of {names.length}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* The project, in the opening its fragment tears */}
      <ProjectView key={shown} project={projects[shown]} panelRef={panelRef} worldRef={worldRef} onScroll={onPanelScroll} />
      <AnimatePresence>
        {project !== null && (
          <motion.button
            type="button"
            onClick={() => onProject(null)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease, delay: 2.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute left-5 top-24 z-20 text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:left-8 sm:top-28 sm:text-lg"
          >
            ← back
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
