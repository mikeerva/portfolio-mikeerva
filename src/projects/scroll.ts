import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'

// The open project's panel: the scroll container every case study scrolls inside
export const ScrollerContext = createContext<RefObject<HTMLDivElement | null> | null>(null)

// How far an element has travelled through the panel, written to it as the CSS variable --p
// (0..1) on every scroll, so its styles can follow scroll without re-rendering React.
//   'pin'   — for a tall section with a sticky inner: 0 when its top reaches the panel's top,
//             1 when its bottom reaches the panel's bottom
//   'cross' — 0 as the element enters at the bottom, 1 as it leaves at the top
export function useScrollProgress<T extends HTMLElement>(mode: 'pin' | 'cross' = 'cross') {
  const ref = useRef<T>(null)
  const scroller = useContext(ScrollerContext)
  useEffect(() => {
    const panel = scroller?.current
    const el = ref.current
    if (!panel || !el) return
    let raf = 0
    const update = () => {
      raf = 0
      const view = panel.clientHeight
      const top = el.getBoundingClientRect().top - panel.getBoundingClientRect().top
      const height = el.offsetHeight
      const p = mode === 'pin' ? -top / Math.max(height - view, 1) : (view - top) / (view + height)
      el.style.setProperty('--p', Math.min(Math.max(p, 0), 1).toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    panel.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      panel.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [scroller, mode])
  return ref
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
