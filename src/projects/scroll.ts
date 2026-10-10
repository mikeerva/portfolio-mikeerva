import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'

// The open project's panel: the scroll container every case study scrolls inside
export const ScrollerContext = createContext<RefObject<HTMLDivElement | null> | null>(null)

// Eases wheel scrolling of a scroll container: each wheel step moves a target and scrollTop glides
// to it every frame. It stays a native scroller, so scroll events, sticky and the scrollbar keep
// working, and touch, keyboard and scrollbar dragging stay native (the glide resyncs to them).
// Off for reduced motion, pinch zoom, and wheels a nested scroller inside can still take.
export function useSmoothWheel(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let target = el.scrollTop
    let current = target
    let raf = 0
    let last = 0
    const max = () => el.scrollHeight - el.clientHeight
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      current += (target - current) * (1 - Math.exp(-dt * 9))
      if (Math.abs(target - current) < 0.5) current = target
      el.scrollTop = current
      raf = current === target ? 0 : requestAnimationFrame(tick)
    }
    // Whether something between the pointer and the container would scroll this way itself
    const nestedTakes = (node: EventTarget | null, dy: number) => {
      for (let n = node as HTMLElement | null; n && n !== el; n = n.parentElement) {
        const { overflowY } = getComputedStyle(n)
        if ((overflowY === 'auto' || overflowY === 'scroll') && n.scrollHeight > n.clientHeight) {
          if (dy < 0 ? n.scrollTop > 0 : n.scrollTop < n.scrollHeight - n.clientHeight - 1) return true
        }
      }
      return false
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1)
      if (nestedTakes(e.target, dy)) return
      e.preventDefault()
      target = Math.min(Math.max(target + dy, 0), max())
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    // Scrolled some other way (touch, keys, scrollbar, scrollIntoView): follow it, not fight it
    const onScroll = () => {
      if (raf && Math.abs(el.scrollTop - current) <= 1) return
      cancelAnimationFrame(raf)
      raf = 0
      target = current = el.scrollTop
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

// How far an element has travelled through the panel, written to it as the CSS variable --p
// (0..1) on every scroll, so its styles can follow scroll without re-rendering React.
//   'pin'   — for a tall section with a sticky inner: 0 when its top reaches the panel's top,
//             1 when its bottom reaches the panel's bottom
//   'cross' — 0 as the element enters at the bottom, 1 as it leaves at the top
// Every tracked element in a panel shares one loop: each frame all of them are measured first
// and written after, so a scroll costs one layout however many there are. Only those near the
// view are measured at all: measuring the rest would make the browser lay out chapters it has
// left unbuilt until they come near (see .case-study-panel in index.css).
export function useScrollProgress<T extends HTMLElement>(mode: 'pin' | 'cross' = 'cross') {
  const ref = useRef<T>(null)
  const scroller = useContext(ScrollerContext)
  useEffect(() => {
    const panel = scroller?.current
    const el = ref.current
    if (!panel || !el) return
    return track(panel, { el, mode, near: false, written: '' })
  }, [scroller, mode])
  return ref
}

interface Tracked {
  el: HTMLElement
  mode: 'pin' | 'cross'
  near: boolean
  written: string
}

interface Loop {
  items: Set<Tracked>
  byEl: Map<Element, Tracked>
  raf: number
  io: IntersectionObserver
  schedule: () => void
  stop: () => void
}

const loops = new Map<HTMLElement, Loop>()

function loopFor(panel: HTMLElement) {
  const existing = loops.get(panel)
  if (existing) return existing
  const items = new Set<Tracked>()
  const byEl = new Map<Element, Tracked>()
  const update = () => {
    loop.raf = 0
    const view = panel.clientHeight
    const top0 = panel.getBoundingClientRect().top
    const values: [Tracked, string][] = []
    for (const t of items) {
      if (!t.near) continue
      const top = t.el.getBoundingClientRect().top - top0
      const height = t.el.offsetHeight
      const p = t.mode === 'pin' ? -top / Math.max(height - view, 1) : (view - top) / (view + height)
      values.push([t, Math.min(Math.max(p, 0), 1).toFixed(4)])
    }
    for (const [t, v] of values) {
      if (v === t.written) continue
      t.written = v
      t.el.style.setProperty('--p', v)
    }
  }
  const schedule = () => {
    if (!loop.raf) loop.raf = requestAnimationFrame(update)
  }
  // Near: within a screen of the panel's view, above or below
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const t = byEl.get(e.target)
        if (t) t.near = e.isIntersecting
      }
      schedule()
    },
    { root: panel, rootMargin: '100% 0px' },
  )
  panel.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  const loop: Loop = {
    items,
    byEl,
    raf: 0,
    io,
    schedule,
    stop: () => {
      panel.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(loop.raf)
      io.disconnect()
      loops.delete(panel)
    },
  }
  loops.set(panel, loop)
  return loop
}

function track(panel: HTMLElement, t: Tracked) {
  const loop = loopFor(panel)
  loop.items.add(t)
  loop.byEl.set(t.el, t)
  loop.io.observe(t.el)
  return () => {
    loop.items.delete(t)
    loop.byEl.delete(t.el)
    loop.io.unobserve(t.el)
    if (!loop.items.size) loop.stop()
  }
}

// Marks an element with .is-in once it has come into view (and keeps it), for one-time reveals
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}
