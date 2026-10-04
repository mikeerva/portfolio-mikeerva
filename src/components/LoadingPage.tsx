import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useResourceLoader } from '../hooks/useResourceLoader'
import { audio } from '../lib/audio'

interface Props {
  // The screen has started lifting enough for the Hero beneath to be seen forming
  onStart: () => void
  onComplete: () => void
}

const FADE_OUT = 2
// When, into the fade, the Hero starts forming
const START_AFTER_MS = 400
// Longest the fade waits for the music to start, then for the page to run smoothly again
const MUSIC_WAIT_MS = 400
const SETTLE_MAX_MS = 700

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Resolves once several frames in a row have arrived on time, or after `maxMs`
function untilSmooth(maxMs: number) {
  return new Promise<void>((resolve) => {
    const start = performance.now()
    let last = start
    let smooth = 0
    const tick = (now: number) => {
      smooth = now - last < 25 ? smooth + 1 : 0
      last = now
      if (smooth >= 6 || now - start > maxMs) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

export function LoadingPage({ onStart, onComplete }: Props) {
  const { progress, isReady } = useResourceLoader()
  const [leaving, setLeaving] = useState(false)
  const started = useRef(false)

  const start = () => {
    if (started.current) return
    started.current = true
    // Starting the music briefly stalls the page once, a little after playback reports it has
    // begun (the audio device opening). The fade waits for the music and then for the page to
    // run smoothly again (never long), so that stall lands while the screen is still rather
    // than in the fade's first frames.
    const music = audio.play().catch(() => {})
    void Promise.race([music, wait(MUSIC_WAIT_MS)])
      .then(() => untilSmooth(SETTLE_MAX_MS))
      .then(() => {
        setLeaving(true)
        // The fade eases in, so the Hero only starts to show a moment after it begins
        setTimeout(onStart, START_AFTER_MS)
        setTimeout(onComplete, FADE_OUT * 1000)
      })
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: FADE_OUT, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] grid place-items-center bg-bg"
    >
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div
            key="count"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-bold tabular-nums text-glow flex items-baseline gap-1"
          >
            <span className="text-phi-xl leading-none">{progress}</span>
            <span className="text-phi-md">%</span>
          </motion.div>
        ) : (
          <motion.button
            key="cta"
            type="button"
            onClick={start}
            initial={{ opacity: 0 }}
            // Light type on dark stays legible at low opacity, so on leaving it fades a little
            // ahead of the screen and is gone when the screen visibly is
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={leaving ? { duration: FADE_OUT * 0.7, ease: 'easeInOut' } : { duration: 1 }}
            className={`cursor-pointer font-light uppercase transition-[color,letter-spacing,font-size] duration-500 ease-out ${
              // It grows by its font size, not a scale, so the type stays crisp through the change
              // instead of snapping sharp at the end. Once pressed it stays as hovered while the
              // screen fades, rather than easing back.
              leaving
                ? 'text-[1.04rem] tracking-[0.45em] text-white'
                : 'text-phi-sm tracking-[0.35em] text-glow hover:text-[1.04rem] hover:tracking-[0.45em] hover:text-white'
            }`}
          >
            Start Experience
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
