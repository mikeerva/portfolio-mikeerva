import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { PhotoSlot } from '../PhotoSlot'
import { useInView } from '../scroll'
import './halo.css'

// HALO — Brand identity for an online casino, 2026.
//
// Context: an online casino for players in Greece and across Europe, used mostly on a phone,
// mostly at night.
// Challenge: the category shouts — gold, chips, sirens, countdowns. Halo has to feel calm,
// premium and trustworthy, and still feel like a night out.
// Idea: THE LIGHT ABOVE THE TABLE. A game begins when its table lights up. The brand is that
// light: a glow rising from the bottom of every surface, and a ring — the halo — that is the O
// of the name and the brand's only symbol.
// Colour: night navy as the ground. Cyan for the casino floor, magenta for live tables. Both
// only ever appear as light (glows, rings, active states), never as large flat fills.
// Typography: Archivo at its narrowest and heaviest for headlines and numbers, Inter for the
// interface, IBM Plex Mono for data (RTP, limits, timestamps).
// Voice: few words, warm, never pushy. No fake urgency.
// Motion: light rises and settles. Nothing flashes.
//
// Story (the same arc as Fold: brief → idea → system → wordmark → applications → closing):
// 00 Opening (the logo animation) · 01 The brief · 02 The idea · 03 The system (rules, colour,
// type) · 04 The wordmark · 05 Brand film · 06 Out in the city · 07 Social · 08 The app ·
// 09 Play well · 10 Motion · 11 Closing
//
// Photographs and film: every slot below is a PhotoSlot or a FilmSlot. Drop the file into public/projects/halo/ under
// the slot's name and it fills in; until then the slot shows what the picture should be.

type Game = { name: string; kind: string; glyph: string; tint: string; light: string }

const GAMES: Game[] = [
  { name: 'Neon Sevens', kind: 'Slots', glyph: '777', tint: '#1b3d8f', light: '#2dd4c8' },
  { name: 'Orbit', kind: 'Slots', glyph: 'O', tint: '#3a1b6e', light: '#c0168f' },
  { name: 'Night Train', kind: 'Slots', glyph: 'NT', tint: '#0f3b4a', light: '#2dd4c8' },
  { name: 'Roulette', kind: 'Live', glyph: '0', tint: '#4a0f3a', light: '#c0168f' },
  { name: 'Blackjack', kind: 'Table', glyph: '21', tint: '#13294f', light: '#2dd4c8' },
  { name: 'Deep Blue', kind: 'Slots', glyph: 'DB', tint: '#0c2a5c', light: '#4f8cff' },
]

export function HaloCaseStudy() {
  return (
    <article className="ha" aria-label="Halo — Brand identity case study">
      <Opening />
      <Brief />
      <Idea />
      <System />
      <Colour />
      <Type />
      <TheMark />
      <BrandFilm />
      <Campaign />
      <Social />
      <Screens />
      <Lobby />
      <PlayWell />
      <Motion />
      <Closing />
    </article>
  )
}

// ------------------------------------------------------------ building blocks

// The name: HAL in Archivo, and the O drawn as the ring of light. With `reveal` it plays the
// logo animation once it comes into view: the ring draws itself, lights up, then the letters rise.
function HaloMark({ size, flat = false, reveal = false, ring = 'var(--cyan)', className = '' }: { size: string; flat?: boolean; reveal?: boolean; ring?: string; className?: string }) {
  const ref = useInView<HTMLSpanElement>(0.3)
  return (
    <span ref={ref} role="img" aria-label="Halo" className={`ha-display inline-flex items-baseline ${reveal ? 'ha-reveal' : ''} ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {['H', 'A', 'L'].map((c, i) => (
        <span key={c} aria-hidden className="ha-letter" style={{ ['--i' as string]: i }}>
          {c}
        </span>
      ))}
      <svg aria-hidden viewBox="0 0 50 71" className={`ha-ring-svg ${flat ? 'is-flat' : ''}`} style={{ width: '0.5em', height: '0.71em', marginLeft: '0.035em', overflow: 'visible', color: ring }}>
        <rect x="6" y="6" width="38" height="59" rx="19" pathLength={1} fill="none" stroke="currentColor" strokeWidth="12" className="ha-ring-path" />
      </svg>
    </span>
  )
}

// A film's place: the film once its file exists, its brief until then
function FilmSlot({ file, brief, spec }: { file: string; brief: string; spec: string }) {
  const [missing, setMissing] = useState(false)
  return (
    <div className="relative aspect-video overflow-hidden rounded-[14px] border border-[var(--line)] bg-black">
      {!missing && <video src={`/projects/halo/${file}`} muted loop playsInline autoPlay controls onError={() => setMissing(true)} className="block size-full object-cover" />}
      {missing && (
        <div role="img" aria-label={`Film to come: ${brief}`} className="ha-glow-cyan ha-mono absolute inset-0 flex flex-col justify-between p-[4%] text-[10px] text-white/50 outline-dashed outline-1 -outline-offset-1 outline-white/20">
          <span>Film to come</span>
          <span className="flex flex-col items-center gap-4 text-center normal-case tracking-normal">
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full border border-white/30 text-[16px] text-white/80">
              ▶
            </span>
            <span className="max-w-[48ch] font-sans text-[12px] leading-relaxed">{brief}</span>
          </span>
          <span className="flex justify-between">
            <span>{file}</span>
            <span>{spec}</span>
          </span>
        </div>
      )}
    </div>
  )
}

function Rise({ children, delay = 0, className = '', style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useInView<HTMLDivElement>(0.2)
  return (
    <div ref={ref} className={`ha-rise ${className}`} style={{ ...style, ['--d' as string]: `${delay}s` }}>
      {children}
    </div>
  )
}

function Head({ n, title }: { n: string; title: string }) {
  return (
    <p className="ha-mono ha-mute text-[10px] @2xl:text-[11px]">
      {n} — {title}
    </p>
  )
}

// A photograph's place: the picture once its file exists, its brief until then
function Photo({ file, brief, className = '' }: { file: string; brief: string; className?: string }) {
  return <PhotoSlot src={`/projects/halo/${file}`} brief={brief} tone="dark" className={`rounded-[12px] ${className}`} />
}

function Caption({ n, name, note }: { n: string; name: string; note: string }) {
  return (
    <figcaption className="ha-mono mt-3 text-[10px]">
      <span className="ha-mute">{n}</span> {name}
      <span className="ha-mute block">{note}</span>
    </figcaption>
  )
}

// A chapter's headline: two lines, the second lit
function Title({ a, b, size = 'max(34px, 6.4cqw)' }: { a: string; b: string; size?: string }) {
  return (
    <Rise>
      <h2 className="ha-display mt-5" style={{ fontSize: size }}>
        <span className="block">{a}</span>
        <span className="block text-[var(--cyan)]">{b}</span>
      </h2>
    </Rise>
  )
}

// A game's cover art, drawn: its tint at the top, its light rising from the bottom
function Tile({ g, className = '', label = true }: { g: Game; className?: string; label?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[0.6em] border border-[var(--line)] ${className}`} style={{ background: `radial-gradient(70% 60% at 50% 100%, ${g.light}aa 0%, ${g.light}00 100%), linear-gradient(180deg, ${g.tint} 0%, #0a1124 100%)` }}>
      <span className="ha-display absolute inset-0 flex items-center justify-center text-white/90" style={{ fontSize: g.glyph.length > 2 ? '2.4em' : '3em', textShadow: `0 0 0.4em ${g.light}` }}>
        {g.glyph}
      </span>
      {label && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1124] to-transparent px-[0.7em] pb-[0.5em] pt-[1.4em]">
          <span className="block text-[0.78em] font-semibold leading-tight">{g.name}</span>
          <span className="ha-mute block text-[0.62em]">{g.kind}</span>
        </span>
      )}
    </div>
  )
}

// A phone, its screen a container so everything inside is sized by the phone's own width
function Phone({ children, caption, n }: { children: ReactNode; caption: string; n: string }) {
  return (
    <figure>
      <div className="rounded-[2.2rem] bg-[#05080f] p-[5px] shadow-[0_40px_70px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        <div className="@container relative aspect-[9/19.5] overflow-hidden rounded-[1.95rem] bg-[var(--night)]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[8cqw] pt-[4cqw] text-[4cqw] font-semibold">
            <span>21:40</span>
            <span aria-hidden className="h-[5.5cqw] w-[26cqw] rounded-full bg-black" />
            <span className="ha-mute">5G</span>
          </div>
          <div className="absolute inset-0 pt-[13cqw] text-[4.2cqw]">{children}</div>
        </div>
      </div>
      <figcaption className="ha-mono mt-3 text-[10px]">
        <span className="ha-mute">{n}</span> {caption}
      </figcaption>
    </figure>
  )
}

function Button({ children, kind = 'primary', className = '' }: { children: ReactNode; kind?: 'primary' | 'ghost'; className?: string }) {
  return kind === 'primary' ? (
    <span className={`inline-flex items-center justify-center rounded-full bg-[var(--cyan)] px-[1.2em] py-[0.6em] font-semibold text-[var(--night)] shadow-[0_8px_24px_-8px_rgba(45,212,200,0.8)] ${className}`}>{children}</span>
  ) : (
    <span className={`inline-flex items-center justify-center rounded-full border border-white/25 px-[1.2em] py-[0.6em] font-semibold ${className}`}>{children}</span>
  )
}

function LivePill({ className = '' }: { className?: string }) {
  return (
    <span className={`ha-mono inline-flex items-center gap-[0.4em] rounded-full bg-[var(--magenta)]/20 px-[0.6em] py-[0.25em] text-[0.7em] text-[#ff8fd6] ${className}`}>
      <span aria-hidden className="ha-live size-[0.5em] rounded-full bg-[#ff4fc0]" />
      Live
    </span>
  )
}

// A jackpot that keeps growing a few cents at a time (it stands still for reduced motion)
function useJackpot(start: number) {
  const [v, setV] = useState(start)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setV((x) => x + 0.07 + Math.random() * 0.9), 900)
    return () => clearInterval(id)
  }, [])
  return v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ------------------------------------------------------------ 00 Opening

function Opening() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden px-[5cqw] pb-[6cqh] pt-[6cqh]" style={{ minHeight: '100cqh', background: 'radial-gradient(60% 75% at 50% 100%, rgba(45,212,200,0.55) 0%, rgba(45,212,200,0) 100%), radial-gradient(40% 50% at 85% 100%, rgba(192,22,143,0.45) 0%, rgba(192,22,143,0) 100%), var(--night)' }}>
      <div className="ha-mono ha-mute flex justify-between text-[10px] @2xl:text-[11px]">
        <span>Case study 02 / 04</span>
        <span>Brand identity / Online casino / 2026</span>
      </div>
      <div className="relative flex flex-col items-center text-center">
        <Rise className="relative" style={{ fontSize: 'max(96px, 22cqw)' }}>
          {/* the halo itself: a thin ring of light hung above the name, seen from the side */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-0.3em] h-[0.17em] w-[1.25em] -translate-x-1/2 rounded-[50%] border-solid border-[var(--cyan)]"
            style={{ borderWidth: '0.022em', boxShadow: '0 0 0.12em rgba(45,212,200,0.7), inset 0 0 0.08em rgba(45,212,200,0.5)' }}
          />
          <HaloMark size="1em" reveal />
        </Rise>
        <Rise delay={1.5}>
          <p className="ha-display mt-[3cqh]" style={{ fontSize: 'max(22px, 2.8cqw)' }}>
            Every table has its light.
          </p>
        </Rise>
      </div>
      <div className="ha-mono flex items-end justify-between text-[10px] @2xl:text-[11px]">
        <span className="ha-mute max-w-[34ch] leading-relaxed">
          Slots / Live casino / Table games
          <br />
          Role — strategy, identity, product design, motion
        </span>
        <span className="ha-mute">Scroll ↓</span>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 01 The brief

function Brief() {
  const rows: [string, string][] = [
    ['Context', 'An online casino for players in Greece and Europe — on a phone, mostly at night.'],
    ['Challenge', 'The category shouts: gold, chips, sirens, countdowns. Halo has to feel calm and trustworthy, and still feel like a night out.'],
    ['Approach', 'Make light the brand. A game begins when its table lights up; everything in Halo is lit, nothing is loud.'],
  ]
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="01" title="The brief" />
      <Title a="A night out," b="not a noise." />
      <div className="mt-[7cqh] grid gap-[4cqh] border-t border-[var(--line)] pt-[4cqh] @2xl:grid-cols-3 @2xl:gap-[4cqw]">
        {rows.map(([k, v], i) => (
          <Rise key={k} delay={i * 0.08}>
            <p className="ha-mono ha-mute text-[10px]">{k}</p>
            <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed">{v}</p>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 02 The idea

function Idea() {
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="02" title="The idea" />
          <Title a="The light" b="above the table." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          In a casino the room is dark and the tables are lit. Halo works the same way: every surface is night navy, and light rises
          from its bottom edge the moment something can be played. Two lights, two moods.
        </Rise>
      </div>
      <Rise className="mt-[8cqh]">
        <Photo
          file="idea-table.jpg"
          brief="A dark room with one card table lit from beneath in cyan light: hands and chips at the edge of the light, everything else in shadow. Shot low, no other light in frame."
          className="aspect-[4/3] w-full @2xl:aspect-[21/9]"
        />
      </Rise>
      <div className="mt-[3cqw] grid gap-[3cqw] @2xl:grid-cols-2">
        {[
          { cls: 'ha-glow-cyan', name: 'Floor light', for: 'Slots and table games', hex: '#2DD4C8' },
          { cls: 'ha-glow-magenta', name: 'Live light', for: 'Live dealers, tonight’s events', hex: '#C0168F' },
        ].map((m, i) => (
          <Rise key={m.name} delay={i * 0.12}>
            <div className={`${m.cls} flex aspect-[4/3] flex-col justify-between rounded-[14px] border border-[var(--line)] p-[5%]`}>
              <span className="ha-mono ha-mute text-[10px]">{m.hex}</span>
              <div>
                <p className="ha-display" style={{ fontSize: 'max(28px, 4cqw)' }}>
                  {m.name}
                </p>
                <p className="mt-1 text-[13px] text-[var(--mute)]">{m.for}</p>
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 04 The wordmark

function TheMark() {
  const notes: [string, string][] = [
    ['The O is a ring', 'The one letter that becomes a symbol: a ring of light, the halo above the table.'],
    ['Narrow and heavy', 'Archivo at its narrowest and heaviest keeps the name compact on a phone’s top bar.'],
    ['Light, then flat', 'The ring glows on screen. Under 24 px and in print it is drawn flat, with no glow.'],
  ]
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="04" title="The wordmark" />
      <Title a="Four letters," b="one ring of light." />
      <div className="mt-[8cqh] grid gap-[6cqh] @2xl:grid-cols-12 @2xl:items-center @2xl:gap-x-[4cqw]">
        <Rise className="@2xl:col-span-7">
          <MarkInMotion />
        </Rise>
        <div className="@2xl:col-span-5">
          {notes.map(([k, v], i) => (
            <Rise key={k} delay={i * 0.08} className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-[var(--line)] py-[2.4cqh]">
              <span className="ha-mono ha-mute pt-1 text-[10px]">0{i + 1}</span>
              <div>
                <p className="ha-display" style={{ fontSize: 'max(18px, 1.7cqw)' }}>
                  {k}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--mute)]">{v}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>

      {/* the mark at work: the app icon, the flat version, the smallest size */}
      <div className="mt-[8cqh] grid grid-cols-2 gap-[3cqw] @2xl:grid-cols-4">
        <Rise>
          <div className="flex aspect-square items-center justify-center rounded-[14px] border border-[var(--line)] bg-[var(--night)]">
            <span aria-hidden className="relative flex size-[46%] items-center justify-center rounded-[22%] ha-glow-cyan ring-1 ring-white/10">
              <span className="ha-ring" style={{ width: '42%', height: '58%', borderWidth: '5px', fontSize: '16px' }} />
            </span>
          </div>
          <p className="ha-mono ha-mute mt-3 text-[10px]">App icon — the ring alone</p>
        </Rise>
        <Rise delay={0.08}>
          <div className="flex aspect-square items-center justify-center rounded-[14px] bg-[var(--text)] text-[var(--night)]">
            <HaloMark size="max(36px, 4.6cqw)" flat ring="var(--night)" />
          </div>
          <p className="ha-mono ha-mute mt-3 text-[10px]">Flat — print and light grounds</p>
        </Rise>
        <Rise delay={0.16}>
          <div className="flex aspect-square flex-col items-center justify-center gap-[1.4cqh] rounded-[14px] border border-[var(--line)]">
            <HaloMark size="40px" />
            <HaloMark size="24px" flat />
            <HaloMark size="16px" flat />
          </div>
          <p className="ha-mono ha-mute mt-3 text-[10px]">40 / 24 / 16 px — the glow stops at 24</p>
        </Rise>
        <Rise delay={0.24}>
          <div className="ha-glow-magenta flex aspect-square items-center justify-center rounded-[14px] border border-[var(--line)]">
            <span className="ha-ring" style={{ width: '34%', height: '48%', borderWidth: '6px', borderColor: '#ff4fc0', boxShadow: '0 0 18px rgba(255,79,192,0.8), inset 0 0 14px rgba(255,79,192,0.6)' }} />
          </div>
          <p className="ha-mono ha-mute mt-3 text-[10px]">The ring in live light</p>
        </Rise>
      </div>
      <Rise className="mt-[3cqw]">
        <figure>
          <Photo
            file="mark-sign.jpg"
            brief="The HALO wordmark as an illuminated sign on a dark concrete wall at night, the ring glowing cyan and its light spilling down the wall onto the floor."
            className="aspect-[4/3] w-full @2xl:aspect-[16/7]"
          />
          <Caption n="04.5" name="The sign" note="The ring is the only part that glows" />
        </figure>
      </Rise>
    </section>
  )
}

// ------------------------------------------------------------ 03 The system

// The ring on its own, for the system's pictures
function Ring({ className = '', color = 'var(--cyan)' }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 50 71" className={`ha-ring-svg ${className}`} style={{ color, overflow: 'visible' }}>
      <rect x="6" y="6" width="38" height="59" rx="19" fill="none" stroke="currentColor" strokeWidth="12" />
    </svg>
  )
}

// The identity's five rules, each shown by itself: what makes Halo a system rather than a logo
// and a palette
function System() {
  const rules: { name: string; note: string; art: ReactNode }[] = [
    {
      name: 'The ring',
      note: 'One symbol only: the O of the name, drawn as a ring of light.',
      art: (
        <div className="flex size-full items-center justify-center bg-[var(--night)]">
          <Ring className="h-[44%]" />
        </div>
      ),
    },
    { name: 'The light', note: 'Light rises from the bottom edge of whatever can be played.', art: <div className="ha-glow-cyan size-full" /> },
    {
      name: 'The night',
      note: 'Every surface is a shade of night navy. Nothing is painted bright.',
      art: (
        <div className="flex size-full flex-col">
          {['#0a1124', '#141b31', '#1d2540', '#283152'].map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      ),
    },
    {
      name: 'The numbers',
      note: 'Narrow, heavy figures for jackpots and results, so big numbers fit a phone.',
      art: (
        <div className="ha-display flex size-full items-center justify-center bg-[var(--night)] text-[max(26px,3.4cqw)]">
          €1.2<span className="text-[var(--cyan)]">M</span>
        </div>
      ),
    },
    {
      name: 'The calm',
      note: 'No flashing, no countdowns. Limits and 18+ always in view.',
      art: (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-[var(--deep)]">
          <span className="ha-display text-[max(26px,3.4cqw)]">18+</span>
          <span className="ha-mono ha-mute text-[9px]">Play well</span>
        </div>
      ),
    },
  ]
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="03" title="The system" />
          <Title a="Five rules." b="One light." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          Five recurring rules connect everything Halo makes, from an app tile to a stadium board. Their scale changes; the dark
          ground, the rising light and the ring stay the same.
        </Rise>
      </div>
      <div className="mt-[7cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-5 @2xl:gap-x-[1.6cqw]">
        {rules.map((r, i) => (
          <Rise key={r.name} delay={i * 0.07}>
            <figure>
              <div className="aspect-square overflow-hidden rounded-[12px] border border-[var(--line)]">{r.art}</div>
              <figcaption className="mt-3">
                <span className="ha-mono ha-mute text-[10px]">0{i + 1}</span>
                <span className="ha-display mt-1 block" style={{ fontSize: 'max(17px, 1.7cqw)' }}>
                  {r.name}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-[var(--mute)]">{r.note}</span>
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 03.2 The system: colour

function Colour() {
  const ground = [
    { name: 'Night', hex: '#0A1124', bg: 'var(--night)' },
    { name: 'Deep', hex: '#141B31', bg: 'var(--deep)' },
    { name: 'Raise', hex: '#1D2540', bg: 'var(--raise)' },
    { name: 'Text', hex: '#EEF2FF', bg: 'var(--text)', dark: true },
  ]
  const light = [
    { name: 'Floor cyan', hex: '#2DD4C8', c: '45,212,200' },
    { name: 'Live magenta', hex: '#C0168F', c: '192,22,143' },
  ]
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="03.2" title="The system — colour" />
          <Title a="Paint the dark." b="Light the rest." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          Four shades of night carry every surface. Cyan and magenta are not paint: they appear only as light — a glow, a ring, the
          state of something you can tap. Green and red are kept for results, nothing else.
        </Rise>
      </div>
      <div className="mt-[7cqh] grid grid-cols-2 gap-[2cqw] @2xl:grid-cols-4">
        {ground.map((g, i) => (
          <Rise key={g.name} delay={i * 0.06}>
            <div className={`flex aspect-[4/3] flex-col justify-between rounded-[12px] border border-[var(--line)] p-[8%] ${g.dark ? 'text-[var(--night)]' : ''}`} style={{ background: g.bg }}>
              <span className="ha-mono text-[10px] opacity-70">{g.hex}</span>
              <span className="ha-display" style={{ fontSize: 'max(20px, 2.2cqw)' }}>
                {g.name}
              </span>
            </div>
          </Rise>
        ))}
      </div>
      <div className="mt-[2cqw] grid gap-[2cqw] @2xl:grid-cols-2">
        {light.map((l, i) => (
          <Rise key={l.name} delay={0.2 + i * 0.08}>
            <div className="flex aspect-[2.6/1] flex-col justify-between rounded-[12px] border border-[var(--line)] p-[4%]" style={{ background: `radial-gradient(55% 120% at 50% 100%, rgba(${l.c},0.75) 0%, rgba(${l.c},0) 100%), var(--night)` }}>
              <span className="ha-mono text-[10px] opacity-70">{l.hex} — as light only</span>
              <span className="ha-display" style={{ fontSize: 'max(22px, 2.8cqw)' }}>
                {l.name}
              </span>
            </div>
          </Rise>
        ))}
      </div>
      <div className="ha-mono mt-5 flex flex-wrap items-center gap-4 text-[10px] text-[var(--mute)]">
        <span>Results only —</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full bg-[var(--win)]" /> Win #7CE38B
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full bg-[var(--alert)]" /> Alert #FF5A5F
        </span>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 03.3 The system: type

function Type() {
  const jackpot = useJackpot(1284906.4)
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="03.3" title="The system — type" />
      <Title a="Numbers first." b="Words second." />
      <div className="mt-[7cqh] grid gap-[5cqh] border-t border-[var(--line)] pt-[4cqh] @2xl:grid-cols-3 @2xl:gap-[4cqw]">
        <Rise>
          <p className="ha-mono ha-mute text-[10px]">Display — Archivo Condensed 800</p>
          <p className="ha-display mt-3 tabular-nums" style={{ fontSize: 'max(30px, 3.6cqw)' }}>
            €{jackpot}
          </p>
          <p className="mt-2 text-[12px] text-[var(--mute)]">Headlines, jackpots, odds. Narrow, so big numbers fit a phone.</p>
        </Rise>
        <Rise delay={0.08}>
          <p className="ha-mono ha-mute text-[10px]">Interface — Inter</p>
          <p className="mt-3 text-[20px] font-semibold">Roulette with Athena</p>
          <p className="text-[15px] text-[var(--mute)]">Table opens at 21:00 · 214 playing</p>
          <p className="mt-2 text-[12px] text-[var(--mute)]">Everything you read and tap.</p>
        </Rise>
        <Rise delay={0.16}>
          <p className="ha-mono ha-mute text-[10px]">Data — IBM Plex Mono</p>
          <p className="ha-mono mt-3 text-[14px] leading-relaxed">
            RTP 96.4%
            <br />
            Session 00:45:12
            <br />
            Limit €100 / week
          </p>
          <p className="mt-2 text-[12px] text-[var(--mute)]">The facts: rates, timers, limits.</p>
        </Rise>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 07 Digital: social

function Social() {
  const jackpot = useJackpot(1284906.4)
  const posts: { copy: string; art: ReactNode }[] = [
    {
      copy: 'Tonight’s Halo jackpot, still growing.',
      art: (
        <div className="ha-glow-cyan flex size-full flex-col justify-between p-[8%]">
          <span className="ha-mono ha-mute text-[9px]">Tonight’s jackpot</span>
          <span className="ha-display tabular-nums" style={{ fontSize: 'max(22px, 2.8cqw)' }}>
            €{jackpot}
          </span>
          <HaloMark size="18px" flat />
        </div>
      ),
    },
    {
      copy: 'One wheel, one light. Live from 21:00.',
      art: <Photo file="social-roulette.jpg" brief="Overhead of a roulette wheel lit from below in magenta, the ball mid-spin, the room black around it." className="size-full rounded-none" />,
    },
    {
      copy: 'Every table has its light.',
      art: (
        <div className="ha-glow-magenta flex size-full flex-col items-start justify-end gap-3 p-[8%]">
          <Ring className="h-[22%]" color="#ff4fc0" />
          <span className="ha-display" style={{ fontSize: 'max(22px, 2.6cqw)' }}>
            Every table
            <br />
            has its light.
          </span>
        </div>
      ),
    },
    {
      copy: 'Meet Athena. She deals roulette, Thursday to Sunday.',
      art: <Photo file="social-dealer.jpg" brief="Portrait of a live dealer at her table, lit from beneath in cyan, looking to camera, the studio dark behind her." className="size-full rounded-none" />,
    },
    {
      copy: 'Set a limit. Then play. It takes two taps.',
      art: (
        <div className="flex size-full flex-col justify-between bg-[var(--deep)] p-[8%]">
          <span className="ha-display" style={{ fontSize: 'max(22px, 2.6cqw)' }}>
            Set a limit.
            <br />
            <span className="text-[var(--cyan)]">Then play.</span>
          </span>
          <span>
            <span className="ha-mono ha-mute flex justify-between text-[9px]">
              <span>This week</span>
              <span>€40 / €100</span>
            </span>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--raise)]">
              <span className="block h-full w-[40%] rounded-full bg-[var(--cyan)]" />
            </span>
            <span className="ha-mono ha-mute mt-3 block text-[9px]">18+ · Play well</span>
          </span>
        </div>
      ),
    },
    {
      copy: 'Reel: the last card of the night.',
      art: <Photo file="social-reel.jpg" brief="Cover of a vertical reel: a hand turning over the last card on a blackjack table, cyan light rising from under the felt." className="size-full rounded-none" />,
    },
  ]
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="07" title="Digital — social" />
          <Title a="A feed that glows." b="Never shouts." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          Live tables, the jackpot, the people who deal, and limits — given the same light and the same calm voice. Photographs
          and typographic posts alternate, so the feed reads as one night.
        </Rise>
      </div>
      <div className="mt-[7cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-3 @2xl:gap-x-[2cqw]">
        {posts.map((post, i) => (
          <Rise key={post.copy} delay={(i % 3) * 0.08}>
            <figure>
              <div className="aspect-[4/5] overflow-hidden rounded-[12px] border border-[var(--line)]">{post.art}</div>
              <figcaption className="mt-3 text-[12px] leading-snug">
                <span className="font-semibold">halo.casino</span> <span className="text-[var(--mute)]">{post.copy}</span>
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 08 Digital: the app

function Screens() {
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="08" title="Digital — the app" />
          <Title a="Lit when" b="it’s your turn." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          The app is dark until something can be played. Then that one thing lights up: a game tile, a seat at a table, the button
          that starts it. Four screens from a night on Halo.
        </Rise>
      </div>
      <div className="mt-[8cqh] grid grid-cols-2 gap-x-[4cqw] gap-y-[6cqh] @2xl:grid-cols-4 @2xl:gap-x-[2.4cqw]">
        <Rise>
          <Phone n="08.1" caption="Lobby">
            <LobbyScreen />
          </Phone>
        </Rise>
        <Rise delay={0.08} className="@2xl:mt-[8cqh]">
          <Phone n="08.2" caption="Game">
            <GameScreen />
          </Phone>
        </Rise>
        <Rise delay={0.16}>
          <Phone n="08.3" caption="Live tables">
            <LiveScreen />
          </Phone>
        </Rise>
        <Rise delay={0.24} className="@2xl:mt-[8cqh]">
          <Phone n="08.4" caption="Wallet & limits">
            <WalletScreen />
          </Phone>
        </Rise>
      </div>
    </section>
  )
}

function TabBar({ on }: { on: number }) {
  const tabs = ['Lobby', 'Live', 'Search', 'Wallet', 'Me']
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-[var(--line)] bg-[var(--deep)] px-[3cqw] pb-[6cqw] pt-[3cqw] text-[3.2cqw]">
      {tabs.map((t, i) => (
        <span key={t} className="flex flex-col items-center gap-[1cqw]" style={{ color: i === on ? 'var(--cyan)' : 'var(--mute)' }}>
          <span aria-hidden className="size-[4.4cqw] rounded-full border-[0.6cqw] border-current" style={{ boxShadow: i === on ? '0 0 2cqw rgba(45,212,200,0.8)' : 'none' }} />
          {t}
        </span>
      ))}
    </div>
  )
}

function LobbyScreen() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between px-[5cqw] pt-[3cqw]">
        <HaloMark size="7.5cqw" />
        <span className="ha-mono rounded-full bg-[var(--raise)] px-[3cqw] py-[1.4cqw] text-[3.4cqw]">€48.20</span>
      </div>
      <p className="ha-mute px-[5cqw] pt-[4cqw] text-[3.6cqw]">Good evening, Eleni</p>
      <div className="ha-glow-magenta mx-[5cqw] mt-[2cqw] rounded-[3cqw] border border-[var(--line)] p-[4cqw]">
        <LivePill />
        <p className="ha-display mt-[2cqw] text-[8cqw]">Roulette at 21:00</p>
        <p className="ha-mute mt-[1cqw] text-[3.4cqw]">Athena deals tonight</p>
        <Button className="mt-[3cqw] text-[3.4cqw]">Take a seat</Button>
      </div>
      <div className="flex gap-[2cqw] overflow-hidden px-[5cqw] pt-[4cqw] text-[3.4cqw]">
        {['All', 'Slots', 'Live', 'Table', 'Jackpots'].map((c, i) => (
          <span key={c} className="shrink-0 rounded-full border px-[3cqw] py-[1.2cqw]" style={i === 0 ? { borderColor: 'var(--cyan)', color: 'var(--cyan)', boxShadow: '0 0 2.4cqw rgba(45,212,200,0.5)' } : { borderColor: 'var(--line)', color: 'var(--mute)' }}>
            {c}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-[3cqw] px-[5cqw] pt-[4cqw] text-[3.6cqw]">
        {GAMES.slice(0, 4).map((g) => (
          <Tile key={g.name} g={g} className="aspect-[4/5]" />
        ))}
      </div>
      <TabBar on={0} />
    </div>
  )
}

function GameScreen() {
  const g = GAMES[0]
  return (
    <div className="h-full">
      <div className="relative px-[5cqw] pt-[2cqw] text-[4.4cqw]">
        <Tile g={g} label={false} className="aspect-square text-[9cqw]" />
        <span aria-hidden className="absolute left-[8cqw] top-[5cqw] flex size-[8cqw] items-center justify-center rounded-full bg-black/40 text-[4cqw]">
          ←
        </span>
      </div>
      <div className="px-[5cqw] pt-[5cqw]">
        <p className="ha-display text-[10cqw]">{g.name}</p>
        <p className="ha-mute mt-[1cqw] text-[3.6cqw]">Slots · Halo Originals</p>
        <div className="ha-mono mt-[5cqw] grid grid-cols-3 border-y border-[var(--line)] py-[3cqw] text-[3cqw]">
          {[
            ['RTP', '96.4%'],
            ['Volatility', 'Mid'],
            ['Max win', '5000×'],
          ].map(([k, v]) => (
            <span key={k}>
              <span className="ha-mute block">{k}</span>
              <span className="mt-[1cqw] block text-[3.8cqw]">{v}</span>
            </span>
          ))}
        </div>
        <div className="mt-[6cqw] grid gap-[2.4cqw] text-[3.8cqw]">
          <Button>Play</Button>
          <Button kind="ghost">Try for free</Button>
        </div>
        <p className="ha-mono ha-mute mt-[5cqw] text-center text-[2.8cqw]">18+ · Play well · Set a limit</p>
      </div>
    </div>
  )
}

function LiveScreen() {
  const tables = [
    { name: 'Roulette', host: 'Athena', min: '€1', playing: 214 },
    { name: 'Blackjack', host: 'Nikos', min: '€5', playing: 6, seats: '1 seat left' },
    { name: 'Baccarat', host: 'Mira', min: '€2', playing: 88 },
  ]
  return (
    <div className="h-full">
      <div className="px-[5cqw] pt-[3cqw]">
        <p className="ha-display text-[10cqw]">Live tables</p>
        <p className="ha-mute text-[3.6cqw]">Real dealers, streamed from the studio</p>
      </div>
      <div className="grid gap-[3.4cqw] px-[5cqw] pt-[5cqw]">
        {tables.map((t, i) => (
          <div key={t.name} className="overflow-hidden rounded-[3cqw] border border-[var(--line)] bg-[var(--deep)]" style={i === 0 ? { borderColor: 'rgba(255,79,192,0.6)', boxShadow: '0 4cqw 10cqw -4cqw rgba(192,22,143,0.7)' } : undefined}>
            {/* the table, lit from below, its dealer a silhouette */}
            <div className="relative h-[24cqw]" style={{ background: 'radial-gradient(60% 90% at 50% 100%, rgba(192,22,143,0.7) 0%, rgba(192,22,143,0) 100%), linear-gradient(#2a1240, #0a1124)' }}>
              <span aria-hidden className="absolute bottom-0 left-1/2 h-[16cqw] w-[14cqw] -translate-x-1/2 rounded-t-full bg-black/55" />
              <span aria-hidden className="absolute bottom-[13cqw] left-1/2 size-[7cqw] -translate-x-1/2 rounded-full bg-black/55" />
              <LivePill className="absolute left-[3cqw] top-[3cqw] text-[3.4cqw]" />
            </div>
            <div className="flex items-end justify-between p-[3cqw]">
              <span>
                <span className="block font-semibold">
                  {t.name} <span className="ha-mute font-normal">with {t.host}</span>
                </span>
                <span className="ha-mono ha-mute block text-[2.8cqw]">
                  Min {t.min} · {t.playing} playing
                </span>
              </span>
              {t.seats && <span className="ha-mono text-[2.8cqw] text-[#ff8fd6]">{t.seats}</span>}
            </div>
          </div>
        ))}
      </div>
      <TabBar on={1} />
    </div>
  )
}

function WalletScreen() {
  const limits = [
    { k: 'Deposits this week', v: '€40 of €100', p: 0.4 },
    { k: 'Time tonight', v: '45 of 60 min', p: 0.75 },
  ]
  return (
    <div className="h-full">
      <div className="ha-glow-cyan mx-[5cqw] mt-[3cqw] rounded-[3cqw] border border-[var(--line)] p-[5cqw] text-center">
        <p className="ha-mono ha-mute text-[3cqw]">Balance</p>
        <p className="ha-display mt-[1cqw] text-[14cqw]">€48.20</p>
        <div className="mt-[3cqw] grid grid-cols-2 gap-[2.4cqw] text-[3.6cqw]">
          <Button>Deposit</Button>
          <Button kind="ghost">Withdraw</Button>
        </div>
      </div>
      <div className="px-[5cqw] pt-[6cqw]">
        <p className="font-semibold">Your limits</p>
        {limits.map((l) => (
          <div key={l.k} className="mt-[3.4cqw]">
            <div className="flex justify-between text-[3.4cqw]">
              <span className="ha-mute">{l.k}</span>
              <span className="ha-mono text-[3cqw]">{l.v}</span>
            </div>
            <div className="mt-[1.4cqw] h-[1.6cqw] overflow-hidden rounded-full bg-[var(--raise)]">
              <div className="h-full rounded-full bg-[var(--cyan)]" style={{ width: `${l.p * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      {/* the reality check: the same calm voice, never a warning siren */}
      <div className="mx-[5cqw] mt-[6cqw] rounded-[3cqw] border border-[var(--line)] bg-[var(--raise)] p-[4cqw] text-[3.6cqw]">
        <p className="font-semibold">You’ve played for 45 minutes.</p>
        <p className="ha-mute mt-[1cqw]">Keep going, or take a break?</p>
        <div className="mt-[3cqw] flex gap-[2cqw] text-[3.4cqw]">
          <Button kind="ghost">Take a break</Button>
          <Button kind="ghost">Keep going</Button>
        </div>
      </div>
      <TabBar on={3} />
    </div>
  )
}

// ------------------------------------------------------------ 08.5 Digital: the lobby on desktop

function Lobby() {
  const jackpot = useJackpot(1284906.4)
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="08.5" title="Digital — the lobby, on desktop" />
      <Title a="One jackpot." b="Always in view." />
      <Rise className="mt-[8cqh] overflow-hidden rounded-[12px] border border-[var(--line)] bg-[var(--night)] shadow-[0_50px_90px_-50px_rgba(0,0,0,0.9)]">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[#070c1a] px-4 py-2.5">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className="size-2.5 rounded-full bg-white/15" />
          ))}
          <span className="ha-mono ha-mute ml-3 rounded-full bg-white/5 px-3 py-0.5 text-[9px]">halo.casino</span>
        </div>
        <div className="text-[max(9px,1.05cqw)]">
          <div className="flex items-center justify-between px-[3%] py-[1.6%]">
            <div className="flex items-center gap-[3em]">
              <HaloMark size="2.2em" />
              <span className="hidden gap-[2em] @2xl:flex">
                <span className="text-[var(--cyan)]">Casino</span>
                <span className="ha-mute">Live casino</span>
                <span className="ha-mute">Jackpots</span>
                <span className="ha-mute">Offers</span>
              </span>
            </div>
            <div className="flex items-center gap-[1em]">
              <span className="ha-mono rounded-full bg-[var(--raise)] px-[1em] py-[0.4em]">€48.20</span>
              <Button className="text-[0.9em]">Deposit</Button>
            </div>
          </div>
          <div className="mx-[3%] flex flex-col items-start justify-between gap-[1em] rounded-[10px] border border-[var(--line)] px-[4%] py-[4%] @2xl:flex-row @2xl:items-end" style={{ background: 'radial-gradient(50% 120% at 30% 100%, rgba(45,212,200,0.55) 0%, rgba(45,212,200,0) 100%), radial-gradient(40% 100% at 90% 100%, rgba(192,22,143,0.45) 0%, rgba(192,22,143,0) 100%), var(--night)' }}>
            <div>
              <p className="ha-mono ha-mute text-[0.85em]">Halo jackpot — growing now</p>
              <p className="ha-display mt-[0.3em] tabular-nums" style={{ fontSize: 'max(28px, 5.4cqw)' }}>
                €{jackpot}
              </p>
            </div>
            <Button>Play for the jackpot</Button>
          </div>
          <div className="flex items-baseline justify-between px-[3%] pb-[1%] pt-[2.4%]">
            <span className="font-semibold">Tonight’s picks</span>
            <span className="ha-mute">See all</span>
          </div>
          <div className="grid grid-cols-3 gap-[1.2%] px-[3%] pb-[3%] @2xl:grid-cols-6">
            {GAMES.map((g) => (
              <Tile key={g.name} g={g} className="aspect-[4/5] text-[1.15em]" />
            ))}
          </div>
          <div className="ha-mono ha-mute flex justify-between border-t border-[var(--line)] px-[3%] py-[1.4%] text-[0.8em]">
            <span>18+ · Play well · Limits in your wallet</span>
            <span>Portfolio concept</span>
          </div>
        </div>
      </Rise>
    </section>
  )
}

// The logo animation, playing again every few seconds and on Replay: the ring draws itself,
// lights up, and the letters rise
function MarkInMotion() {
  const [take, setTake] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTake((t) => t + 1), 5200)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="ha-glow-cyan relative flex items-center justify-center rounded-[16px] border border-[var(--line)] pb-[12cqh] pt-[10cqh]">
      <HaloMark key={take} size="max(80px, 13cqw)" reveal />
      <span className="ha-mono ha-mute absolute bottom-3 left-4 text-[10px]">Logo animation — draw · light · rise</span>
      <button
        type="button"
        onClick={() => setTake((t) => t + 1)}
        className="ha-mono absolute bottom-2.5 right-3 rounded-full border border-white/20 px-3 py-1 text-[10px] text-white/70 transition-colors hover:border-[var(--cyan)] hover:text-white"
      >
        Replay ↺
      </button>
    </div>
  )
}

// ------------------------------------------------------------ 05 Brand film

function BrandFilm() {
  const frames: { t: string; note: string; art: ReactNode }[] = [
    { t: '00:00', note: 'Dark. A room you can’t see yet.', art: <div className="size-full bg-black" /> },
    { t: '00:04', note: 'A table lights up from below.', art: <div className="ha-glow-cyan size-full" /> },
    {
      t: '00:12',
      note: 'Above it, the ring draws itself.',
      art: (
        <div className="ha-glow-cyan flex size-full items-center justify-center">
          <Ring className="h-[40%]" />
        </div>
      ),
    },
    {
      t: '00:24',
      note: 'The ring becomes the O. Every table has its light.',
      art: (
        <div className="ha-glow-cyan flex size-full items-center justify-center">
          <HaloMark size="max(24px, 3cqw)" />
        </div>
      ),
    },
  ]
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="05" title="Brand film" />
          <Title a="Thirty seconds." b="One light." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          The film tells the idea without a word: a dark room, a table lighting up, and the ring that becomes the name. One low
          note, no voice-over, nothing that flashes.
        </Rise>
      </div>
      <Rise className="mt-[8cqh]">
        <FilmSlot
          file="brand-film.mp4"
          brief="30-second brand film: a dark room; one table lights up from beneath; the ring draws itself above it and becomes the O of HALO. One low synth note, no voice, no flashing."
          spec="16:9 · 0:30"
        />
      </Rise>
      {/* the storyboard */}
      <div className="mt-[4cqh] grid grid-cols-2 gap-x-[2cqw] gap-y-[4cqh] @2xl:grid-cols-4">
        {frames.map((f, i) => (
          <Rise key={f.t} delay={i * 0.08}>
            <figure>
              <div className="aspect-video overflow-hidden rounded-[10px] border border-[var(--line)]">{f.art}</div>
              <figcaption className="ha-mono mt-3 text-[10px]">
                <span className="text-[var(--cyan)]">{f.t}</span>
                <span className="ha-mute mt-1 block normal-case tracking-normal font-sans text-[12px]">{f.note}</span>
              </figcaption>
            </figure>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 06 Out in the city

function Campaign() {
  const small = [
    { file: 'campaign-metro.jpg', n: '06.2', name: 'Metro poster', note: 'One table, lit, and the name small', brief: 'A poster in a metro station: a single roulette wheel lit from below in magenta on navy, HALO small at the bottom, 18+ in the footer. Commuters blurred past it.' },
    { file: 'campaign-phone.jpg', n: '06.3', name: 'At home', note: 'The lobby lighting the hand', brief: 'A hand holding a phone on a sofa at night, the Halo lobby on screen lighting the fingers cyan. The room is dark.' },
    { file: 'campaign-uniform.jpg', n: '06.4', name: 'Dealer uniform', note: 'Navy, one embroidered ring', brief: 'Close-up of a live dealer’s navy waistcoat with a small cyan ring embroidered on the chest, in low light.' },
  ]
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="06" title="Out in the city" />
          <Title a="A light you see" b="from the street." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          Off the screen the rule stays the same: a dark ground and one thing lit. A billboard, a metro poster, the live studio, a
          stadium board — each carries the ring and very little else.
        </Rise>
      </div>
      <Rise className="mt-[8cqh]">
        <figure>
          <Photo
            file="campaign-billboard.jpg"
            brief="A large billboard on an Athens avenue at night: navy ground, the HALO ring glowing, the line “Every table has its light.” Car light trails below."
            className="aspect-[4/3] w-full @2xl:aspect-[21/9]"
          />
          <Caption n="06.1" name="Billboard" note="Every table has its light" />
        </figure>
      </Rise>
      <div className="mt-[5cqh] grid grid-cols-2 gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-3">
        {small.map((p, i) => (
          <Rise key={p.file} delay={i * 0.08} className={i === 2 ? 'col-span-2 @2xl:col-span-1' : ''}>
            <figure>
              <Photo file={p.file} brief={p.brief} className={i === 2 ? 'aspect-[16/10] w-full @2xl:aspect-[3/4]' : 'aspect-[3/4] w-full'} />
              <Caption n={p.n} name={p.name} note={p.note} />
            </figure>
          </Rise>
        ))}
      </div>
      <div className="mt-[5cqh] grid gap-x-[3cqw] gap-y-[5cqh] @2xl:grid-cols-2">
        <Rise>
          <figure>
            <Photo
              file="campaign-studio.jpg"
              brief="The live studio: a dealer at a roulette table lit from beneath in magenta, the HALO ring glowing on the wall behind, everything else in darkness."
              className="aspect-[16/10] w-full"
            />
            <Caption n="06.5" name="Live studio" note="The table is the only light in the room" />
          </figure>
        </Rise>
        <Rise delay={0.1}>
          <figure>
            <Photo
              file="campaign-stadium.jpg"
              brief="A football stadium at night, the LED perimeter board running the HALO ring and wordmark in cyan on navy, players blurred in the foreground."
              className="aspect-[16/10] w-full"
            />
            <Caption n="06.6" name="Stadium board" note="Sponsorship: the ring, on a loop" />
          </figure>
        </Rise>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 09 Play well

function PlayWell() {
  const rules: [string, string][] = [
    ['18+ on every screen', 'In the footer of every page and under every Play button, the same size as the rest of the line.'],
    ['Limits a tap away', 'Deposit and time limits sit in the wallet, next to the balance — not three menus deep.'],
    ['A check-in, not a siren', 'After an hour the app asks, in the same calm voice: keep going, or take a break?'],
    ['No fake urgency', 'No countdowns on offers, no flashing wins, no “last chance”. Light rises; it never blinks.'],
  ]
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[4cqh] @2xl:grid-cols-[1.3fr_1fr] @2xl:items-end @2xl:gap-[5cqw]">
        <div>
          <Head n="09" title="Play well" />
          <Title a="Calm is" b="part of the brand." />
        </div>
        <Rise className="max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
          Responsible play is designed in the same system as everything else, with the same type, the same voice and the same light.
          It is not a disclaimer at the bottom; it is how Halo behaves.
        </Rise>
      </div>
      <div className="mt-[7cqh] grid gap-[3cqw] @2xl:grid-cols-4">
        {rules.map(([k, v], i) => (
          <Rise key={k} delay={i * 0.08} className="rounded-[12px] border border-[var(--line)] bg-[var(--deep)] p-[6%] @2xl:p-[10%]">
            <span className="ha-mono text-[10px] text-[var(--cyan)]">0{i + 1}</span>
            <p className="ha-display mt-3" style={{ fontSize: 'max(20px, 2cqw)' }}>
              {k}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--mute)]">{v}</p>
          </Rise>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 10 Motion

function Motion() {
  const specs: [string, string][] = [
    ['Easing', 'cubic-bezier(0.2, 0.7, 0.2, 1)'],
    ['Duration', '600 ms'],
    ['Flashing', 'Never'],
    ['Reduced motion', 'Static light'],
  ]
  return (
    <section className="bg-[var(--deep)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[6cqh] @2xl:grid-cols-2 @2xl:items-center @2xl:gap-[5cqw]">
        <div>
          <Head n="10" title="Motion" />
          <Title a="Light rises." b="Nothing flashes." />
          <Rise className="mt-[4cqh] max-w-[44ch] text-[14px] leading-relaxed text-[var(--mute)]">
            When something becomes playable, its light rises from below and settles. A live table breathes slowly. Wins are shown
            once, calmly. There are no strobes, no shaking and no blinking — good for players, and for anyone sensitive to flashing
            light.
          </Rise>
          <div className="ha-mono mt-[4cqh] border-t border-[var(--line)] text-[11px]">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[var(--line)] py-2.5">
                <span className="ha-mute">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {/* the rule, running: a tile lights up, holds, and settles */}
        <Rise className="mx-auto w-[70%] text-[max(14px,1.6cqw)] @2xl:w-[62%]">
          <div className="ha-light-up rounded-[0.7em] border-2 border-[var(--line)]">
            <Tile g={GAMES[1]} className="aspect-[4/5]" />
          </div>
          <p className="ha-mono ha-mute mt-4 text-center text-[10px]">Rise 600 ms · hold · settle</p>
        </Rise>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 11 Closing

function Closing() {
  return (
    <section className="ha-glow-cyan flex flex-col justify-between px-[5cqw] pb-[6cqh] pt-[10cqh]" style={{ minHeight: '90cqh' }}>
      <Head n="11" title="Closing" />
      <div>
        <Rise>
          <h2 className="ha-display" style={{ fontSize: 'max(48px, 10cqw)' }}>
            <span className="block">Every table</span>
            <span className="block text-[var(--cyan)]">has its light.</span>
          </h2>
        </Rise>
        <Rise delay={0.2} className="mt-[4cqh] max-w-[46ch] text-[15px] leading-relaxed">
          A dark room, a lit table, a ring of light for a name.
          <span className="ha-mute"> Halo makes a night of play feel calm, clear and a little special.</span>
        </Rise>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[var(--line)] pt-[4cqh]">
        <HaloMark size="max(56px, 7cqw)" />
        <p className="ha-mono ha-mute text-right text-[10px] leading-relaxed">
          Halo — Brand identity — Online casino — 2026
          <br />
          Strategy · Identity · Product design · Motion
          <br />
          Portfolio concept · 18+
        </p>
      </div>
    </section>
  )
}
