import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { PhotoSlot } from '../PhotoSlot'
import { useInView, useScrollProgress } from '../scroll'
import './open-shelf.css'

// OPEN SHELF — Brand identity for a city's public library network, 2025.
//
// Insight: people think a library is a place that owns knowledge. It isn't — it's the one place
// in the city that lends it. Everything on the shelves belongs to everyone, and is out more often
// than it is in.
// Idea: EVERYTHING HERE IS BORROWED. The brand is built from what lending leaves behind: the gap
// on a shelf, the call number on a spine, the date stamped inside the cover.
// Logo logic: the name rests on a shelf line with one gap in it — a book that is out. Each branch
// has its own gap, at its own place on the line. The mark is never complete, on purpose.
// Typography: Inter Tight (one weight for words, one for emphasis) and DM Mono for anything a
// catalogue would say. Colour: paper, ink, and one loan blue — the colour of the date stamp.
// Voice: plain, generous, a little dry. Imperatives that invite: Take it home. Bring it back.
// Motion: lend and return. Things slide out of their row, wait, and slide back.
//
// Story: 00 Insight · 01 The gap · 02 Call numbers · 03 Type + colour · 04 The stamp ·
// 05 Wayfinding · 06 The card · 07 Catalogue (digital) · 08 Campaign · 09 Motion · 10 Closing

const BRANCHES: { name: string; gap: number; call: string }[] = [
  { name: 'Central', gap: 0.18, call: '027.4 CEN' },
  { name: 'Riverside', gap: 0.62, call: '027.4 RIV' },
  { name: 'North Hill', gap: 0.41, call: '027.4 NOR' },
  { name: 'Harbour', gap: 0.84, call: '027.4 HAR' },
  { name: 'Old Market', gap: 0.07, call: '027.4 OLD' },
  { name: 'Eastfield', gap: 0.53, call: '027.4 EAS' },
]

export function OpenShelfCaseStudy() {
  return (
    <article className="os" aria-label="Open Shelf — Brand identity case study">
      <Insight />
      <Gap />
      <CallNumbers />
      <TypeColour />
      <Stamp />
      <Wayfinding />
      <Card />
      <Catalogue />
      <Campaign />
      <MotionPrinciple />
      <Closing />
    </article>
  )
}

// ------------------------------------------------------------ building blocks

// The mark: OPEN SHELF resting on a shelf line, with one gap (fraction along the line)
function Mark({ gap = 0.18, className = '', style, tone = 'var(--ink)' }: { gap?: number; className?: string; style?: CSSProperties; tone?: string }) {
  const g = Math.min(Math.max(gap, 0.04), 0.9)
  return (
    <div className={`inline-flex flex-col ${className}`} style={{ ...style, color: tone }} role="img" aria-label="Open Shelf">
      <span className="whitespace-nowrap font-medium leading-[0.92] tracking-[-0.035em]" style={{ fontSize: '1em' }}>
        Open Shelf
      </span>
      <span className="relative mt-[0.12em] block h-[0.075em] w-full" aria-hidden>
        <span className="absolute inset-y-0 left-0 bg-current" style={{ right: `${(1 - g) * 100}%` }} />
        <span className="absolute inset-y-0 right-0 bg-current" style={{ left: `calc(${g * 100}% + 0.42em)` }} />
      </span>
    </div>
  )
}

function Head({ n, title, tone = 'var(--ink)' }: { n: string; title: string; tone?: string }) {
  return (
    <p className="os-mono flex items-baseline gap-3 text-[11px]" style={{ color: tone }}>
      <span className="text-[var(--blue)]">{n}</span>
      <span className="opacity-60">{title}</span>
    </p>
  )
}

function Lend({ children, delay = 0, className = '', style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useInView<HTMLDivElement>(0.15)
  return (
    <div ref={ref} className={`os-lend ${className}`} style={{ ...style, ['--d' as string]: `${delay}s` }}>
      {children}
    </div>
  )
}

// A due-date stamp
function DueStamp({ date, rotate = -8, delay = 0, className = '', size = 'md' }: { date: string; rotate?: number; delay?: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const ref = useInView<HTMLDivElement>(0.4)
  const s = size === 'lg' ? 'text-[clamp(18px,3cqw,34px)] px-[0.7em] py-[0.35em]' : size === 'sm' ? 'text-[10px] px-2 py-1' : 'text-[13px] px-3 py-1.5'
  return (
    <div
      ref={ref}
      className={`os-stamp os-mono inline-flex flex-col items-center rounded-[3px] border-2 border-[var(--blue)] text-[var(--blue)] ${s} ${className}`}
      style={{ ['--r' as string]: `${rotate}deg`, ['--d' as string]: `${delay}s`, mixBlendMode: 'multiply' }}
    >
      <span className="text-[0.62em] tracking-[0.18em]">DUE BACK</span>
      <span className="font-medium tracking-[0.06em]">{date}</span>
    </div>
  )
}

// ------------------------------------------------------------ 00 Insight

function LiveCount() {
  // a live-looking count of everything out on loan right now
  const [n, setN] = useState(1284602)
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + (Math.random() < 0.55 ? 1 : -1)), 900)
    return () => clearInterval(id)
  }, [])
  return <>{n.toLocaleString('en-GB')}</>
}

function Insight() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden px-[6cqw] pb-[6cqh] pt-[7cqh]" style={{ minHeight: '100cqh' }}>
      <div className="os-mono flex justify-between text-[11px] text-[var(--ink)]/55">
        <span>Case study 02 / 04</span>
        <span>Brand identity / Public library / 2025</span>
      </div>
      <div>
        <Lend>
          <p className="max-w-[16ch] font-medium leading-[0.98] tracking-[-0.035em]" style={{ fontSize: 'max(34px, 7.4cqw)' }}>
            Nothing here is yours. <span className="text-[var(--blue)]">That&rsquo;s the point.</span>
          </p>
        </Lend>
        {/* a shelf, mostly full, with the gaps showing what is out */}
        <div className="mt-[7cqh] flex h-[18cqh] items-end gap-[0.45cqw] border-b-2 border-[var(--ink)]" aria-hidden>
          {Array.from({ length: 64 }, (_, i) => {
            const out = [5, 6, 13, 22, 23, 24, 31, 40, 47, 48, 55, 61].includes(i)
            const h = 58 + ((i * 37) % 42)
            return (
              <span
                key={i}
                className="flex-1"
                style={{
                  height: `${h}%`,
                  background: out ? 'transparent' : i % 9 === 0 ? 'var(--blue)' : i % 4 === 0 ? 'var(--ink)' : '#c9c8c1',
                  outline: out ? '1px dashed rgba(31,69,255,0.45)' : 'none',
                  outlineOffset: -1,
                }}
              />
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <Mark gap={0.18} style={{ fontSize: 'max(26px, 4.4cqw)' }} />
        <p className="os-mono text-[11px] text-[var(--ink)]/65 @2xl:text-right">
          <span className="text-[var(--blue)]">
            <LiveCount />
          </span>{' '}
          items out on loan right now
          <br />
          across 6 branches
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 01 The gap

function Gap() {
  const ref = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section className="bg-[var(--ink)] text-[var(--paper)]">
      <div ref={ref} className="relative" style={{ height: '230cqh' }}>
        <div className="sticky top-0 flex flex-col justify-between overflow-hidden px-[6cqw] pb-[7cqh] pt-[8cqh]" style={{ height: '100cqh' }}>
          <Head n="01" title="The gap" tone="var(--paper)" />
          <div>
            {/* the gap travels along the line as the chapter scrolls */}
            <div className="relative" style={{ fontSize: 'max(44px, 11cqw)' }}>
              <span className="whitespace-nowrap font-medium leading-[0.92] tracking-[-0.035em]">Open Shelf</span>
              <span className="relative mt-[0.12em] block h-[0.075em] w-full" aria-hidden>
                <span data-scroll className="absolute inset-y-0 left-0 bg-[var(--paper)]" style={{ right: 'calc(100% - (8% + var(--p, 0) * 78%))' }} />
                <span data-scroll className="absolute inset-y-0 right-0 bg-[var(--paper)]" style={{ left: 'calc(8% + var(--p, 0) * 78% + 0.42em)' }} />
                <span data-scroll className="absolute -top-[1.1em] h-[0.9em] w-[0.42em] border border-dashed border-[var(--blue)]" style={{ left: 'calc(8% + var(--p, 0) * 78%)' }} />
              </span>
            </div>
          </div>
          <div className="grid gap-[3cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-end">
            <p className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--paper)]/70">
              The mark is the name resting on a shelf, with one book out. It is never complete — a full shelf would mean nobody
              is reading. The gap is where the brand begins.
            </p>
            <p className="os-mono text-[11px] text-[var(--paper)]/50 @2xl:text-right">Each branch keeps its gap in its own place on the line.</p>
          </div>
        </div>
      </div>
      {/* the six branch marks */}
      <div className="grid grid-cols-2 gap-px bg-[var(--paper)]/15 @2xl:grid-cols-3">
        {BRANCHES.map((b, i) => (
          <Lend key={b.name} delay={i * 0.06} className="bg-[var(--ink)] p-[5cqw] @2xl:p-[3.4cqw]">
            <Mark gap={b.gap} tone="var(--paper)" style={{ fontSize: 'max(20px, 2.8cqw)' }} />
            <div className="os-mono mt-[3cqh] flex justify-between text-[10px] text-[var(--paper)]/55">
              <span>{b.name}</span>
              <span className="text-[var(--blue)]">{b.call}</span>
            </div>
          </Lend>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 02 Call numbers

const CARDS: { call: string; title: string; kind: string; date: string }[] = [
  { call: '027.4 OPE', title: 'Open Shelf — the library itself', kind: 'Brand', date: '02 MAR' },
  { call: '741.6 POS', title: 'Season poster, spring', kind: 'Campaign', date: '14 MAR' },
  { call: '372.4 STO', title: 'Saturday story hour', kind: 'Event', date: '21 MAR' },
  { call: '004.6 LAB', title: 'Digital lab, Riverside', kind: 'Space', date: '28 MAR' },
  { call: '780 LIS', title: 'Listening room', kind: 'Space', date: '04 APR' },
  { call: '646.4 REP', title: 'Repair café, Eastfield', kind: 'Event', date: '11 APR' },
]

function CallNumbers() {
  return (
    <section className="px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1fr_1.2fr]">
        <div>
          <Head n="02" title="Call numbers" />
          <h3 className="mt-5 max-w-[12ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.4cqw)' }}>
            Everything gets a place on the shelf.
          </h3>
        </div>
        <p className="max-w-[46ch] self-end text-[14px] leading-relaxed text-[var(--ink)]/70">
          The library already has the most rigorous naming system in the city. The identity borrows it: every branch, event,
          poster and room is catalogued with a real Dewey call number, set in mono, always in the same place — top right, like
          a spine label. The system tells you what something is before you read it.
        </p>
      </div>
      <div className="mt-[8cqh] grid grid-cols-1 gap-[2.4cqw] @lg:grid-cols-2 @2xl:grid-cols-3">
        {CARDS.map((c, i) => (
          <Lend key={c.call} delay={(i % 3) * 0.08}>
            <div className="os-grid relative aspect-[5/3] bg-[var(--card)] p-[7%] shadow-[0_1px_0_var(--rule),0_18px_30px_-24px_rgba(17,18,20,0.35)]">
              {/* punched hole of a catalogue card */}
              <span className="absolute bottom-[8%] left-1/2 size-[7%] -translate-x-1/2 rounded-full bg-[var(--paper)] shadow-inner" aria-hidden />
              <div className="flex items-start justify-between gap-4">
                <span className="os-mono text-[10px] text-[var(--ink)]/55">{c.kind}</span>
                <span className="os-mono text-[15px] font-medium leading-tight text-[var(--blue)]">
                  {c.call.split(' ')[0]}
                  <br />
                  {c.call.split(' ')[1]}
                </span>
              </div>
              <p className="mt-[8%] max-w-[18ch] text-[clamp(14px,1.7cqw,20px)] font-medium leading-tight tracking-[-0.01em]">{c.title}</p>
              <span className="os-mono absolute bottom-[7%] right-[7%] text-[9px] text-[var(--ink)]/40">{c.date}</span>
            </div>
          </Lend>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 03 Type + colour

function TypeColour() {
  return (
    <section className="border-t border-[var(--rule)] px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="03" title="Type + colour" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1.35fr_1fr] @2xl:gap-[5cqw]">
        <div className="flex flex-col gap-[4cqh]">
          <Lend>
            <p className="os-mono text-[11px] text-[var(--ink)]/50">Words — Inter Tight Medium</p>
            <p className="mt-2 font-medium leading-[0.95] tracking-[-0.035em]" style={{ fontSize: 'max(40px, 9cqw)' }}>
              Aa Bb Cc
            </p>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-[var(--ink)]/75">
              Plain and generous. One weight for words, one for emphasis, nothing else. A library talks to everyone at once.
            </p>
          </Lend>
          <Lend delay={0.1}>
            <p className="os-mono text-[11px] text-[var(--ink)]/50">Catalogue — DM Mono</p>
            <p className="os-mono mt-2 leading-none text-[var(--blue)]" style={{ fontSize: 'max(30px, 6cqw)' }}>
              027.4 OPE
            </p>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-[var(--ink)]/75">
              For anything a catalogue would say: call numbers, dates, opening hours, counts. Mono keeps the numbers in columns.
            </p>
          </Lend>
        </div>
        <div className="grid grid-cols-2 grid-rows-[2fr_1fr] gap-[2cqw]">
          <Lend className="col-span-2 flex flex-col justify-between bg-[var(--blue)] p-[7%] text-white">
            <span className="os-mono text-[11px]">Loan blue — #1F45FF</span>
            <span className="max-w-[16ch] text-[clamp(16px,2cqw,24px)] font-medium leading-tight">
              The colour of the stamp. It only ever marks something happening.
            </span>
          </Lend>
          <Lend delay={0.08} className="flex flex-col justify-between bg-[var(--ink)] p-[9%] text-[var(--paper)]">
            <span className="os-mono text-[10px]">Ink — #111214</span>
          </Lend>
          <Lend delay={0.14} className="flex flex-col justify-between bg-[var(--card)] p-[9%] shadow-[inset_0_0_0_1px_var(--rule)]">
            <span className="os-mono text-[10px]">Card — #FBFAF6</span>
          </Lend>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 04 The stamp

function Stamp() {
  return (
    <section className="relative overflow-hidden bg-[var(--blue-soft)] px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="04" title="The stamp" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1fr_1.2fr] @2xl:items-center">
        <div>
          <h3 className="max-w-[13ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
            Every loan ends with a date.
          </h3>
          <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-[var(--ink)]/70">
            The due-date stamp is the brand&rsquo;s only ornament. It lands on posters, receipts, tote bags and the website — always
            slightly crooked, always in loan blue, always a real date. It turns every piece of communication into a promise: this
            comes back.
          </p>
        </div>
        {/* a date label inside a cover, stamped over and over */}
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="os-grid relative aspect-[4/5] bg-[var(--card)] p-[8%] shadow-[0_30px_50px_-30px_rgba(17,18,20,0.4)]">
            <div className="flex items-start justify-between">
              <Mark gap={0.62} style={{ fontSize: 'clamp(16px,2.4cqw,26px)' }} />
              <span className="os-mono text-right text-[10px] leading-tight text-[var(--ink)]/50">
                Riverside
                <br />
                027.4 RIV
              </span>
            </div>
            <p className="os-mono mt-[6%] text-[10px] text-[var(--ink)]/45">Date due</p>
            <div className="relative mt-2 h-[68%]">
              {[
                ['12 JAN', -9, 6, 4],
                ['03 FEB', 6, 52, 10],
                ['27 FEB', -4, 14, 34],
                ['19 MAR', 11, 50, 44],
                ['08 APR', -7, 10, 66],
                ['30 APR', 4, 48, 74],
              ].map(([d, r, x, y], i) => (
                <div key={d as string} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                  <DueStamp date={d as string} rotate={r as number} delay={i * 0.18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 05 Wayfinding

const RANGES = [
  ['000', '099', 'Knowledge'],
  ['100', '299', 'Thought + belief'],
  ['300', '399', 'Society'],
  ['500', '699', 'Science + making'],
  ['700', '799', 'Arts + play'],
  ['800', '999', 'Stories + places'],
]

function Wayfinding() {
  return (
    <section className="bg-[var(--ink)] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <div className="px-[6cqw]">
        <Head n="05" title="Wayfinding" tone="var(--paper)" />
        <h3 className="mt-5 max-w-[15ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
          The building is the catalogue.
        </h3>
      </div>
      {/* shelf-end signs: the call-number ranges, as bands */}
      <div className="mt-[7cqh] flex flex-col">
        {RANGES.map(([from, to, name], i) => (
          <Lend key={from} delay={i * 0.05}>
            <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-[3cqw] border-t border-[var(--paper)]/15 px-[6cqw] py-[2.6cqh]">
              <span className="os-mono text-[clamp(14px,2.2cqw,26px)] text-[var(--blue)]">
                {from}–{to}
              </span>
              <span className="font-medium tracking-[-0.025em]" style={{ fontSize: 'max(20px, 3.6cqw)' }}>
                {name}
              </span>
              <span className="os-mono text-[10px] text-[var(--paper)]/45">Floor {i < 3 ? 1 : 2} →</span>
            </div>
          </Lend>
        ))}
      </div>
      <div className="mt-[8cqh] grid gap-[3cqw] px-[6cqw] @2xl:grid-cols-[1.4fr_1fr]">
        <PhotoSlot
          src="/projects/open-shelf/branch-interior.jpg"
          brief="Riverside branch: long shelf-end signs in ink and loan blue receding down an aisle, daylight, people reading. Wide, documentary, not staged."
          tone="dark"
          className="aspect-[16/10] w-full"
        />
        <div className="flex flex-col justify-between gap-[4cqh]">
          <p className="max-w-[40ch] text-[14px] leading-relaxed text-[var(--paper)]/65">
            Signs are the same object as the spine label, scaled up: a range of numbers, a plain name, a direction. Visitors
            learn the system once and can find anything in any branch.
          </p>
          {/* a hanging sign */}
          <div className="bg-[var(--paper)] p-[7%] text-[var(--ink)]">
            <div className="flex items-start justify-between">
              <span className="os-mono text-[clamp(22px,3.2cqw,40px)] leading-none text-[var(--blue)]">700–799</span>
              <span className="os-mono text-[10px] text-[var(--ink)]/50">↑ Floor 2</span>
            </div>
            <p className="mt-[10%] font-medium leading-none tracking-[-0.03em]" style={{ fontSize: 'clamp(22px,3.4cqw,42px)' }}>
              Arts + play
            </p>
            <p className="os-mono mt-3 text-[10px] text-[var(--ink)]/50">Music · Film · Games · Design · Sport</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 06 The card

function Card() {
  return (
    <section className="px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[6cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-center">
        <div>
          <Head n="06" title="The card" />
          <h3 className="mt-5 max-w-[12ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
            One card. The whole city&rsquo;s shelves.
          </h3>
          <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-[var(--ink)]/70">
            The membership card carries your own gap: the line breaks at a point set by your member number, so no two cards
            are quite the same. Free, for everyone, forever — the card says so on the back.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[460px]">
          <Lend className="relative z-10 aspect-[1.586/1] rounded-[14px] bg-[var(--blue)] p-[7%] text-white shadow-[0_30px_50px_-28px_rgba(31,69,255,0.7)]">
            <div className="flex h-full flex-col justify-between">
              <Mark gap={0.71} tone="#fff" style={{ fontSize: 'clamp(18px,2.6cqw,30px)' }} />
              <div className="flex items-end justify-between">
                <div className="os-mono text-[10px] leading-relaxed text-white/80">
                  Member
                  <br />
                  <span className="text-[13px] text-white">0071 4429 18</span>
                </div>
                <span className="os-mono text-[10px] text-white/70">Since 2025</span>
              </div>
            </div>
          </Lend>
          <Lend delay={0.15} className="absolute -bottom-[16%] -right-[6%] aspect-[1.586/1] w-[86%] -rotate-[5deg] rounded-[14px] bg-[var(--card)] p-[6%] shadow-[0_24px_40px_-26px_rgba(17,18,20,0.45)] ring-1 ring-[var(--rule)]">
            <div className="flex h-full flex-col justify-between">
              <p className="text-[clamp(12px,1.6cqw,17px)] font-medium leading-tight">Free, for everyone, forever.</p>
              {/* barcode */}
              <div className="flex h-[30%] items-stretch gap-[2px]" aria-hidden>
                {Array.from({ length: 46 }, (_, i) => (
                  <span key={i} className="bg-[var(--ink)]" style={{ width: [1, 2, 1, 3, 1, 2][i % 6] }} />
                ))}
              </div>
            </div>
          </Lend>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 07 Catalogue (digital)

const RESULTS: { title: string; author: string; call: string; status: 'in' | 'out'; due?: string; branch: string }[] = [
  { title: 'The Shape of Things', author: 'M. Ortega', call: '745.4 ORT', status: 'in', branch: 'Central' },
  { title: 'Gardening in Small Spaces', author: 'L. Haas', call: '635 HAA', status: 'out', due: '19 MAR', branch: 'Riverside' },
  { title: 'A Year of Bread', author: 'S. Okafor', call: '641.8 OKA', status: 'in', branch: 'Harbour' },
  { title: 'Maps of Imaginary Places', author: 'P. Lind', call: '912 LIN', status: 'out', due: '02 APR', branch: 'North Hill' },
]

function Catalogue() {
  return (
    <section className="bg-[var(--card)] px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-end">
        <div>
          <Head n="07" title="Catalogue" />
          <h3 className="mt-5 max-w-[14ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
            Search that answers one question: can I have it?
          </h3>
        </div>
        <p className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--ink)]/70">
          Every result says where something is and whether it is in. Items out on loan show the stamp and the date they come
          back, so the answer is never just &ldquo;no&rdquo;.
        </p>
      </div>
      {/* the catalogue, as an interface */}
      <Lend className="mt-[7cqh] overflow-hidden rounded-[10px] bg-[var(--paper)] shadow-[0_30px_60px_-34px_rgba(17,18,20,0.45)] ring-1 ring-[var(--rule)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] px-[4%] py-[2.4%]">
          <Mark gap={0.18} style={{ fontSize: 'clamp(14px,1.8cqw,20px)' }} />
          <div className="os-mono hidden gap-6 text-[11px] text-[var(--ink)]/55 @2xl:flex">
            <span className="text-[var(--ink)]">Search</span>
            <span>Branches</span>
            <span>What&rsquo;s on</span>
            <span>My loans</span>
          </div>
        </div>
        <div className="px-[4%] py-[4%]">
          <div className="flex items-center gap-3 border-b-2 border-[var(--ink)] pb-3">
            <span className="text-[clamp(18px,2.6cqw,30px)] font-medium tracking-[-0.02em]">small spaces</span>
            <span className="h-[1.2em] w-px animate-pulse bg-[var(--blue)]" />
            <span className="os-mono ml-auto text-[10px] text-[var(--ink)]/45">4 results · 6 branches</span>
          </div>
          <div className="mt-[3%] flex flex-col">
            {RESULTS.map((r) => (
              <div key={r.call} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--rule)] py-[2.2%] @2xl:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <p className="text-[clamp(13px,1.6cqw,17px)] font-medium leading-tight">{r.title}</p>
                  <p className="os-mono mt-1 text-[10px] text-[var(--ink)]/50">{r.author}</p>
                </div>
                <span className="os-mono hidden text-[12px] text-[var(--blue)] @2xl:block">{r.call}</span>
                <span className="os-mono hidden text-[11px] text-[var(--ink)]/55 @2xl:block">{r.branch}</span>
                {r.status === 'in' ? (
                  <span className="os-mono rounded-full bg-[var(--ink)] px-3 py-1 text-[10px] text-[var(--paper)]">On the shelf</span>
                ) : (
                  <DueStamp date={r.due!} rotate={-5} size="sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Lend>
    </section>
  )
}

// ------------------------------------------------------------ 08 Campaign

function Poster({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative flex aspect-[1/1.414] flex-col justify-between p-[7%] ${className}`} style={style}>
      {children}
    </div>
  )
}

function Campaign() {
  return (
    <section className="px-[6cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="08" title="Campaign" />
      <h3 className="mt-5 max-w-[16ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
        Take it home. Bring it back changed.
      </h3>
      <div className="mt-[7cqh] grid grid-cols-1 gap-[3cqw] @lg:grid-cols-3">
        <Lend>
          <Poster className="bg-[var(--blue)] text-white">
            <div className="flex justify-between">
              <span className="os-mono text-[10px]">641.8</span>
              <span className="os-mono text-[10px]">Spring season</span>
            </div>
            <p className="font-medium leading-[0.95] tracking-[-0.035em]" style={{ fontSize: 'clamp(28px,4.6cqw,56px)' }}>
              Take it home.
            </p>
            <Mark gap={0.33} tone="#fff" style={{ fontSize: 'clamp(12px,1.5cqw,17px)' }} />
          </Poster>
        </Lend>
        <Lend delay={0.1}>
          <Poster className="bg-[var(--card)] shadow-[inset_0_0_0_1px_var(--rule)]">
            <div className="flex justify-between">
              <span className="os-mono text-[10px] text-[var(--blue)]">372.4</span>
              <span className="os-mono text-[10px] text-[var(--ink)]/50">Saturdays 10:00</span>
            </div>
            <div>
              <p className="font-medium leading-[0.95] tracking-[-0.035em]" style={{ fontSize: 'clamp(28px,4.6cqw,56px)' }}>
                Borrow a story. Return a reader.
              </p>
              <div className="mt-[8%]">
                <DueStamp date="EVERY SAT" rotate={-6} />
              </div>
            </div>
            <Mark gap={0.55} style={{ fontSize: 'clamp(12px,1.5cqw,17px)' }} />
          </Poster>
        </Lend>
        <Lend delay={0.2}>
          <Poster className="bg-[var(--ink)] text-[var(--paper)]">
            <div className="flex justify-between">
              <span className="os-mono text-[10px] text-[var(--blue)]">027.4</span>
              <span className="os-mono text-[10px] text-[var(--paper)]/55">Free, forever</span>
            </div>
            <p className="font-medium leading-[0.95] tracking-[-0.035em]" style={{ fontSize: 'clamp(28px,4.6cqw,56px)' }}>
              Nothing here is yours.
              <br />
              <span className="text-[var(--blue)]">All of it is.</span>
            </p>
            <Mark gap={0.86} tone="var(--paper)" style={{ fontSize: 'clamp(12px,1.5cqw,17px)' }} />
          </Poster>
        </Lend>
      </div>
      <div className="mt-[3cqw] grid gap-[3cqw] @2xl:grid-cols-[1fr_1.5fr]">
        {/* tote: the gap is the handle opening */}
        <Lend className="relative grid aspect-square place-items-center bg-[#e8e4da]">
          <div className="relative aspect-[1/1.12] w-[58%] bg-[var(--card)] shadow-[0_24px_40px_-26px_rgba(17,18,20,0.45)]">
            <span className="absolute -top-[22%] left-[22%] h-[30%] w-[56%] rounded-t-full border-[6px] border-b-0 border-[var(--card)]" aria-hidden />
            <div className="absolute inset-x-[10%] bottom-[12%]">
              <Mark gap={0.48} style={{ fontSize: 'clamp(13px,2cqw,22px)' }} />
            </div>
            <div className="absolute right-[10%] top-[12%]">
              <DueStamp date="NEVER" rotate={8} size="sm" />
            </div>
          </div>
          <span className="os-mono absolute bottom-[5%] left-[6%] text-[10px] text-[var(--ink)]/50">Tote — due back: never</span>
        </Lend>
        <PhotoSlot
          src="/projects/open-shelf/poster-street.jpg"
          brief="The three spring posters in a bus shelter at dusk, a commuter waiting; loan blue the brightest thing in the street."
          className="aspect-[16/11] w-full"
        />
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 09 Motion

function MotionPrinciple() {
  const ref = useInView<HTMLDivElement>(0.4)
  return (
    <section className="bg-[var(--ink)] px-[6cqw] pb-[12cqh] pt-[10cqh] text-[var(--paper)]">
      <Head n="09" title="Motion" tone="var(--paper)" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1fr_1.2fr] @2xl:items-center">
        <div>
          <h3 className="max-w-[12ch] font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'max(30px, 5.2cqw)' }}>
            Lend. Wait. Return.
          </h3>
          <p className="mt-5 max-w-[40ch] text-[14px] leading-relaxed text-[var(--paper)]/65">
            Nothing appears from nowhere and nothing disappears. Content slides out of its row, stays as long as it&rsquo;s needed,
            and slides back to the same place. Transitions are always reversible — like a loan.
          </p>
        </div>
        <div ref={ref} className="os-demo">
          <div className="flex h-[34cqh] items-end gap-[3px] border-b-2 border-[var(--paper)] pt-[12cqh]">
            {Array.from({ length: 22 }, (_, i) => (
              <span
                key={i}
                className={i === 9 ? 'book flex-1 bg-[var(--blue)]' : 'flex-1'}
                style={i === 9 ? { height: '84%' } : { height: `${62 + ((i * 29) % 34)}%`, background: i % 5 === 0 ? '#3a3b3f' : '#2a2b2f' }}
              />
            ))}
          </div>
          <div className="os-mono mt-4 flex justify-between text-[11px]">
            <span className="label text-[var(--blue)]">780 LIS — out on loan</span>
            <span className="text-[var(--paper)]/45">5.5 s loop</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 10 Closing

function Closing() {
  return (
    <section className="relative flex flex-col justify-between px-[6cqw] pb-[6cqh] pt-[10cqh]" style={{ minHeight: '100cqh' }}>
      <Head n="10" title="Closing" />
      <p className="my-[8cqh] max-w-[13ch] font-medium leading-[0.95] tracking-[-0.04em]" style={{ fontSize: 'max(44px, 10cqw)' }}>
        Everything here is <span className="text-[var(--blue)]">borrowed.</span>
      </p>
      <div className="flex flex-col gap-6 border-t border-[var(--rule)] pt-[4cqh] @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <Mark gap={0.18} style={{ fontSize: 'max(30px, 5cqw)' }} />
        <div className="flex items-end gap-6">
          <p className="os-mono text-[11px] text-[var(--ink)]/55 @2xl:text-right">
            Open Shelf — Brand identity — 2025
            <br />6 branches · 1 card · free for everyone
          </p>
          <DueStamp date="RETURN SOON" rotate={-7} />
        </div>
      </div>
    </section>
  )
}
