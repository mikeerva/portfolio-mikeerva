import { useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react'
import {
  BENCH_BASE,
  BLOCK_DONE_BEFORE,
  BLOCK_PLANNED,
  HISTORY,
  PLAN,
  WEEK_DONE_BEFORE,
  WEEK_TARGET,
  WEEKS,
  fmtKg,
  fmtNum,
  fmtTime,
  SCREEN_TITLE,
  summary,
  type Action,
  type Screen,
  type State,
} from './session'

type Props = { state: State; dispatch: Dispatch<Action> }

// The FitTrack application itself: one screen of the session at a time, sliding in the way the
// journey moved. `live` runs the rest timer and moves focus with the screen; the still copies
// in the final composition leave both off.
export function FitTrackApp({ state, dispatch, live = false }: Props & { live?: boolean }) {
  const { screen } = state
  const resting = screen === 'rest' && !!state.rest && state.rest.left > 0
  useEffect(() => {
    if (!live || !resting) return
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => window.clearInterval(id)
  }, [live, resting, dispatch])

  // A new screen takes focus (without scrolling the page), so keyboard users land on it
  const screenRef = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (live) screenRef.current?.focus({ preventScroll: true })
  }, [screen, live])

  const tabs = screen === 'today' || screen === 'progress' || screen === 'history'
  const tone = screen === 'rest' ? 'is-yellow' : screen === 'complete' ? 'is-cream' : ''
  return (
    <div className={`ft-app ${tone}`}>
      <StatusBar />
      <div
        ref={screenRef}
        key={screen}
        tabIndex={-1}
        aria-label={SCREEN_TITLE[screen]}
        className={`ft-screen ft-in-${state.dir > 0 ? 'next' : 'back'} ft-s-${screen}`}
      >
        {screen === 'today' && <Today state={state} dispatch={dispatch} />}
        {screen === 'workout' && <Workout state={state} dispatch={dispatch} />}
        {screen === 'exercise' && <ExerciseScreen state={state} dispatch={dispatch} />}
        {screen === 'log' && <Log state={state} dispatch={dispatch} />}
        {screen === 'rest' && <Rest state={state} dispatch={dispatch} />}
        {screen === 'complete' && <Complete state={state} dispatch={dispatch} live={live} />}
        {screen === 'progress' && <Progress state={state} dispatch={dispatch} />}
        {screen === 'history' && <History state={state} dispatch={dispatch} />}
      </div>
      {tabs && <Tabs screen={screen} dispatch={dispatch} />}
    </div>
  )
}

function StatusBar() {
  return (
    <div className="ft-status" aria-hidden>
      <span>07:42</span>
      <span className="ft-status-icons">
        <i />
        <i />
        <i />
        <b />
      </span>
    </div>
  )
}

function Tabs({ screen, dispatch }: { screen: Screen; dispatch: Dispatch<Action> }) {
  const items: [Screen, string][] = [
    ['today', 'Today'],
    ['progress', 'Progress'],
    ['history', 'History'],
  ]
  return (
    <nav className="ft-tabs" aria-label="FitTrack" data-anno="Tab bar · hidden during training">
      {items.map(([s, label]) => (
        <button key={s} type="button" aria-current={screen === s ? 'page' : undefined} onClick={() => dispatch({ type: 'go', screen: s })}>
          <i aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  )
}

// The header used inside the training flow: a way back, and where you are
function Bar({ back, onBack, children }: { back: string; onBack: () => void; children?: ReactNode }) {
  return (
    <div className="ft-bar">
      <button type="button" className="ft-back" onClick={onBack}>
        <span aria-hidden>←</span> {back}
      </button>
      <span className="ft-micro">{children}</span>
    </div>
  )
}

function Pips({ done, total, label }: { done: number; total: number; label?: string }) {
  return (
    <span className="ft-pips" role="img" aria-label={label ?? `${done} of ${total} sets done`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < done ? 'is-done' : i === done ? 'is-now' : ''} />
      ))}
    </span>
  )
}

// A number that animates when it changes
function Num({ value, className = '' }: { value: string | number; className?: string }) {
  return (
    <span key={value} className={`ft-num ${className}`}>
      {value}
    </span>
  )
}

/* ---------------------------------------------------------------- 01 Today */

function Today({ state, dispatch }: Props) {
  const done = state.finished
  const week = WEEK_DONE_BEFORE + (done ? 1 : 0)
  // The last seven days, today last: Thu, Sat and Mon were trained
  const days = [
    ['W', false],
    ['T', true],
    ['F', false],
    ['S', true],
    ['S', false],
    ['M', true],
    ['T', done],
  ] as const
  return (
    <div className="ft-pad ft-today">
      <header className="ft-greet">
        <p className="ft-micro">Tuesday, Oct 7</p>
        <h2>Good morning, Alex.</h2>
      </header>

      <div className="ft-ready" data-anno="Readiness · one number, one sentence">
        <Ring value={72} size="sm" />
        <div>
          <p className="ft-micro">Readiness</p>
          <p className="ft-ready-copy">Recovered. Train as planned.</p>
        </div>
      </div>

      <section className="ft-plan" aria-label="Today's training" data-anno="Today's plan · the answer">
        <p className="ft-micro">Today's training</p>
        <h3>{PLAN.name}</h3>
        <p className="ft-plan-meta">
          {PLAN.minutes} min · {PLAN.exercises.length} exercises
        </p>
        <ol className="ft-plan-list">
          {PLAN.exercises.map((e) => (
            <li key={e.id}>
              <span>{e.name}</span>
              <span>
                {e.sets} × {e.reps[1]}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="ft-week" aria-label={`${week} of ${WEEK_TARGET} sessions in the last seven days`}>
        <div className="ft-week-days" aria-hidden>
          {days.map(([d, on], i) => (
            <span key={i} className={`${on ? 'is-on' : ''} ${i === 6 ? 'is-today' : ''}`}>
              <i />
              {d}
            </span>
          ))}
        </div>
        <p className="ft-micro">
          {week} / {WEEK_TARGET} this week
        </p>
      </div>

      <div className="ft-cta-dock">
        {done ? (
          <button type="button" className="ft-cta" onClick={() => dispatch({ type: 'go', screen: 'progress' })}>
            Done today · View progress <span aria-hidden>→</span>
          </button>
        ) : (
          <button type="button" className="ft-cta" data-anno="Primary CTA · 56 px · thumb zone" onClick={() => dispatch({ type: 'start' })}>
            {state.logs.some((l) => l.length) ? 'Resume workout' : 'Start workout'} <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </div>
  )
}

function Ring({ value, size = 'lg', label }: { value: number; size?: 'sm' | 'lg'; label?: string }) {
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <span className={`ft-ring ft-ring-${size}`} role="img" aria-label={label ?? `Readiness ${value} out of 100`}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={r} className="ft-ring-track" />
        <circle cx="50" cy="50" r={r} className="ft-ring-fill" strokeDasharray={`${(c * value) / 100} ${c}`} />
      </svg>
      <b>{value}</b>
    </span>
  )
}

/* -------------------------------------------------------------- 02 Workout */

function Workout({ state, dispatch }: Props) {
  const total = PLAN.exercises.reduce((n, e) => n + e.sets, 0)
  const { sets } = summary(state)
  const current = state.exercise
  const allDone = state.logs.every((l, i) => l.length >= PLAN.exercises[i].sets)
  return (
    <div className="ft-pad ft-workout">
      <Bar back="Today" onBack={() => dispatch({ type: 'go', screen: 'today' })}>
        In progress
      </Bar>
      <header className="ft-wo-head">
        <h2>{PLAN.name}</h2>
        <p className="ft-micro">
          {PLAN.minutes} min · {PLAN.exercises.length} exercises
        </p>
      </header>
      <div className="ft-wo-progress" data-anno="Session progress · sets, not time">
        <div className="ft-bar-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={sets} aria-label="Sets completed">
          <i style={{ width: `${(sets / total) * 100}%` }} />
        </div>
        <span className="ft-micro">
          <Num value={sets} /> / {total} sets
        </span>
      </div>
      <ol className="ft-ex-list" data-anno="Order · done / now / next">
        {PLAN.exercises.map((e, i) => {
          const done = state.logs[i].length
          const status = done >= e.sets ? 'done' : i === current ? 'now' : 'next'
          return (
            <li key={e.id}>
              <button
                type="button"
                className={`ft-ex is-${status}`}
                onClick={() => dispatch({ type: 'select', exercise: i })}
                aria-label={`${e.name}, ${e.sets} sets of ${e.reps[1]}, ${status === 'done' ? 'done' : status === 'now' ? 'up now' : 'upcoming'}`}
              >
                <span className="ft-ex-n">{status === 'done' ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span className="ft-ex-name">
                  {e.name}
                  <small>
                    {e.sets} × {e.reps[1]}
                  </small>
                </span>
                <Pips done={done} total={e.sets} />
              </button>
            </li>
          )
        })}
      </ol>
      <div className="ft-cta-dock">
        {allDone ? (
          <button type="button" className="ft-cta" onClick={() => dispatch({ type: 'finish' })}>
            Finish workout <span aria-hidden>→</span>
          </button>
        ) : (
          <>
            <button type="button" className="ft-cta" onClick={() => dispatch({ type: 'select', exercise: current })}>
              {sets ? 'Continue' : 'Begin'} · {PLAN.exercises[current].name} <span aria-hidden>→</span>
            </button>
            <button type="button" className="ft-ghost" disabled={!sets} onClick={() => dispatch({ type: 'finish' })}>
              End workout early
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 03 Exercise */

function ExerciseScreen({ state, dispatch }: Props) {
  const i = state.exercise
  const e = PLAN.exercises[i]
  const logs = state.logs[i]
  const n = logs.length
  const complete = n >= e.sets
  const prev = logs[n - 1]
  const nextOpen = PLAN.exercises.findIndex((x, k) => state.logs[k].length < x.sets)
  return (
    <div className="ft-pad ft-exercise">
      <Bar back="Workout" onBack={() => dispatch({ type: 'go', screen: 'workout' })}>
        Exercise {i + 1} / {PLAN.exercises.length}
      </Bar>
      <h2 className="ft-ex-title">{e.name}</h2>
      <div className="ft-set" data-anno="Current set · read from 2 m away">
        <p className="ft-micro">Set</p>
        <p className="ft-set-n">
          <Num value={Math.min(n + 1, e.sets)} />
          <span>/ {e.sets}</span>
        </p>
        <Pips done={n} total={e.sets} />
      </div>
      <dl className="ft-facts" data-anno="Only two facts">
        <div>
          <dt className="ft-micro">{prev ? 'Last set' : 'Previous'}</dt>
          <dd>
            {fmtKg((prev ?? e.previous).kg)} kg × {(prev ?? e.previous).reps}
          </dd>
        </div>
        <div>
          <dt className="ft-micro">Target</dt>
          <dd>
            {e.reps[0]}–{e.reps[1]} reps
          </dd>
        </div>
      </dl>
      {n > 0 && (
        <ol className="ft-logged" aria-label="Sets logged">
          {logs.map((l, k) => (
            <li key={k}>
              <span className="ft-micro">Set {k + 1}</span>
              <span>
                {fmtKg(l.kg)} kg × {l.reps}
              </span>
              <span aria-hidden>✓</span>
            </li>
          ))}
        </ol>
      )}
      <div className="ft-cta-dock">
        {complete ? (
          nextOpen >= 0 ? (
            <button type="button" className="ft-cta" onClick={() => dispatch({ type: 'select', exercise: nextOpen })}>
              Next · {PLAN.exercises[nextOpen].name} <span aria-hidden>→</span>
            </button>
          ) : (
            <button type="button" className="ft-cta" onClick={() => dispatch({ type: 'finish' })}>
              Finish workout <span aria-hidden>→</span>
            </button>
          )
        ) : (
          <button type="button" className="ft-cta ft-cta-xl" data-anno="One action · 64 px" onClick={() => dispatch({ type: 'log' })}>
            Log set <span aria-hidden>+</span>
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ 04 Log */

function Stepper({
  label,
  value,
  unit,
  onMinus,
  onPlus,
  minusDisabled,
  plusDisabled,
  step,
}: {
  label: string
  value: string
  unit: string
  onMinus: () => void
  onPlus: () => void
  minusDisabled: boolean
  plusDisabled: boolean
  step: string
}) {
  return (
    <div className="ft-stepper" role="group" aria-label={label}>
      <p className="ft-micro">{label}</p>
      <div className="ft-stepper-row">
        <button type="button" onClick={onMinus} disabled={minusDisabled} aria-label={`${label} minus ${step}`}>
          −
        </button>
        <output aria-live="polite" aria-label={`${label} ${value} ${unit}`}>
          <Num value={value} />
          <small>{unit}</small>
        </output>
        <button type="button" onClick={onPlus} disabled={plusDisabled} aria-label={`${label} plus ${step}`}>
          +
        </button>
      </div>
    </div>
  )
}

function Log({ state, dispatch }: Props) {
  const e = PLAN.exercises[state.exercise]
  const { kg, reps } = state.draft
  const n = state.logs[state.exercise].length
  return (
    <div className="ft-pad ft-log">
      <Bar back="Cancel" onBack={() => dispatch({ type: 'go', screen: 'exercise' })}>
        {e.name} · Set {n + 1}
      </Bar>
      <h2 className="ft-log-title">Log set</h2>
      <div data-anno="Stepper · 48 px targets, no keyboard">
        <Stepper
          label="Weight"
          value={fmtKg(kg)}
          unit="kg"
          step={`${e.step} kg`}
          onMinus={() => dispatch({ type: 'draft', kg: kg - e.step })}
          onPlus={() => dispatch({ type: 'draft', kg: kg + e.step })}
          minusDisabled={kg <= 0}
          plusDisabled={kg >= 300}
        />
      </div>
      <Stepper
        label="Reps"
        value={String(reps)}
        unit="reps"
        step="1 rep"
        onMinus={() => dispatch({ type: 'draft', reps: reps - 1 })}
        onPlus={() => dispatch({ type: 'draft', reps: reps + 1 })}
        minusDisabled={reps <= 1}
        plusDisabled={reps >= 30}
      />
      <p className="ft-log-note">
        <span className="ft-micro">Set volume</span>
        <Num value={`${fmtNum(Math.round(kg * reps))} kg`} />
      </p>
      <div className="ft-cta-dock">
        <button type="button" className="ft-cta ft-cta-xl" data-anno="Save → rest starts" onClick={() => dispatch({ type: 'save' })}>
          Save set <span aria-hidden>✓</span>
        </button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- 05 Rest */

function Rest({ state, dispatch }: Props) {
  const rest = state.rest ?? { total: 90, left: 0 }
  const i = state.exercise
  const e = PLAN.exercises[i]
  const n = state.logs[i].length
  const last = state.logs[i][n - 1]
  const moreSets = n < e.sets
  const nextEx = PLAN.exercises.findIndex((x, k) => state.logs[k].length < x.sets)
  const ready = rest.left === 0
  const nextLabel = moreSets ? `Set ${n + 1} / ${e.sets} · ${e.name}` : nextEx >= 0 ? PLAN.exercises[nextEx].name : 'Finish'
  return (
    <div className="ft-pad ft-rest">
      <p className="ft-rest-logged ft-micro">
        {last ? (
          <>
            Logged {fmtKg(last.kg)} kg × {last.reps} <span aria-hidden>✓</span>
          </>
        ) : (
          'Set logged'
        )}
      </p>
      <div className="ft-timer" data-anno="Timer · the only thing that matters">
        <p className="ft-micro">{ready ? 'Ready' : 'Rest'}</p>
        <p className="ft-timer-n" role="timer" aria-live={ready ? 'assertive' : 'off'} aria-label={ready ? 'Rest complete' : `Rest, ${rest.left} seconds left`}>
          {fmtTime(rest.left)}
        </p>
        <div className="ft-timer-bar" aria-hidden>
          <i style={{ transform: `scaleX(${rest.left / rest.total})` }} />
        </div>
      </div>
      <div className="ft-next" data-anno="Next action, always visible">
        <p className="ft-micro">Next</p>
        <p>{nextLabel}</p>
        {moreSets && last && (
          <p className="ft-micro">
            Suggested {fmtKg(last.kg)} kg × {last.reps}
          </p>
        )}
      </div>
      <div className="ft-cta-dock">
        {ready ? (
          <button type="button" className="ft-cta ft-cta-ink ft-cta-xl" onClick={() => dispatch({ type: 'next' })}>
            {moreSets ? 'Next set' : 'Next exercise'} <span aria-hidden>→</span>
          </button>
        ) : (
          <div className="ft-rest-actions">
            <button type="button" className="ft-outline" onClick={() => dispatch({ type: 'extend' })}>
              +30 sec
            </button>
            <button type="button" className="ft-cta ft-cta-ink" onClick={() => dispatch({ type: 'next' })}>
              Skip rest
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 06 Complete */

// Counts up to a value once, unless motion is reduced or the copy is still
function useCount(target: number, run: boolean) {
  const [still] = useState(() => !run || matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (still) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min((t - t0) / 1100, 1)
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, still])
  return still ? target : v
}

function Complete({ state, dispatch, live }: Props & { live: boolean }) {
  const s = summary(state)
  const minutes = useCount(s.minutes, live)
  const sets = useCount(s.sets, live)
  const volume = useCount(s.volume, live)
  const gain = s.bench - BENCH_BASE
  return (
    <div className="ft-pad ft-complete">
      <p className="ft-micro ft-complete-date">Upper Body · Tue, Oct 7</p>
      <h2 className="ft-complete-title">
        <span>Workout</span>
        <span>complete.</span>
      </h2>
      <dl className="ft-stats" data-anno="Four numbers, derived from this session">
        <div>
          <dt className="ft-micro">Time</dt>
          <dd>
            {minutes}
            <small>min</small>
          </dd>
        </div>
        <div>
          <dt className="ft-micro">Sets</dt>
          <dd>{sets}</dd>
        </div>
        <div className="is-wide">
          <dt className="ft-micro">Volume</dt>
          <dd>
            {fmtNum(volume)}
            <small>kg</small>
          </dd>
        </div>
        <div>
          <dt className="ft-micro">Exercises</dt>
          <dd>
            {s.exercises}
            <small>/ {PLAN.exercises.length}</small>
          </dd>
        </div>
      </dl>
      {gain > 0 && (
        <p className="ft-highlight" data-anno="One meaningful highlight">
          <b>Bench press +{fmtKg(gain)} kg</b> on four weeks ago.
        </p>
      )}
      <div className="ft-cta-dock">
        <button type="button" className="ft-cta ft-cta-ink" onClick={() => dispatch({ type: 'go', screen: 'progress' })}>
          View progress <span aria-hidden>→</span>
        </button>
        <button type="button" className="ft-ghost" onClick={() => dispatch({ type: 'go', screen: 'today' })}>
          Back to today
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 07 Progress */

function Progress({ state, dispatch }: Props) {
  const s = summary(state)
  const done = state.finished
  const week = WEEK_DONE_BEFORE + (done ? 1 : 0)
  const consistency = Math.round(((BLOCK_DONE_BEFORE + (done ? 1 : 0)) / BLOCK_PLANNED) * 100)
  const bench = done && s.bench ? s.bench : 60
  const thisWeek = HISTORY.reduce((v, h) => v + h.volume, 0) + (done ? s.volume : 0)
  const weeks = [...WEEKS, thisWeek]
  const max = Math.max(...weeks)
  const recent = [
    ...(done ? [{ id: 'today', day: 'TUE', name: PLAN.name, meta: `${s.sets} sets · ${fmtNum(s.volume)} kg` }] : []),
    ...HISTORY.map((h) => ({ id: h.id, day: h.day, name: h.name, meta: `${h.sets} sets · ${fmtNum(h.volume)} kg` })),
  ].slice(0, 3)
  return (
    <div className="ft-pad ft-progress">
      <header className="ft-greet">
        <p className="ft-micro">Progress · Block 3, week 8</p>
        <h2>Progress.</h2>
      </header>
      <section className="ft-pg-week" data-anno="Lead with the habit">
        <p className="ft-micro">This week</p>
        <p className="ft-pg-big">
          <Num value={week} />
          <span>/ {WEEK_TARGET} sessions</span>
        </p>
        <div className="ft-seg" aria-hidden>
          {Array.from({ length: WEEK_TARGET }, (_, i) => (
            <i key={i} className={i < week ? 'is-on' : ''} />
          ))}
        </div>
      </section>
      <div className="ft-pg-pair">
        <div>
          <p className="ft-micro">Consistency</p>
          <p className="ft-pg-mid">
            <Num value={`${consistency}%`} />
          </p>
          <p className="ft-micro ft-dim">8-week block</p>
        </div>
        <div data-anno="Change, not a raw total">
          <p className="ft-micro">Bench press</p>
          <p className="ft-pg-mid is-up">
            <Num value={`+${fmtKg(bench - BENCH_BASE)}`} />
            <small>kg</small>
          </p>
          <p className="ft-micro ft-dim">vs 4 weeks ago</p>
        </div>
      </div>
      <figure className="ft-chart" data-anno="Labelled chart · kg per week">
        <figcaption className="ft-micro">
          Training volume <span>kg / week</span>
        </figcaption>
        <div className="ft-bars" role="img" aria-label={`Weekly volume over 8 weeks, this week ${fmtNum(thisWeek)} kg`}>
          {weeks.map((v, i) => (
            <span key={i} className={i === weeks.length - 1 ? 'is-now' : ''} style={{ height: `${(v / max) * 100}%` }}>
              {i === weeks.length - 1 && <b>{fmtNum(Math.round(v / 100) / 10)}k</b>}
            </span>
          ))}
        </div>
        <div className="ft-bars-axis ft-micro" aria-hidden>
          <span>W1</span>
          <span>W8</span>
        </div>
      </figure>
      <section className="ft-recent">
        <p className="ft-micro">Recent activity</p>
        <ul>
          {recent.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'open', id: r.id })
                  dispatch({ type: 'go', screen: 'history' })
                }}
              >
                <span className="ft-micro">{r.day}</span>
                <span>{r.name}</span>
                <span className="ft-micro ft-dim">{r.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- 08 History */

function History({ state, dispatch }: Props) {
  const s = summary(state)
  const items = [
    ...(state.finished
      ? [
          {
            id: 'today',
            day: 'TUE',
            date: 'Oct 7',
            name: PLAN.name,
            minutes: s.minutes,
            sets: s.sets,
            volume: s.volume,
            lines: PLAN.exercises
              .map((e, i) => [e.name, state.logs[i].map((l) => `${fmtKg(l.kg)}×${l.reps}`).join(' · ')] as [string, string])
              .filter(([, v]) => v),
          },
        ]
      : []),
    ...HISTORY,
  ]
  return (
    <div className="ft-pad ft-history">
      <header className="ft-greet">
        <p className="ft-micro">{items.length} sessions · last 7 days</p>
        <h2>History.</h2>
      </header>
      <ul className="ft-hist">
        {items.map((h) => {
          const open = state.opened === h.id
          return (
            <li key={h.id} className={open ? 'is-open' : ''}>
              <button type="button" aria-expanded={open} onClick={() => dispatch({ type: 'open', id: open ? null : h.id })}>
                <span className="ft-hist-day">
                  <b>{h.day}</b>
                  <small>{h.date}</small>
                </span>
                <span className="ft-hist-name">
                  {h.name}
                  <small>
                    {h.minutes} min · {h.sets} sets · {fmtNum(h.volume)} kg
                  </small>
                </span>
                <span aria-hidden className="ft-hist-chev">
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <ol className="ft-hist-lines">
                  {h.lines.map(([a, b]) => (
                    <li key={a}>
                      <span>{a}</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          )
        })}
      </ul>
      <button type="button" className="ft-ghost" onClick={() => dispatch({ type: 'go', screen: 'progress' })}>
        <span aria-hidden>←</span> Back to progress
      </button>
    </div>
  )
}

export { Ring, Pips }
