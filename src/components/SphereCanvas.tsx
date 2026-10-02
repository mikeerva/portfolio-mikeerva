import { useEffect, useRef } from 'react'
import { audio } from '../lib/audio'
import { DarkMatter } from '../scene/DarkMatter'

export function SphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    let scene: DarkMatter
    try {
      scene = new DarkMatter(canvas)
    } catch (err) {
      // No WebGL: the page still works, just without the sphere
      console.warn('WebGL unavailable', err)
      return
    }

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      scene.update((now - last) / 1000, audio.read())
      last = now
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const ro = new ResizeObserver(() => scene.resize())
    ro.observe(canvas)

    const onPointer = (e: PointerEvent) =>
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    window.addEventListener('pointermove', onPointer)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      scene.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
}
