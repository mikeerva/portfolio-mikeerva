import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useResourceLoader } from '../hooks/useResourceLoader'
import { audio } from '../lib/audio'

interface Props {
  onComplete: () => void
}

const FADE_OUT = 2

export function LoadingPage({ onComplete }: Props) {
  const { progress, isReady } = useResourceLoader()
  const [leaving, setLeaving] = useState(false)

  const start = () => {
    if (leaving) return
    setLeaving(true)
    void audio.play().catch(() => {})
    setTimeout(onComplete, FADE_OUT * 1000)
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
            className="font-display font-bold tabular-nums text-white/60 flex items-baseline gap-1"
          >
            <span className="text-6xl">{progress}</span>
            <span className="text-3xl">%</span>
          </motion.div>
        ) : (
          <motion.button
            key="cta"
            type="button"
            onClick={start}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="cursor-pointer text-sm font-light uppercase tracking-[0.35em] text-white/60 transition-colors duration-500 hover:text-white"
          >
            Start Experience
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
