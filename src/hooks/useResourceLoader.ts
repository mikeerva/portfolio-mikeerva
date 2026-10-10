import { useEffect, useState } from 'react'

export function useResourceLoader() {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let alive = true
    // The only thing waited for is the fonts
    let target = 0
    document.fonts.ready.catch(() => {}).then(() => (target = 100))

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
