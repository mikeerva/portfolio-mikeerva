import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createContext, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { afterPanelOpens } from '../../lib/scene'
import { ScrollerContext, useInView, useScrollProgress } from '../scroll'
import { PHOTOS, photoSrc, type PhotoKey } from './assets'
import './fold.css'
import { PATH, VIEWBOX } from './wordmark'

// FOLD — Brand Identity / Hospitality, 2026.
// The case study scrolls inside the project panel and is sized by it (cqw / cqh). It reads
// brief → idea → system → applications → closing. Chapters:
// 00 Opening · 01 The brief · 02 The idea · 03 The system · 04 The wordmark · 05 Packaging ·
// 06 Physical space · 07 Print & menu · 08 Digital (social, order ahead) · 09 Motion · 10 Closing

const LINE = 'Brunch / Bakery / Specialty coffee / All day'
const ROLE = 'Role — strategy, identity, packaging, print, space, digital, motion'

// The chapters' photographs start loading once the panel has opened, all of them, so they're
// there before the reader scrolls to them; fetched during the opening they'd compete with it.
// (Loaded only as each came near, they arrived late, visibly.) The opening's own two images
// load straight away.
const PhotosReady = createContext(false)

export function FoldCaseStudy() {
  const [photosReady, setPhotosReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    afterPanelOpens(() => cancelled).then((open) => open && setPhotosReady(true))
    return () => {
      cancelled = true
    }
  }, [])
  return (
    <PhotosReady.Provider value={photosReady}>
      <article className="fold" aria-label="Fold — Brand identity case study">
        <Opening />
        <Brief />
        <Idea />
        <System />
        <Wordmark />
        <Packaging />
        <Space />
        <Print />
        <Social />
        <Order />
        <Motion />
        <Closing />
      </article>
    </PhotosReady.Provider>
  )
}

// ---------------------------------------------------------------- building blocks

// Decorative unless given a label: the wordmark appears dozens of times and the name is already
// in the text around it, so a screen reader shouldn't read "FOLD" at every one
function Mark({ className = '', viewBox = VIEWBOX, style, label }: { className?: string; viewBox?: string; style?: CSSProperties; label?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      fill="currentColor"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path fillRule="evenodd" d={PATH} />
    </svg>
  )
}

// `focus`: the point of the photograph kept in view when its box crops it (object-position)
function Photo({ k, className = '', style, focus }: { k: PhotoKey; className?: string; style?: CSSProperties; focus?: string }) {
  const ready = useContext(PhotosReady)
  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <img
        ref={showWhenLoaded}
        src={ready ? photoSrc(k) : undefined}
        alt={PHOTOS[k].alt}
        decoding="async"
        className="fold-photo"
        style={focus ? { objectPosition: focus } : undefined}
        onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
        onError={(e) => e.currentTarget.classList.add('is-loaded')}
      />
    </div>
  )
}

// ...and one already loaded (from cache) before React attached onLoad shows at once
function showWhenLoaded(img: HTMLImageElement | null) {
  if (img?.complete && img.naturalWidth) img.classList.add('is-loaded')
}

// A chapter's small running head
function Head({ n, title, light = false, className = '' }: { n: string; title: string; light?: boolean; className?: string }) {
  return (
    <p className={`fold-mono flex gap-4 text-[10px] @2xl:text-[11px] ${light ? 'text-[var(--paper)]/60' : 'text-[var(--ink)]/55'} ${className}`}>
      <span>{n}</span>
      <span>—</span>
      <span>{title}</span>
    </p>
  )
}

// Reveals its children once when they come into view
function In({
  as: Tag = 'div',
  kind = 'rise',
  delay = 0,
  className = '',
  style,
  children,
}: {
  as?: 'div' | 'p' | 'h2' | 'h3' | 'figure' | 'li'
  kind?: 'rise' | 'open' | 'drop' | 'lines'
  delay?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const ref = useInView<HTMLElement>(kind === 'lines' ? 0.4 : kind === 'rise' ? 0.2 : 0.06)
  // A clip-reveal starts fully clipped, and the browser counts a fully clipped element as out
  // of view, so those are watched through an unclipped wrapper
  if (kind === 'open' || kind === 'drop')
    return (
      <Tag ref={ref as never} className={`fold-reveal-${kind} ${className}`} style={style}>
        <div className={`fold-${kind} relative size-full`} style={{ ['--d' as string]: `${delay}s` }}>
          {children}
        </div>
      </Tag>
    )
  return (
    <Tag
      ref={ref as never}
      className={`fold-${kind} ${className}`}
      style={{ ...style, ['--d' as string]: `${delay}s` }}
    >
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------- 00 Opening

// How far the reader has scrolled through the opening (0 at the top, 1 once it has gone),
// written to the section as --p so its layers can drift at different rates
function useOpeningProgress() {
  const ref = useRef<HTMLElement>(null)
  const scroller = useContext(ScrollerContext)
  useEffect(() => {
    const panel = scroller?.current
    const el = ref.current
    if (!panel || !el) return
    let raf = 0
    const update = () => {
      raf = 0
      el.style.setProperty('--p', Math.min(Math.max(panel.scrollTop / Math.max(el.offsetHeight, 1), 0), 1).toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    panel.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      panel.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [scroller])
  return ref
}

function Opening() {
  const ref = useOpeningProgress()
  return (
    // the photograph's own black, so where it ends there is no step in tone
    <section ref={ref} className="relative overflow-hidden bg-[#090806] text-[var(--paper)]" style={{ height: '100cqh', minHeight: 520 }}>
      {/* The campaign photograph, full bleed. Its black merges with the section's own black, so
          it has no visible edge. Wide panels: the whole hero, cropped to keep the cup on the
          right and the left side empty for the wordmark. Narrow panels: the lower part, so the
          cup stays whole and the wordmark sits in the black above it. It drifts and swells very
          slightly as the reader scrolls on. It's two layers: the ground, and the cup over it,
          which rises and turns a little faster than the ground, for depth. */}
      <div
        data-scroll
        className="absolute inset-x-0 bottom-0 h-[64%] [container-type:size] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] @2xl:inset-0 @2xl:h-full @2xl:[mask-image:none]"
        style={{ transform: 'translateY(calc(var(--p, 0) * 3cqh)) scale(calc(1 + var(--p, 0) * 0.03))', transformOrigin: '70% 60%' }}
      >
        {/* The photograph's frame, covering this box the way object-cover would (held at 78% across
            on narrow panels, 56% on wide ones), so the cup can be placed on it in its own units */}
        <div
          className="absolute [--fx:0.78] @2xl:[--fx:0.56]"
          style={
            {
              '--fw': 'max(100cqw, 100cqh * 1677 / 938)',
              width: 'var(--fw)',
              aspectRatio: '1677 / 938',
              left: 'calc((100cqw - var(--fw)) * var(--fx))',
              top: 'calc((100cqh - var(--fw) * 938 / 1677) * 0.5)',
            } as CSSProperties
          }
        >
          <img src={photoSrc('heroGround')} alt="" fetchPriority="high" decoding="async" className="absolute inset-0" />
          {/* centred where the cup stood in the original photograph, a little smaller */}
          <div
            data-scroll
            className="absolute"
            style={{
              left: '55.6%',
              top: '10%',
              width: '27%',
              aspectRatio: '753 / 1117',
              transformOrigin: '50% 60%',
              transform: 'translateY(calc(var(--p, 0) * -9cqh)) rotate(calc(var(--p, 0) * -5deg))',
            }}
          >
            <img src={photoSrc('heroCup')} alt={PHOTOS.heroCup.alt} fetchPriority="high" decoding="async" />
          </div>
        </div>
      </div>

      <div className="fold-mono absolute inset-x-[5cqw] top-[4.5cqh] flex justify-between text-[10px] text-[var(--paper)]/60 @2xl:text-[11px]">
        <span>Case study 01 / 04</span>
        <span className="text-right">Brand identity / Hospitality / 2026</span>
      </div>

      {/* the wordmark and its line, held together in the black on the left; they rise a little
          faster than the photograph as the reader scrolls, for depth */}
      <div
        data-scroll
        className="absolute left-[5cqw] top-[11cqh] w-[68cqw] @2xl:top-auto @2xl:bottom-[24cqh] @2xl:w-[47cqw]"
        style={{ transform: 'translateY(calc(var(--p, 0) * -7cqh))' }}
      >
        <In kind="open" delay={0.35}>
          <Mark label="FOLD" className="w-full text-[var(--paper)]" />
        </In>
        <In kind="lines" delay={0.6} className="fold-display mt-[3.5cqh]" style={{ fontSize: 'max(20px, 2.9cqw)' }}>
          <span>
            <span>Fold is a verb</span>
          </span>
          <span>
            <span className="text-[var(--signal)]">before it is a logo.</span>
          </span>
        </In>
        {/* what it is and what was done, kept with the wordmark in the black, clear of the
            photograph and of the corners of the panel */}
        <p className="fold-mono mt-[2.5cqh] max-w-[36ch] text-[10px] text-[var(--paper)]/55 @2xl:mt-[3cqh] @2xl:text-[11px]">
          {LINE}
          <br />
          <span className="text-[var(--paper)]/85">{ROLE}</span>
        </p>
      </div>

      {/* where to go next */}
      <p className="fold-mono absolute bottom-[4.5cqh] left-[9cqw] hidden text-[11px] text-[var(--paper)]/55 @2xl:block">
        Scroll to see the system ↓
      </p>
    </section>
  )
}

// ---------------------------------------------------------------- 01 The brief

// What the project is, for whom, and how far it goes — short enough to read at a glance; the
// idea itself is the next chapter's
const BRIEF: [string, string][] = [
  ['Context', 'A neighbourhood bakery and specialty coffee spot, open all day.'],
  ['Challenge', 'Be recognisable on a receipt, a cup and a storefront alike — while keeping a clear, welcoming character.'],
  ['Approach', 'Translate the everyday act of folding into a graphic language.'],
]
const FACTS = ['Hospitality', 'Athens', '2026', 'Personal concept', 'Identity system']

function Brief() {
  return (
    <section className="bg-[var(--paper)] px-[5cqw] pb-[9cqh] pt-[10cqh]">
      <Head n="01" title="The brief" />
      <div className="mt-5 grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <In kind="lines" className="fold-display" style={{ fontSize: 'max(32px, 5.6cqw)' }}>
          <span>
            <span>A brand for the</span>
          </span>
          <span>
            <span className="text-[var(--signal)]">rhythm of the city.</span>
          </span>
        </In>
        <In kind="rise" as="p" className="max-w-[44ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          Coffee on the way to work, a pastry carried across the street, a wrapper opened on a bench, a quick bite before moving on.
        </In>
      </div>
      <div className="mt-[7cqh] grid gap-[3.5cqh] border-t border-[var(--ink)]/15 pt-[3cqh] @2xl:grid-cols-3 @2xl:gap-[4cqw]">
        {BRIEF.map(([label, text], i) => (
          <In key={label} kind="rise" delay={i * 0.08}>
            <p className="fold-mono text-[10px] text-[var(--ink)]/50">{label}</p>
            <p className="mt-2 max-w-[34ch] text-[15px] leading-snug @2xl:text-[16px]">{text}</p>
          </In>
        ))}
      </div>
      <p className="fold-mono mt-[6cqh] flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--ink)]/55 @2xl:text-[11px]">
        {FACTS.map((f, i) => (
          <span key={f}>
            {f}
            {i < FACTS.length - 1 && <span className="ml-4 opacity-40">·</span>}
          </span>
        ))}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------- 02 The idea

// One gesture, repeated all day: the statement across the top, then the city photograph with
// the reasoning and the objects beside it (both columns start and end level), then the day
// itself as a sequence of everyday moments, the fold among them.
const DAY: [string, string][] = [
  ['Morning', 'Grab'],
  ['On the way', 'Carry'],
  ['A break', 'Open'],
  ['A small gesture', 'Fold'],
  ['Lunch', 'Eat'],
  ['Back to the city', 'Go'],
]

function Idea() {
  const carry = useScrollProgress<HTMLDivElement>('cross')
  return (
    <section
      className="relative px-[5cqw] pb-[12cqh] pt-[10cqh]"
      style={{ background: '#F4EDE2', color: '#111111', ['--signal' as string]: '#E6452E', ['--ink' as string]: '#111111' }}
    >
      <Head n="02" title="The idea" />
      <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
        <span>
          <span>One small gesture,</span>
        </span>
        <span>
          <span className="text-[var(--signal)]">repeated all day.</span>
        </span>
      </In>

      <div className="mt-[7cqh] grid gap-[5cqh] @2xl:grid-cols-12 @2xl:gap-x-[3cqw]">
        {/* the city: the largest picture, drifting a touch slower than the page */}
        <div ref={carry} className="@2xl:col-span-7">
          <In kind="drop">
            <div data-scroll style={{ transform: 'translateY(calc((var(--p, 0.5) - 0.5) * 4cqh))' }}>
              <Photo k="cityCarry" className="aspect-[4/5] w-full" />
            </div>
          </In>
          <p className="fold-mono mt-3 flex justify-between text-[10px] text-[#111111]/55">
            <span>Athens / Morning</span>
            <span>Grab / Carry</span>
          </p>
        </div>

        {/* the reasoning at the photograph's top, the objects at its foot */}
        <div className="flex flex-col justify-between gap-[5cqh] @2xl:col-span-5">
          <In kind="rise" className="max-w-[40ch]">
            <p className="text-[15px] leading-snug @2xl:text-[17px]">
              Closing a bag, turning back a lid, tucking a corner in to carry it further — the city does it a hundred times
              before noon.
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-[#111111]/70">
              Inspired by the everyday act of folding, FOLD brings bold lettering, warm materials and angular colour shapes
              into one recognisable identity. The fold is the starting point, expressed through both paper construction and printed graphics.
            </p>
          </In>
          <div className="ml-[22%] @2xl:ml-[18%]">
            <In kind="drop" delay={0.15}>
              <Photo k="cityCupBag" className="aspect-[4/5] w-full" />
            </In>
            <p className="fold-mono mt-3 flex justify-between text-[10px] text-[#111111]/55">
              <span>Cup + bag</span>
              <span>Made to carry</span>
            </p>
          </div>
        </div>
      </div>

      {/* an illustrative rhythm, not a documented customer journey */}
      <ol className="mt-[9cqh] grid grid-cols-3 border-t border-[#111111]/20 @2xl:grid-cols-6">
        {DAY.map(([time, verb], i) => (
          <In
            key={verb}
            as="li"
            kind="rise"
            delay={i * 0.06}
            className={`border-b border-[#111111]/20 py-[2.4cqh] pr-3 @2xl:border-b-0 ${verb === 'Fold' ? 'text-[var(--signal)]' : ''}`}
          >
            <p className={`fold-mono text-[10px] ${verb === 'Fold' ? '' : 'text-[#111111]/50'}`}>{time}</p>
            <p className="fold-display mt-1" style={{ fontSize: 'max(22px, 2.6cqw)' }}>
              {verb}
            </p>
          </In>
        ))}
      </ol>
      <p className="fold-mono mt-[4cqh] text-[10px] text-[#111111]/55 @2xl:text-[11px]">{LINE}</p>
    </section>
  )
}

// ---------------------------------------------------------------- 03 The system

// The identity's five rules, each shown by itself: what makes FOLD a system rather than a logo
// and a palette. The raster specimens show the same parts used throughout the case study.
const RULES: { name: string; note: string }[] = [
  { name: 'The signal', note: 'A single red-orange accent that draws the eye.' },
  { name: 'The pattern', note: 'Angular colour planes cross the full surface, with cream space for the wordmark and information.' },
  { name: 'The wordmark', note: 'Heavy lettering, close spacing, a compact silhouette.' },
  { name: 'The materials', note: 'Warm paper, kraft and mineral textures.' },
  { name: 'The type', note: 'Bold headlines, mono details, clear body text.' },
]

const MATERIALS = [
  { name: 'Paper', hex: '#EFE8DC', bg: 'var(--paper)', fg: 'var(--ink)', image: '/projects/fold/material-paper.webp' },
  { name: 'Kraft', hex: '#C8A77C', bg: 'var(--kraft)', fg: 'var(--ink)', image: '/projects/fold/material-kraft.webp' },
  { name: 'Concrete', hex: '#B9B2A7', bg: 'var(--concrete)', fg: 'var(--ink)', image: '/projects/fold/material-concrete.webp' },
  { name: 'Ink', hex: '#151311', bg: 'var(--ink)', fg: 'var(--paper)', image: '/projects/fold/material-ink.webp' },
  { name: 'Signal', hex: '#E8462A', bg: 'var(--signal)', fg: 'var(--ink)', image: '/projects/fold/material-signal.webp' },
]

const TYPEFACES = [
  { role: 'Voice', face: 'Anton', sample: 'Good things inside.', className: 'fold-display', size: 'max(22px, 2.6cqw)' },
  { role: 'Information', face: 'IBM Plex Mono', sample: 'Order 0247 — € 3.80', className: 'fold-mono', size: 'max(13px, 1.25cqw)' },
  { role: 'Reading', face: 'Inter', sample: 'Coffee in hand. The city ahead.', className: '', size: 'max(16px, 1.6cqw)' },
]

// One rule's picture, square
function RuleArt({ i }: { i: number }) {
  if (i === 1)
    return <img src="/projects/fold/system-pattern.webp" alt="FOLD's angular red, orange, burgundy and ink pattern printed on cream paper" className="size-full object-cover" loading="lazy" decoding="async" />

  const systemImages = [
    { src: 'material-signal.webp', alt: 'A flat sheet of red-orange signal paper' },
    { src: 'system-wordmark-v2.webp', alt: 'The FOLD master wordmark in black on a textured kraft ground' },
    { src: 'system-materials.webp', alt: 'A strip of paper, kraft, concrete, ink and red-orange material textures' },
    { src: 'system-type-v2.webp', alt: 'Type specimen: Anton headline letters, IBM Plex Mono details and Inter reading text' },
  ]
  const art = systemImages[i > 1 ? i - 1 : i]
  return <img src={`/projects/fold/${art.src}`} alt={art.alt} className="size-full object-cover" loading="lazy" decoding="async" />
}

function System() {
  return (
    <section className="bg-[#f7f3ec] px-[5cqw] pb-[11cqh] pt-[10cqh]">
      <Head n="03" title="The system" />
      <div className="mt-5 grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <In kind="lines" className="fold-display" style={{ fontSize: 'max(32px, 5.6cqw)' }}>
          <span>
            <span>Five rules.</span>
          </span>
          <span>
            <span className="text-[var(--signal)]">Every touchpoint.</span>
          </span>
        </In>
        <In kind="rise" as="p" className="max-w-[42ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          Five recurring elements connect the identity, from a receipt to a shopfront. Their scale and arrangement change;
          their character stays familiar.
        </In>
      </div>

      {/* the rules */}
      <div className="mt-[7cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-5 @2xl:gap-x-[1.6cqw]">
        {RULES.map((r, i) => (
          <In key={r.name} as="figure" kind="rise" delay={i * 0.07}>
            <div className="aspect-square overflow-hidden ring-1 ring-inset ring-[var(--ink)]/10">
              <RuleArt i={i} />
            </div>
            <figcaption className="mt-3">
              <span className="fold-mono text-[10px] text-[var(--ink)]/45">{String(i + 1).padStart(2, '0')}</span>
              <span className="fold-display mt-1 block" style={{ fontSize: 'max(17px, 1.7cqw)' }}>
                {r.name}
              </span>
              <span className="fold-mono mt-1 block text-[10px] leading-snug text-[var(--ink)]/60">{r.note}</span>
            </figcaption>
          </In>
        ))}
      </div>

      {/* the palette, as overlapping sheets */}
      <div className="mt-[9cqh]">
        <p className="fold-mono text-[10px] text-[var(--ink)]/55 @2xl:text-[11px]">Colour & material — warm neutrals, dark ink, a red-orange signal</p>
        <div className="mt-4 flex">
          {MATERIALS.map((m, i) => (
            <In
              key={m.name}
              kind="rise"
              delay={i * 0.08}
              className="relative flex aspect-[1/1.25] flex-1 flex-col justify-between p-[1.4cqw] shadow-[-18px_0_30px_-22px_rgba(21,19,17,0.55)] ring-1 ring-inset ring-[var(--ink)]/10 @2xl:aspect-[1/0.9]"
              style={{ backgroundColor: m.bg, backgroundImage: `linear-gradient(rgba(247,243,236,.08), rgba(247,243,236,.08)), url(${m.image})`, backgroundSize: 'cover', backgroundPosition: 'center', color: m.fg, marginLeft: i ? '-1.6cqw' : 0, zIndex: i }}
            >
              <span className="fold-mono text-[9px] opacity-70 @2xl:text-[10px]">{m.hex}</span>
              <span className="fold-display" style={{ fontSize: 'max(14px, 2.2cqw)' }}>
                {m.name}
              </span>
            </In>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="max-w-[58ch] text-[11px] leading-relaxed text-[var(--ink)]/60">
          Material textures vary with light and print. Hex values are digital references, not measurements of the photographed surfaces.
        </p>
        <div className="fold-mono flex flex-wrap items-center gap-3 text-[9px] text-[var(--ink)]/60" aria-label="Pattern shades: used only inside the angular pattern">
          <span className="text-[var(--ink)]/80">Pattern only —</span>
          {[
            ['Orange', 'var(--orange)'],
            ['Red', 'var(--red)'],
            ['Deep red', 'var(--deep-red)'],
          ].map(([name, colour]) => (
            <span key={name} className="flex items-center gap-1.5">
              <span aria-hidden className="size-3" style={{ background: colour }} />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* the type */}
      <div className="mt-[8cqh] grid gap-[4cqh] border-t border-[var(--ink)]/15 pt-[3cqh] @2xl:grid-cols-3 @2xl:gap-[4cqw]">
        {TYPEFACES.map((t) => (
          <div key={t.face}>
            <p className="fold-mono text-[10px] text-[var(--ink)]/50">
              {t.role} — {t.face}
            </p>
            <p className={`mt-3 ${t.className}`} style={{ fontSize: t.size }}>
              {t.sample}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 04 The wordmark

// The design choices visible in the finished wordmark.
const WORDMARK_CHOICES: [string, string][] = [
  ['A compact silhouette', 'Heavy strokes and close spacing give the name a distinct outline. Four letters become a single, recognisable signature.'],
  ['A softer edge', 'Rounded corners and narrow, curved counters soften the heavy strokes. Straight stems and flat terminals keep the silhouette clear.'],
  ['Part of the everyday', 'Ink on paper. A stamp on kraft. A name above the door. The surface changes; the signature stays familiar.'],
]

const IN_USE: { k: PhotoKey; label: string; offset: string }[] = [
  { k: 'markSticker', label: 'Sticker / signal accent', offset: '@2xl:mt-0' },
  { k: 'markCup', label: 'Cup / black on paper', offset: '@2xl:mt-[12cqh]' },
  { k: 'markBag', label: 'Carrier bag / ink & signal', offset: '@2xl:mt-[4cqh]' },
  { k: 'markReceipt', label: 'Receipt / compact signature', offset: '@2xl:mt-[16cqh]' },
]

function Wordmark() {
  return (
    <section className="bg-[var(--ink)] px-[5cqw] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="04" title="The wordmark" light />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
            <span>
              <span>Four letters,</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">one bold signature.</span>
            </span>
          </In>
        </div>
        <In kind="rise" as="p" className="max-w-[44ch] text-[13px] leading-relaxed text-[var(--paper)]/65">
          The wordmark gives FOLD a compact, recognisable silhouette. Heavy strokes, narrow counters and tight spacing create
          a strong block of lettering, balanced by softer curves. It anchors the more expressive corner graphics around it.
        </In>
      </div>

      {/* the mark and the choices behind its character */}
      <div className="mt-[9cqh] grid gap-[6cqh] @2xl:grid-cols-12 @2xl:items-center @2xl:gap-x-[4cqw]">
        <div className="w-[80%] overflow-x-clip px-[3%] @2xl:col-span-7 @2xl:w-auto">
          <Mark label="FOLD" className="block w-full text-[var(--paper)]" />
        </div>
        <div className="border-t border-[var(--paper)]/15 @2xl:col-span-5">
          <p className="fold-mono pt-[3cqh] text-[10px] text-[var(--paper)]/55 @2xl:text-[11px]">Behind the mark</p>
          {WORDMARK_CHOICES.map(([name, note], i) => (
            <In key={name} kind="rise" delay={i * 0.08} className="mt-[3cqh] grid grid-cols-[auto_1fr] gap-x-4">
              <span className="fold-mono pt-1 text-[10px] text-[var(--paper)]/45">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="fold-display" style={{ fontSize: 'max(18px, 1.7cqw)' }}>
                  {name}
                </p>
                <p className="mt-1 max-w-[46ch] text-[13px] leading-relaxed text-[var(--paper)]/65">{note}</p>
              </div>
            </In>
          ))}
        </div>
      </div>

      {/* in use, at scale */}
      <div className="mt-[10cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-4 @2xl:gap-x-[2cqw]">
        {IN_USE.map(({ k, label, offset }, i) => (
          <In key={k} as="figure" kind="rise" delay={i * 0.07} className={offset}>
            <Photo k={k} className="aspect-[3/4] w-full" />
            <figcaption className="fold-mono mt-3 text-[10px] text-[var(--paper)]/55">{label}</figcaption>
          </In>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 05 Packaging

// Shared graphic cues across different packaging formats.
const MOVE: [string, string][] = [
  ['Material', 'Paper and kraft set a warm base'],
  ['Mark', 'Bold lettering identifies the brand'],
  ['Signal', 'Angular colour ties the range together'],
]

// The range, set out like a catalogue: different formats with shared graphic cues.
const PACKS: { k: PhotoKey; name: string; note: string }[] = [
  { k: 'cupHot', name: 'Takeaway cup', note: 'Wordmark & corner graphic' },
  { k: 'kraftBag', name: 'Carrier bag', note: 'Kraft' },
  { k: 'boxOrange', name: 'Pastry box', note: 'Printed panels & sticker seal' },
  { k: 'pastryBag', name: 'Pastry bag', note: 'Sticker seal' },
  { k: 'napkins', name: 'Napkin', note: 'Printed' },
  { k: 'stickers', name: 'Sticker', note: 'Signal' },
  { k: 'boxOpen', name: 'Pastry box', note: 'Opened' },
  { k: 'wrapPaper', name: 'Wrap', note: 'Printed paper' },
]

function Packaging() {
  return (
    <section className="bg-[var(--kraft-light)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="05" title="Packaging" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
            <span>
              <span>Different forms.</span>
            </span>
            <span>
              <span>One identity.</span>
            </span>
          </In>
        </div>
        <In kind="rise" as="p" className="max-w-[46ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          A cup, a carrier bag and a pastry box serve different needs. The wordmark, paper tones and angular colour graphics
          connect them without asking every object to share the same shape or closure.
        </In>
      </div>

      {/* the shared cues, beside their application on the boxes */}
      <div className="mt-[8cqh] grid gap-[5cqh] @2xl:grid-cols-12 @2xl:items-end @2xl:gap-[4cqw]">
        <In kind="open" className="@2xl:col-span-8">
          <Photo k="packBoxes" className="aspect-[1312/1199] w-full" />
        </In>
        <div className="border-t border-[var(--ink)]/20 @2xl:col-span-4">
          {MOVE.map(([word, note], i) => (
            <In
              key={word}
              kind="rise"
              delay={i * 0.1}
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b border-[var(--ink)]/20 py-[2.4cqh]"
            >
              <span className="fold-mono text-[10px] text-[var(--ink)]/45">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className={`fold-display ${i === 2 ? 'text-[var(--signal)]' : ''}`} style={{ fontSize: 'max(24px, 3.2cqw)' }}>
                  {word}
                </p>
                <p className="fold-mono mt-1 text-[10px] text-[var(--ink)]/60">{note}</p>
              </div>
            </In>
          ))}
        </div>
      </div>

      {/* the range */}
      <div className="fold-mono mt-[11cqh] flex justify-between border-t border-[var(--ink)]/20 pt-3 text-[10px] text-[var(--ink)]/55 @2xl:text-[11px]">
        <span>The range</span>
        <span>{PACKS.length} pieces / 1 identity</span>
      </div>
      <div className="mt-[4cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-4 @2xl:gap-x-[2cqw]">
        {PACKS.map(({ k, name, note }, i) => (
          <In key={k} as="figure" kind="rise" delay={(i % 4) * 0.08} className="group">
            <div className="overflow-hidden bg-[var(--paper)]">
              <Photo k={k} className="aspect-[1358/1159] w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </div>
            <figcaption className="fold-mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-[10px]">
              <span className="text-[var(--ink)]/45">{String(i + 1).padStart(2, '0')}</span>
              <span>
                {name}
                <span className="block text-[var(--ink)]/55">{note}</span>
              </span>
            </figcaption>
          </In>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 06 Physical space

function Space() {
  return (
    <section className="bg-[var(--ink)] pb-[12cqh] pt-[8cqh] text-[var(--paper)]">
      {/* the running head in the dark above the storefront, where it reads */}
      <div className="mb-[4cqh] grid gap-3 px-[5cqw] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <Head n="06" title="Physical space" light />
        <p className="max-w-[44ch] text-[13px] leading-relaxed text-[var(--paper)]/65">
          On the street, the wordmark makes the café easy to spot. Angular graphics extend the identity across the façade, signage and interior.
        </p>
      </div>
      <In kind="open">
        {/* at the photograph's own proportions, so it is never cropped, whatever the screen */}
        <Photo k="storefront" className="aspect-[2/1] w-full" />
      </In>
      <div className="grid gap-[5cqw] px-[5cqw] pt-[8cqh] @2xl:grid-cols-[1.45fr_1fr]">
        {/* on wide panels it fills its row, as tall as the column beside it, so no empty block is
            left under it; the sign on its left stays in view */}
        <In kind="drop">
          <Photo k="counter" focus="12% 50%" className="aspect-[4/3] w-full @2xl:aspect-auto @2xl:h-full" />
        </In>
        <div className="flex flex-col justify-between gap-[5cqh]">
          <In kind="lines" className="fold-display" style={{ fontSize: 'max(30px, 5.6cqw)' }}>
            <span>
              <span>Urban.</span>
            </span>
            <span>
              <span>Warm.</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">Functional.</span>
            </span>
          </In>
          <p className="max-w-[40ch] text-[13px] leading-relaxed text-[var(--paper)]/65">
            Concrete, terrazzo and warm wood give the space a tactile, everyday character. Dark lettering brings contrast;
            red-orange graphics connect the wall, menu board and pavement sign with the packaging on the counter.
          </p>
          <In kind="rise" delay={0.1} className="ml-auto w-[54%]">
            <Photo k="aFrame" className="aspect-[3/4] w-full" />
          </In>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 07 Print & menu

// A printed piece's caption: its number in the set, what it is, and a note on it
function Piece({ n, name, note, light = false }: { n: string; name: string; note: string; light?: boolean }) {
  return (
    <figcaption className={`fold-mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-[10px] ${light ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
      <span className="opacity-45">07.{n}</span>
      <span>
        {name}
        <span className="block opacity-55">{note}</span>
      </span>
    </figcaption>
  )
}

// The printed set, laid out like sheets on a table: tall and wide pieces alternating on an
// uneven grid, each unfolding into view, each drifting at its own rate as the chapter passes so
// the set has depth. The phrase the poster carries sits in the middle of it, set large.
function Print() {
  const ref = useScrollProgress<HTMLElement>('cross')
  const drift = (d: number): CSSProperties => ({ transform: `translateY(calc((var(--p, 0.5) - 0.5) * ${d}cqh))` })
  return (
    <section ref={ref} className="relative overflow-hidden bg-[#d8d1c6] px-[5cqw] pb-[14cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="07" title="Print & menu" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 7cqw)' }}>
            <span>
              <span>Paper that</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">does what it says.</span>
            </span>
          </In>
        </div>
        <In kind="rise" as="p" className="max-w-[44ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          The wordmark identifies each piece; a clear type hierarchy helps people use it. Bold headings lead, simple sans-serif
          text keeps the menu readable, and monospaced details give receipts their functional character. Angular graphics connect the set.
        </In>
      </div>

      {/* the menu: its cover, then opened */}
      <div className="mt-[9cqh] grid grid-cols-12 items-start gap-x-[3cqw] gap-y-[6cqh]">
        <figure data-scroll className="col-span-12 @2xl:col-span-5" style={drift(-8)}>
          <In kind="open">
            <div className="relative">
              <Photo k="printMenuCover" className="aspect-[2/3] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
            </div>
          </In>
          <Piece n="1" name="Menu" note="Cover" />
        </figure>
        <figure data-scroll className="col-span-12 @2xl:col-span-7 @2xl:mt-[22cqh]" style={drift(5)}>
          <In kind="drop">
            <Photo k="printMenuSpread" className="aspect-[3/2] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="2" name="Menu" note="Spread — coffee, brunch, bakery, all day" />
        </figure>
      </div>

      {/* what's handed over the counter */}
      <div className="mt-[10cqh] grid grid-cols-12 items-start gap-x-[3cqw] gap-y-[6cqh]">
        <figure data-scroll className="col-span-12 @2xl:col-span-7" style={drift(-4)}>
          <In kind="drop">
            <Photo k="printReceipt" className="aspect-[3/2] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="3" name="Receipt" note="Mono, torn edge, signed off in the voice" />
        </figure>
        <figure data-scroll className="col-span-10 col-start-3 @2xl:col-span-4 @2xl:col-start-9 @2xl:-mt-[6cqh] @2xl:rotate-[1.5deg]" style={drift(9)}>
          <In kind="open">
            <Photo k="printLoyalty" className="aspect-[2/3] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="4" name="Loyalty card" note="Eight folds, one coffee" />
        </figure>
      </div>

      {/* on the staff */}
      <div className="mt-[10cqh] grid grid-cols-12 items-start gap-x-[3cqw] gap-y-[6cqh]">
        <figure data-scroll className="col-span-10 @2xl:col-span-5 @2xl:col-start-2" style={drift(-6)}>
          <In kind="drop">
            <Photo k="printTee" className="aspect-[1312/1199] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="5" name="Staff tee" note="Wordmark & corner graphics" />
        </figure>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 08 Digital / social

// One post of the feed. Every post's media is 4:5 (master 1080 × 1350); the layout never changes
// whichever kind it holds.
type SocialPost = { caption: string } & (
  | { id: string; type: 'placeholder' }
  | { id: string; type: 'image'; src: string; alt: string }
  | { id: string; type: 'video'; src: string; poster?: string; alt: string }
)

// The nine posts, in feed order. Each has visible campaign copy as well as descriptive alt text.
// The feed measures itself, so the sticky journey follows the media and caption heights.
const SOCIAL_POSTS: SocialPost[] = [
  {
    id: '01',
    type: 'image',
    src: '/projects/fold/social/post-01.jpg',
    caption: 'Start with a fold. First stop: your usual.',
    alt: '”Start with a fold.” — a FOLD takeaway cup on a sunlit stone ledge, folded signal planes in the corners; Coffee / Athens / Every day',
  },
  {
    id: '02',
    type: 'image',
    src: '/projects/fold/social/post-02-v2.jpg',
    caption: 'Made to move. Your usual, wherever the day takes you.',
    alt: 'Made to move — a cream FOLD takeaway cup with a black lid and straw, tilted above a textured paper ground beside a sculptural red-orange paper fold; oversized black and red-orange campaign lettering',
  },
  {
    id: '03',
    type: 'image',
    src: '/projects/fold/social/post-03-v2.jpg',
    caption: 'Same routine. Different angle. Take the long way back.',
    alt: 'Same Routine Different Angle — a FOLD poster on a weathered wall beside a coffee cup and the branded kraft carrier bag with flat paper handles and red-orange fold graphics',
  },
  {
    id: '04',
    type: 'image',
    src: '/projects/fold/social/post-04-v2.jpg',
    caption: 'One more layer. A golden crust, a delicate centre, a few crumbs left behind.',
    alt: 'One More Layer — a close-up of a torn golden croissant showing its layered interior on cream bakery paper, beneath oversized cream and red-orange lettering against a dark background',
  },
  {
    id: '05',
    type: 'image',
    src: '/projects/fold/social/post-05.jpg',
    caption: 'Coffee first. Then a croissant. No need to rush the second part.',
    alt: 'Same Routine Different Angle — a FOLD coffee with latte art on a sunlit stone surface, paired with a croissant, fold planes in the corner',
  },
  {
    id: '06',
    type: 'image',
    src: '/projects/fold/social/post-06-v2.jpg',
    caption: 'Good things inside. Lift the lid. Take a little bakery break.',
    alt: 'Good Things Inside — an open rectangular FOLD kraft pastry box with a raised branded lid, red-orange corner graphics and a round seal, revealing a croissant on printed tissue in warm sunlight',
  },
  {
    id: '07',
    type: 'image',
    src: '/projects/fold/social/post-07-v2.jpg',
    caption: 'Something to sip. Something to share. A well-spent break.',
    alt: 'Good things inside — the cream FOLD hero cup with a black lid and straw, a croissant and branded FOLD napkins on a sunlit stone counter',
  },
  {
    id: '08',
    type: 'image',
    src: '/projects/fold/social/post-08-v3.jpg',
    caption: 'Different forms. One identity. A bag, a box and the little things that complete the set.',
    alt: 'One more layer — the FOLD kraft carrier bag with paper handles, an open pastry box with branded tissue and a round seal, and printed FOLD napkins on a concrete counter',
  },
  {
    id: '09',
    type: 'image',
    src: '/projects/fold/social/post-09-v2.jpg',
    caption: 'Athens, every day. From the first takeaway to the last light in the window.',
    alt: 'Athens every day — the cream FOLD hero cup with a black lid and straw beside the branded kraft carrier bag with paper handles, outside a warm neighbourhood cafe at blue hour',
  },
]

// Highlights reuse the identity's approved photography, with a short story behind each cover.
const SOCIAL_HIGHLIGHTS: { label: string; photo: PhotoKey; title: string; copy: string }[] = [
  { label: 'Coffee', photo: 'cupHot', title: 'Start with a fold.', copy: 'A cup in hand. A moment before the city picks up. Coffee is where the everyday ritual begins.' },
  { label: 'Bakery', photo: 'boxOpen', title: 'Good things inside.', copy: 'Layers, a golden crust and a trail of crumbs. Open the box and take a moment for something good.' },
  { label: 'To go', photo: 'kraftBag', title: 'Made to move.', copy: 'Coffee, pastries, lunch for later. Familiar lettering and a flash of colour, wherever you take them.' },
  { label: 'Athens', photo: 'storefront', title: 'Your everyday corner.', copy: 'Concrete, warm light, familiar faces. A neighbourhood seen one coffee at a time.' },
]

// A warm white, so the chapter reads as a reset between the print and the website chapters
const SOCIAL_BG = '#f7f3ec'
// How long the phone holds still before the feed starts and after it ends (of the view height)
const SOCIAL_HOLD = 0.16
// How far the feed travels for each pixel scrolled: faster than the page, so nine posts don't take
// seven screens of scrolling
const SOCIAL_RATE = 1.8
// Below this panel width (px) there's no phone: the feed is laid out in the page itself
const SOCIAL_NARROW = 672
// The active label's colour, cycling through the identity's own colours
const SOCIAL_ACTIVE = ['var(--signal)', 'var(--ink)']

// A future video post: muted, looping, inline, and playing only while most of it is on screen
// (and never with reduced motion). Nothing loads until it's first needed.
function SocialVideo({ post }: { post: Extract<SocialPost, { type: 'video' }> }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !still) {
          video.preload = 'auto'
          video.play().catch(() => {})
        } else video.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={ref}
      src={post.src}
      poster={post.poster}
      aria-label={post.alt}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 size-full object-cover"
    />
  )
}

// A restrained modern phone: a dark frame, side buttons, a rounded screen that clips what it
// holds, and a status bar that stays put over it. The screen is a size container, so whatever
// is inside sizes itself by the screen (cqw). Shared by the social feed (06) and the order app (07).
function PhoneFrame({ screenRef, height, children }: { screenRef?: RefObject<HTMLDivElement | null>; height: string; children: ReactNode }) {
  return (
    <div
      className="relative bg-[#1b1917] p-[3.2%] shadow-[0_60px_90px_-60px_rgba(21,19,17,0.6),0_0_0_1px_rgba(21,19,17,0.06)]"
      style={{ height, aspectRatio: '390 / 812', borderRadius: '14% / 6.7%' }}
    >
      {/* side buttons */}
      <span aria-hidden className="absolute -left-[1.4%] top-[18%] h-[6%] w-[1.4%] rounded-l-sm bg-[#1b1917]" />
      <span aria-hidden className="absolute -left-[1.4%] top-[27%] h-[9%] w-[1.4%] rounded-l-sm bg-[#1b1917]" />
      <span aria-hidden className="absolute -right-[1.4%] top-[24%] h-[13%] w-[1.4%] rounded-r-sm bg-[#1b1917]" />
      <div
        ref={screenRef}
        className="@container relative size-full overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
        style={{ borderRadius: '11.5% / 5.4%' }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 z-10 flex h-[12cqw] items-center justify-between bg-[var(--paper)] px-[8%]">
          <span className="fold-mono text-[3.2cqw]">9:41</span>
          <span className="absolute left-1/2 top-[22%] h-[50%] w-[30%] -translate-x-1/2 rounded-full bg-[#1b1917]" />
          <span className="flex items-center gap-[1.4cqw]">
            <span className="h-[2.2cqw] w-[4cqw] rounded-[1px] bg-[var(--ink)]/80" />
            <span className="h-[2.4cqw] w-[5.4cqw] rounded-[2px] border border-[var(--ink)]/70" />
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

// A post's 4:5 media, with a placeholder option for future work in progress.
function SocialMedia({ post }: { post: SocialPost }) {
  const ready = useContext(PhotosReady)
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ebe4d8]">
      {post.type === 'placeholder' && (
        <div className="absolute inset-[5%] grid place-items-center border border-[var(--ink)]/12">
          {/* a small registration mark at the centre */}
          <span aria-hidden className="absolute left-1/2 top-1/2 h-[9%] w-px -translate-x-1/2 -translate-y-1/2 bg-[var(--ink)]/15" />
          <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-[9%] -translate-x-1/2 -translate-y-1/2 bg-[var(--ink)]/15" />
          <div className="fold-mono mt-[34%] text-center text-[var(--ink)]">
            <p className="text-[3.4cqw]">Post {post.id}</p>
            <p className="mt-[0.4em] text-[2.6cqw] opacity-45">1080 × 1350 / 4:5</p>
          </div>
        </div>
      )}
      {post.type === 'image' && (
        <img src={ready ? post.src : undefined} alt={post.alt} decoding="async" className="absolute inset-0 size-full object-cover" />
      )}
      {post.type === 'video' && <SocialVideo post={post} />}
    </div>
  )
}

function SocialIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[6.2cqw]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

// The FOLD account: the top of the profile, then the posts one after another. Its text is sized
// by whatever holds it (the phone's screen, or the column on narrow panels), in cqw.
function SocialFeed({ postRefs }: { postRefs?: RefObject<(HTMLElement | null)[]> }) {
  const ready = useContext(PhotosReady)
  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(null)
  const highlightId = useId()
  const highlightButtons = useRef<(HTMLButtonElement | null)[]>([])
  const highlight = selectedHighlight === null ? null : SOCIAL_HIGHLIGHTS[selectedHighlight]
  const closeHighlight = () => {
    if (selectedHighlight !== null) highlightButtons.current[selectedHighlight]?.focus({ preventScroll: true })
    setSelectedHighlight(null)
  }
  const avatar = (size: string) => (
    <span className="grid shrink-0 place-items-center rounded-full bg-[var(--ink)]" style={{ width: size, aspectRatio: '1' }}>
      <Mark className="w-[66%] text-[var(--paper)]" />
    </span>
  )
  return (
    <>
      {/* the profile */}
      <div className="px-[5%] pb-[6%] pt-[3%]">
        <div className="flex items-center gap-[5%]">
          {avatar('22%')}
          <div>
            <p className="fold-display text-[7.4cqw]">Fold</p>
            <p className="fold-mono mt-[0.3em] text-[3cqw] opacity-55">@fold.athens</p>
          </div>
        </div>
        <p className="fold-mono mt-[5%] text-[3.1cqw]">Coffee / Food / People / Athens</p>
        <div role="group" aria-label="FOLD highlights" className="mt-[6%] grid grid-cols-4 gap-[4%]">
          {SOCIAL_HIGHLIGHTS.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => { highlightButtons.current[i] = el }}
              type="button"
              aria-expanded={selectedHighlight === i}
              aria-controls={highlightId}
              onClick={() => setSelectedHighlight(selectedHighlight === i ? null : i)}
              className="group min-h-[44px] rounded-md text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
            >
              <span className="mx-auto block aspect-square w-[90%] rounded-full border-2 border-[var(--signal)] p-[5%] transition-colors group-hover:border-[var(--ink)]">
                <span className="block size-full overflow-hidden rounded-full bg-[var(--kraft-light)]">
                  <img src={ready ? photoSrc(item.photo) : undefined} alt="" decoding="async" className="size-full object-cover" />
                </span>
              </span>
              <span className="fold-mono mt-2 block text-[max(10px,2.8cqw)]">{item.label}</span>
            </button>
          ))}
        </div>
        <div id={highlightId} hidden={!highlight}>
          {highlight && (
            <section
              aria-label={`${highlight.label} highlight`}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); closeHighlight() } }}
              className="mt-[5%] overflow-hidden rounded-lg border border-[var(--ink)]/15 bg-[var(--paper)]"
            >
              <div className="flex items-center justify-between gap-2 px-[5%]">
                <p className="fold-mono text-[max(10px,2.8cqw)]">{highlight.label}</p>
                <button type="button" onClick={closeHighlight} aria-label="Close highlight" className="min-h-[44px] min-w-[44px] text-xl focus-visible:outline-2 focus-visible:outline-[var(--ink)]">×</button>
              </div>
              <div className="aspect-[4/3]">
                <img src={ready ? photoSrc(highlight.photo) : undefined} alt={PHOTOS[highlight.photo].alt} decoding="async" className="size-full object-cover" />
              </div>
              <div className="p-[5%]">
                <h4 className="fold-display text-[max(18px,6cqw)]">{highlight.title}</h4>
                <p className="mt-2 text-[max(12px,3.4cqw)] leading-relaxed">{highlight.copy}</p>
              </div>
            </section>
          )}
        </div>
      </div>
      <div aria-hidden className="h-px bg-[var(--ink)]/10" />

      {/* the posts */}
      {SOCIAL_POSTS.map((post, i) => (
        <article
          key={post.id}
          ref={(el) => {
            if (postRefs) postRefs.current[i] = el
          }}
          className="pb-[7%]"
          aria-label={`Post ${post.id}`}
        >
          <div className="flex items-center gap-[3%] px-[4%] py-[3%]">
            {avatar('8.5%')}
            <span className="fold-mono text-[3cqw]">fold.athens</span>
            <span aria-hidden className="ml-auto text-[3.6cqw] leading-none opacity-50">
              ···
            </span>
          </div>
          <SocialMedia post={post} />
          <div aria-hidden className="flex items-center gap-[4%] px-[4%] pt-[3.4%]">
            <SocialIcon d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
            <SocialIcon d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />
            <SocialIcon d="m21 4-9 9M21 4l-6 17-3-8-8-3 17-6Z" />
            <span className="ml-auto">
              <SocialIcon d="M6 4h12v16l-6-4-6 4V4Z" />
            </span>
          </div>
          <p className="mt-[3.4%] px-[4%] text-[max(12px,3.4cqw)] leading-relaxed">
            <span className="font-semibold">fold.athens</span>{' '}{post.caption}
          </p>
        </article>
      ))}
    </>
  )
}

// 06 — Social media. The FOLD feed, seen through a phone. The section arrives like any other; once
// it fills the panel the phone holds still, and the same page scroll carries the feed up through
// its screen: no second scroll, nothing captured. The index on the left follows the post under
// the middle of the screen. After the last post the phone holds a moment, then the section
// leaves with the page. The journey's length is measured from the feed itself.
// On narrow panels there is no phone: the feed is simply laid out in the page.
function Social() {
  const scroller = useContext(ScrollerContext)
  const track = useRef<HTMLElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const feed = useRef<HTMLDivElement>(null)
  const posts = useRef<(HTMLElement | null)[]>([])
  const [narrow, setNarrow] = useState(false)
  // The section's height in phone mode: the panel's own, plus the holds and the feed's travel
  const [height, setHeight] = useState<number | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const panel = scroller?.current
    const t = track.current
    if (!panel || !t) return
    let journey = 0
    let hold = 0
    let raf = 0
    let last = -1

    const update = () => {
      raf = 0
      const f = feed.current
      const s = screen.current
      if (!f || !s) return
      // How far the section has risen past the top of the panel: the sticky stage holds the phone
      // in place over this distance, and the feed travels through the middle of it
      const box = t.getBoundingClientRect()
      const view = panel.getBoundingClientRect()
      // Nowhere near the view: nothing to move, and measuring the posts would only make the
      // browser lay the section out early
      if (box.bottom < view.top - view.height || box.top > view.bottom + view.height) return
      const scrolled = view.top - box.top
      const y = Math.min(Math.max((scrolled - hold) * SOCIAL_RATE, 0), journey)
      f.style.transform = `translate3d(0, ${-y}px, 0)`
      // The active post: the one under the middle of the screen
      const point = y + s.clientHeight / 2
      let a = 0
      posts.current.forEach((p, i) => {
        if (p && p.offsetTop <= point) a = i
      })
      if (a !== last) {
        last = a
        setActive(a)
      }
    }
    const measure = () => {
      const isNarrow = panel.clientWidth < SOCIAL_NARROW
      setNarrow(isNarrow)
      const f = feed.current
      const s = screen.current
      if (isNarrow || !f || !s) return
      journey = Math.max(f.scrollHeight - s.clientHeight, 0)
      hold = panel.clientHeight * SOCIAL_HOLD
      setHeight(Math.round(panel.clientHeight + hold * 2 + journey / SOCIAL_RATE))
      update()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    measure()
    // The panel resizing, and the feed's own height changing (an image or video arriving)
    const ro = new ResizeObserver(measure)
    ro.observe(panel)
    if (feed.current) ro.observe(feed.current)
    panel.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      panel.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [scroller, narrow])

  const title = (
    <>
      <Head n="08" title="Digital / social" />
      {/* three short lines, so it stays in the index column, clear of the phone */}
      <h3 className="fold-display mt-4" style={{ fontSize: 'max(28px, 3.6cqw)' }}>
        An everyday
        <br />
        point of
        <br />
        <span className="text-[var(--signal)]">view.</span>
      </h3>
      <p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-[var(--ink)]/70">
        Product moments, neighbourhood scenes and bold campaign lines. Tactile photography and graphic compositions bring the same identity into the feed.
      </p>
    </>
  )

  if (narrow)
    return (
      <section ref={track} className="px-[5cqw] pb-[12cqh] pt-[10cqh]" style={{ background: SOCIAL_BG }}>
        {title}
        <div className="@container mx-auto mt-[6cqh] max-w-[420px] overflow-hidden rounded-[20px] bg-[var(--paper)] pt-[4%] text-[var(--ink)] ring-1 ring-[var(--ink)]/10">
          <SocialFeed />
        </div>
      </section>
    )

  return (
    <section ref={track} className="relative" style={{ background: SOCIAL_BG, height: height ?? undefined, minHeight: '100cqh' }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: '100cqh' }}>
        {/* the index: one label per post, the one in the phone lit */}
        <div className="absolute left-[5cqw] top-1/2 -translate-y-1/2">
          <In kind="rise">{title}</In>
          <ol className="fold-mono mt-[5cqh] space-y-[1.1cqh] text-[10px] @4xl:text-[11px]">
            {SOCIAL_POSTS.map((post, i) => {
              const on = i === active
              return (
                <li
                  key={post.id}
                  aria-current={on ? 'true' : undefined}
                  className="flex items-center transition-[color,opacity,translate] duration-[400ms] ease-out motion-reduce:transition-none"
                  style={{
                    color: on ? SOCIAL_ACTIVE[i % SOCIAL_ACTIVE.length] : 'var(--ink)',
                    opacity: on ? 1 : 0.26,
                    translate: on ? '6px 0' : '0 0',
                  }}
                >
                  <span className="tabular-nums">{post.id}</span>
                  <span
                    aria-hidden
                    className="mx-3 h-px bg-current transition-[width] duration-[400ms] ease-out motion-reduce:transition-none"
                    style={{ width: on ? 28 : 12 }}
                  />
                  <span>Post {post.id}</span>
                </li>
              )
            })}
          </ol>
        </div>

        {/* the phone, slightly right of centre */}
        <div className="absolute left-[57%] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <In kind="rise" delay={0.1}>
            <PhoneFrame screenRef={screen} height="min(840px, 86cqh)">
              {/* the status bar stays put; the feed passes under it */}
              <div ref={feed} className="relative pb-[24%] pt-[12cqw] will-change-transform">
                <SocialFeed postRefs={posts} />
              </div>
            </PhoneFrame>
          </In>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 09 Digital / order ahead

// The fold, as the packaging prints it: flat planes in the fold colours, entering from a corner
// of whatever they sit on (top-right as drawn; turned for the other corners)
function FoldPlanes({ corner = 'tr', className = '' }: { corner?: 'tr' | 'bl'; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: corner === 'bl' ? 'rotate(180deg)' : undefined }}
    >
      <polygon points="100,0 44,0 100,62" fill="var(--orange)" />
      <polygon points="100,0 70,0 100,32" fill="var(--red)" />
      <polygon points="100,32 100,62 80,42" fill="var(--deep-red)" />
    </svg>
  )
}

interface OrderItem {
  id: string
  name: string
  note: string
  price: number
  photo?: PhotoKey
}
// From the printed menu (05)
const COFFEES: OrderItem[] = [
  { id: 'espresso', name: 'Espresso', note: 'Hot', price: 2.2 },
  { id: 'flat-white', name: 'Flat white', note: 'Hot', price: 3.5 },
  { id: 'freddo', name: 'Freddo espresso', note: 'Iced', price: 3.8 },
  { id: 'iced-latte', name: 'Iced latte', note: 'Iced', price: 3.8 },
]
const PASTRIES: OrderItem[] = [
  { id: 'croissant', name: 'Croissant', note: 'Bakery', price: 2.8, photo: 'croissantMacro' },
  { id: 'pastry', name: 'Pain au chocolat', note: 'Bakery', price: 3.0, photo: 'pastryBag' },
  { id: 'sandwich', name: 'Turkey sandwich', note: 'All day', price: 7.0, photo: 'wrapPaper' },
]
const ORDER_STEPS = [
  { name: 'Coffee', note: 'Pick a drink' },
  { name: 'Pastry', note: 'Add something' },
  { name: 'Review', note: 'Simulate payment' },
  { name: 'Confirmation', note: 'Preview pickup' },
]
// A simulated order uses the time shown by the prototype phone (9:41).
const placedNow = () => {
  const d = new Date()
  d.setHours(9, 41, 0, 0)
  return d
}
const ORDER_NUMBER = '0247'
const euro = (v: number) => v.toFixed(2)

// A choice in the app: the whole row is the button
function OrderRow({ item, picked, onPick, hint = false }: { item: OrderItem; picked: boolean; onPick: () => void; hint?: boolean }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      className={`relative flex w-full items-center gap-[3.5cqw] border-b border-[var(--ink)]/10 py-[2.6cqw] text-left transition-colors duration-300 ${picked ? 'text-[var(--ink)]' : 'text-[var(--ink)]/70 hover:text-[var(--ink)]'}`}
    >
      {item.photo && <Photo k={item.photo} className="size-[13cqw] shrink-0 rounded-[2cqw]" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[3.8cqw] font-semibold leading-tight">{item.name}</span>
        <span className="fold-mono mt-[0.5cqw] block text-[2.6cqw] opacity-55">{item.note}</span>
      </span>
      <span className="fold-mono text-[3.2cqw] tabular-nums">{euro(item.price)}</span>
      {/* picked: the row's corner turns, in signal */}
      <span
        aria-hidden
        className="size-[4cqw] shrink-0 transition-[background-color,clip-path] duration-300"
        style={{
          background: picked ? 'var(--signal)' : 'rgba(21,19,17,0.12)',
          clipPath: picked ? 'polygon(0 0, 100% 0, 100% 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />
      {/* where to tap, until the app is first used */}
      {hint && <span aria-hidden className="fold-tap pointer-events-none absolute right-[2cqw] top-1/2 size-[10cqw] translate-x-1/2 -translate-y-1/2" />}
    </button>
  )
}

// The app's main button: ink, with its corner folded back to signal
function OrderButton({ children, onClick, disabled = false, quiet = false }: { children: ReactNode; onClick: () => void; disabled?: boolean; quiet?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`fold-mono relative mt-auto flex w-full items-center justify-between overflow-hidden rounded-[2.4cqw] px-[5cqw] py-[4.2cqw] text-[3.2cqw] transition-[opacity,background-color] duration-300 disabled:opacity-30 ${quiet ? 'border border-[var(--ink)]/25 text-[var(--ink)] hover:bg-[var(--ink)]/5' : 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2a2622]'}`}
    >
      {children}
      {!quiet && (
        <span aria-hidden className="absolute right-0 top-0 size-[6cqw] bg-[var(--signal)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
      )}
    </button>
  )
}

// 08 — Order ahead: a four-screen interactive concept, with no order or payment backend.
// The prototype uses local state, with each screen pushed
// in from the right over the last, which draws back and dims; a new order goes back the other
// way). Prices are the printed menu's; the photographs, colours and mark are the identity's own.
function Order() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  // 1 going on to the next screen, -1 going back to the first
  const [dir, setDir] = useState(1)
  const [coffee, setCoffee] = useState<OrderItem | null>(null)
  // undefined: not chosen yet; null: "no thanks"
  const [pastry, setPastry] = useState<OrderItem | null | undefined>(undefined)
  const [placedAt, setPlacedAt] = useState<Date | null>(null)
  // Whether the app has been touched yet: until then a pulse shows where to tap
  const [used, setUsed] = useState(false)
  const items = [coffee, pastry].filter(Boolean) as OrderItem[]
  const total = items.reduce((s, it) => s + it.price, 0)
  const readyAt = placedAt ? new Date(placedAt.getTime() + 6 * 60 * 1000) : null
  const clock = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }
  const restart = () => {
    go(0)
    setCoffee(null)
    setPastry(undefined)
    setPlacedAt(null)
  }
  // A phone app's navigation: the next screen is pushed in from the right edge over the current
  // one, which draws back a third of the way and dims under it; going back reverses it. Both
  // move at once, on the same curve.
  const push = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const }
  const screens = reduced
    ? { enter: { opacity: 0 }, shown: { opacity: 1 }, leave: { opacity: 0 } }
    : {
        enter: (d: number) => (d > 0 ? { x: '100%', filter: 'brightness(1)', zIndex: 2 } : { x: '-30%', filter: 'brightness(0.8)', zIndex: 1 }),
        shown: { x: '0%', filter: 'brightness(1)', transition: push },
        leave: (d: number) => (d > 0 ? { x: '-30%', filter: 'brightness(0.8)', zIndex: 1, transition: push } : { x: '100%', zIndex: 2, transition: push }),
      }

  return (
    <section className="relative overflow-hidden bg-[var(--kraft-light)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid items-center gap-y-[7cqh] @2xl:grid-cols-12 @2xl:gap-x-[3cqw]">
        {/* the story, and where the order is */}
        <div className="@2xl:col-span-5 @2xl:col-start-2">
          <Head n="09" title="Digital / order ahead" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
            <span>
              <span>Order</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">ahead.</span>
            </span>
          </In>
          <In kind="rise" as="p" className="mt-[3cqh] max-w-[38ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
            A four-screen ordering concept: choose a drink, add a bite, review, then see a pickup confirmation. Angular selection
            markers and receipt-like prices carry the identity into a simple interface, with short sliding transitions.
          </In>
          <ol className="fold-mono mt-[5cqh] space-y-[1.4cqh] text-[10px] @4xl:text-[11px]">
            {ORDER_STEPS.map((s, i) => {
              const on = i === step
              return (
                <li
                  key={s.name}
                  aria-current={on ? 'step' : undefined}
                  className="flex items-baseline whitespace-nowrap transition-[color,opacity,translate] duration-[400ms] ease-out motion-reduce:transition-none"
                  style={{ color: on ? 'var(--signal)' : 'var(--ink)', opacity: on ? 1 : i < step ? 0.55 : 0.28, translate: on ? '6px 0' : '0 0' }}
                >
                  <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span aria-hidden className="mx-3 h-px self-center bg-current transition-[width] duration-[400ms]" style={{ width: on ? 28 : 12 }} />
                  <span>
                    {s.name}
                    <span className="ml-3 opacity-60">{s.note}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="fold-mono mt-[5cqh] flex items-center gap-2 text-[11px] text-[var(--ink)]">
            <span>Try the demo inside the phone</span>
            <span aria-hidden className="text-[var(--signal)]">
              <span className="@2xl:hidden">↓</span>
              <span className="hidden @2xl:inline">→</span>
            </span>
          </p>
        </div>

        {/* the phone: the app itself */}
        <div className="flex justify-center @2xl:col-span-5">
          <In kind="rise" delay={0.1}>
            {/* interactive concept only: no purchase, payment or order is submitted */}
            <p className="fold-mono mx-auto mb-[2.4cqh] flex w-fit items-center gap-2 rounded-full bg-[var(--ink)] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--paper)]">
              <span aria-hidden className="fold-live size-1.5 rounded-full bg-[var(--signal)]" />
              Interactive demo — no real orders
            </p>
            <div className="[--ph:min(680px,175cqw)] @2xl:[--ph:min(720px,74cqh)]" onPointerDown={() => setUsed(true)}>
              <PhoneFrame height="var(--ph)">
                <div className="absolute inset-x-0 bottom-0 top-[12cqw] flex flex-col">
                  {/* the app's own bar: the mark, and how far the order has come */}
                  <div className="flex items-center justify-between px-[6cqw] pb-[3cqw] pt-[2cqw]">
                    <Mark className="w-[17cqw] text-[var(--ink)]" />
                    <div aria-label={`Step ${step + 1} of 4`} className="flex gap-[1.4cqw]">
                      {ORDER_STEPS.map((s, i) => (
                        <span
                          key={s.name}
                          className="h-[1cqw] w-[6cqw] rounded-full transition-colors duration-500"
                          style={{ background: i <= step ? 'var(--signal)' : 'rgba(21,19,17,0.14)' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-hidden" aria-live="polite">
                    <AnimatePresence initial={false} custom={dir}>
                      <motion.div
                        key={step}
                        custom={dir}
                        variants={screens}
                        initial="enter"
                        animate="shown"
                        exit="leave"
                        className="absolute inset-0 flex flex-col bg-[var(--paper)] px-[6cqw] pb-[7cqw] shadow-[-12px_0_24px_-12px_rgba(21,19,17,0.35)]"
                      >
                        {step === 0 && (
                          <>
                            {/* the cup, on kraft, the fold entering from its corner */}
                            <div className="relative -mx-[6cqw] h-[58cqw] shrink-0 overflow-hidden bg-[var(--kraft)]">
                              <FoldPlanes className="right-0 top-0 h-[60%] w-[40%]" />
                              <FoldPlanes corner="bl" className="bottom-0 left-0 h-[34%] w-[26%]" />
                              <img
                                src={photoSrc('heroCup')}
                                alt={PHOTOS.heroCup.alt}
                                className="absolute left-1/2 top-[6%] h-[96%] w-auto -translate-x-1/2"
                                style={{ height: '96%', width: 'auto', objectFit: 'contain' }}
                              />
                              <span className="fold-mono absolute bottom-[6cqw] left-[6cqw] rounded-full bg-[var(--ink)] px-[3cqw] py-[1.4cqw] text-[2.8cqw] text-[var(--paper)]">
                                {coffee ? coffee.name : 'Your coffee'}
                              </span>
                            </div>
                            <p className="fold-display mt-[5cqw] text-[9cqw]">Coffee.</p>
                            <div className="mt-[1cqw]">
                              {COFFEES.map((c, i) => (
                                <OrderRow key={c.id} item={c} picked={coffee?.id === c.id} onPick={() => setCoffee(c)} hint={!used && i === 0} />
                              ))}
                            </div>
                            <OrderButton disabled={!coffee} onClick={() => go(1)}>
                              <span>Next — pastry</span>
                              <span>→</span>
                            </OrderButton>
                          </>
                        )}

                        {step === 1 && (
                          <>
                            <p className="fold-display mt-[3cqw] text-[9cqw] leading-[0.95]">
                              Something
                              <br />
                              <span className="text-[var(--signal)]">with it?</span>
                            </p>
                            <div className="mt-[3cqw]">
                              {PASTRIES.map((p) => (
                                <OrderRow key={p.id} item={p} picked={pastry?.id === p.id} onPick={() => setPastry(p)} />
                              ))}
                              <button
                                type="button"
                                onClick={() => setPastry(null)}
                                aria-pressed={pastry === null}
                                className={`fold-mono w-full py-[3.4cqw] text-left text-[3cqw] transition-colors ${pastry === null ? 'text-[var(--signal)]' : 'text-[var(--ink)]/55 hover:text-[var(--ink)]'}`}
                              >
                                No thanks, just the coffee
                              </button>
                            </div>
                            <OrderButton disabled={pastry === undefined} onClick={() => go(2)}>
                              <span>Review order</span>
                              <span>→</span>
                            </OrderButton>
                          </>
                        )}

                        {step === 2 && (
                          <>
                            <p className="fold-display mt-[3cqw] text-[9cqw]">Your order.</p>
                            <div className="fold-mono mt-[4cqw] text-[3.2cqw]">
                              {items.map((it) => (
                                <p key={it.id} className="flex justify-between border-b border-[var(--ink)]/10 py-[2.6cqw]">
                                  <span>1&nbsp;&nbsp;{it.name}</span>
                                  <span className="tabular-nums">{euro(it.price)}</span>
                                </p>
                              ))}
                              <p className="flex justify-between py-[3cqw] font-medium">
                                <span>Total</span>
                                <span className="tabular-nums">€ {euro(total)}</span>
                              </p>
                            </div>
                            {/* where to pick it up */}
                            <div className="mt-[2cqw] flex items-center gap-[3.5cqw] rounded-[2.4cqw] bg-[var(--ink)]/[0.05] p-[3cqw]">
                              <Photo k="storefront" className="aspect-[2/1] w-[30cqw] shrink-0 rounded-[1.6cqw]" />
                              <div className="fold-mono text-[2.7cqw] leading-snug">
                                <p>Pick up</p>
                                <p className="opacity-60">FOLD — Athens</p>
                                <p className="opacity-60">Example pickup: 6 min</p>
                              </div>
                            </div>
                            <OrderButton
                              onClick={() => {
                                setPlacedAt(placedNow())
                                go(3)
                              }}
                            >
                              <span>Simulate payment · € {euro(total)}</span>
                              <span>→</span>
                            </OrderButton>
                          </>
                        )}

                        {step === 3 && readyAt && (
                          <>
                            {/* the café, the fold turned back over it */}
                            <div className="relative -mx-[6cqw] h-[44cqw] shrink-0 overflow-hidden">
                              <Photo k="storefront" className="size-full" />
                              <FoldPlanes className="right-0 top-0 h-[70%] w-[34%]" />
                            </div>
                            <p className="fold-mono mt-[5cqw] text-[2.8cqw] opacity-60">
                              Demo {ORDER_NUMBER} / Take away
                            </p>
                            <p className="fold-display mt-[2cqw] text-[11cqw] leading-[0.95]">
                              Ready
                              <br />
                              at <span className="text-[var(--signal)]">{clock(readyAt)}.</span>
                            </p>
                            <p className="mt-[4cqw] text-[3.4cqw] leading-relaxed opacity-75">
                              Preview complete. No order was sent and no payment was taken.
                            </p>
                            <p className="fold-mono mt-[3cqw] text-[2.8cqw] opacity-60">Good things ahead.</p>
                            <OrderButton quiet onClick={restart}>
                              <span>Try another order</span>
                              <span>↺</span>
                            </OrderButton>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </In>
        </div>

      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 10 Motion

// The brand's motion, as a short spec: the one curve every move uses (the order app's own
// navigation curve), and the three moves, each playing on a loop while the chapter is in view.
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const MOTION_SPEC: [string, string][] = [
  ['Easing', EASE],
  ['Duration', '500–800 ms'],
  ['Overshoot', 'None'],
  ['Reduced motion', 'Fades only'],
]
const MOVES: { name: string; note: string; spec: string }[] = [
  { name: 'Slide', note: 'A screen enters from the edge like a sheet pushed across the counter. The one beneath steps back and dims.', spec: '500 ms / from the edge' },
  { name: 'Turn', note: 'A corner folds back and uncovers the signal colour beneath it.', spec: '700 ms / one corner at a time' },
  { name: 'Mask', note: 'The wordmark is wiped into view through a clip — never scaled, stretched or bounced.', spec: '800 ms / left to right' },
]

// The three moves, drawn small
function MoveDemo({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="relative size-full overflow-hidden bg-[var(--kraft)]">
        {(['back', 'front'] as const).map((card) => (
          <div
            key={card}
            className={`fold-move-card fold-move-card--${card} absolute inset-y-[12%] left-[22%] w-[56%] rounded-[6%/4.5%] bg-[var(--paper)] p-[7%] text-[var(--ink)] shadow-[-10px_0_24px_-12px_rgba(21,19,17,0.5)]`}
          >
            <Mark className="w-[42%]" />
            <p className="fold-display mt-[18%] text-[max(14px,2cqw)] leading-none">{card === 'back' ? 'Coffee.' : 'Your order.'}</p>
            {[78, 62, 70].map((w, k) => (
              <span key={k} className="mt-[9%] block h-[2.5%] rounded-full bg-[var(--ink)]/15" style={{ width: `${w}%` }} />
            ))}
            {card === 'front' && <span className="absolute inset-x-[7%] bottom-[7%] h-[11%] rounded-[8px] bg-[var(--ink)]" />}
          </div>
        ))}
      </div>
    )
  if (i === 1)
    return (
      <div className="relative size-full overflow-hidden bg-[var(--signal)]">
        <div className="fold-move-sheet absolute inset-0 grid place-items-center bg-[var(--paper)]">
          <Mark className="w-[58%] text-[var(--ink)]" />
        </div>
        <div className="absolute inset-0 [filter:drop-shadow(-6px_8px_8px_rgba(21,19,17,0.28))]">
          <div className="fold-move-flap absolute inset-0 bg-[#d9cfbf]" />
        </div>
      </div>
    )
  return (
    <div className="relative grid size-full place-items-center overflow-hidden bg-[var(--paper)]">
      <div className="relative w-[70%]">
        <Mark className="fold-move-word block w-full text-[var(--ink)]" />
        <span className="fold-move-edge absolute inset-y-[-12%] left-0 w-full">
          <span className="absolute inset-y-0 left-0 w-[3px] -translate-x-1/2 bg-[var(--signal)]" />
        </span>
      </div>
    </div>
  )
}

function Motion() {
  // the demos loop, so they only run while the chapter is on screen
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => el.classList.toggle('is-playing', entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <section ref={ref} className="fold-motion bg-[var(--ink)] px-[5cqw] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <div className="grid gap-[6cqh] @2xl:grid-cols-12 @2xl:items-end @2xl:gap-x-[4cqw]">
        <div className="@2xl:col-span-7">
          <Head n="10" title="Motion principles" light />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
            <span>
              <span>Moves like paper.</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">Never like rubber.</span>
            </span>
          </In>
          <In kind="rise" as="p" className="mt-[3cqh] max-w-[46ch] text-[13px] leading-relaxed text-[var(--paper)]/65">
            On screen, the brand moves the way its packaging does: a sheet slides, a corner turns, a label is uncovered. Every move
            starts quickly and settles slowly, and nothing stretches or bounces.
          </In>
        </div>

        {/* the curve, with a dot riding it: time runs across, progress up */}
        <In kind="rise" delay={0.1} className="@2xl:col-span-5">
          <div className="border border-[var(--paper)]/15 p-[6%]">
            <div className="relative aspect-[5/3]">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
                <path d="M0 100H100M0 100V0" fill="none" stroke="currentColor" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
                <path d="M0 100C32 28 0 0 100 0" fill="none" stroke="var(--signal)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="fold-curve-x absolute inset-0">
                <div className="fold-curve-y absolute inset-0">
                  <span className="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--paper)]" />
                </div>
              </div>
            </div>
            <p className="fold-mono mt-3 flex justify-between text-[9px] text-[var(--paper)]/45">
              <span>Time →</span>
              <span>Fast out, long settle</span>
            </p>
          </div>
          <dl className="fold-mono mt-4 text-[10px] @2xl:text-[11px]">
            {MOTION_SPEC.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-[var(--paper)]/15 py-2">
                <dt className="text-[var(--paper)]/50">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </In>
      </div>

      {/* the three moves */}
      <ol className="mt-[9cqh] grid gap-[6cqh] @2xl:grid-cols-3 @2xl:gap-x-[2.5cqw]">
        {MOVES.map((m, i) => (
          <In key={m.name} as="li" kind="rise" delay={i * 0.08}>
            <div className="aspect-[4/5] overflow-hidden ring-1 ring-[var(--paper)]/10 [container-type:inline-size]">
              <MoveDemo i={i} />
            </div>
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4">
              <span className="fold-mono pt-1 text-[10px] text-[var(--paper)]/45">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="fold-display" style={{ fontSize: 'max(20px, 2.2cqw)' }}>
                  {m.name}
                </p>
                <p className="mt-1 max-w-[36ch] text-[13px] leading-relaxed text-[var(--paper)]/65">{m.note}</p>
                <p className="fold-mono mt-2 text-[10px] text-[var(--paper)]/45">{m.spec}</p>
              </div>
            </div>
          </In>
        ))}
      </ol>
    </section>
  )
}

// ---------------------------------------------------------------- 11 Closing

function Closing() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden bg-[var(--paper)] px-[5cqw] pb-[6cqh] pt-[10cqh]" style={{ minHeight: '100cqh' }}>
      <Head n="11" title="Closing" />
      <In kind="lines" className="fold-display my-[6cqh]" style={{ fontSize: 'max(52px, 15cqw)' }}>
        <span>
          <span>Good things</span>
        </span>
        <span>
          <span className="text-[var(--signal)]">ahead.</span>
        </span>
      </In>
      {/* the project in one statement */}
      <In kind="rise" className="mb-[6cqh] max-w-[46ch] text-[15px] leading-relaxed @2xl:text-[17px]">
        <p>One everyday gesture, a complete visual language.</p>
        <p className="text-[var(--ink)]/60">Bold lettering. Warm surfaces. A corner of colour, from the counter to the city.</p>
      </In>
      <div className="flex flex-col gap-6 border-t border-[var(--ink)]/15 pt-[4cqh] @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <In kind="open">
          <Mark label="FOLD" className="w-[48cqw] text-[var(--ink)] @2xl:w-[30cqw]" />
        </In>
        <div className="fold-mono text-[10px] text-[var(--ink)]/60 @2xl:mr-[12cqw] @2xl:text-right @2xl:text-[11px]">
          <p>Fold — Brand identity / Hospitality — 2026</p>
          <p className="mt-1">Strategy · Identity · Wordmark · Packaging · Print · Space · Digital · Motion</p>
          <p className="mt-1">{LINE}</p>
        </div>
      </div>
    </section>
  )
}
