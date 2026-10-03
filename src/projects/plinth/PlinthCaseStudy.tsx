import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { PhotoSlot } from '../PhotoSlot'
import { useInView } from '../scroll'
import './plinth.css'

// PLINTH — Brand identity for a gallery that shows one object at a time, 2025.
//
// Context: a single room in the city. Each season it shows one object — a chair, a vessel, a
// stone, a table — and nothing else. Collectors, designers and passers-by come to look properly
// at one thing.
// Idea: ONE THING AT A TIME. The rule the gallery lives by is the rule the identity is made of:
// one type size, one colour per exhibition, one change at a time in every movement.
// Logo logic: the name rests on a block — a plinth — whose proportions are the footprint of the
// object currently on show. The mark changes shape every season and is always the same mark.
// Typography: Inter, 15 px, everywhere: on the website, the wall text, the invitation and the
// facade. Hierarchy comes from position and space, never from size.
// Colour: gallery white and ink, plus one colour per show, taken from the object itself.
// Voice: few words, exact, unhurried. Nothing is "stunning".
// Motion: one change at a time, two seconds each, never overlapping.
//
// Story: 00 The object · 01 One thing at a time · 02 The plinth · 03 One size · 04 One colour ·
// 05 In print · 06 The room · 07 The website · 08 Motion · 09 Closing

const SHOWS: { n: string; object: string; maker: string; season: string; colour: string; w: number; h: number }[] = [
  { n: '01', object: 'Low vessel', maker: 'Anja Lindqvist', season: 'Spring', colour: '#b8613a', w: 30, h: 7 },
  { n: '02', object: 'Side chair', maker: 'Teo Marchetti', season: 'Summer', colour: '#5d6b4a', w: 13, h: 15 },
  { n: '03', object: 'River stone', maker: 'Unknown', season: 'Autumn', colour: '#8a8a86', w: 9, h: 4 },
  { n: '04', object: 'Long table', maker: 'Studio Hale', season: 'Winter', colour: '#3c4a63', w: 42, h: 5 },
]

export function PlinthCaseStudy() {
  return (
    <article className="pl" aria-label="Plinth — Brand identity case study">
      <TheObject />
      <OneThing />
      <ThePlinth />
      <OneSize />
      <OneColour />
      <InPrint />
      <TheRoom />
      <Website />
      <MotionPrinciple />
      <Closing />
    </article>
  )
}

// ------------------------------------------------------------ building blocks

// The mark: the name resting on a block with the object's footprint (w × h, in em)
function Mark({ w = 30, h = 7, colour = 'var(--ink)', scale = 1, className = '' }: { w?: number; h?: number; colour?: string; scale?: number; className?: string }) {
  return (
    <div className={`inline-flex flex-col items-start ${className}`} role="img" aria-label="Plinth">
      <span className="leading-none">Plinth</span>
      <span className="pl-block mt-[6px] block" style={{ width: `${w * scale}px`, height: `${h * scale}px`, background: colour }} aria-hidden />
    </div>
  )
}

function Slow({ children, delay = 0, className = '', style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useInView<HTMLDivElement>(0.25)
  return (
    <div ref={ref} className={`pl-slow ${className}`} style={{ ...style, ['--d' as string]: `${delay}s` }}>
      {children}
    </div>
  )
}

// A chapter label: number and title on one line, the same size as everything else
function Label({ n, title }: { n: string; title: string }) {
  return (
    <p className="flex gap-[3cqw]">
      <span className="pl-mute">{n}</span>
      <span>{title}</span>
    </p>
  )
}

// ------------------------------------------------------------ 00 The object

function TheObject() {
  return (
    <section className="relative flex flex-col justify-between px-[6cqw] pb-[6cqh] pt-[6cqh]" style={{ minHeight: '100cqh' }}>
      <div className="flex justify-between">
        <span className="pl-mute">Case study 04 / 04</span>
        <span className="pl-mute">Brand identity / Gallery / 2025</span>
      </div>
      {/* the object on its plinth, alone in the space */}
      <div className="flex flex-col items-center">
        <Slow className="w-[28cqw] min-w-[160px] max-w-[320px]">
          <PhotoSlot
            src="/projects/plinth/vessel.jpg"
            brief="Exhibition 01: a low, wide terracotta vessel, photographed straight on against a white wall, soft daylight from the left, its shadow falling right. Nothing else in frame."
            className="aspect-[4/3] w-full"
          />
        </Slow>
        <Slow delay={0.6}>
          <span className="pl-block mt-0 block h-[16cqh] w-[34cqw] min-w-[190px] max-w-[380px] bg-[var(--ink)]" aria-hidden />
        </Slow>
      </div>
      <div className="flex items-end justify-between">
        <Slow delay={1.2}>
          <Mark w={30} h={7} colour="var(--show)" />
        </Slow>
        <Slow delay={1.8}>
          <p className="max-w-[22ch] text-right">One object at a time.</p>
        </Slow>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 01 One thing at a time

function OneThing() {
  return (
    <section className="grid gap-[8cqh] px-[6cqw] py-[18cqh] @2xl:grid-cols-[1fr_2fr]">
      <Label n="01" title="One thing at a time" />
      <Slow>
        <p className="max-w-[42ch]">
          Plinth is one room. Each season it shows one object — a chair, a vessel, a stone, a table — and nothing else. People
          come to look properly at a single thing, for as long as they like.
        </p>
        <p className="mt-[1.45em] max-w-[42ch]">
          The identity follows the same rule. One type size. One colour per exhibition. One change at a time. Everything else is
          removed, so the object is the loudest thing on every page, wall and screen.
        </p>
        <p className="pl-mute mt-[1.45em]">What the brand leaves out is the brand.</p>
      </Slow>
    </section>
  )
}

// ------------------------------------------------------------ 02 The plinth

function ThePlinth() {
  const [i, setI] = useState(0)
  const ref = useInView<HTMLDivElement>(0.4)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SHOWS.length), 3600)
    return () => clearInterval(id)
  }, [])
  const s = SHOWS[i]
  return (
    <section className="border-t border-[var(--line)] px-[6cqw] pb-[14cqh] pt-[10cqh]">
      <Label n="02" title="The plinth" />
      <div className="mt-[10cqh] grid gap-[8cqh] @2xl:grid-cols-[2fr_1fr] @2xl:items-end">
        {/* the mark, changing its block to each exhibition's footprint, slowly */}
        <div ref={ref} className="flex h-[42cqh] items-end">
          <div className="flex flex-col items-start">
            <span className="leading-none">Plinth</span>
            <span className="pl-block mt-[10px] block" style={{ width: `${s.w * 1.1}cqw`, height: `${s.h * 1.6}cqh`, background: s.colour }} aria-hidden />
          </div>
        </div>
        <div>
          <p className="max-w-[34ch]">
            The name rests on a block whose proportions are the footprint of the object on show. It changes shape every season and
            is always the same mark.
          </p>
          <div className="mt-[4cqh] border-t border-[var(--line)]">
            {SHOWS.map((x, k) => (
              <div key={x.n} className="flex justify-between border-b border-[var(--line)] py-[0.6em]" style={{ opacity: k === i ? 1 : 0.35, transition: 'opacity 2s' }}>
                <span>
                  {x.n} {x.object}
                </span>
                <span className="pl-mute">
                  {x.w * 10} × {x.h * 10} cm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 03 One size

function OneSize() {
  return (
    <section className="bg-[var(--ink)] px-[6cqw] pb-[14cqh] pt-[10cqh] text-[var(--white)]">
      <p className="flex gap-[3cqw]">
        <span className="opacity-45">03</span>
        <span>One size</span>
      </p>
      <div className="mt-[10cqh] grid gap-[8cqh] @2xl:grid-cols-[1fr_1fr]">
        <Slow>
          <p className="max-w-[36ch]">
            Inter, 15 pixels, everywhere — on the website, the invitation, the wall text and the facade. There are no headlines.
          </p>
          <p className="mt-[1.45em] max-w-[36ch] opacity-55">
            Hierarchy is made only with position and space: what matters comes first and has room around it. A title is a title
            because of where it sits.
          </p>
        </Slow>
        {/* a hierarchy built from space alone */}
        <Slow delay={0.4} className="relative h-[46cqh] border-l border-[var(--white)]/20 pl-[4cqw]">
          <p className="absolute left-[4cqw] top-0">Side chair</p>
          <p className="absolute left-[4cqw] top-[14%] opacity-55">Teo Marchetti, 2024</p>
          <p className="absolute left-[4cqw] top-[22%] opacity-55">Ash, linen cord</p>
          <p className="absolute bottom-[18%] left-[4cqw] max-w-[30ch]">On show until 31 August. Open Thursday to Sunday, 11 to 18.</p>
          <p className="absolute bottom-0 left-[4cqw] opacity-55">Free entry</p>
          <span className="absolute -left-px top-0 h-[1.45em] w-px bg-[var(--white)]" aria-hidden />
        </Slow>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 04 One colour

function OneColour() {
  return (
    <section>
      <div className="px-[6cqw] pb-[6cqh] pt-[10cqh]">
        <Label n="04" title="One colour" />
        <p className="mt-[4cqh] max-w-[44ch]">Each exhibition has one colour, taken from the object itself. It is used for the plinth in the mark and nothing else.</p>
      </div>
      {SHOWS.map((s, k) => (
        <Slow key={s.n} delay={k * 0.1}>
          <div className="flex items-end justify-between px-[6cqw] pb-[3cqh] pt-[14cqh] text-[var(--white)]" style={{ background: s.colour }}>
            <span>
              {s.n} {s.object}
              <br />
              <span className="opacity-60">{s.maker}</span>
            </span>
            <span className="text-right opacity-75">
              {s.season}
              <br />
              {s.colour.toUpperCase()}
            </span>
          </div>
        </Slow>
      ))}
    </section>
  )
}

// ------------------------------------------------------------ 05 In print

function InPrint() {
  const s = SHOWS[1]
  return (
    <section className="px-[6cqw] pb-[14cqh] pt-[10cqh]">
      <Label n="05" title="In print" />
      <div className="mt-[8cqh] grid gap-[4cqw] @2xl:grid-cols-[1fr_1fr_0.8fr] @2xl:items-end">
        {/* invitation */}
        <Slow>
          <div className="flex aspect-[1/1.414] flex-col justify-between bg-white p-[8%] shadow-[0_24px_40px_-30px_rgba(26,26,25,0.35)] ring-1 ring-[var(--line)]">
            <Mark w={s.w} h={s.h} colour={s.colour} scale={1.2} />
            <div>
              <p>Side chair</p>
              <p className="pl-mute">Teo Marchetti</p>
            </div>
            <p>
              Opening
              <br />
              Thursday 5 June, 18:00
            </p>
          </div>
          <p className="pl-mute mt-3">Invitation</p>
        </Slow>
        {/* wall text */}
        <Slow delay={0.3}>
          <div className="flex aspect-square flex-col justify-between bg-[var(--white)] p-[8%] ring-1 ring-[var(--line)]">
            <p>
              Side chair, 2024
              <br />
              <span className="pl-mute">Ash, linen cord</span>
            </p>
            <p className="max-w-[26ch]">Made in one piece of ash, bent while green. The seat is woven from a single cord, eleven metres long.</p>
          </div>
          <p className="pl-mute mt-3">Wall text</p>
        </Slow>
        {/* bag */}
        <Slow delay={0.6}>
          <div className="relative mx-auto aspect-[1/1.2] w-[80%] bg-white p-[10%] shadow-[0_24px_40px_-28px_rgba(26,26,25,0.4)] ring-1 ring-[var(--line)]">
            <span className="absolute -top-[16%] left-[30%] h-[18%] w-[40%] rounded-t-full border-2 border-b-0 border-[var(--ink)]" aria-hidden />
            <Mark w={s.w} h={s.h} colour={s.colour} />
          </div>
          <p className="pl-mute mt-3">Bag</p>
        </Slow>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 06 The room

function TheRoom() {
  return (
    <section className="grid gap-[4cqw] px-[6cqw] pb-[14cqh] pt-[6cqh] @2xl:grid-cols-[2fr_1fr] @2xl:items-end">
      <Slow>
        <PhotoSlot
          src="/projects/plinth/room.jpg"
          brief="The gallery: one white room, polished concrete floor, a single side chair on a low ink-black plinth in the centre, the facade's 15 px name visible on the glass. Wide, symmetrical, early morning light."
          className="aspect-[16/10] w-full"
        />
      </Slow>
      <div>
        <Label n="06" title="The room" />
        <p className="mt-[4cqh] max-w-[30ch]">
          The facade carries the name at the same size as everything else — small enough that you have to walk up to the glass.
          Inside there is one plinth, one object and a bench.
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 07 The website

function Website() {
  const s = SHOWS[0]
  return (
    <section className="bg-[#ecebe7] px-[6cqw] pb-[14cqh] pt-[10cqh]">
      <Label n="07" title="The website" />
      <p className="mt-[4cqh] max-w-[44ch]">The homepage shows the object, its name and the dates. That is the whole site; the rest is one click away.</p>
      <Slow className="mt-[8cqh] overflow-hidden rounded-[8px] bg-[var(--white)] shadow-[0_30px_60px_-36px_rgba(26,26,25,0.45)] ring-1 ring-[var(--line)]">
        <div className="flex justify-between px-[4%] py-[2.6%]">
          <Mark w={s.w} h={s.h} colour={s.colour} scale={0.8} />
          <span className="pl-mute">Visit · About</span>
        </div>
        <div className="flex flex-col items-center px-[4%] pb-[6%] pt-[4%]">
          <PhotoSlot
            src="/projects/plinth/vessel.jpg"
            brief="The same vessel as the opening, cut out on white."
            className="aspect-[4/3] w-[42%]"
          />
          <span className="block h-[5cqh] w-[48%] bg-[var(--ink)]" aria-hidden />
        </div>
        <div className="flex justify-between border-t border-[var(--line)] px-[4%] py-[2.6%]">
          <span>
            Low vessel <span className="pl-mute">— Anja Lindqvist</span>
          </span>
          <span className="pl-mute">Until 30 April</span>
        </div>
      </Slow>
    </section>
  )
}

// ------------------------------------------------------------ 08 Motion

function MotionPrinciple() {
  const steps = ['The object fades in.', 'Then its name.', 'Then the dates.', 'Then nothing.']
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % (steps.length + 1)), 2000)
    return () => clearInterval(id)
  }, [steps.length])
  return (
    <section className="px-[6cqw] pb-[14cqh] pt-[10cqh]">
      <Label n="08" title="Motion" />
      <div className="mt-[8cqh] grid gap-[8cqh] @2xl:grid-cols-[1fr_1fr]">
        <p className="max-w-[34ch]">
          One change at a time, two seconds each, never overlapping. Nothing moves while something else is moving. The pace is the
          pace of someone walking around an object.
        </p>
        <div className="border-t border-[var(--line)]">
          {steps.map((t, k) => (
            <p key={t} className="border-b border-[var(--line)] py-[0.6em]" style={{ opacity: k < i ? 1 : 0.12, transition: 'opacity 2s cubic-bezier(0.45, 0, 0.2, 1)' }}>
              <span className="pl-mute mr-[3cqw]">{(k * 2).toFixed(1)}s</span>
              {t}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 09 Closing

function Closing() {
  return (
    <section className="flex flex-col justify-between bg-[var(--white)] px-[6cqw] pb-[6cqh] pt-[10cqh]" style={{ minHeight: '100cqh' }}>
      <Label n="09" title="Closing" />
      <Slow className="flex flex-col items-center">
        <p>Next: one more.</p>
      </Slow>
      <div className="flex items-end justify-between border-t border-[var(--line)] pt-[4cqh]">
        <Mark w={SHOWS[3].w} h={SHOWS[3].h} colour={SHOWS[3].colour} />
        <p className="pl-mute text-right">
          Plinth — Brand identity — 2025
          <br />
          One room · four objects a year
        </p>
      </div>
    </section>
  )
}
