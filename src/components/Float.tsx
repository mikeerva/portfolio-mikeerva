import { useEffect, useRef, type ReactNode } from 'react'

// A Hero link adrift like the Work names on their mass: a slow rise and fall and a slight turn in
// perspective, at the mass's own rates, its shadow rising and settling with it. Motionless when
// motion is reduced, and on touch screens, where it would only add work for the phone's GPU.
export function Float({ children, phase = 0 }: { children: ReactNode; phase?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return
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

  return (
    <span ref={ref} className="inline-block will-change-transform">
      {children}
    </span>
  )
}
