import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { track } from '../lib/audio'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

const LINKS = [
  { label: 'Home', href: '#', match: (h: string) => !h.startsWith('#work') && !h.startsWith('#about') },
  { label: 'Work', href: '#work', match: (h: string) => h.startsWith('#work') },
  { label: 'About', href: '#about', match: (h: string) => h.startsWith('#about') },
  { label: 'Contact', href: `mailto:${config.email}`, match: () => false },
]

// The opening grows out of the button (top right) as a circle wide enough to cover the screen, and
// closes back into it. Its edge is a wide soft gradient into transparency (FEATHER), not a line, so
// it spreads like a blur rather than a cut. --r is its outer radius.
const FEATHER = '40vmax'
const reveal = `radial-gradient(circle at calc(100% - 60px) 60px, #000 calc(var(--r) - ${FEATHER}), transparent var(--r))`

export function Menu() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(-1)
  const [hash, setHash] = useState(() => window.location.hash)
  const reduced = useReducedMotion()
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const id = setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 400)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(id)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setHovered(-1)
  }

  return (
    <>
      {/* Two drops of the mass's material, each adrift. Hovered, they draw together and melt into
          one another through a neck (a gooey filter, as the mass's own volumes merge); open, each
          stretches into a rounded bar and they cross into an ×, melted together where they meet. */}
      <button
        type="button"
        onClick={() => {
          setHash(window.location.hash)
          setOpen((o) => !o)
        }}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="lift-drop group relative z-50 size-10 text-glow transition-colors duration-300 hover:text-white"
      >
        <svg viewBox="0 0 40 40" className="size-full overflow-visible" fill="currentColor" aria-hidden>
          <defs>
            <filter id="menu-goo" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="soft" />
              <feColorMatrix in="soft" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
            </filter>
          </defs>
          <g filter="url(#menu-goo)">
            {[0, 1].map((i) => (
              <ellipse
                key={i}
                cy="20"
                className={`menu-drop transition-[cx,rx,ry,rotate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open
                    ? `[cx:20px] [rx:15px] [ry:2.8px] ${i === 0 ? 'rotate-45' : '-rotate-45'}`
                    : i === 0
                      ? '[cx:11.5px] [rx:6.6px] [ry:6.6px] group-hover:[cx:15.5px]'
                      : '[cx:28.5px] [rx:6.6px] [ry:6.6px] group-hover:[cx:24.5px]'
                }`}
                style={{
                  transformBox: 'view-box',
                  transformOrigin: '20px 20px',
                  animationDelay: `${i * -3.1}s`,
                  animationDuration: `${6 + i * 1.7}s`,
                }}
              />
            ))}
          </g>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduced ? { opacity: 0 } : { '--r': '0vmax' }}
            animate={reduced ? { opacity: 1 } : { '--r': '190vmax' }}
            exit={reduced ? { opacity: 0 } : { '--r': '0vmax', transition: { duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.15 } }}
            transition={{ duration: 1.8, ease: [0.33, 0, 0.2, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-bg/85 backdrop-blur-xl"
            style={{ paddingLeft: 40, paddingRight: 40, ...(reduced ? {} : { maskImage: reveal, WebkitMaskImage: reveal }) }}
          >
            <nav aria-label="Main" className="flex flex-1 flex-col justify-center">
              <ul onPointerLeave={() => setHovered(-1)}>
                {LINKS.map((l, i) => {
                  const current = l.match(hash)
                  const dim = hovered !== -1 && hovered !== i
                  const lit = hovered === i
                  return (
                    <li key={l.label} className="overflow-hidden pr-4 pb-2">
                      <motion.a
                        ref={i === 0 ? firstLink : undefined}
                        href={l.href}
                        onClick={close}
                        onPointerEnter={() => setHovered(i)}
                        // Lit by focus only when it's the keyboard's (not the focus given on opening)
                        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHovered(i)}
                        onBlur={() => setHovered(-1)}
                        initial={{ y: '110%' }}
                        animate={{ y: '0%', transition: { duration: 0.8, ease, delay: 0.7 + i * 0.08 } }}
                        exit={{ y: '110%', transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1], delay: (LINKS.length - 1 - i) * 0.04 } }}
                        className="group flex items-baseline gap-5 outline-none sm:gap-8"
                        style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 0.5s' }}
                      >
                        <span
                          className={`w-8 shrink-0 text-phi-xs font-light tabular-nums tracking-[0.35em] transition-colors duration-500 ${current || lit ? 'text-glow' : 'text-white/45'}`}
                        >
                          {pad(i + 1)}
                        </span>
                        <span
                          className={`lift-shadow font-display text-phi-lg font-bold uppercase leading-[0.95] transition-[letter-spacing,color] duration-700 sm:text-phi-xl lg:text-phi-2xl ${lit ? 'text-glow' : 'text-cream'}`}
                          style={{ letterSpacing: lit ? '0.01em' : '-0.02em' }}
                        >
                          {l.label}
                        </span>
                        <span
                          aria-hidden
                          className="text-phi-md text-glow transition-[opacity,translate] duration-500 ease-out sm:text-phi-lg"
                          style={{ opacity: lit ? 1 : 0, translate: lit ? '0 0' : '-0.4em 0' }}
                        >
                          →
                        </span>
                        {current && <span className="sr-only">(current page)</span>}
                      </motion.a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Who, how to reach, and the music's credit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8, delay: 1.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              // Clear of the sound button, which stays in the corner over the menu
              className="flex flex-col gap-3 border-t border-white/10 pt-5 pr-16 pb-8 text-phi-xs uppercase tracking-[0.25em] text-white/45 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span>
                {config.name} — {config.role}
              </span>
              <a href={`mailto:${config.email}`} className="text-glow transition-colors duration-300 hover:text-white">
                {config.email}
              </a>
              <a href={track.url} target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-glow">
                Music: “{track.title}” — {track.artist} · {track.license}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
