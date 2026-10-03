import type { CSSProperties, ReactNode } from 'react'
import { PhotoSlot } from '../PhotoSlot'
import { useInView, useScrollProgress } from '../scroll'
import './decay.css'

// DECAY — Brand identity for a festival of electronic and ambient music, 2026.
//
// Context: three nights in a flooded limestone quarry outside the city. The walls give every
// sound a six-second tail. People come for the sets; they stay for the silence after them.
// Idea: EVERY SOUND FADES. The identity is built from what happens after a note — the echo, the
// tail, the decay — and it is allowed to fade too.
// Logo logic: the word and its echoes. Each repetition is later, narrower, lighter and fainter,
// spaced by the quarry's real reverb time. The mark is a sound with its tail still ringing.
// Typography: one family, Archivo, used across its whole width axis. Loud things are set at its
// widest; they narrow as they decay. Small text sits wide and tracked, like gear labels.
// Colour: cold quarry grey, black, and acid — high-visibility lime, because the festival happens
// at night on a working site, and because it is the colour of a lit level meter.
// Voice: terse, nocturnal, time-stamped. Everything is said with a time.
// Motion: the synthesiser envelope. Attack, decay, sustain, release — nothing simply fades in.
//
// Story: 00 The poster (campaign first) · 01 Every sound fades · 02 The echo mark ·
// 03 Type that decays · 04 Line-up · 05 Programme · 06 On site · 07 The app · 08 Envelope ·
// 09 Closing

const REVERB = [0, 1.2, 2.4, 3.6, 4.8, 6.0]

export function DecayCaseStudy() {
  return (
    <article className="dc" aria-label="Decay — Brand identity case study">
      <Poster />
      <Fades />
      <EchoMark />
      <DecayType />
      <LineUp />
      <Programme />
      <OnSite />
      <App />
      <Envelope />
      <Closing />
    </article>
  )
}

// ------------------------------------------------------------ building blocks

// The mark: DECAY and its echoes. `count` repetitions, each later, narrower, lighter, fainter.
function Echo({
  word = 'Decay',
  count = 6,
  size = '10cqw',
  tone = 'var(--ink)',
  times = false,
  className = '',
}: {
  word?: string
  count?: number
  size?: string
  tone?: string
  times?: boolean
  className?: string
}) {
  return (
    <div className={className} role="img" aria-label={word}>
      {Array.from({ length: count }, (_, i) => {
        const k = i / Math.max(count - 1, 1)
        const wdth = 125 - k * 63
        return (
          <span
            key={i}
            aria-hidden
            className="dc-echo flex items-baseline gap-[0.25em]"
            style={{
              fontFamily: 'Archivo',
              textTransform: 'uppercase',
              fontSize: size,
              lineHeight: 0.8,
              letterSpacing: '-0.02em',
              fontWeight: Math.round(860 - k * 520),
              fontVariationSettings: `'wdth' ${wdth}`,
              fontStretch: `${wdth}%`,
              color: tone,
              opacity: 1 - k * 0.82,
            }}
          >
            {word}
            {times && <span className="dc-small" style={{ fontSize: 'max(9px, 0.11em)', letterSpacing: '0.1em', fontWeight: 500 }}>{`+${REVERB[i] ?? i}s`}</span>}
          </span>
        )
      })}
    </div>
  )
}

function Head({ n, title, tone = 'var(--ink)' }: { n: string; title: string; tone?: string }) {
  return (
    <p className="dc-small flex items-center gap-3" style={{ color: tone }}>
      <span className="inline-block size-[7px] rounded-full bg-[var(--acid)] ring-1 ring-black/20" />
      <span>{n}</span>
      <span className="opacity-60">{title}</span>
    </p>
  )
}

function Attack({ children, delay = 0, className = '', style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const ref = useInView<HTMLDivElement>(0.2)
  return (
    <div ref={ref} className={`dc-attack ${className}`} style={{ ...style, ['--d' as string]: `${delay}s` }}>
      {children}
    </div>
  )
}

// ------------------------------------------------------------ 00 The poster

function Poster() {
  return (
    <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--acid)]" style={{ minHeight: '100cqh' }}>
      <div className="dc-small absolute inset-x-[5cqw] top-[4cqh] flex justify-between text-[var(--grey)]/70">
        <span>Case study 03 / 04</span>
        <span>Brand identity / Music festival / 2026</span>
      </div>
      <div className="flex min-h-[100cqh] flex-col justify-between px-[5cqw] pb-[5cqh] pt-[11cqh]">
        <Echo count={6} size="max(64px, 17.5cqw)" tone="var(--acid)" />
        <div className="grid gap-[3cqh] @2xl:grid-cols-[1fr_auto] @2xl:items-end">
          <div className="dc-small grid grid-cols-3 gap-[3cqw] text-[var(--grey)]">
            <span>
              Fri 18
              <br />
              Sat 19
              <br />
              Sun 20 Sept
            </span>
            <span>
              The quarry
              <br />
              Lower basin
              <br />
              Gates 19:00
            </span>
            <span>
              Electronic
              <br />
              Ambient
              <br />
              Silence
            </span>
          </div>
          <p className="dc-wide text-[var(--grey)]" style={{ fontSize: 'max(22px, 3.4cqw)' }}>
            Every sound fades.
          </p>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 01 Every sound fades

function Fades() {
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="01" title="Every sound fades" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1.25fr_1fr] @2xl:items-end">
        <Attack>
          <p className="dc-wide" style={{ fontSize: 'max(30px, 6cqw)' }}>
            The quarry holds every note for six seconds.
          </p>
        </Attack>
        <Attack delay={0.1}>
          <p className="dc-body max-w-[44ch] text-[14px] leading-relaxed text-[var(--ink)]/75">
            Decay happens in a flooded limestone quarry where the walls give every sound a long, ringing tail. The best moment
            of every set is the one after it. The identity is built from that moment — the echo, the tail, the fade — and is
            allowed to disappear too.
          </p>
        </Attack>
      </div>
      {/* the room's impulse response: a sound and its six-second tail */}
      <Attack delay={0.15} className="mt-[8cqh]">
        <div className="flex h-[22cqh] items-center gap-[2px]">
          {Array.from({ length: 140 }, (_, i) => {
            const t = i / 139
            const env = i < 3 ? 1 : Math.exp(-t * 4.2)
            const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1)
            return <span key={i} className="flex-1" style={{ height: `${Math.max(env * jitter * 100, 1.5)}%`, background: i < 3 ? 'var(--ink)' : `rgba(14,15,14,${0.25 + env * 0.75})` }} />
          })}
        </div>
        <div className="dc-small mt-3 flex justify-between text-[var(--ink)]/55">
          {REVERB.map((s) => (
            <span key={s}>{s.toFixed(1)}s</span>
          ))}
        </div>
      </Attack>
    </section>
  )
}

// ------------------------------------------------------------ 02 The echo mark

function EchoMark() {
  return (
    <section className="bg-[var(--acid)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="02" title="The echo mark" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1.4fr_1fr]">
        <Attack>
          <Echo count={6} size="max(46px, 10.5cqw)" times />
        </Attack>
        <div className="flex flex-col justify-end gap-6">
          <p className="dc-body max-w-[40ch] text-[14px] leading-relaxed">
            The mark is the word and its echoes, spaced by the quarry&rsquo;s real reverb time. Each repetition is a little later,
            narrower, lighter and fainter. It is never the same length twice: on a ticket it rings for two echoes, on the main
            stage for six.
          </p>
          <div className="dc-small grid grid-cols-2 gap-x-6 gap-y-1 text-[var(--ink)]/70">
            <span>Width 125 → 62</span>
            <span>Weight 860 → 340</span>
            <span>Opacity 100 → 18%</span>
            <span>Spacing = 1.2 s</span>
          </div>
        </div>
      </div>
      {/* the same mark at different lengths */}
      <div className="mt-[9cqh] grid grid-cols-2 gap-[2.5cqw] @2xl:grid-cols-4">
        {[
          { n: 1, label: 'Wristband', bg: 'var(--ink)', fg: 'var(--acid)' },
          { n: 2, label: 'Ticket', bg: 'var(--grey)', fg: 'var(--ink)' },
          { n: 4, label: 'Social', bg: 'var(--ink)', fg: 'var(--grey)' },
          { n: 6, label: 'Main stage', bg: '#fff', fg: 'var(--ink)' },
        ].map(({ n, label, bg, fg }, i) => (
          <Attack key={label} delay={i * 0.06}>
            <div className="flex aspect-square items-center overflow-hidden p-[10%]" style={{ background: bg }}>
              <Echo count={n} size="max(18px, 3.2cqw)" tone={fg} />
            </div>
            <p className="dc-small mt-2 text-[var(--ink)]/65">
              {label} — {n} {n === 1 ? 'echo' : 'echoes'}
            </p>
          </Attack>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 03 Type that decays

function DecayType() {
  const ref = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section className="bg-[var(--ink)] text-[var(--grey)]">
      <div ref={ref} className="relative" style={{ height: '240cqh' }}>
        <div className="sticky top-0 flex flex-col justify-between overflow-hidden px-[5cqw] pb-[6cqh] pt-[8cqh]" style={{ height: '100cqh' }}>
          <Head n="03" title="Type that decays" tone="var(--grey)" />
          <div>
            {['Attack', 'Sustain', 'Decay'].map((w, i) => (
              <p
                key={w}
                data-scroll
                className="dc-wide dc-shrink whitespace-nowrap"
                style={{
                  fontSize: 'max(42px, 12cqw)',
                  color: i === 2 ? 'var(--acid)' : 'var(--grey)',
                  fontWeight: `calc(860 - var(--p, 0) * ${i * 220})` as unknown as number,
                  opacity: `calc(1 - var(--p, 0) * ${i * 0.32})` as unknown as number,
                }}
              >
                {w}
              </p>
            ))}
          </div>
          <div className="grid gap-[3cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-end">
            <p className="dc-body max-w-[44ch] text-[14px] leading-relaxed text-[var(--grey)]/65">
              One family across its whole width axis. Loud things are set at Archivo&rsquo;s widest — 125 — and lose width as they
              decay, down to 62. Scroll this chapter and the words fade the way a sound does.
            </p>
            <p className="dc-small text-[var(--grey)]/50 @2xl:text-right">Archivo Variable — wdth 62–125 / wght 300–900</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 04 Line-up

const ACTS: [string, string][] = [
  ['Sela Moor', 'Fri 23:40'],
  ['Halvard', 'Sat 01:10'],
  ['Ione Tay', 'Fri 21:30'],
  ['Basin Choir', 'Sun 20:00'],
  ['Kepler & Wren', 'Sat 22:50'],
  ['Marrow', 'Sun 23:15'],
  ['Ø Static', 'Fri 19:40'],
  ['Little Hours', 'Sat 19:30'],
  ['Pale Engine', 'Sun 21:40'],
  ['Hollow Sun', 'Sat 03:00'],
]

function LineUp() {
  return (
    <section className="overflow-hidden px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="04" title="Line-up" />
      <p className="dc-body mt-4 max-w-[46ch] text-[14px] leading-relaxed text-[var(--ink)]/70">
        Billing as decay: headliners at full width, every act after them narrower, lighter and quieter — the line-up rings out
        down the page.
      </p>
      <div className="mt-[6cqh] flex flex-col">
        {ACTS.map(([name, time], i) => {
          const k = i / (ACTS.length - 1)
          const wdth = 125 - k * 60
          return (
            <Attack key={name} delay={i * 0.04} className="flex items-baseline justify-between gap-4 border-t border-[var(--ink)]/12 py-[0.6cqh]">
              <span
                className="whitespace-nowrap uppercase"
                style={{
                  fontFamily: 'Archivo',
                  fontSize: `max(${20 - k * 6}px, ${8.6 - k * 5.4}cqw)`,
                  lineHeight: 0.92,
                  letterSpacing: '-0.015em',
                  fontWeight: Math.round(860 - k * 480),
                  fontVariationSettings: `'wdth' ${wdth}`,
                  fontStretch: `${wdth}%`,
                  opacity: 1 - k * 0.55,
                }}
              >
                {name}
              </span>
              <span className="dc-small shrink-0 text-[var(--ink)]/55">{time}</span>
            </Attack>
          )
        })}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 05 Programme

const NIGHTS: { day: string; sets: [string, number, number][] }[] = [
  { day: 'Fri', sets: [['Ø Static', 0, 1.6], ['Ione Tay', 2, 3.6], ['Sela Moor', 4.2, 6.2]] },
  { day: 'Sat', sets: [['Little Hours', 0.2, 1.9], ['Kepler & Wren', 3.6, 5.2], ['Halvard', 5.8, 7.4], ['Hollow Sun', 7.8, 9.4]] },
  { day: 'Sun', sets: [['Basin Choir', 1, 2.6], ['Pale Engine', 2.9, 4.4], ['Marrow', 4.6, 6.8]] },
]

function Programme() {
  return (
    <section className="bg-[var(--stone)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="05" title="Programme" />
      <h3 className="dc-wide mt-5 max-w-[14ch]" style={{ fontSize: 'max(28px, 5cqw)' }}>
        Every set has a tail.
      </h3>
      <p className="dc-body mt-4 max-w-[46ch] text-[14px] leading-relaxed text-[var(--ink)]/75">
        The timetable draws each set as a sound: a hard start, a held body, and a fading tail that runs into the silence
        before the next act. The gaps are programmed too.
      </p>
      <div className="mt-[7cqh]">
        <div className="dc-small mb-2 grid grid-cols-[3.4cqw_1fr] text-[var(--ink)]/55">
          <span />
          <div className="flex justify-between">
            {['19', '20', '21', '22', '23', '00', '01', '02', '03', '04'].map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        </div>
        {NIGHTS.map(({ day, sets }, n) => (
          <Attack key={day} delay={n * 0.08} className="grid grid-cols-[3.4cqw_1fr] items-center border-t border-[var(--ink)]/20">
            <span className="dc-small">{day}</span>
            <div className="relative h-[9cqh]">
              {sets.map(([act, from, to]) => (
                <div
                  key={act}
                  className="absolute inset-y-[18%] overflow-hidden"
                  style={{
                    left: `${(from / 10) * 100}%`,
                    width: `${((to - from) / 10) * 100 + 4}%`,
                    background: 'linear-gradient(90deg, var(--ink) 0%, var(--ink) 72%, rgba(14,15,14,0) 100%)',
                  }}
                >
                  <span className="dc-small block truncate px-2 pt-1 text-[var(--acid)]">{act}</span>
                </div>
              ))}
            </div>
          </Attack>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 06 On site

function OnSite() {
  return (
    <section className="bg-[var(--ink)] pb-[12cqh] pt-[10cqh] text-[var(--grey)]">
      <div className="px-[5cqw]">
        <Head n="06" title="On site" tone="var(--grey)" />
        <h3 className="dc-wide mt-5 max-w-[16ch]" style={{ fontSize: 'max(28px, 5cqw)' }}>
          High-vis, because it&rsquo;s a quarry.
        </h3>
      </div>
      <div className="mt-[7cqh] grid gap-[3cqw] px-[5cqw] @2xl:grid-cols-[1.5fr_1fr]">
        <PhotoSlot
          src="/projects/decay/quarry-night.jpg"
          brief="The lower basin at night: water, sheer limestone walls, one acid-lime stage sign and work lights; crowd small at the bottom of the frame. Long exposure, cold, wide."
          tone="dark"
          className="aspect-[16/11] w-full"
        />
        <div className="flex flex-col gap-[3cqw]">
          {/* stage sign */}
          <Attack className="flex flex-1 flex-col justify-between bg-[var(--acid)] p-[8%] text-[var(--ink)]">
            <span className="dc-small">Stage 1 — Lower basin →</span>
            <Echo word="Basin" count={3} size="max(26px, 4.6cqw)" />
          </Attack>
          {/* wristband */}
          <Attack delay={0.1} className="relative flex h-[11cqh] min-h-[64px] items-center gap-[6%] overflow-hidden rounded-full bg-[#1b1c1b] px-[8%] ring-1 ring-[var(--grey)]/15">
            <span className="size-[1.6cqh] min-h-2 min-w-2 shrink-0 rounded-full bg-[var(--grey)]/30" />
            <Echo count={4} size="max(14px, 2cqw)" tone="var(--acid)" className="flex gap-[0.4em] [&>span]:inline-flex" />
            <span className="dc-small ml-auto shrink-0 text-[var(--grey)]/55">3-night</span>
          </Attack>
        </div>
      </div>
      <div className="mt-[3cqw] grid grid-cols-3 gap-[3cqw] px-[5cqw]">
        {['Water point', 'Silence zone', 'Exit 2'].map((t, i) => (
          <Attack key={t} delay={i * 0.06} className="flex aspect-[3/4] flex-col justify-between border border-[var(--grey)]/25 p-[10%]">
            <span className="dc-small text-[var(--acid)]">{['↓ 40 m', '⦸ no sound', '→ 120 m'][i]}</span>
            <span className="dc-wide" style={{ fontSize: 'max(16px, 2.6cqw)' }}>
              {t}
            </span>
          </Attack>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 07 The app

function App() {
  return (
    <section className="px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <div className="grid gap-[6cqh] @2xl:grid-cols-[1fr_1fr] @2xl:items-center">
        <div>
          <Head n="07" title="The app" />
          <h3 className="dc-wide mt-5 max-w-[12ch]" style={{ fontSize: 'max(28px, 5cqw)' }}>
            Always: what&rsquo;s fading, what&rsquo;s next.
          </h3>
          <p className="dc-body mt-4 max-w-[42ch] text-[14px] leading-relaxed text-[var(--ink)]/75">
            One screen that matters: the set that&rsquo;s playing, shrinking as it runs out, and the countdown to the next. The
            current act&rsquo;s name literally narrows as its set decays.
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-[4%]">
          <Attack className="relative aspect-[9/18.5] overflow-hidden rounded-[18px] bg-[var(--ink)] p-[8%] text-[var(--grey)] shadow-[0_30px_50px_-30px_rgba(14,15,14,0.6)]">
            <p className="dc-small text-[var(--grey)]/55">Now — Lower basin</p>
            <div className="mt-[18%]">
              <Echo word="Halvard" count={3} size="clamp(14px, 2.5cqw, 26px)" tone="var(--acid)" />
            </div>
            <div className="absolute inset-x-[8%] bottom-[22%]">
              <div className="flex h-[3px] bg-[var(--grey)]/15">
                <span className="w-[68%] bg-[var(--acid)]" />
              </div>
              <div className="dc-small mt-2 flex justify-between text-[var(--grey)]/55">
                <span>01:10</span>
                <span>−00:31</span>
              </div>
            </div>
            <div className="dc-meter absolute bottom-[7%] left-[8%] flex h-[6%] items-end gap-[3px]">
              {[0.2, 0.6, 0.35, 0.9, 0.5, 0.75, 0.3].map((d, i) => (
                <span key={i} className="block h-full w-[4px] bg-[var(--acid)]" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </Attack>
          <Attack delay={0.12} className="relative mt-[18%] aspect-[9/18.5] overflow-hidden rounded-[18px] bg-[var(--grey)] p-[8%] shadow-[0_30px_50px_-30px_rgba(14,15,14,0.5)] ring-1 ring-black/10">
            <p className="dc-small text-[var(--ink)]/55">Next</p>
            <p className="dc-wide mt-[16%]" style={{ fontSize: 'clamp(16px, 2.8cqw, 30px)' }}>
              Hollow Sun
            </p>
            <p className="dc-small mt-2 text-[var(--ink)]/60">Sat 03:00 — Upper ledge</p>
            <div className="mt-[18%] flex flex-col gap-[6%]">
              {[['Sun 20:00', 'Basin Choir'], ['Sun 21:40', 'Pale Engine'], ['Sun 23:15', 'Marrow']].map(([t, a], i) => (
                <div key={a} className="flex justify-between border-t border-[var(--ink)]/15 pt-2" style={{ opacity: 1 - i * 0.28 }}>
                  <span className="dc-small">{a}</span>
                  <span className="dc-small text-[var(--ink)]/55">{t}</span>
                </div>
              ))}
            </div>
            <span className="dc-small absolute bottom-[6%] left-[8%] rounded-full bg-[var(--acid)] px-3 py-1.5">Remind me</span>
          </Attack>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 08 Envelope (motion)

function Envelope() {
  const ref = useInView<HTMLDivElement>(0.4)
  return (
    <section className="bg-[var(--acid)] px-[5cqw] pb-[12cqh] pt-[10cqh]">
      <Head n="08" title="Motion — the envelope" />
      <div className="mt-[6cqh] grid gap-[6cqh] @2xl:grid-cols-[1fr_1.3fr] @2xl:items-center">
        <div>
          <h3 className="dc-wide max-w-[10ch]" style={{ fontSize: 'max(30px, 5.6cqw)' }}>
            Nothing just fades in.
          </h3>
          <p className="dc-body mt-4 max-w-[40ch] text-[14px] leading-relaxed">
            Every movement follows a synthesiser envelope: a fast attack, a short decay, a sustained hold, and a long release.
            Type, images and the app all move like sounds.
          </p>
        </div>
        <div ref={ref} className="dc-env">
          {/* the envelope shape, with a playhead and the sound it shapes */}
          <div className="relative h-[30cqh] border-b-2 border-l-2 border-[var(--ink)]">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <polyline points="0,50 6,2 22,19 58,19 96,50 100,50" fill="none" stroke="var(--ink)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="head absolute inset-y-0 w-px bg-[var(--ink)]/50" />
            <div className="absolute bottom-0 right-[4%] flex h-[70%] w-[18%] items-end justify-center">
              <span className="pulse block h-full w-[40%] bg-[var(--ink)]" />
            </div>
          </div>
          <div className="dc-small mt-3 grid grid-cols-4">
            <span>Attack 0.12s</span>
            <span>Decay 0.5s</span>
            <span>Sustain</span>
            <span className="text-right">Release 1.6s</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------ 09 Closing

function Closing() {
  return (
    <section className="flex flex-col justify-between bg-[var(--ink)] px-[5cqw] pb-[6cqh] pt-[10cqh] text-[var(--grey)]" style={{ minHeight: '100cqh' }}>
      <Head n="09" title="Closing" tone="var(--grey)" />
      <Echo word="See you" count={4} size="max(44px, 12cqw)" tone="var(--acid)" className="my-[6cqh]" />
      <div className="flex flex-col gap-4 border-t border-[var(--grey)]/15 pt-[4cqh] @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <p className="dc-wide" style={{ fontSize: 'max(20px, 3cqw)' }}>
          before it fades.
        </p>
        <p className="dc-small text-[var(--grey)]/55 @2xl:text-right">
          Decay — Brand identity — 2026
          <br />
          The quarry · 18–20 Sept
        </p>
      </div>
    </section>
  )
}
