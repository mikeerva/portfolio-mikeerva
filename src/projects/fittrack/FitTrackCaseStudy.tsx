import { useCallback, useContext, useEffect, useReducer, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { ScrollerContext, useInView, useScrollProgress } from '../scroll'
import { FitTrackApp, Pips, Ring } from './FitTrackApp'
import { NOTES, STEPS, type Note } from './notes'
import { MISSED, PLAN, SCREEN_TITLE, blockStats, fmtKg, initial, reducer, sampleLogs, type Action, type SetLog, type State } from './session'
import './fittrack.css'

// FitTrack: a working training app inside a case study about designing it. The page scrolls
// normally; only the experience chapter holds its phone in place while its notes are read.
export function FitTrackCaseStudy() {
  return (
    <article className="ft">
      <Hero />
      <Idea />
      <Experience />
      <BehindTheUI />
      <FinalProduct />
      <Ending />
    </article>
  )
}

// One-time rise into view
function Reveal({ children, className = '', threshold = 0.2 }: { children: ReactNode; className?: string; threshold?: number }) {
  const ref = useInView<HTMLDivElement>(threshold)
  return (
    <div ref={ref} className={`ft-reveal ${className}`}>
      {children}
    </div>
  )
}

function Kicker({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="ft-kicker">
      <span>{n}</span>
      {children}
    </p>
  )
}

/* -------------------------------------------------------------------- Hero */

function Hero() {
  // The link scrolls the panel, not the window (the route lives in the hash, and the page around
  // the panel must not move)
  const scroller = useContext(ScrollerContext)
  const toExperience = (e: MouseEvent) => {
    e.preventDefault()
    const panel = scroller?.current
    const target = document.getElementById('ft-experience')
    if (!panel || !target) return
    const top = target.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop
    panel.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  // The photograph is the hero's frame of reference: it keeps its own proportions in a layer that
  // covers the hero, and the type and the margins are placed in its coordinates (see .ft-hero),
  // so everything lines up on the F mark and stays clear of the athlete at every crop.
  return (
    <header className="ft-hero">
      <div className="ft-hero-art">
        <img
          src="/projects/fittrack/hero.webp"
          width={1516}
          height={1037}
          alt="An athlete seen from behind after training, lit in warm orange, the FitTrack F mark top left"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="ft-hero-shade" aria-hidden />
      <div className="ft-hero-top">
        {/* Only where the photograph's own F mark is cropped away */}
        <span className="ft-wordmark">
          <i aria-hidden>FT</i>FitTrack
        </span>
        <span>UI/UX · Product design · Interactive experience</span>
        <span>2025</span>
      </div>
      <h1 className="ft-hero-title">
        <span>Build a</span>
        <span className="is-orange">stronger</span>
        <span>day.</span>
      </h1>
      <div className="ft-hero-foot">
        <p>A focused training companion, designed for the minutes between sets.</p>
        <a href="#ft-experience" onClick={toExperience}>
          Use the app <span aria-hidden>↓</span>
        </a>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------- Idea */

const NOISE = ['Badges', 'Leaderboards', 'Streak guilt', 'Calorie theatre', 'Social feed', 'Daily scores']
const SIGNAL = ['Today’s plan', 'The current set', 'Rest', 'Progress over weeks']
const PRINCIPLES: [string, string][] = [
  ['Clarity', 'One question per screen.'],
  ['Focus', 'Navigation disappears while training.'],
  ['Consistency', 'Show up, not show off.'],
  ['Fast logging', 'One tap for most sets.'],
  ['Meaningful progress', 'Kilograms and sessions, not points.'],
  ['Low cognitive load', 'Readable mid-set, out of breath.'],
]

function Idea() {
  return (
    <section className="ft-idea">
      <Reveal className="ft-idea-head">
        <Kicker n="02">The idea</Kicker>
        <h2 className="ft-giant">
          Show up
          <br />
          for yourself.
        </h2>
      </Reveal>
      <Reveal className="ft-idea-copy">
        <p>
          FitTrack is a focused training companion. It tells you what to do today, lets you log training with almost no friction, and
          shows progress that actually means something over time.
        </p>
      </Reveal>
      <Reveal className="ft-noise" threshold={0.15}>
        <h3>
          Motivation
          <br />
          without the noise.
        </h3>
        <div className="ft-noise-cols">
          <div>
            <p className="ft-micro">Left out</p>
            <ul className="ft-struck">
              {NOISE.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ft-micro">Kept</p>
            <ul className="ft-kept">
              {SIGNAL.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
      <Reveal className="ft-principles">
        {PRINCIPLES.map(([t, d], i) => (
          <div key={t}>
            <span className="ft-micro">{String(i + 1).padStart(2, '0')}</span>
            <strong>{t}</strong>
            <p>{d}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/* -------------------------------------------------------------- Experience */

// The chapter is built around one object: the phone is the action, the panel beside it the
// explanation. On first arrival a line draws from the invitation down to the phone and Start
// workout rings twice; the first thing done in the app retires that invitation for good.
function Experience() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [design, setDesign] = useState(false)
  const [touched, setTouched] = useState(false)
  const act = useCallback((a: Action) => {
    setTouched(true)
    dispatch(a)
  }, [])
  const ref = useInView<HTMLElement>(0.3)
  const note = NOTES[state.screen]
  const stepIndex = STEPS.indexOf(state.screen)
  return (
    <section ref={ref} className={`ft-xp ${touched ? 'is-touched' : ''}`} id="ft-experience" aria-labelledby="ft-xp-title">
      <div className="ft-xp-head">
        <Kicker n="03">The experience</Kicker>
        <div className="ft-xp-headline">
          <h2 id="ft-xp-title" className="ft-xp-title">
            Use it.
          </h2>
          <p className="ft-xp-live">
            <span>This prototype is live.</span>
            <span className="ft-micro">Every button works · nothing is a screenshot</span>
          </p>
        </div>
      </div>

      <div className={`ft-xp-grid ${design ? 'is-design' : ''}`}>
        <div className="ft-xp-action">
          <p className="ft-xp-cue" aria-live="polite">
            <i aria-hidden className="ft-live-dot" />
            {touched ? (
              <span>
                Live · {note.n} {SCREEN_TITLE[state.screen]}
              </span>
            ) : (
              <span>
                Start a workout <b aria-hidden>↓</b>
              </span>
            )}
          </p>
          <div className="ft-xp-stage">
            <span className="ft-cue-line" aria-hidden>
              <i />
            </span>
            <div className="ft-phone" role="group" aria-label="FitTrack prototype, interactive">
              <div className="ft-phone-screen">
                <FitTrackApp state={state} dispatch={act} live />
                <div className="ft-grid-overlay" aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                  <span>4 col · 20 margin · 8 gutter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="ft-xp-notes" aria-label="Why this screen works">
          <div className="ft-notes-bar">
            <p className="ft-micro">Why it works</p>
            <div className="ft-notes-controls">
              <div className="ft-switch" role="radiogroup" aria-label="View">
                <button type="button" role="radio" aria-checked={!design} onClick={() => setDesign(false)}>
                  App
                </button>
                <button type="button" role="radio" aria-checked={design} onClick={() => setDesign(true)}>
                  Design
                </button>
                <i aria-hidden style={{ transform: `translateX(${design ? 100 : 0}%)` }} />
              </div>
              <button type="button" className="ft-restart" onClick={() => dispatch({ type: 'reset' })} disabled={state === initial}>
                Restart
              </button>
            </div>
          </div>
          <NotePanel key={state.screen} note={note} design={design} />
          <ol className="ft-rail" aria-label="Jump to a screen">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  aria-current={state.screen === s ? 'step' : undefined}
                  className={i < stepIndex ? 'is-past' : ''}
                  onClick={() => act({ type: 'jump', screen: s })}
                  aria-label={`${NOTES[s].n} ${NOTES[s].label}`}
                  title={NOTES[s].label}
                >
                  <span>{NOTES[s].n}</span>
                  {state.screen === s && <em>{NOTES[s].label}</em>}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  )
}

function NotePanel({ note, design }: { note: Note; design: boolean }) {
  return (
    <div className="ft-note">
      <p className="ft-note-n">
        <b>{note.n}</b> / {note.label}
      </p>
      {note.statement && <p className="ft-statement">{note.statement}</p>}
      <p className="ft-micro ft-note-k">Design goal</p>
      <p className="ft-note-goal">{note.goal}</p>
      {design ? (
        <div className="ft-note-design">
          <dl className="ft-note-points">
            {note.points.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="ft-note-wire">
            <figure>
              <figcaption className="ft-micro">First structure</figcaption>
              <Wire spec={note.wire} />
            </figure>
            <span aria-hidden>→</span>
            <div>
              <p>Final screen: the phone, marked up.</p>
              {note.flow && (
                <ol className="ft-flow" aria-label="Flow">
                  {note.flow.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="ft-note-try">
          <p className="ft-micro">Try</p>
          <p>{note.try}</p>
          <p>Switch to Design for the reasoning.</p>
        </div>
      )}
    </div>
  )
}

function Wire({ spec }: { spec: string }) {
  return (
    <div className="ft-wire" aria-hidden>
      {spec.split('').map((k, i) => (
        <i key={i} className={`w-${k}`} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ Behind the UI */

const SWATCHES = [
  { name: 'Ink', hex: '#141414', role: 'Base surface. Most of the product is this.', ratio: 'Cream on ink 16:1' },
  { name: 'Cream', hex: '#F3F1E8', role: 'Type and completion. Warm, never pure white.', ratio: 'Ink on cream 16:1' },
  { name: 'Orange', hex: '#FF6545', role: 'Action. The one thing to press, the set you’re on.', ratio: 'Ink on orange 6.3:1' },
  { name: 'Yellow', hex: '#F2DC5B', role: 'Rest. The only full-bleed colour state.', ratio: 'Ink on yellow 13:1' },
]

function Spec({ title, n, children, className = '' }: { title: string; n: string; children: ReactNode; className?: string }) {
  return (
    <Reveal className={`ft-spec ${className}`} threshold={0.15}>
      <p className="ft-spec-label">
        <span>{n}</span>
        {title}
      </p>
      {children}
    </Reveal>
  )
}

function BehindTheUI() {
  return (
    <section className="ft-system" aria-labelledby="ft-sys-title">
      <Reveal className="ft-system-head">
        <Kicker n="04">Behind the UI</Kicker>
        <h2 id="ft-sys-title" className="ft-giant">
          One system,
          <br />
          four colours,
          <br />
          no noise.
        </h2>
      </Reveal>

      <div className="ft-spec-grid">
        <Spec n="A" title="Type" className="is-ink is-wide">
          <div className="ft-type">
            <p className="ft-type-aa">Aa 72</p>
            <ul>
              <li>
                <b className="ft-f-display">Archivo Expanded 800</b>
                <span>Headlines and every number that matters</span>
              </li>
              <li>
                <b className="ft-f-mono">IBM Plex Mono 500</b>
                <span>Micro labels, units, states</span>
              </li>
              <li>
                <b className="ft-f-sans">Inter 400 / 500</b>
                <span>Sentences, kept short</span>
              </li>
            </ul>
          </div>
        </Spec>

        <Spec n="B" title="Colour" className="is-wide">
          <div className="ft-swatches">
            {SWATCHES.map((s) => (
              <div key={s.name} style={{ '--sw': s.hex } as CSSProperties}>
                <i />
                <b>{s.name}</b>
                <span className="ft-micro">{s.hex}</span>
                <p>{s.role}</p>
                <span className="ft-micro ft-dim">{s.ratio}</span>
              </div>
            ))}
          </div>
        </Spec>

        <Spec n="C" title="Grid" className="is-ink">
          <div className="ft-gridspec" aria-hidden>
            <div>
              {Array.from({ length: 4 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>
          <p className="ft-spec-note">4 columns · 20 margin · 8 gutter. Actions span all four.</p>
        </Spec>

        <Spec n="D" title="Spacing">
          <div className="ft-space" aria-hidden>
            {[4, 8, 16, 24, 40].map((s) => (
              <div key={s}>
                <i style={{ width: s * 2.4 }} />
                <span className="ft-micro">{s}</span>
              </div>
            ))}
          </div>
          <p className="ft-spec-note">An 8-point scale. 4 only inside components.</p>
        </Spec>

        <Spec n="E" title="Buttons & states" className="is-ink is-wide">
          <div className="ft-app ft-specimen ft-states" inert>
            {[
              ['Default', ''],
              ['Pressed', 'is-pressed'],
              ['Focus', 'is-focus'],
              ['Disabled', ''],
            ].map(([label, cls], i) => (
              <div key={label}>
                <button type="button" className={`ft-cta ${cls}`} disabled={i === 3}>
                  Log set <span aria-hidden>+</span>
                </button>
                <span className="ft-micro">{label}</span>
              </div>
            ))}
            <div>
              <button type="button" className="ft-outline">
                +30 sec
              </button>
              <span className="ft-micro">Secondary</span>
            </div>
            <div>
              <button type="button" className="ft-ghost">
                End workout early
              </button>
              <span className="ft-micro">Tertiary</span>
            </div>
          </div>
        </Spec>

        <Spec n="F" title="Input · wireframe → final" className="is-wide">
          <div className="ft-evolve">
            <div className="ft-wf-stepper" aria-hidden>
              <span>Weight</span>
              <div>
                <i>kg</i>
                <i />
              </div>
              <small>Text field + keyboard. Covered half the screen.</small>
            </div>
            <span className="ft-evolve-arrow" aria-hidden>
              →
            </span>
            <div className="ft-app ft-specimen" inert>
              <div className="ft-stepper">
                <p className="ft-micro">Weight</p>
                <div className="ft-stepper-row">
                  <button type="button">−</button>
                  <output>
                    <span className="ft-num">62.5</span>
                    <small>kg</small>
                  </output>
                  <button type="button">+</button>
                </div>
              </div>
            </div>
          </div>
        </Spec>

        <Spec n="G" title="Card · structure → final" className="is-ink is-wide">
          <div className="ft-evolve">
            <div className="ft-wire ft-wire-card" aria-hidden>
              <i className="w-t" />
              <i className="w-h" />
              <i className="w-t" />
              <i className="w-r" />
              <i className="w-r" />
            </div>
            <span className="ft-evolve-arrow" aria-hidden>
              →
            </span>
            <div className="ft-app ft-specimen" inert>
              <section className="ft-plan">
                <p className="ft-micro">Today's training</p>
                <h3>{PLAN.name}</h3>
                <p className="ft-plan-meta">45 min · 4 exercises</p>
                <ol className="ft-plan-list">
                  {PLAN.exercises.slice(0, 2).map((e) => (
                    <li key={e.id}>
                      <span>{e.name}</span>
                      <span>
                        {e.sets} × {e.reps[1]}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </Spec>

        <Spec n="H" title="Progress components" className="is-wide">
          <div className="ft-app ft-specimen ft-progress-kit" inert>
            <div>
              <Ring value={72} size="sm" />
              <span className="ft-micro">Readiness ring</span>
            </div>
            <div>
              <div className="ft-bar-track">
                <i style={{ width: '58%' }} />
              </div>
              <span className="ft-micro">Session bar · sets</span>
            </div>
            <div>
              <Pips done={1} total={3} />
              <span className="ft-micro">Set pips · done / now / next</span>
            </div>
            <div>
              <div className="ft-seg">
                <i className="is-on" />
                <i className="is-on" />
                <i className="is-on" />
                <i />
              </div>
              <span className="ft-micro">Week segments</span>
            </div>
          </div>
        </Spec>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- Final product */

const SAMPLE = sampleLogs()
const FIRST_SET: SetLog[][] = [[{ kg: 60, reps: 10 }], [], [], []]
// Two screens carry the composition (rest, the product's idea; progress, its payoff); the other
// four are set around them smaller
const STILLS: { id: string; state: State; label: string; line?: string }[] = [
  { id: 'today', label: 'Today', state: initial },
  { id: 'rest', label: 'Rest', line: 'The screen between sets: one number, one next action.', state: { ...initial, screen: 'rest', logs: FIRST_SET, rest: { total: 90, left: 54 } } },
  { id: 'exercise', label: 'Exercise', state: { ...initial, screen: 'exercise', logs: FIRST_SET } },
  { id: 'log', label: 'Logging', state: { ...initial, screen: 'log', logs: FIRST_SET, draft: { kg: 62.5, reps: 10 } } },
  { id: 'complete', label: 'Complete', state: { ...initial, screen: 'complete', logs: SAMPLE, finished: true } },
  { id: 'progress', label: 'Progress', line: 'Progress in kilograms and sessions, never in points.', state: { ...initial, screen: 'progress', logs: SAMPLE, finished: true } },
]
const noop = () => {}

function FinalProduct() {
  const ref = useScrollProgress<HTMLElement>('cross')
  return (
    <section ref={ref} className="ft-final" aria-labelledby="ft-final-title">
      <div className="ft-final-head">
        <Kicker n="05">Final experience</Kicker>
        <h2 id="ft-final-title" className="ft-giant">
          The product.
        </h2>
        <p className="ft-final-sub">You used it. You saw why. Here is the finished interface, screen by screen.</p>
      </div>
      <p className="ft-final-ghost" aria-hidden>
        FitTrack
      </p>
      <div className="ft-final-stage">
        {STILLS.map((s, i) => (
          <figure key={s.id} className={`ft-slab ft-slab-${s.id} ${s.line ? 'is-primary' : ''}`}>
            <div className="ft-slab-screen" inert>
              <FitTrackApp state={s.state} dispatch={noop} />
            </div>
            <figcaption>
              <span className="ft-micro">
                {String(i + 1).padStart(2, '0')} {s.label}
              </span>
              {s.line && <span className="ft-slab-line">{s.line}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Ending */

// The case study closes on the product's own language: the readiness ring the app opens with,
// grown into the whole training block and cropped so only a quarter of the dial shows. Ticks, one
// mark per planned session, weekly volume and the consistency arc, all from the same sample data
// the Progress screen shows; the reading sits in the dial's hub. It draws once, as the section
// arrives; the headline never moves.
function Ending() {
  const [ref, on] = useOnce<HTMLElement>(0.35)
  const { sessions, planned, consistency, volumeChange, bench, streak, weeks } = STATS
  const value = useCountTo(consistency, on)
  return (
    <footer ref={ref} className={`ft-end ${on ? 'is-on' : ''}`}>
      <div className="ft-end-inner">
        <Kicker n="06">Reflection</Kicker>
        <h2 className="ft-end-title">
          <span>Progress</span>
          <span>is personal.</span>
        </h2>
        <p className="ft-end-copy">FitTrack was designed around a simple principle: training software should disappear when the training begins.</p>
      </div>
      <ProgressObject />
      <dl className="ft-end-data">
        <div className="is-main">
          <dt>Consistency · {weeks.length}-week block</dt>
          <dd>
            <b>
              {value}
              <small>%</small>
            </b>
            <span>
              {sessions} / {planned} sessions
            </span>
          </dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>+{volumeChange}%</dd>
        </div>
        <div>
          <dt>Bench press</dt>
          <dd>+{fmtKg(bench)} kg</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{String(streak).padStart(2, '0')} wk</dd>
        </div>
      </dl>
      <div className="ft-end-foot">
        <span>FitTrack</span>
        <span>Visual identity · UI · UX · Interactive prototype</span>
        <span>2025</span>
      </div>
    </footer>
  )
}

// True from the first time the element is well into view
function useOnce<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on] as const
}

const STATS = blockStats()
const TAU = Math.PI * 2
// A point on a circle about the object's centre, angle 0 at twelve o'clock, clockwise
const at = (r: number, turn: number): [number, number] => [500 + r * Math.sin(turn * TAU), 500 - r * Math.cos(turn * TAU)]
const arc = (r: number, from: number, to: number) => {
  const [x0, y0] = at(r, from)
  const [x1, y1] = at(r, to)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${to - from > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

function ProgressObject() {
  const { weeks, sessions, planned, consistency, volumeChange, bench, streak } = STATS
  const R = 400
  const len = TAU * R
  const max = Math.max(...weeks)
  const w1 = at(266, 0.014)
  const w8 = at(266, 0.986)
  return (
    <figure
      className="ft-end-viz"
      aria-label={`Training block: ${consistency}% consistency, ${sessions} of ${planned} sessions over ${weeks.length} weeks, training volume up ${volumeChange}%, bench press up ${fmtKg(bench)} kg, ${streak}-week streak`}
    >
      <svg viewBox="-70 -70 1140 1140" aria-hidden>
        <defs>
          <path id="ft-end-orbit" d="M 500 500 m -512 0 a 512 512 0 1 1 1024 0 a 512 512 0 1 1 -1024 0" />
        </defs>
        {/* alignment */}
        <g className="ft-viz-grid">
          <line x1="500" y1="-60" x2="500" y2="1060" />
          <line x1="-60" y1="500" x2="1060" y2="500" />
          <circle cx="500" cy="500" r="262" />
        </g>
        {/* measurement: 120 ticks, every tenth long, the quarters labelled */}
        <g className="ft-viz-ticks">
          {Array.from({ length: 120 }, (_, i) => {
            const major = i % 10 === 0
            const [x0, y0] = at(major ? 438 : 446, i / 120)
            const [x1, y1] = at(major ? 478 : 462, i / 120)
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} className={major ? 'is-major' : ''} style={{ '--i': i } as CSSProperties} />
          })}
          {[0, 25, 50, 75].map((q) => {
            const [x, y] = at(502, q / 100)
            return (
              <text key={q} x={x} y={y} className="ft-viz-q">
                {q}
              </text>
            )
          })}
        </g>
        {/* the arc: consistency over the block */}
        <circle cx="500" cy="500" r={R} className="ft-viz-track" />
        <circle
          cx="500"
          cy="500"
          r={R}
          className="ft-viz-arc"
          strokeDasharray={`${len} ${len}`}
          style={{ '--off': len * (1 - consistency / 100), '--len': len } as CSSProperties}
          transform="rotate(-90 500 500)"
        />
        {/* every planned session, in order: trained, missed, today */}
        <g className="ft-viz-sessions">
          {Array.from({ length: planned }, (_, i) => {
            const [x, y] = at(354, (i + 0.5) / planned)
            const today = i === planned - 1
            const cls = today ? 'is-today' : MISSED.includes(i) ? 'is-missed' : 'is-done'
            return <circle key={i} cx={x} cy={y} r={today ? 11 : 8} className={cls} style={{ '--i': i } as CSSProperties} />
          })}
        </g>
        {/* weekly training volume: one segment a week, weighted by its volume */}
        <g className="ft-viz-weeks">
          {weeks.map((v, i) => (
            <path
              key={i}
              d={arc(306, i / weeks.length + 0.008, (i + 1) / weeks.length - 0.008)}
              strokeWidth={6 + 22 * (v / max)}
              className={i === weeks.length - 1 ? 'is-now' : ''}
              style={{ '--i': i } as CSSProperties}
            />
          ))}
          <text x={w1[0]} y={w1[1]} className="ft-viz-small is-start">
            W1
          </text>
          <text x={w8[0]} y={w8[1]} className="ft-viz-small is-end">
            W{weeks.length}
          </text>
        </g>
        {/* where the block stands: a mark across the arc's end */}
        {(() => {
          const [x0, y0] = at(366, consistency / 100)
          const [x1, y1] = at(434, consistency / 100)
          return <line x1={x0} y1={y0} x2={x1} y2={y1} className="ft-viz-now" />
        })()}
        <text className="ft-viz-orbit">
          <textPath href="#ft-end-orbit" startOffset="2%">
            No two progress stories look the same
          </textPath>
        </text>
      </svg>
    </figure>
  )
}

// Counts up once to a value when `run` turns on (straight to it with reduced motion)
function useCountTo(target: number, run: boolean) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = still ? 1 : Math.min((t - t0) / 1600, 1)
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run])
  return v
}
