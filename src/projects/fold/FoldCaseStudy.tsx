import { useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ScrollerContext, useInView, useScrollProgress } from '../scroll'
import { PHOTOS, photoSrc, type PhotoKey } from './assets'
import './fold.css'
import { PATH, VIEWBOX } from './wordmark'

// FOLD — Brand Identity / Hospitality, 2026.
// The case study scrolls inside the project panel and is sized by it (cqw / cqh). Chapters:
// 00 Opening · 01 The idea · 02 The wordmark · 03 The fold system · 04 Food / photography ·
// 05 Packaging · 06 Physical space · 07 Menu / print · 08 Campaign · 09 Digital ·
// 10 Motion principles · 11 Closing

const LINE = 'Brunch / Bakery / Specialty coffee / All day'

export function FoldCaseStudy() {
  return (
    <article className="fold" aria-label="Fold — Brand identity case study">
      <Opening />
      <Idea />
      <Wordmark />
      <FoldSystem />
      <Photography />
      <Packaging />
      <Space />
      <Print />
      <Campaign />
      <Digital />
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
      <img src={photoSrc(k)} alt={PHOTOS[k].alt} loading="lazy" decoding="async" />
    </div>
  )
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
          slightly as the reader scrolls on. */}
      <div
        data-scroll
        className="absolute inset-x-0 bottom-0 h-[56%] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] @2xl:inset-0 @2xl:h-full @2xl:[mask-image:none]"
        style={{ transform: 'translateY(calc(var(--p, 0) * 3cqh)) scale(calc(1 + var(--p, 0) * 0.03))', transformOrigin: '70% 60%' }}
      >
        <img
          src={photoSrc('heroCoffee')}
          alt={PHOTOS.heroCoffee.alt}
          decoding="async"
          className="block size-full object-cover object-[78%_50%] @2xl:object-[56%_50%]"
        />
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
              <Mark viewBox="190 -10 540 664" className="block h-[38cqh] max-h-[360px] text-[var(--ink)]" />
              {/* where the O meets the L */}
              <span aria-hidden className="absolute inset-y-[-3cqh] w-px bg-[var(--signal)]" style={{ left: `${((498 - 190) / 540) * 100}%` }} />
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
              <Mark viewBox="470 -10 560 664" className="block h-[38cqh] max-h-[360px] text-[var(--paper)]" />
              {/* the open gap between the L and the D */}
              <span aria-hidden className="absolute inset-y-[-3cqh] w-px bg-[var(--signal)]" style={{ left: `${((706 - 470) / 560) * 100}%` }} />
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
        {[
          { bg: 'var(--signal)', fg: 'var(--ink)', size: '72%', label: 'Sticker' },
          { bg: 'var(--ink)', fg: 'var(--paper)', size: '46%', label: 'Cup / 40 mm' },
          { bg: 'var(--kraft)', fg: 'var(--ink)', size: '30%', label: 'Bag stamp' },
          { bg: '#fff', fg: 'var(--ink)', size: '16%', label: 'Receipt / 14 mm' },
        ].map(({ bg, fg, size, label }, i) => (
          <In key={label} kind="rise" delay={i * 0.07}>
            <div className="grid aspect-square place-items-center" style={{ background: bg, color: fg }}>
              <Mark style={{ width: size }} />
            </div>
            <p className="fold-mono mt-2 text-[10px] text-[var(--ink)]/55">{label}</p>
          </In>
        ))}
      </div>
      <In kind="rise" className="mt-[8cqh] flex flex-col gap-4 border-t border-[var(--ink)]/15 pt-[4cqh] @2xl:flex-row @2xl:items-end @2xl:gap-[4cqw]">
        <Mark className="w-[38cqw] max-w-[260px] text-[var(--ink)] @2xl:w-[22cqw]" />
        <p className="fold-mono text-[10px] text-[var(--ink)]/70 @2xl:text-[11px]">
          Brunch /<br />
          Bakery /<br />
          Specialty coffee /<br />
          All day
        </p>
        <p className="fold-mono text-[10px] text-[var(--ink)]/45 @2xl:ml-auto @2xl:max-w-[30ch] @2xl:text-right">
          Primary lockup. The descriptor is always set in mono, always broken by slashes, never centred.
        </p>
      </In>
    </section>
  )
}

// ---------------------------------------------------------------- 03 The fold system

const PRINCIPLES: { word: string; note: string; bg: string; fg: string; demo: ReactNode }[] = [
  {
    word: 'Hide',
    note: 'A plane covers part of the mark.',
    bg: 'var(--paper)',
    fg: 'var(--ink)',
    demo: (
      <div className="relative">
        <Mark className="w-full" />
        <span className="absolute inset-0 bg-[var(--signal)]" style={{ clipPath: 'polygon(0 55%, 100% 20%, 100% 100%, 0 100%)' }} />
      </div>
    ),
  },
  {
    word: 'Reveal',
    note: 'An opening shows what is inside.',
    bg: 'var(--ink)',
    fg: 'var(--paper)',
    demo: (
      <div className="relative aspect-square">
        <Photo k="croissantMacro" className="absolute inset-0" style={{ clipPath: 'inset(32% 0 32% 0)' }} />
      </div>
    ),
  },
  {
    word: 'Layer',
    note: 'Planes stack, each slightly shifted.',
    bg: 'var(--kraft-light)',
    fg: 'var(--ink)',
    demo: (
      <div className="relative aspect-square">
        {['var(--paper)', 'var(--kraft)', 'var(--signal)', 'var(--ink)'].map((c, i) => (
          <span key={c} className="absolute size-[62%]" style={{ background: c, left: `${i * 12}%`, top: `${i * 12}%` }} />
        ))}
      </div>
    ),
  },
  {
    word: 'Overlap',
    note: 'Two things occupy one space.',
    bg: 'var(--paper)',
    fg: 'var(--ink)',
    demo: (
      <div className="relative aspect-square">
        <Photo k="sandwichWrap" className="absolute left-0 top-0 size-[70%]" />
        <span className="absolute bottom-0 right-0 size-[60%] bg-[var(--signal)] mix-blend-multiply" />
      </div>
    ),
  },
  {
    word: 'Wrap',
    note: 'A band holds everything together.',
    bg: 'var(--signal)',
    fg: 'var(--ink)',
    demo: (
      <div className="relative grid aspect-square place-items-center">
        <span className="absolute inset-x-[18%] inset-y-[8%] bg-[var(--paper)]" />
        <span className="absolute inset-x-0 top-[40%] h-[22%] bg-[var(--ink)]" />
        <Mark className="relative w-[62%] text-[var(--paper)]" />
      </div>
    ),
  },
  {
    word: 'Compress',
    note: 'The mark presses together.',
    bg: 'var(--ink)',
    fg: 'var(--paper)',
    demo: <Mark className="w-full origin-left text-[var(--paper)]" style={{ transform: 'scaleX(0.58)' }} />,
  },
  {
    word: 'Tear',
    note: 'An edge that was not cut.',
    bg: 'var(--paper)',
    fg: 'var(--ink)',
    demo: (
      <div
        className="aspect-square bg-[var(--kraft)]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 52%, 88% 58%, 79% 51%, 66% 62%, 54% 55%, 41% 66%, 30% 58%, 18% 67%, 8% 60%, 0 66%)' }}
      />
    ),
  },
  {
    word: 'Continue',
    note: 'Nothing ends at the edge.',
    bg: 'var(--kraft)',
    fg: 'var(--ink)',
    demo: (
      <div className="overflow-hidden">
        <Mark className="w-[190%] text-[var(--ink)]" />
      </div>
    ),
  },
]

// Eight panels, folded flat, open one after another as the chapter is held in place
function FoldSystem() {
  const ref = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section ref={ref} className="relative bg-[var(--ink)] text-[var(--paper)]" style={{ height: '300cqh' }}>
      <div className="sticky top-0 flex flex-col overflow-hidden px-[4cqw] pb-[5cqh] pt-[7cqh]" style={{ height: '100cqh' }}>
        <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-end @2xl:justify-between">
          <div>
            <Head n="03" title="The fold system" light />
            <h3 className="fold-display mt-4" style={{ fontSize: 'max(26px, 5.2cqw)' }}>
              Eight ways to fold anything.
            </h3>
          </div>
          <p className="max-w-[44ch] text-[12px] leading-relaxed text-[var(--paper)]/60 @2xl:text-[13px]">
            Not a pattern library — a set of physical moves. Any surface FOLD touches can do one of these, and the layouts in
            this case study use them too.
          </p>
        </div>
        <div className="mt-[4cqh] grid flex-1 grid-cols-4 grid-rows-2 gap-[0.8cqw] @2xl:grid-cols-8 @2xl:grid-rows-1" style={{ perspective: '1400px' }}>
          {PRINCIPLES.map(({ word, note, bg, fg, demo }, i) => (
            <div
              key={word}
              data-scroll
              className="relative flex min-h-0 flex-col justify-between overflow-hidden p-[1.2cqw]"
              style={{
                background: bg,
                color: fg,
                transformOrigin: i % 2 ? 'right center' : 'left center',
                transform: `rotateY(calc((1 - clamp(0, var(--p, 0) * 9.5 - ${i * 1.05}, 1)) * ${i % 2 ? -84 : 84}deg))`,
              }}
            >
              <span className="fold-mono text-[9px] opacity-60 @2xl:text-[10px]">{String(i + 1).padStart(2, '0')}</span>
              <div className="my-[1.5cqh] w-full">{demo}</div>
              <div>
                <p className="fold-display" style={{ fontSize: 'max(15px, 2.2cqw)' }}>
                  {word}
                </p>
                <p className="mt-1 hidden text-[10px] leading-snug opacity-65 @2xl:block">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 04 Food / photography

const REEL: { k: PhotoKey; ratio: number; caption: string }[] = [
  { k: 'croissantMacro', ratio: 381 / 262, caption: 'Lamination' },
  { k: 'pastryTear', ratio: 165 / 263, caption: 'Tear' },
  { k: 'sandwichWrap', ratio: 353 / 262, caption: 'Layers' },
  { k: 'lattePour', ratio: 180 / 263, caption: 'Pour' },
  { k: 'icedCoffeeCroissant', ratio: 256 / 265, caption: 'Crumb' },
]

function Photography() {
  const ref = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section className="bg-[var(--ink)] text-[var(--paper)]">
      <div className="grid gap-[5cqh] px-[5cqw] pb-[6cqh] pt-[10cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end">
        <div>
          <Head n="04" title="Food / photography" light />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 8cqw)' }}>
            <span>
              <span>Close enough</span>
            </span>
            <span>
              <span className="text-[var(--signal)]">to taste.</span>
            </span>
          </In>
        </div>
        <In kind="rise" className="fold-mono grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] text-[var(--paper)]/65 @2xl:text-[11px]">
          <span>Warm, directional light</span>
          <span>Hard, believable shadow</span>
          <span>Rich warm blacks</span>
          <span>Crumbs left where they fall</span>
          <span>Hands, not models</span>
          <span>Food mid-action</span>
        </In>
      </div>

      {/* the reel: held in place, scrolled sideways */}
      <div ref={ref} className="relative" style={{ height: '320cqh' }}>
        <div className="sticky top-0 flex items-center overflow-hidden" style={{ height: '100cqh' }}>
          <div
            data-scroll
            className="flex shrink-0 items-end gap-[3cqw] pl-[5cqw] pr-[5cqw]"
            style={{ transform: 'translateX(calc((100cqw - 100%) * var(--p, 0)))' }}
          >
            {REEL.map(({ k, ratio, caption }, i) => (
              <figure key={k} className="shrink-0" style={{ marginBottom: i % 2 ? '9cqh' : 0 }}>
                <Photo
                  k={k}
                  style={{ height: i % 2 ? '52cqh' : '66cqh', width: `calc(${i % 2 ? 52 : 66}cqh * ${ratio})` }}
                />
                <figcaption className="fold-mono mt-3 flex gap-3 text-[10px] text-[var(--paper)]/55">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{caption}</span>
                </figcaption>
              </figure>
            ))}
            <p className="fold-display w-[60cqw] shrink-0 self-center @2xl:w-[38cqw]" style={{ fontSize: 'max(30px, 6.4cqw)' }}>
              Crumbs are part <span className="text-[var(--signal)]">of the story.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 05 Packaging

const PACKS: { k: PhotoKey; tag: string; className: string; drift: number }[] = [
  { k: 'cupHot', tag: 'Cup / 8 oz', className: '@2xl:left-[3cqw] @2xl:top-[22cqh] @2xl:w-[30cqw]', drift: -14 },
  { k: 'kraftBag', tag: 'Carrier bag', className: '@2xl:right-[4cqw] @2xl:top-[8cqh] @2xl:w-[26cqw]', drift: 10 },
  { k: 'boxesStack', tag: 'Pastry box', className: '@2xl:left-[30cqw] @2xl:top-[52cqh] @2xl:w-[36cqw]', drift: -6 },
  { k: 'boxOrange', tag: 'Corner seal', className: '@2xl:right-[2cqw] @2xl:top-[70cqh] @2xl:w-[24cqw]', drift: 16 },
  { k: 'pastryBag', tag: 'Pastry bag', className: '@2xl:left-[6cqw] @2xl:top-[96cqh] @2xl:w-[24cqw]', drift: 8 },
  { k: 'napkins', tag: 'Napkin', className: '@2xl:left-[37cqw] @2xl:top-[112cqh] @2xl:w-[22cqw]', drift: -12 },
  { k: 'stickers', tag: 'Sticker', className: '@2xl:right-[6cqw] @2xl:top-[118cqh] @2xl:w-[22cqw]', drift: 6 },
  { k: 'boxOpen', tag: 'Opened', className: '@2xl:left-[14cqw] @2xl:top-[150cqh] @2xl:w-[30cqw]', drift: -9 },
]

function Packaging() {
  const ref = useScrollProgress<HTMLDivElement>('cross')
  return (
    <section ref={ref} className="relative bg-[var(--kraft-light)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="relative z-10 @2xl:max-w-[54cqw]">
        <Head n="05" title="Packaging" />
        <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(34px, 7.6cqw)' }}>
          <span>
            <span>Folded,</span>
          </span>
          <span>
            <span>not decorated.</span>
          </span>
        </In>
        <p className="mt-5 max-w-[46ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          Every piece closes the same way: a corner folds back and the signal colour shows underneath. The fold is the brand
          mark on the move — it seals, it tells you where to open, and it is still there when the paper is crumpled.
        </p>
      </div>
      <div className="relative mt-[6cqh] grid grid-cols-2 gap-[4cqw] @2xl:mt-0 @2xl:block @2xl:h-[182cqh]">
        {PACKS.map(({ k, tag, className, drift }) => (
          <figure
            key={k}
            data-scroll
            className={`@2xl:absolute ${className}`}
            style={{ transform: `translateY(calc((var(--p, 0.5) - 0.5) * ${drift}cqh))` }}
          >
            <Photo k={k} className="aspect-[4/4.2] w-full shadow-[0_24px_50px_-28px_rgba(21,19,17,0.55)]" />
            <figcaption className="fold-mono mt-2 text-[10px] text-[var(--ink)]/60">{tag}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 06 Physical space

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
          <Photo k="storefront" className="h-[48cqh] w-full @2xl:h-[66cqh]" />
        </In>
        <div className="absolute left-[5cqw] top-[5cqh]">
          <Head n="06" title="Physical space" light />
        </div>
      </div>
      <div className="grid gap-[5cqw] px-[5cqw] pt-[8cqh] @2xl:grid-cols-[1.45fr_1fr]">
        <In kind="drop">
          <Photo k="counter" className="aspect-[349/263] w-full" />
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
            <Photo k="aFrame" className="aspect-[233/265] w-full" />
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

// ---------------------------------------------------------------- 07 Menu / print

const MENU: [string, [string, string][]][] = [
  ['Coffee', [['Espresso', '2.50'], ['Americano', '2.80'], ['Cappuccino', '3.20'], ['Latte', '3.50'], ['Flat white', '3.50'], ['Cold brew', '3.80']]],
  ['Pastry', [['Croissant', '3.00'], ['Pain au chocolat', '3.50'], ['Cinnamon roll', '4.20'], ['Seasonal pastry', '4.50']]],
  ['Sandwiches', [['Focaccia', '8.50'], ['Chicken sandwich', '8.50'], ['Avocado toast', '7.50'], ['Seasonal special', '9.00']]],
]

function Print() {
  return (
    <section className="relative overflow-hidden bg-[#d8d1c6] px-[5cqw] pb-[14cqh] pt-[10cqh]">
      <Head n="07" title="Menu / print" />
      <h3 className="fold-display mt-5 max-w-[14ch]" style={{ fontSize: 'max(30px, 6.4cqw)' }}>
        Paper that does what it says.
      </h3>

      <div className="relative mt-[7cqh] grid gap-[6cqh] @2xl:block @2xl:h-[118cqh]">
        {/* the menu: folded down the middle, its corner turned */}
        <In kind="drop" className="relative @2xl:absolute @2xl:left-[2cqw] @2xl:top-0 @2xl:w-[48cqw] @2xl:-rotate-[2deg]">
          <div
            className="relative bg-[var(--paper)] p-[5%] shadow-[0_30px_60px_-30px_rgba(21,19,17,0.5)]"
            style={{ backgroundImage: 'linear-gradient(90deg, transparent 49.6%, rgba(21,19,17,0.07) 50%, transparent 52%)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <Mark className="w-[34%] text-[var(--ink)]" />
              <p className="fold-mono text-right text-[9px] text-[var(--ink)]/70 @2xl:text-[10px]">
                Brunch / Bakery /<br />
                Specialty coffee /<br />
                All day
              </p>
            </div>
            <div className="mt-[8%] grid gap-[6%] @2xl:grid-cols-2">
              {MENU.map(([group, items]) => (
                <div key={group} className="fold-mono text-[10px] @2xl:text-[11px]">
                  <p className="mb-2 font-medium">{group}</p>
                  {items.map(([item, price]) => (
                    <p key={item} className="flex justify-between gap-3 text-[var(--ink)]/75">
                      <span>{item}</span>
                      <span>{price}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <Corner className="bottom-0 right-0 rotate-[-90deg]" size="12cqw" />
          </div>
        </In>

        {/* the receipt, torn off */}
        <In kind="rise" delay={0.15} className="relative mx-auto w-[64%] @2xl:absolute @2xl:right-[16cqw] @2xl:top-[8cqh] @2xl:w-[22cqw] @2xl:rotate-[3deg]">
          <div
            className="fold-mono bg-white px-[9%] pb-[18%] pt-[9%] text-[10px] text-[var(--ink)]/80 shadow-[0_30px_50px_-30px_rgba(21,19,17,0.5)]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 94% 99%, 88% 96%, 82% 99%, 76% 96%, 70% 99%, 64% 96%, 58% 99%, 52% 96%, 46% 99%, 40% 96%, 34% 99%, 28% 96%, 22% 99%, 16% 96%, 10% 99%, 4% 96%, 0 99%)' }}
          >
            <Mark className="mx-auto mb-4 w-[44%] text-[var(--ink)]" />
            <p className="text-center">Order 0247 — Table 6</p>
            <p className="my-3 border-t border-dashed border-[var(--ink)]/30" />
            {[['1 Flat white', '3.50'], ['1 Croissant', '3.00'], ['1 Focaccia', '8.50'], ['1 Cold brew', '3.80']].map(([a, b]) => (
              <p key={a} className="flex justify-between">
                <span>{a}</span>
                <span>{b}</span>
              </p>
            ))}
            <p className="my-3 border-t border-dashed border-[var(--ink)]/30" />
            <p className="flex justify-between font-medium">
              <span>Total</span>
              <span>18.80</span>
            </p>
            <p className="mt-5 text-center">Good things ahead.</p>
          </div>
        </In>

        {/* sticker and loyalty card */}
        <In kind="rise" delay={0.25} className="mx-auto grid aspect-square w-[40%] place-items-center rounded-full bg-[var(--signal)] @2xl:absolute @2xl:right-[3cqw] @2xl:top-[58cqh] @2xl:w-[15cqw] @2xl:-rotate-[12deg]">
          <Mark className="w-[64%] text-[var(--ink)]" />
        </In>
        <In kind="rise" delay={0.3} className="relative @2xl:absolute @2xl:bottom-0 @2xl:left-[30cqw] @2xl:w-[34cqw] @2xl:rotate-[1.5deg]">
          <div className="relative aspect-[1.6/1] bg-[var(--ink)] p-[6%] text-[var(--paper)] shadow-[0_30px_50px_-30px_rgba(21,19,17,0.6)]">
            <div className="flex items-start justify-between">
              <p className="fold-display" style={{ fontSize: 'max(20px, 2.6cqw)' }}>
                Fold it.
              </p>
              <p className="fold-mono text-right text-[9px] text-[var(--paper)]/60">Ninth one is on us</p>
            </div>
            <div className="mt-[8%] grid grid-cols-8 gap-[3%]">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="relative aspect-square overflow-hidden border border-[var(--paper)]/40">
                  {i < 5 && <span className="absolute inset-0 bg-[var(--signal)]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />}
                </span>
              ))}
            </div>
          </div>
        </In>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 08 Campaign

const SLOGANS: { text: string; tone: 'ink' | 'paper'; dir: number }[] = [
  { text: 'One more layer.', tone: 'ink', dir: -1 },
  { text: 'Made to come apart.', tone: 'paper', dir: 1 },
  { text: 'Good things inside.', tone: 'ink', dir: -1 },
  { text: 'Tear. Dip. Share.', tone: 'paper', dir: 1 },
]

function Campaign() {
  const ref = useScrollProgress<HTMLDivElement>('cross')
  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--signal)] pb-[12cqh] pt-[10cqh]">
      <div className="px-[5cqw]">
        <Head n="08" title="Campaign / social" />
      </div>
      <div className="mt-[6cqh] flex flex-col gap-[3cqh]">
        {SLOGANS.map(({ text, tone, dir }, i) => (
          <div key={text}>
            <p
              data-scroll
              className="fold-display whitespace-nowrap"
              style={{
                fontSize: 'max(48px, 14cqw)',
                color: tone === 'ink' ? 'var(--ink)' : 'var(--paper)',
                transform: `translateX(calc(${i % 2 ? 4 : -2}cqw + (var(--p, 0.5) - 0.5) * ${dir * 36}cqw))`,
              }}
            >
              {text}
            </p>
            {i === 1 && (
              <div className="my-[4cqh] grid grid-cols-[1.6fr_1fr] gap-[3cqw] px-[5cqw]">
                <In kind="drop">
                  <Photo k="windowCampaign" className="aspect-[368/265] w-full" />
                </In>
                <In kind="drop" delay={0.12} className="-rotate-[3deg] @2xl:mt-[6cqh]">
                  <Photo k="posterGoodThings" className="aspect-[183/263] w-full" />
                </In>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="fold-mono mt-[6cqh] px-[5cqw] text-[10px] text-[var(--ink)]/70 @2xl:max-w-[60ch] @2xl:text-[11px]">
        Lines are short, physical and a little impatient — instructions as much as slogans. They run on windows, posters,
        cup sleeves and stories, always set in the same condensed voice, always broken where you would take a bite.
      </p>
    </section>
  )
}

// ---------------------------------------------------------------- 09 Digital

function Screen({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="relative aspect-[9/18.5] overflow-hidden rounded-[18px] shadow-[0_40px_70px_-40px_rgba(21,19,17,0.55)] ring-1 ring-[var(--ink)]/10"
      style={{ background: dark ? 'var(--ink)' : 'var(--paper)', color: dark ? 'var(--paper)' : 'var(--ink)' }}
    >
      {children}
    </div>
  )
}

function Nav({ active }: { active: string }) {
  return (
    <div className="flex items-center justify-between px-[7%] pt-[8%]">
      <Mark className="w-[26%] text-[var(--ink)]" />
      <span className="flex flex-col gap-[3px]">
        <span className="block h-px w-4 bg-[var(--ink)]" />
        <span className="block h-px w-4 bg-[var(--ink)]" />
        <span className="block h-px w-4 bg-[var(--ink)]" />
      </span>
      <div className="fold-mono absolute inset-x-[7%] top-[12%] flex justify-between text-[8px]">
        {['Today', 'Menu', 'Bakery', 'Visit'].map((t) => (
          <span key={t} className={t === active ? 'border-b border-[var(--signal)] text-[var(--ink)]' : 'text-[var(--ink)]/45'}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function Digital() {
  return (
    <section className="bg-[var(--paper)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-end">
        <div>
          <Head n="09" title="Digital" />
          <In kind="lines" className="fold-display mt-5" style={{ fontSize: 'max(32px, 7cqw)' }}>
            <span>
              <span>Four words</span>
            </span>
            <span>
              <span>of navigation.</span>
            </span>
          </In>
        </div>
        <p className="max-w-[44ch] text-[13px] leading-relaxed text-[var(--ink)]/75">
          Today, Menu, Bakery, Visit — the site answers the four things people come for. The fold carries over as a single
          rule: content is revealed by opening, never by sliding in. Prices are mono, like the receipt.
        </p>
      </div>

      <div className="mt-[8cqh] grid grid-cols-3 items-start gap-[3cqw]">
        {/* Today */}
        <In kind="rise">
          <Screen>
            <Nav active="Today" />
            <div className="absolute inset-x-0 top-[20%] h-[44%]">
              <div className="size-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
                <Photo k="croissantMacro" className="size-full" />
              </div>
              <span className="absolute left-0 top-0 h-[42%] w-[30%] bg-[var(--signal)]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
            </div>
            <div className="absolute inset-x-[7%] bottom-[7%]">
              <p className="fold-mono text-[8px] leading-snug text-[var(--ink)]/75">
                Brunch /<br />
                Bakery /<br />
                Specialty coffee /<br />
                All day
              </p>
              <span className="fold-mono mt-[10%] inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[8px] text-[var(--paper)]">
                See menu →
              </span>
            </div>
          </Screen>
          <p className="fold-mono mt-3 text-[10px] text-[var(--ink)]/55">Today</p>
        </In>
        {/* Menu */}
        <In kind="rise" delay={0.1} className="mt-[8cqh]">
          <Screen>
            <Nav active="Menu" />
            <div className="absolute inset-x-[7%] top-[20%]">
              <p className="fold-display text-[clamp(14px,2.4cqw,30px)]">Pastry</p>
              <span className="fold-mono mt-1 inline-block bg-[var(--signal)] px-1.5 py-0.5 text-[7px] text-[var(--ink)]">Fresh from 7:00</span>
              <div className="fold-mono mt-[12%] text-[8px]">
                {MENU[1][1].map(([item, price], i) => (
                  <p key={item} className="flex justify-between border-b border-[var(--ink)]/10 py-[6%]" style={{ opacity: i === 0 ? 1 : 0.75 }}>
                    <span>{item}</span>
                    <span>{price}</span>
                  </p>
                ))}
              </div>
              <p className="fold-display mt-[14%] text-[clamp(14px,2.4cqw,30px)] opacity-30">Coffee</p>
            </div>
          </Screen>
          <p className="fold-mono mt-3 text-[10px] text-[var(--ink)]/55">Menu</p>
        </In>
        {/* Visit */}
        <In kind="rise" delay={0.2} className="mt-[3cqh]">
          <Screen dark>
            <div className="absolute inset-x-0 top-0 h-[52%] bg-[#2a2622]" style={{ backgroundImage: 'linear-gradient(rgba(239,232,220,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(239,232,220,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
              <span className="absolute left-[46%] top-[44%] size-3 rotate-45 bg-[var(--signal)]" />
            </div>
            <div className="absolute inset-x-[7%] top-[58%]">
              <p className="fold-display text-[clamp(14px,2.4cqw,30px)] text-[var(--paper)]">Visit</p>
              <p className="fold-mono mt-[8%] text-[8px] leading-relaxed text-[var(--paper)]/70">
                Mon–Fri 7:00–18:00
                <br />
                Sat–Sun 8:00–17:00
              </p>
              <p className="fold-mono mt-[8%] text-[8px] text-[var(--paper)]/45">Open now — counter + tables</p>
            </div>
          </Screen>
          <p className="fold-mono mt-3 text-[10px] text-[var(--ink)]/55">Visit</p>
        </In>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 10 Motion principles

function Motion() {
  const reveal = useInView<HTMLDivElement>(0.4)
  const settle = useInView<HTMLDivElement>(0.4)
  return (
    <section className="bg-[var(--ink)] px-[5cqw] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <Head n="10" title="Motion principles" light />
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
