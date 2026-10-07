import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { config } from '../config'
import { ABOUT_OPEN_AT_S, aboutLayout } from '../lib/about'
import { object } from '../lib/scene'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

const ROLE = 'Audiovisual Specialist'
const PLACE = 'Athens, Greece'
const SUMMARY =
  'Multidisciplinary designer with a background spanning graphic design, motion graphics, video, web and digital production — most at home where design, motion, technology and audiovisual production come together.'
const EXPERIENCE = [
  { company: 'Andreadis Audiovisual', role: 'Audiovisual Specialist', years: '2026 — Present' },
  { company: 'Kontra Channel', role: 'Graphic & Motion Designer', years: '2018 — 2025' },
  { company: 'Straktor Media', role: 'Co-Founder & Creative Designer', years: '2016 — 2024' },
  { company: 'Freelance', role: 'Graphic, Motion & Digital Designer', years: '2010 — Present' },
]
const EDUCATION = [
  { school: 'IEK AKMI', field: 'Graphic Design', years: '2010 — 2012' },
  { school: 'IEK AKMI', field: 'Photography', years: '2007 — 2009' },
]
const SKILLS = ['Motion Graphics', 'Graphic Design', 'Brand Identity', 'Visual Communication', 'Video', 'Live Production', 'Digital Experiences']
const LINKEDIN = 'https://www.linkedin.com/in/michail-androulakis'

// Each line is uncovered from left to right, as the ABOUT label is, once the portrait has begun to
// rise; leaving, it's covered again toward the left. The clip reaches past the line so its shadow
// isn't cut.
const SHUT = 'inset(-30% 100% -60% -10%)'
const OPEN = 'inset(-30% -10% -60% -10%)'
const line = {
  hidden: { clipPath: SHUT },
  shown: (k: number) => ({ clipPath: OPEN, transition: { duration: 0.9, ease, delay: ABOUT_OPEN_AT_S - 0.2 + k * 0.06 } }),
  gone: { clipPath: SHUT, transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] as const } },
}

function Line({ k, children, className = '' }: { k: number; children: ReactNode; className?: string }) {
  return (
    <motion.div custom={k} variants={line} className={className}>
      {children}
    </motion.div>
  )
}

const label = 'text-[0.62em] font-light uppercase tabular-nums tracking-[0.35em] text-white/50'

function useLayout() {
  const [layout, setLayout] = useState(() => aboutLayout(window.innerWidth, window.innerHeight))
  useEffect(() => {
    const onResize = () => setLayout(aboutLayout(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}

export function About() {
  const { portrait, frame, text } = useLayout()
  const photo = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(-1)

  // The portrait rides the canvas's frame: it rises open with the cut-out the material makes for it
  useEffect(() => {
    object.onAboutFrame = (r) => {
      const el = photo.current
      if (!el) return
      el.style.clipPath = `inset(${((1 - r) * 100).toFixed(2)}% 0 0 0 round 6px)`
      el.style.opacity = String(Math.min(r / 0.3, 1))
      el.style.setProperty('--rise', (1 - r).toFixed(4))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.location.hash = ''
    }
    window.addEventListener('keydown', onKey)
    return () => {
      object.onAboutFrame = null
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const entry = (i: number) => ({
    onPointerEnter: () => setHovered(i),
    onPointerLeave: () => setHovered(-1),
    style: { opacity: hovered === -1 || hovered === i ? 1 : 0.55, transition: 'opacity 0.5s' },
  })
  const title = (i: number) =>
    `font-display font-bold uppercase leading-none transition-[letter-spacing,color] duration-500 ${hovered === i ? 'text-glow' : 'text-cream'}`
  const titleStyle = (i: number): CSSProperties => ({ fontSize: '1.32em', letterSpacing: hovered === i ? '0.02em' : '-0.01em' })

  // Type is sized to the room the column has, so the CV always fits the one screen
  const room = text.bottom - text.top
  const size = Math.min(Math.max(Math.min(room / (portrait ? 44 : 48), text.width / (portrait ? 30 : 42)), 9), 17)

  return (
    // No opacity or transform of its own: the portrait must stay under the canvas, the CV over it.
    // It stays while its lines are covered again and the portrait closes.
    <motion.div
      initial="hidden"
      animate="shown"
      exit="gone"
      variants={{ gone: { opacity: 1, transition: { duration: 0.5 } } }}
      className="absolute inset-0"
    >
      <div
        ref={photo}
        className="absolute z-0 overflow-hidden rounded-[6px] bg-black opacity-0"
        style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      >
        <img
          src="/about/portrait.jpg"
          alt={config.name}
          className="size-full object-cover"
          style={{ transform: 'translateY(calc(var(--rise, 0) * 8%)) scale(calc(1 + var(--rise, 0) * 0.06))' }}
        />
      </div>

      <section
        aria-label="About"
        className="lift-shadow absolute z-[2] flex flex-col justify-center"
        style={{ left: text.left, top: text.top, width: text.width, height: room, fontSize: size }}
      >
        <Line k={0}>
          <p className={label}>About</p>
        </Line>
        <div
          role="heading"
          aria-level={1}
          className="mt-[0.9em] font-display font-bold uppercase leading-[0.9] tracking-[-0.01em] text-cream"
          style={{ fontSize: portrait ? '3.2em' : '4.2em' }}
        >
          {config.name.split(' ').map((w, i) => (
            <Line key={w} k={1 + i}>
              {w}
            </Line>
          ))}
        </div>
        <Line k={3} className="mt-[1.2em]">
          <p className={label}>
            {ROLE} — {PLACE}
          </p>
        </Line>
        {!portrait && (
          <Line k={4} className="mt-[1.4em] max-w-[34em]">
            <p className="text-[0.92em] font-light leading-relaxed text-white/70">{SUMMARY}</p>
          </Line>
        )}

        <div className={`mt-[2.6em] grid gap-x-[3em] gap-y-[2em] ${portrait ? 'grid-cols-1' : 'grid-cols-[1.25fr_1fr]'}`}>
          <div>
            <Line k={5}>
              <p className={label}>Experience</p>
            </Line>
            <ul className={`mt-[1.1em] ${portrait ? 'grid grid-cols-2 gap-x-[2em] gap-y-[1.2em]' : 'space-y-[1.25em]'}`}>
              {EXPERIENCE.map((e, i) => (
                <li key={e.company} {...entry(i)}>
                  <Line k={6 + i}>
                    <p className={label}>
                      {pad(i + 1)} / {pad(EXPERIENCE.length)} · {e.years}
                    </p>
                    <p className={`mt-[0.5em] ${title(i)}`} style={titleStyle(i)}>
                      {e.company}
                    </p>
                    <p className="mt-[0.4em] text-[0.8em] font-light text-white/50">{e.role}</p>
                  </Line>
                </li>
              ))}
            </ul>
          </div>

          <div className={portrait ? 'grid grid-cols-2 gap-x-[2em] gap-y-[1.6em]' : 'space-y-[2em]'}>
            <div>
              <Line k={10}>
                <p className={label}>Education</p>
              </Line>
              <ul className="mt-[1.1em] space-y-[1em]">
                {EDUCATION.map((e, j) => {
                  const i = EXPERIENCE.length + j
                  return (
                    <li key={e.field} {...entry(i)}>
                      <Line k={11 + j}>
                        <p className={label}>{e.years}</p>
                        <p className={`mt-[0.5em] ${title(i)}`} style={{ ...titleStyle(i), fontSize: '1.05em' }}>
                          {e.field}
                        </p>
                        <p className="mt-[0.4em] text-[0.8em] font-light text-white/50">{e.school}</p>
                      </Line>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <Line k={13}>
                <p className={label}>Skills</p>
              </Line>
              <Line k={14} className="mt-[1.1em]">
                <p className="text-[0.8em] font-light leading-[1.9] text-white/70">{SKILLS.join(' / ')}</p>
              </Line>
            </div>
            <div className={portrait ? 'col-span-2' : ''}>
              <Line k={15}>
                <p className={label}>Contact</p>
              </Line>
              <Line k={16} className="mt-[1.1em]">
                <p className="flex flex-wrap gap-x-[1.6em] gap-y-[0.4em] text-[0.8em] font-medium">
                  <a href={`mailto:${config.email}`} className="text-cream transition-colors duration-300 hover:text-glow">
                    {config.email}
                  </a>
                  <a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-cream transition-colors duration-300 hover:text-glow">
                    LinkedIn ↗
                  </a>
                </p>
              </Line>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
