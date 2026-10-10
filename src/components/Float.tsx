import { useEffect, useRef, type ReactNode } from 'react'
import { object } from '../lib/scene'

// A Hero link adrift like the Work names on their mass: a slow rise and fall and a slight turn in
// perspective, at the mass's own rates, its shadow rising and settling with it. While hovered it
// tells the canvas where it is, so the material swells toward it (unless `still`: no response to
// the pointer). Motionless when motion is reduced.
export function Float({ children, phase = 0, still = false }: { children: ReactNode; phase?: number; still?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = (now - start) / 1000
      const el = ref.current
      if (el) {
        const rise = Math.sin(t * 0.45 + phase)
        el.style.transform = `translateY(${(-rise * 4).toFixed(2)}px) perspective(600px) rotateY(${(Math.sin(t * 0.23 + phase) * 0.04).toFixed(4)}rad)`
        el.style.setProperty('--lift', (0.6 + 0.2 * rise).toFixed(2))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => () => void (object.heroLink = null), [])

  const enter = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) object.heroLink = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  return (
    <span
      ref={ref}
      className="inline-block will-change-transform"
      onPointerEnter={still ? undefined : enter}
      onPointerLeave={still ? undefined : () => (object.heroLink = null)}
    >
      {children}
    </span>
  )
}
