import { useEffect, useState } from 'react'

const FONT_WAIT_MS = 4000

export function useResourceLoader() {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let alive = true
    // The only thing waited for is the fonts, and never for more than a few seconds: if they're
    // slow or blocked the page goes on with its fallback faces rather than sit at 0%
    let target = 0
    Promise.race([document.fonts.ready.catch(() => {}), new Promise((done) => setTimeout(done, FONT_WAIT_MS))]).then(() => (target = 100))

    // Displayed value eases toward the real value, so it never jumps and never runs ahead of it.
    let shown = 0
    let raf = 0
    const tick = () => {
      if (!alive) return
      shown += (target - shown) * 0.12
      if (target - shown < 0.05) shown = target
      setProgress(Math.round(shown))
      if (shown >= 100) {
        setTimeout(() => alive && setIsReady(true), 400)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [])

  return { progress, isReady }
}
