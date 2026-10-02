import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { track } from '../lib/audio'

const LINKS = [
  { label: 'Home', href: '#' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export function Menu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="relative z-50 grid size-10 grid-cols-2 place-items-center gap-1 p-2 text-cream transition-transform duration-500 hover:rotate-45"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="size-3 rounded-full bg-current" />
        ))}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-black/90 px-8 backdrop-blur-md sm:px-16"
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-[clamp(2.5rem,8vw,6rem)] font-bold leading-none text-cream/80 transition-colors hover:text-cream"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href={track.url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-6 left-8 text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white/70 sm:left-16"
            >
              Music: “{track.title}” — {track.artist} · {track.license}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
