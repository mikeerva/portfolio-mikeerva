import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { ScrollerContext, useInView, useScrollProgress } from '../scroll'
import { PHOTOS, photoSrc, type PhotoKey } from './assets'
import './fold.css'
import { PATH, VIEWBOX } from './wordmark'

// FOLD — Brand Identity / Hospitality, 2026.
// The case study scrolls inside the project panel and is sized by it (cqw / cqh). Chapters:
// 00 Opening · 01 The idea · 02 The wordmark · 03 Packaging · 04 Physical space ·
// 05 Menu / print · 06 Social media · 07 Order ahead · 08 Motion principles · 09 Closing

const LINE = 'Brunch / Bakery / Specialty coffee / All day'

export function FoldCaseStudy() {
  return (
    <article className="fold" aria-label="Fold — Brand identity case study">
      <Opening />
      <Idea />
      <Wordmark />
      <Packaging />
      <Space />
      <Print />
      <Social />
      <Order />
      <Motion />
      <Closing />
    </article>
  )
}

// ---------------------------------------------------------------- building blocks

function Mark({ className = '', viewBox = VIEWBOX, style }: { className?: string; viewBox?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={viewBox} className={className} style={style} role="img" aria-label="FOLD" fill="currentColor">
      <path fillRule="evenodd" d={PATH} />
    </svg>
  )
}

function Photo({ k, className = '', style }: { k: PhotoKey; className?: string; style?: CSSProperties }) {
  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <img
        ref={showWhenLoaded}
        src={photoSrc(k)}
        alt={PHOTOS[k].alt}
        decoding="async"
        className="fold-photo"
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
  as?: 'div' | 'p' | 'h2' | 'h3' | 'figure'
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

// A folded corner: the corner of whatever it sits on, turned back to show signal orange
function Corner({ size = '9cqw', className = '' }: { size?: string; className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute ${className}`} style={{ width: size, height: size }}>
      <span className="absolute inset-0 bg-[var(--signal)]" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
      <span className="absolute inset-0 bg-[#c9bfae]" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 0)' }} />
    </span>
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
        className="absolute inset-x-0 bottom-0 h-[56%] [container-type:size] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] @2xl:inset-0 @2xl:h-full @2xl:[mask-image:none]"
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
          <img src={photoSrc('heroGround')} alt="" decoding="async" className="absolute inset-0" />
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
            <img src={photoSrc('heroCup')} alt={PHOTOS.heroCup.alt} decoding="async" />
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
          <Mark className="w-full text-[var(--paper)]" />
        </In>
        <In kind="lines" delay={0.6} className="fold-display mt-[3.5cqh]" style={{ fontSize: 'max(20px, 2.9cqw)' }}>
          <span>
            <span>Fold is a verb</span>
          </span>
          <span>
            <span className="text-[var(--signal)]">before it is a logo.</span>
          </span>
        </In>
        {/* narrow panels: kept with the wordmark, clear of the photograph */}
        <p className="fold-mono mt-[2.5cqh] max-w-[32ch] text-[10px] text-[var(--paper)]/55 @2xl:hidden">{LINE}</p>
      </div>

      <p className="fold-mono absolute bottom-[4.5cqh] left-[9cqw] hidden max-w-[32ch] text-[11px] text-[var(--paper)]/55 @2xl:block">
        {LINE}
      </p>
    </section>
  )
}

// ---------------------------------------------------------------- 01 The idea

// The way the city moves: an asymmetric spread. The concept column holds its place while the
// city photograph and then the cup and bag pass beside it.
const BEHAVIOUR = ['Grab', 'Carry', 'Open', 'Fold', 'Eat', 'Go']

function Idea() {
  const carry = useScrollProgress<HTMLDivElement>('cross')
  return (
    <section
      className="relative px-[5cqw] pb-[20cqh] pt-[14cqh]"
      style={{ background: '#F4EDE2', color: '#111111', ['--signal' as string]: '#E6452E', ['--ink' as string]: '#111111' }}
    >
      <div className="grid grid-cols-1 gap-[7cqh] @2xl:grid-cols-[0.9fr_1.5fr_0.78fr] @2xl:gap-x-[3cqw] @2xl:gap-y-0">
        {/* LEFT — the concept, held while the photographs pass */}
        <div className="@2xl:sticky @2xl:top-[9cqh] @2xl:self-start">
          <Head n="01" title="The idea" />
          <In kind="lines" className="fold-display mt-[5cqh] whitespace-nowrap" style={{ fontSize: 'max(38px, 4.5cqw)' }}>
            <span>
              <span>Built around</span>
            </span>
            <span>
              <span>the way the</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">city moves.</span>
            </span>
          </In>
          <In kind="rise" delay={0.2} className="mt-[5cqh] max-w-[34ch] text-[13px] leading-relaxed text-[#111111]/75 @2xl:text-[14px]">
            <p>
              FOLD lives in the everyday movements of the city — grabbing a coffee, carrying a bag, opening a wrapper, eating on
              the move and getting on with the day.
            </p>
            <p className="mt-3">The identity comes from these behaviours, not from decorative fold graphics.</p>
          </In>
          <div className="mt-[5cqh] border-t border-[#111111]/15 pt-[3cqh]">
            <In kind="lines" className="fold-display flex flex-wrap gap-x-[1.1cqw] gap-y-1" style={{ fontSize: 'max(18px, 2.1cqw)' }}>
              {BEHAVIOUR.map((word, i) => (
                <span key={word}>
                  <span className={word === 'Fold' ? 'text-[var(--signal)]' : ''}>
                    {word}
                    {i < BEHAVIOUR.length - 1 && <span className="ml-[1.1cqw] text-[#111111]/25">/</span>}
                  </span>
                </span>
              ))}
            </In>
          </div>
          <p className="fold-mono mt-[5cqh] hidden max-w-[30ch] text-[10px] text-[#111111]/55 @2xl:block">{LINE}</p>
        </div>

        {/* CENTRE — the city: the largest picture, drifting a touch slower than the page */}
        <div ref={carry} className="@2xl:mt-[10cqh]">
          <In kind="drop">
            <div data-scroll style={{ transform: 'translateY(calc((var(--p, 0.5) - 0.5) * 5cqh))' }}>
              <Photo k="cityCarry" className="aspect-[2/3] w-full" />
            </div>
          </In>
          <p className="fold-mono mt-3 flex justify-between text-[10px] text-[#111111]/55">
            <span>Athens, 08:40</span>
            <span>Grab / Carry</span>
          </p>
        </div>

        {/* RIGHT — the objects: smaller, later, lower */}
        <div className="ml-[22%] @2xl:ml-0 @2xl:mt-[54cqh]">
          <In kind="drop" delay={0.2}>
            <Photo k="cityCupBag" className="aspect-[2/3] w-full" />
          </In>
          <p className="fold-mono mt-3 flex justify-between text-[10px] text-[#111111]/55">
            <span>Cup + bag</span>
            <span>Open / Fold</span>
          </p>
          <p className="fold-mono mt-[4cqh] max-w-[30ch] text-[10px] text-[#111111]/55 @2xl:hidden">{LINE}</p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 02 The wordmark

function Wordmark() {
  return (
    <section className="bg-[var(--paper)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="02" title="The wordmark" />
      <In kind="open" className="mt-[7cqh]">
        <Mark className="w-full text-[var(--ink)]" />
      </In>

      <div className="mt-[9cqh] grid gap-[5cqw] @2xl:grid-cols-2">
        {/* O → L */}
        <figure>
          <In kind="rise" className="overflow-hidden bg-[var(--kraft-light)] py-[5cqh]">
            <div className="relative mx-auto w-fit">
              {/* the O and the L alone: the F ends at 217, the D starts at 727 */}
              <Mark viewBox="220 -10 500 445" className="block h-[38cqh] max-h-[360px] text-[var(--ink)]" />
              {/* where the O meets the L */}
              <span aria-hidden className="absolute inset-y-[-3cqh] w-px bg-[var(--signal)]" style={{ left: `${((496.3 - 220) / 500) * 100}%` }} />
            </div>
          </In>
          <figcaption className="mt-4 grid grid-cols-[auto_1fr] gap-x-5">
            <span className="fold-display" style={{ fontSize: 'max(20px, 3.4cqw)' }}>
              O → L
            </span>
            <span className="text-[13px] leading-relaxed text-[var(--ink)]/75">
              The fold. The O presses into the L until they share an edge — two forms compressed into one, the way layers of
              dough become a single pastry.
            </span>
          </figcaption>
        </figure>
        {/* L → D */}
        <figure>
          <In kind="rise" delay={0.12} className="overflow-hidden bg-[var(--ink)] py-[5cqh]">
            <div className="relative mx-auto w-fit">
              {/* the L and the D alone: the O ends at 490 */}
              <Mark viewBox="496 -10 514 445" className="block h-[38cqh] max-h-[360px] text-[var(--paper)]" />
              {/* the open gap between the L and the D */}
              <span aria-hidden className="absolute inset-y-[-3cqh] w-px bg-[var(--signal)]" style={{ left: `${((720.5 - 496) / 514) * 100}%` }} />
            </div>
          </In>
          <figcaption className="mt-4 grid grid-cols-[auto_1fr] gap-x-5">
            <span className="fold-display" style={{ fontSize: 'max(20px, 3.4cqw)' }}>
              L → D
            </span>
            <span className="text-[13px] leading-relaxed text-[var(--ink)]/75">
              The breath. A quieter gap, so the word can open again. One tight relationship, one released one — the mark
              folds and unfolds as you read it.
            </span>
          </figcaption>
        </figure>
      </div>

      {/* in use, at scale */}
      <div className="mt-[10cqh] grid grid-cols-2 gap-[2.5cqw] @2xl:grid-cols-4">
        {(
          [
            { k: 'markSticker', label: 'Sticker' },
            { k: 'markCup', label: 'Cup / 40 mm' },
            { k: 'markBag', label: 'Bag stamp' },
            { k: 'markReceipt', label: 'Receipt / 14 mm' },
          ] as const
        ).map(({ k, label }, i) => (
          <In key={label} kind="rise" delay={i * 0.07}>
            <Photo k={k} className="aspect-[3/4] w-full" />
            <p className="fold-mono mt-2 text-[10px] text-[var(--ink)]/55">{label}</p>
          </In>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 03 Packaging

// The one move every piece makes
const MOVE: [string, string][] = [
  ['Close', 'Lid, flap or wrap'],
  ['Fold', 'One corner, turned back'],
  ['Signal', 'Seals it, shows where to open'],
]

// The range, set out like a catalogue: same tile, same caption, so the fold is what differs
const PACKS: { k: PhotoKey; name: string; note: string }[] = [
  { k: 'cupHot', name: 'Cup', note: '8 oz' },
  { k: 'kraftBag', name: 'Carrier bag', note: 'Kraft' },
  { k: 'boxOrange', name: 'Corner seal', note: 'Signal' },
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
          <Head n="03" title="Packaging" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 7.6cqw)' }}>
            <span>
              <span>Folded,</span>
            </span>
            <span>
              <span>not decorated.</span>
            </span>
          </In>
        </div>
        <In kind="rise" as="p" className="max-w-[46ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          Every piece closes the same way: a corner folds back and the signal colour shows underneath. The fold is the brand
          mark on the move — it seals, it tells you where to open, and it is still there when the paper is crumpled.
        </In>
      </div>

      {/* the move, beside the piece that shows it best */}
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
        <span>{PACKS.length} pieces / 1 move</span>
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

// ---------------------------------------------------------------- 04 Physical space

const MATERIALS = [
  { name: 'Concrete', hex: '#B9B2A7', bg: 'var(--concrete)', fg: 'var(--ink)' },
  { name: 'Kraft', hex: '#C8A77C', bg: 'var(--kraft)', fg: 'var(--ink)' },
  { name: 'Paper', hex: '#EFE8DC', bg: 'var(--paper)', fg: 'var(--ink)' },
  { name: 'Charcoal', hex: '#151311', bg: 'var(--ink)', fg: 'var(--paper)' },
  { name: 'Signal', hex: '#E8462A', bg: 'var(--signal)', fg: 'var(--ink)' },
]

function Space() {
  return (
    <section className="bg-[var(--ink)] pb-[12cqh] text-[var(--paper)]">
      <div className="relative">
        <In kind="open">
          {/* at the photograph's own proportions, so it is never cropped, whatever the screen */}
          <Photo k="storefront" className="aspect-[2/1] w-full" />
        </In>
        {/* a soft shade from the top-left, so the running head reads over the bright tree */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 0% 0%, rgba(21,19,17,0.9) 0%, rgba(21,19,17,0.55) 40%, transparent 80%)' }}
        />
        <div className="absolute left-[5cqw] top-[5cqh]">
          <Head n="04" title="Physical space" light />
        </div>
      </div>
      <div className="grid gap-[5cqw] px-[5cqw] pt-[8cqh] @2xl:grid-cols-[1.45fr_1fr]">
        <In kind="drop">
          <Photo k="counter" className="aspect-[4/3] w-full" />
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
            A counter, not a stage. Raw concrete and steel carry the paper colours; signage is printed, not lit; the signal
            orange appears only where something folds — on the A-frame, the boxes, the corner of the menu.
          </p>
          <In kind="rise" delay={0.1} className="ml-auto w-[54%]">
            <Photo k="aFrame" className="aspect-[3/4] w-full" />
          </In>
        </div>
      </div>
      {/* the material palette, as overlapping planes */}
      <div className="mt-[10cqh] px-[5cqw]">
        <p className="fold-mono text-[10px] text-[var(--paper)]/55">Materials / colour</p>
        <div className="mt-4 flex">
          {MATERIALS.map((m, i) => (
            <In
              key={m.name}
              kind="rise"
              delay={i * 0.08}
              className="relative flex aspect-[1/1.5] flex-1 flex-col justify-between p-[1.4cqw] shadow-[-18px_0_30px_-20px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-[var(--paper)]/12"
              style={{ background: m.bg, color: m.fg, marginLeft: i ? '-2.2cqw' : 0, zIndex: i }}
            >
              <span className="fold-mono text-[9px] opacity-70 @2xl:text-[10px]">{m.hex}</span>
              <span className="fold-display" style={{ fontSize: 'max(14px, 2.4cqw)' }}>
                {m.name}
              </span>
            </In>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 05 Menu / print

// A printed piece's caption: its number in the set, what it is, and a note on it
function Piece({ n, name, note, light = false }: { n: string; name: string; note: string; light?: boolean }) {
  return (
    <figcaption className={`fold-mono mt-3 grid grid-cols-[auto_1fr] gap-x-3 text-[10px] ${light ? 'text-[var(--paper)]' : 'text-[var(--ink)]'}`}>
      <span className="opacity-45">05.{n}</span>
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
          <Head n="05" title="Menu / print" />
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
          One ink and the signal colour, on uncoated stock. The wordmark leads, the mono line informs, and the folded corner
          turns up wherever the paper goes — the menu, the receipt, the card in a wallet, the shirt behind the counter.
        </In>
      </div>

      {/* the menu: its cover, then opened */}
      <div className="mt-[9cqh] grid grid-cols-12 items-start gap-x-[3cqw] gap-y-[6cqh]">
        <figure data-scroll className="col-span-12 @2xl:col-span-5" style={drift(-8)}>
          <In kind="open">
            <div className="relative">
              <Photo k="printMenuCover" className="aspect-[2/3] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
              <Corner className="right-0 top-0" size="7cqw" />
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

      {/* on the wall and on the staff: the poster's line, set large between them */}
      <div className="mt-[10cqh] grid grid-cols-12 items-center gap-x-[3cqw] gap-y-[6cqh]">
        <figure data-scroll className="col-span-8 @2xl:col-span-4" style={drift(-7)}>
          <In kind="open">
            <Photo k="printPoster" className="aspect-[2/3] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="5" name="Poster" note="Window and wall" />
        </figure>
        <div className="col-span-12 @2xl:col-span-4">
          <In kind="lines" className="fold-display" style={{ fontSize: 'max(40px, 6.2cqw)' }}>
            <span>
              <span>Good</span>
            </span>
            <span>
              <span>things</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">ahead.</span>
            </span>
          </In>
          <In kind="rise" delay={0.2} className="fold-mono mt-[3cqh] text-[10px] text-[var(--ink)]/60 @2xl:text-[11px]">
            Coffee /<br />
            Food /<br />
            People /<br />
            Neighbourhood
          </In>
        </div>
        <figure data-scroll className="col-span-10 col-start-3 @2xl:col-span-4 @2xl:col-start-9 @2xl:mt-[16cqh]" style={drift(6)}>
          <In kind="drop">
            <Photo k="printTee" className="aspect-[1312/1199] w-full shadow-[0_40px_70px_-40px_rgba(21,19,17,0.6)]" />
          </In>
          <Piece n="6" name="Staff tee" note="The fold, worn" />
        </figure>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 06 Social media

// One post of the feed. Every post's media is 4:5 (master 1080 × 1350); the layout never changes
// whichever kind it holds.
type SocialPost =
  | { id: string; type: 'placeholder' }
  | { id: string; type: 'image'; src: string; alt: string }
  | { id: string; type: 'video'; src: string; poster?: string; alt: string }

// The nine posts, in feed order. To fill one, replace its entry, for example:
//   { id: '03', type: 'image', src: '/projects/fold/social/post-03.webp', alt: '…' },
//   { id: '06', type: 'video', src: '/projects/fold/social/reel-06.mp4', poster: '/projects/fold/social/reel-06.jpg', alt: '…' },
// Nothing else needs to change: the feed measures itself, so the sticky journey and the active
// post stay right whatever the posts hold.
const SOCIAL_POSTS: SocialPost[] = [
  {
    id: '01',
    type: 'image',
    src: '/projects/fold/social/post-01.jpg',
    alt: '”Start with a fold.” — a FOLD takeaway cup on a sunlit stone ledge, folded signal planes in the corners; Coffee / Athens / Every day',
  },
  {
    id: '02',
    type: 'image',
    src: '/projects/fold/social/post-02.jpg',
    alt: 'Athens, Every Day — a woman walking through an Athens street with a FOLD coffee cup, red fold planes entering from the corner',
  },
  {
    id: '03',
    type: 'image',
    src: '/projects/fold/social/post-03.jpg',
    alt: 'Same Routine Different Angle — a FOLD poster on a concrete wall with a kraft paper coffee cup, layered fold planes in red and orange',
  },
  {
    id: '04',
    type: 'image',
    src: '/projects/fold/social/post-04.jpg',
    alt: 'One More Layer — a FOLD poster with the wordmark showing fold planes entering from multiple corners, kraft paper aesthetic',
  },
  {
    id: '05',
    type: 'image',
    src: '/projects/fold/social/post-05.jpg',
    alt: 'Same Routine Different Angle — a FOLD coffee with latte art on a sunlit stone surface, paired with a croissant, fold planes in the corner',
  },
  {
    id: '06',
    type: 'image',
    src: '/projects/fold/social/post-06.jpg',
    alt: 'Good Things Inside. — an opened FOLD kraft takeaway box on a sunlit stone floor, its red inner flaps folded back around wrapped pastries',
  },
  {
    id: '07',
    type: 'image',
    src: '/projects/fold/social/post-07-v2.png',
    alt: 'Good things inside — the cream FOLD hero cup with a black lid and straw, a croissant and branded FOLD napkins on a sunlit stone counter',
  },
  {
    id: '08',
    type: 'image',
    src: '/projects/fold/social/post-08-v2.png',
    alt: 'One more layer — the FOLD kraft carrier bag with paper handles, an open pastry box with branded tissue and a round seal, and printed FOLD napkins on a concrete counter',
  },
  {
    id: '09',
    type: 'image',
    src: '/projects/fold/social/post-09-v2.png',
    alt: 'Athens every day — the cream FOLD hero cup with a black lid and straw beside the branded kraft carrier bag with paper handles, outside a warm neighbourhood cafe at blue hour',
  },
]

// A warm white, so the chapter reads as a reset between the print and the website chapters
const SOCIAL_BG = '#f7f3ec'
// How long the phone holds still before the feed starts and after it ends (of the view height)
const SOCIAL_HOLD = 0.16
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

// A post's 4:5 media: a quiet placeholder for now, an image or a video later
function SocialMedia({ post }: { post: SocialPost }) {
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
        <img src={post.src} alt={post.alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
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
        {/* highlights, left empty until the content exists */}
        <div aria-hidden className="mt-[6%] flex gap-[4.5%]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="aspect-square w-[15%] rounded-full border border-[var(--ink)]/15 bg-[#ebe4d8]" />
          ))}
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
          {/* the caption, left as a quiet rule until the copy exists */}
          <div aria-hidden className="mt-[3.4%] space-y-[1.6%] px-[4%]">
            <span className="block h-[1.6cqw] w-[72%] rounded-full bg-[var(--ink)]/8" />
            <span className="block h-[1.6cqw] w-[46%] rounded-full bg-[var(--ink)]/8" />
          </div>
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
      const y = Math.min(Math.max(scrolled - hold, 0), journey)
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
      setHeight(Math.round(panel.clientHeight + hold * 2 + journey))
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
      <Head n="06" title="Social media" />
      <h3 className="fold-display mt-4" style={{ fontSize: 'max(30px, 4.6cqw)' }}>
        Social media.
      </h3>
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

// ---------------------------------------------------------------- 07 Order ahead

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
  { name: 'Pay', note: 'One tap' },
  { name: 'Pick up', note: 'At the counter' },
]
// The order is placed at the time the phone shows (9:41), today
const placedNow = () => {
  const d = new Date()
  d.setHours(9, 41, 0, 0)
  return d
}
const ORDER_NUMBER = '0247'
const euro = (v: number) => v.toFixed(2)

// A choice in the app: the whole row is the button
function OrderRow({ item, picked, onPick }: { item: OrderItem; picked: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={picked}
      className={`flex w-full items-center gap-[3.5cqw] border-b border-[var(--ink)]/10 py-[2.6cqw] text-left transition-colors duration-300 ${picked ? 'text-[var(--ink)]' : 'text-[var(--ink)]/70 hover:text-[var(--ink)]'}`}
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

// 07 — Order ahead. The FOLD app does one thing: gets the order ready before you arrive. It works
// here: four steps inside the phone, moving the way a phone's own app does (each screen pushed
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
          <Head n="07" title="Order ahead" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 6.4cqw)' }}>
            <span>
              <span>Order</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">ahead.</span>
            </span>
          </In>
          <In kind="rise" as="p" className="mt-[3cqh] max-w-[38ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
            The app does one thing: gets your order ready before you arrive. Four taps, prices in mono like the receipt.
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
          <p className="fold-mono mt-[5cqh] text-[10px] text-[var(--ink)]/50">Try it — tap inside the phone.</p>
        </div>

        {/* the phone: the app itself */}
        <div className="flex justify-center @2xl:col-span-5">
          <In kind="rise" delay={0.1}>
            <div className="[--ph:min(680px,175cqw)] @2xl:[--ph:min(760px,82cqh)]">
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
                              {COFFEES.map((c) => (
                                <OrderRow key={c.id} item={c} picked={coffee?.id === c.id} onPick={() => setCoffee(c)} />
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
                                <p className="opacity-60">Ready in 6 min</p>
                              </div>
                            </div>
                            <OrderButton
                              onClick={() => {
                                setPlacedAt(placedNow())
                                go(3)
                              }}
                            >
                              <span>Pay € {euro(total)}</span>
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
                              Order {ORDER_NUMBER} / Take away
                            </p>
                            <p className="fold-display mt-[2cqw] text-[11cqw] leading-[0.95]">
                              Ready
                              <br />
                              at <span className="text-[var(--signal)]">{clock(readyAt)}.</span>
                            </p>
                            <p className="mt-[4cqw] text-[3.4cqw] leading-relaxed opacity-75">
                              Show this at the counter.
                            </p>
                            <p className="fold-mono mt-[3cqw] text-[2.8cqw] opacity-60">Good things ahead.</p>
                            <OrderButton quiet onClick={restart}>
                              <span>New order</span>
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

// ---------------------------------------------------------------- 08 Motion principles

function Motion() {
  const reveal = useInView<HTMLDivElement>(0.4)
  const settle = useInView<HTMLDivElement>(0.4)
  return (
    <section className="bg-[var(--ink)] px-[5cqw] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <Head n="08" title="Motion principles" light />
      <h3 className="fold-display mt-5" style={{ fontSize: 'max(30px, 6.6cqw)' }}>
        Nothing bounces.
      </h3>
      <p className="mt-4 max-w-[46ch] text-[13px] leading-relaxed text-[var(--paper)]/60">
        Things fold, open and settle — the way paper and dough actually move. Two moves cover almost everything the brand does
        on screen.
      </p>
      <div className="mt-[7cqh] grid gap-[5cqw] @2xl:grid-cols-2">
        <div ref={reveal} className="fold-demo-reveal">
          <div className="relative aspect-square overflow-hidden bg-[var(--ink)] ring-1 ring-[var(--paper)]/15">
            <div className="absolute inset-0 grid place-items-center bg-[var(--signal)]">
              <Mark className="w-[64%] text-[var(--ink)]" />
            </div>
            <div className="sheet absolute inset-0 bg-[var(--paper)]" />
            <div className="flap absolute inset-0 bg-[#d9cfbf]" />
          </div>
          <p className="fold-mono mt-4 flex gap-3 text-[11px]">
            <span className="step">Closed</span>
            <span className="opacity-40">→</span>
            <span className="step">Fold</span>
            <span className="opacity-40">→</span>
            <span className="step">Reveal</span>
          </p>
        </div>
        <div ref={settle} className="fold-demo-settle">
          <div className="relative grid aspect-square place-items-center overflow-hidden bg-[var(--paper)]">
            <Mark className="mark w-[70%] text-[var(--ink)]" />
          </div>
          <p className="fold-mono mt-4 flex gap-3 text-[11px]">
            <span className="step">Compress</span>
            <span className="opacity-40">→</span>
            <span className="step">Open</span>
            <span className="opacity-40">→</span>
            <span className="step">Settle</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 09 Closing

function Closing() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden bg-[var(--paper)] px-[5cqw] pb-[6cqh] pt-[10cqh]" style={{ minHeight: '100cqh' }}>
      <Head n="09" title="Closing" />
      <In kind="lines" className="fold-display my-[6cqh]" style={{ fontSize: 'max(52px, 15cqw)' }}>
        <span>
          <span>Good things</span>
        </span>
        <span>
          <span className="text-[var(--signal)]">ahead.</span>
        </span>
      </In>
      <div className="flex flex-col gap-6 border-t border-[var(--ink)]/15 pt-[4cqh] @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <In kind="open">
          <Mark className="w-[48cqw] text-[var(--ink)] @2xl:w-[30cqw]" />
        </In>
        <div className="fold-mono text-[10px] text-[var(--ink)]/60 @2xl:mr-[12cqw] @2xl:text-right @2xl:text-[11px]">
          <p>Fold — Brand identity / Hospitality — 2026</p>
          <p className="mt-1">{LINE}</p>
        </div>
      </div>
      <Corner className="bottom-0 right-0 rotate-[-90deg]" size="16cqw" />
    </section>
  )
}
