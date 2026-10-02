import { useEffect, useState } from 'react'
import { track } from '../lib/audio'

// Real tasks, weighted by size. Each reports 0..1.
const WEIGHTS = { audio: 0.9, fonts: 0.1 }
type Task = keyof typeof WEIGHTS

async function fetchWithProgress(url: string, onProgress: (p: number) => void) {
  const res = await fetch(url)
  const total = Number(res.headers.get('content-length')) || 0
  if (!res.body || !total) {
    await res.arrayBuffer()
    return
  }
  const reader = res.body.getReader()
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    loaded += value.length
    onProgress(Math.min(loaded / total, 1))
  }
}

export function useResourceLoader() {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let alive = true
    const done: Record<Task, number> = { audio: 0, fonts: 0 }
    let target = 0

    const report = (task: Task, value: number) => {
      done[task] = value
      target = (Object.keys(WEIGHTS) as Task[]).reduce((sum, t) => sum + WEIGHTS[t] * done[t], 0) * 100
    }

    const tasks = [
      fetchWithProgress(track.src, (p) => report('audio', p)).catch(() => {}).then(() => report('audio', 1)),
      document.fonts.ready.catch(() => {}).then(() => report('fonts', 1)),
    ]

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

    void Promise.all(tasks)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [])

  return { progress, isReady }
}
