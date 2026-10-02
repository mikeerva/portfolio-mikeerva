import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Category } from '../config'
import { scene } from '../lib/scene'

const ease = [0.22, 1, 0.36, 1] as const
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

const cardWidth = () => Math.min(window.innerWidth * 0.72, window.innerHeight * 0.5)

function useCardWidth() {
  const [w, setW] = useState(cardWidth)
  useEffect(() => {
    const onResize = () => setW(cardWidth())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

type Work = Category['works'][number]

function Card({
  work,
  index,
  position,
  tilt,
  spacing,
  onSelect,
}: {
  work: Work
  index: number
  position: MotionValue<number>
  tilt: MotionValue<number>
  spacing: number
  onSelect: () => void
}) {
  const d = useTransform(position, (p) => index - p)
  const x = useTransform(d, (v) => v * spacing)
  const rotateY = useTransform([d, tilt], ([v, t]: number[]) => clamp(-v * 28, -55, 55) + t)
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 2) * 0.14)
  const filter = useTransform(d, (v) => {
    const a = Math.min(Math.abs(v), 2)
    return `blur(${a * 3}px) brightness(${1 - a * 0.25})`
  })
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10))
  // A light glare that slides across the surface as the card turns
  const glare = useTransform(
    d,
    (v) => `radial-gradient(120% 80% at ${50 + clamp(v, -1.5, 1.5) * 45}% 0%, rgba(255,255,255,0.28), transparent 60%)`,
  )

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`${work.title}, ${work.year}`}
      style={{ x, rotateY, scale, filter, zIndex }}
      className="absolute inset-0 overflow-hidden rounded-[28px] text-left text-cream shadow-2xl shadow-black/60 outline-none"
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${work.color} 0%, #0b0b12 78%)` }} />
      <motion.div className="absolute inset-0" style={{ background: glare }} />
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/15" />
      <span className="absolute left-6 top-6 text-sm font-semibold tabular-nums opacity-80">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="absolute inset-x-6 bottom-6">
        <p className="text-sm font-semibold opacity-70">{work.year}</p>
        <h3 className="font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-bold leading-none">{work.title}</h3>
      </div>
    </motion.button>
  )
}

export function WorkSlider({ category }: { category: Category }) {
  const { works } = category
  const last = works.length - 1
  const position = useMotionValue(0)
  const [active, setActive] = useState(0)
  const dragged = useRef(false)
  const cardW = useCardWidth()
  const spacing = cardW * 1.08
  // Cards lean into the drag direction while moving fast
  const tilt = useSpring(useTransform(useVelocity(position), [-6, 6], [14, -14]), { stiffness: 220, damping: 30 })
  const progress = useTransform(position, (p) => (last ? clamp(p / last, 0, 1) : 1))

  useEffect(
    () =>
      position.on('change', (v) => {
        scene.position = v
        setActive(clamp(Math.round(v), 0, last))
      }),
    [last, position],
  )

  const goTo = (i: number) => {
    animate(position, clamp(i, 0, last), { type: 'spring', stiffness: 170, damping: 26 })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(Math.round(position.get()) + 1)
      else if (e.key === 'ArrowLeft') goTo(Math.round(position.get()) - 1)
      else if (e.key === 'Escape') window.location.hash = '#work'
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    position.stop()
    dragged.current = false
    const startX = e.clientX
    const startPos = position.get()
    let lastX = startX
    let lastT = performance.now()
    let vx = 0

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      if (Math.abs(dx) > 6) dragged.current = true
      const now = performance.now()
      vx = (ev.clientX - lastX) / Math.max(now - lastT, 1)
      lastX = ev.clientX
      lastT = now
      const p = startPos - dx / spacing
      // Rubber-band past the first and last card
      position.set(p < 0 ? p * 0.3 : p > last ? last + (p - last) * 0.3 : p)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (performance.now() - lastT > 80) vx = 0
      goTo(Math.round(position.get() - (vx * 250) / spacing))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease }}
        className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8"
      >
        <a
          href="#work"
          onPointerDown={(e) => e.stopPropagation()}
          className="text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:text-lg"
        >
          ← {category.name}
        </a>
      </motion.div>

      {works.map((work, i) => (
        <motion.div
          key={work.title}
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55 + i * 0.08, duration: 0.9, ease }}
          className="absolute left-1/2 top-1/2"
          style={{ width: cardW, height: cardW * 1.3, marginLeft: -cardW / 2, marginTop: -cardW * 0.65, perspective: 1400 }}
        >
          <Card
            work={work}
            index={i}
            position={position}
            tilt={tilt}
            spacing={spacing}
            onSelect={() => {
              if (!dragged.current && i !== active) goTo(i)
            }}
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute bottom-5 left-5 z-20 flex items-center gap-4 text-sm font-semibold tabular-nums text-cream sm:bottom-8 sm:left-8"
      >
        <span>{String(active + 1).padStart(2, '0')}</span>
        <span className="relative h-[2px] w-24 overflow-hidden bg-cream/25 sm:w-32">
          <motion.span className="absolute inset-0 origin-left bg-cream" style={{ scaleX: progress }} />
        </span>
        <span className="opacity-60">{String(works.length).padStart(2, '0')}</span>
        <span className="ml-4 hidden opacity-50 sm:inline">drag ←→</span>
      </motion.div>
    </motion.section>
  )
}
