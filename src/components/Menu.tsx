import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { object } from '../lib/scene'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

const LINKS = [
  { label: 'Home', href: '#', match: (h: string) => !h.startsWith('#work') && !h.startsWith('#about') },
  { label: 'Work', href: '#work', match: (h: string) => h.startsWith('#work') },
  { label: 'About', href: '#about', match: (h: string) => h.startsWith('#about') },
  { label: 'Contact', href: `mailto:${config.email}`, match: () => false },
]

// The menu is the button's material: its two drops swell into a body of the purple liquid that
// floods the screen from the button, its front a soft blurred gradient, and drain back into it on
// closing. The liquid is a little translucent, over the page blurred behind it.
const white = (a: number) => `rgb(255 255 255 / ${a})`
// How see-through the liquid is: enough to show the blurred page through it
const LIQUID_OPACITY = 0.78
// The blur behind spreads with the liquid, as a circle from the button with a wide soft edge
const FROST_FEATHER = 0.4

// Drops that run ahead of the body as it spreads, so its front is uneven, like poured liquid:
// [direction (degrees, screen space: 90 = down, 180 = left), reach and radius (fractions of the
// distance to the far corner), delay (s)]
const DROPS: [number, number, number, number][] = [
  [178, 0.62, 0.2, 0],
  [146, 0.72, 0.24, 0.06],
  [118, 0.58, 0.22, 0.03],
  [94, 0.66, 0.18, 0.1],
  [162, 0.9, 0.14, 0.14],
  [132, 0.95, 0.16, 0.18],
  [104, 0.88, 0.13, 0.2],
]
const pour = [0.65, 0, 0.25, 1] as const

// A link's letters (k, from 1; 0 is its number) condense out of the liquid once it has spread:
// each comes into focus from a soft blur, settling from slightly larger and lower, one after
// another along the word and the links. Closing, they dissolve back into blur.
const condense = (i: number, k: number) => ({
  initial: { opacity: 0, filter: 'blur(14px)', y: '0.16em', scale: 1.22 },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    y: '0em',
    scale: 1,
    transition: { duration: 0.95, ease, delay: 0.7 + i * 0.09 + k * 0.035 },
  },
  exit: {
    opacity: 0,
    filter: 'blur(12px)',
    scale: 1.08,
    transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] as const, delay: (LINKS.length - 1 - i) * 0.03 },
  },
})

// How soft the liquid's front is (px): a wide blur, so it spreads as a gradient rather than a line
const BLUR = 56

function Liquid({ origin: [ox, oy], size: [w, h] }: { origin: [number, number]; size: [number, number] }) {
  // Drawn past the screen's edges, so the blur never fades them once it has filled the screen
  const pad = BLUR * 3
  // Far enough to cover the screen, blurred front and all
  const far = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy)) * 1.08 + pad
  const rad = (deg: number) => (deg * Math.PI) / 180
  const feather = Math.max(w, h) * FROST_FEATHER
  const frost = `radial-gradient(circle at ${ox}px ${oy}px, #000 calc(var(--r) - ${feather}px), transparent var(--r))`
  return (
    <>
      {/* the page behind, blurred where the liquid has reached */}
      <motion.div
        aria-hidden
        className="absolute inset-0 backdrop-blur-xl"
        style={{ maskImage: frost, WebkitMaskImage: frost }}
        initial={{ '--r': '0px' }}
        animate={{ '--r': `${far + feather}px`, transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] } }}
        exit={{ '--r': '0px', transition: { duration: 0.75, ease: [0.5, 0, 0.75, 0.4], delay: 0.1 } }}
      />
    <svg
      aria-hidden
      className="absolute"
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      style={{ left: -pad, top: -pad, width: w + pad * 2, height: h + pad * 2, filter: `blur(${BLUR}px)`, opacity: LIQUID_OPACITY }}
    >
      <defs>
        {/* lit from where it pours, deepening away from it, like the mass's own material */}
        <radialGradient id="menu-liquid-fill" gradientUnits="userSpaceOnUse" cx={ox} cy={oy} r={far}>
          <stop offset="0" stopColor="#7a76ff" />
          <stop offset="0.45" stopColor="#5653c8" />
          <stop offset="1" stopColor="#2c2a7a" />
        </radialGradient>
      </defs>
      <g fill="url(#menu-liquid-fill)">
        <motion.circle
          cx={ox}
          cy={oy}
          initial={{ r: 0 }}
          // The body sets off with the drops, so none of them parts from it and leaves a gap
          animate={{ r: far, transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] } }}
          exit={{ r: 0, transition: { duration: 0.75, ease: [0.5, 0, 0.75, 0.4], delay: 0.1 } }}
        />
        {DROPS.map(([deg, reach, r, delay], i) => (
          <motion.circle
            key={i}
            initial={{ cx: ox, cy: oy, r: 0 }}
            animate={{
              cx: ox + Math.cos(rad(deg)) * reach * far,
              cy: oy + Math.sin(rad(deg)) * reach * far,
              r: r * far,
              transition: { duration: 0.95, ease: pour, delay },
            }}
            exit={{ cx: ox, cy: oy, r: 0, transition: { duration: 0.6, ease: [0.5, 0, 0.75, 0.4], delay: 0.1 + delay * 0.5 } }}
          />
        ))}
      </g>
    </svg>
    </>
  )
}

export function Menu() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(-1)
  // The link the hover drop sits by: the last one hovered, kept while the pointer is between words
  const [dropAt, setDropAt] = useState(-1)
  // Whether it came from another link (so it glides over, fully visible) rather than appearing
  const [dropMoved, setDropMoved] = useState(false)
  const hover = (i: number) => {
    setHovered(i)
    setDropMoved(dropAt !== -1 && dropAt !== i)
    setDropAt(i)
  }
  const [hash, setHash] = useState(() => window.location.hash)
  const reduced = useReducedMotion()
  const firstLink = useRef<HTMLAnchorElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  // Where the liquid pours from (the button's centre) and the screen it fills
  const [origin, setOrigin] = useState<[number, number]>([0, 0])
  const [size, setSize] = useState<[number, number]>([1, 1])
  const measure = () => {
    const b = button.current?.getBoundingClientRect()
    if (b) setOrigin([b.left + b.width / 2, b.top + b.height / 2])
    setSize([window.innerWidth, window.innerHeight])
  }

  // The open menu is an entry of its own in the browser's history, so the back button closes it
  // rather than leaving the page under it. Whether that entry is still there:
  const inHistory = useRef(false)

  const openMenu = () => {
    setHash(window.location.hash)
    measure()
    history.pushState({ menu: true }, '')
    inHistory.current = true
    setDropAt(-1)
    setDropMoved(false)
    setOpen(true)
  }

  // Closed from inside the menu (×, Escape, Contact): its history entry is taken back too
  const close = () => {
    if (inHistory.current) {
      inHistory.current = false
      history.back()
    }
    setOpen(false)
    setHovered(-1)
  }

  // A link to another view: it takes the menu's place in history, so back from there returns to
  // the page the menu was opened over, not to the menu
  const go = (href: string) => {
    if (inHistory.current) {
      inHistory.current = false
      const oldURL = window.location.href
      history.replaceState(null, '', href)
      window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: window.location.href }))
    } else {
      window.location.assign(href)
    }
    setOpen(false)
    setHovered(-1)
  }

  // Once the liquid has filled the screen, the canvas beneath it is only seen blurred and tinted:
  // it holds still there, sparing the GPU both its own drawing and the blur re-made every frame
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => (object.menuCovered = true), 1300)
    return () => {
      clearTimeout(id)
      object.menuCovered = false
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    // The browser's back button, with the menu open: it closes the menu
    const onPop = () => {
      if (!inHistory.current) return
      inHistory.current = false
      setOpen(false)
      setHovered(-1)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    window.addEventListener('resize', measure)
    const id = setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 400)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('resize', measure)
      clearTimeout(id)
    }
  }, [open])

  return (
    <>
      {/* Two drops of the mass's material, each adrift. Hovered, they draw together and melt into
          one another through a neck (a gooey filter, as the mass's own volumes merge); open, each
          stretches into a rounded bar and they cross into an ×, melted together where they meet. */}
      <button
        ref={button}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        // White on the liquid, so the × reads against it
        className={`lift-drop group relative z-50 size-10 transition-colors duration-500 hover:text-white ${open ? 'text-white' : 'text-glow'}`}
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
            className="fixed inset-0 z-40 flex flex-col overflow-hidden"
            style={{ paddingLeft: 40, paddingRight: 40, color: '#fff' }}
            // Stays until the liquid has drained back into the button
            exit={{ opacity: 1, transition: { duration: 0.9 } }}
          >
            {reduced ? (
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#7a76ffc7,#5653c8c7_45%,#2c2a7ac7)] backdrop-blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : (
              <Liquid origin={origin} size={size} />
            )}

            <nav aria-label="Main" className="relative flex flex-1 flex-col justify-center">
              <ul onPointerLeave={() => setHovered(-1)}>
                {LINKS.map((l, i) => {
                  const current = l.match(hash)
                  const dim = hovered !== -1 && hovered !== i
                  const lit = hovered === i
                  return (
                    <li key={l.label} className="pr-4 pb-2">
                      <motion.a
                        ref={i === 0 ? firstLink : undefined}
                        href={l.href}
                        onClick={(e) => {
                          if (l.href.startsWith('mailto:')) return close()
                          e.preventDefault()
                          go(l.href)
                        }}
                        // Lit by focus only when it's the keyboard's (not the focus given on opening)
                        onFocus={(e) => e.currentTarget.matches(':focus-visible') && hover(i)}
                        onBlur={() => setHovered(-1)}
                        // Only as wide as its word, so the empty row beside it is not a target
                        className="inline-flex items-baseline gap-5 outline-none sm:gap-8"
                        style={{ opacity: dim ? 0.38 : 1, transition: 'opacity 0.5s' }}
                      >
                        <motion.span
                          {...condense(i, 0)}
                          className="w-8 shrink-0 text-phi-xs font-medium tabular-nums tracking-[0.35em] transition-colors duration-500"
                          style={{ color: current || lit ? '#fff' : white(0.55) }}
                        >
                          {pad(i + 1)}
                        </motion.span>
                        {/* Lit only while the pointer is on the letters themselves */}
                        <span
                          onPointerEnter={() => hover(i)}
                          onPointerLeave={() => setHovered((h) => (h === i ? -1 : h))}
                          // Hovered, the word opens up, as the category names in Work do
                          className="lift-shadow relative font-display text-phi-lg font-bold uppercase leading-[0.95] transition-[letter-spacing,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-phi-xl lg:text-phi-2xl"
                          style={{ letterSpacing: lit ? '0.04em' : '-0.02em', translate: lit ? '0.08em 0' : '0 0' }}
                        >
                          {/* letter by letter, each condensing out of the blurred liquid */}
                          <span aria-hidden>
                            {[...l.label].map((ch, k) => (
                              <motion.span key={k} {...condense(i, k + 1)} className="inline-block">
                                {ch}
                              </motion.span>
                            ))}
                          </span>
                          <span className="sr-only">{l.label}</span>
                          {/* A drop that glides from one link to the next, following the pointer. It
                              stays with the last link while the pointer crosses the gap between
                              words, so its glide is never cut short, and only fades once the
                              pointer has left the words for a moment. */}
                          {dropAt === i && (
                            <motion.span
                              layoutId="menu-drop"
                              aria-hidden
                              className="absolute left-full ml-[0.3em] size-[0.26em]"
                              style={{ top: 'calc(50% - 0.13em)' }}
                              // Only its glide is animated here: a slow, even one that eases out as
                              // it arrives
                              transition={{ type: 'tween', duration: 0.95, ease: [0.4, 0, 0.15, 1] }}
                            >
                              {/* Its fading is kept apart from the glide, in plain CSS, so the two
                                  never interrupt each other: it fades in when it first appears (not
                                  when it moves to another link, where it's drawn anew), and fades
                                  out, after a moment, once the pointer has left the words */}
                              <span
                                className={`block size-full transition-[opacity,scale] duration-500 ease-out ${dropMoved ? '' : 'menu-drop-in'}`}
                                style={{
                                  opacity: hovered === -1 ? 0 : 1,
                                  scale: hovered === -1 ? '0.9' : '1',
                                  transitionDelay: hovered === -1 ? '0.25s' : '0s',
                                }}
                              >
                                {/* ...and, wherever it is, it floats */}
                                <span className="menu-float block size-full rounded-full bg-white" />
                              </span>
                            </motion.span>
                          )}
                        </span>
                        {current && <span className="sr-only">(current page)</span>}
                      </motion.a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Who, and how to reach */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8, delay: 1.0 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="relative flex flex-col gap-3 border-t pt-5 pb-8 text-phi-xs font-medium uppercase tracking-[0.25em] sm:flex-row sm:items-baseline sm:justify-between"
              style={{ borderColor: white(0.18), color: white(0.6) }}
            >
              <span>
                {config.name} — {config.role}
              </span>
              <a href={`mailto:${config.email}`} className="text-white transition-colors duration-300 hover:text-glow">
                {config.email}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
