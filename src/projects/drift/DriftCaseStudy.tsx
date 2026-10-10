import { useContext, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { afterPanelOpens } from '../../lib/scene'
import { ScrollerContext } from '../scroll'
import type { Controls } from './field'
import { sampleWord } from './letters'
import { DriftStage, pickTier } from './stage'
import { DRIFT } from './config'
import './drift.css'

// DRIFT: one living particle system that is the whole page. The stage holds still while the
// panel scrolls past it, and that scroll moves the system through FLOW → FORM → RELEASE → CALM.
// React only builds the frame; everything that moves runs in the stage's own loop.
export function DriftCaseStudy() {
  return (
    <article className="drift">
      <DriftRun />
      <DriftStory />
      <footer className="drift-foot">
        <p>Nothing stays still.</p>
        <div>
          <span>Drift</span>
          <span>Creative development · Interaction design · WebGL</span>
          <span>2026</span>
        </div>
      </footer>
    </article>
  )
}

// What the experiment is, set after it: the visitor has played first, so the text explains
// what they already felt. Figures come from the engine's own configuration.
const STATES: [string, string, string][] = [
  ['01', 'Flow', 'Three loose currents and a sparse dust, carried by slow travelling waves. The cursor adds forces to it, never positions.'],
  ['02', 'Form', 'Scroll moves every particle’s point of rest from the field into the word. Physics, not a tween, decides how they get there.'],
  ['03', 'Release', 'Fast gestures inside the word build tension. Enough of it, and the structure lets go the way the hand was moving.'],
  ['04', 'Calm', 'Energy drains through drag, the field slows, and the same particles return to drifting. Scroll back up and the word rebuilds.'],
]
const FORCES: [string, string][] = [
  ['Spring', 'Every particle is pulled toward a rest position that is itself moving.'],
  ['Drag', 'Velocity bleeds away each frame, so every disturbance ends.'],
  ['Displacement', 'Close to the cursor’s ray, particles are pushed aside — harder the faster it moves.'],
  ['Momentum', 'The gesture’s own velocity is handed to what it passes through.'],
  ['Tension', 'Holding draws the local field in and twists it; letting go returns it as speed.'],
  ['Tearing', 'A hard hit loosens a particle’s spring for a few seconds, so damage stays visible.'],
]

function DriftStory() {
  const tiers = DRIFT.tiers
  const facts: [string, string][] = [
    [`${(tiers.high.count / 1000).toFixed(0)}k`, 'particles on desktop'],
    [`${(tiers.low.count / 1000).toFixed(0)}k`, 'on phones'],
    ['1', 'draw call per frame'],
    ['0', 'libraries · plain WebGL'],
    ['10 kB', 'the whole experiment, compressed'],
    ['0', 'allocations per frame'],
  ]
  return (
    <div className="drift-story">
      <section className="drift-sec drift-concept">
        <p className="drift-kicker">
          <span>01</span>Concept
        </p>
        <h2>
          User movement
          <br />
          creates the design.
        </h2>
        <p className="drift-lede">
          Drift is a single population of particles with no fixed picture. What you see at any moment is the sum of a slow
          ambient field and whatever your hand has just done to it. The same material flows, becomes a word, breaks, and
          settles again — one system, many states.
        </p>
      </section>

      <section className="drift-sec">
        <p className="drift-kicker">
          <span>02</span>Four states, one material
        </p>
        <ol className="drift-states">
          {STATES.map(([n, t, d]) => (
            <li key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="drift-sec drift-model">
        <p className="drift-kicker">
          <span>03</span>Forces, not positions
        </p>
        <div className="drift-model-grid">
          <p className="drift-lede">
            Nothing in Drift is animated. Every input only changes a force: moving, holding, dragging and letting go all
            feed the same simulation, so a slow hand bends the field and a fast one cuts it.
          </p>
          <dl className="drift-forces">
            {FORCES.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="drift-sec">
        <p className="drift-kicker">
          <span>04</span>Built to stay light
        </p>
        <dl className="drift-facts">
          {facts.map(([n, l]) => (
            <div key={l}>
              <dt>{n}</dt>
              <dd>{l}</dd>
            </div>
          ))}
        </dl>
        <p className="drift-note">
          The simulation runs on typed arrays in one loop and only while the experiment is on screen. A device that can’t
          keep up sheds particles on its own; reduced-motion settings calm every force.
        </p>
      </section>
    </div>
  )
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const { overflowY } = getComputedStyle(n)
    if (overflowY === 'auto' || overflowY === 'scroll') return n
  }
  return null
}

const PHASES = ['Flow', 'Form', 'Release', 'Calm']
const HINTS = [
  'Move to disturb · scroll to transform',
  '',
  'Drag fast through the word to release it',
  'Energy dissipates · scroll up to rebuild',
]
const CONTROLS: { key: keyof Controls; label: string; hint: string }[] = [
  { key: 'gravity', label: 'Gravity', hint: 'How strongly particles return to rest' },
  { key: 'flow', label: 'Flow', hint: 'Strength of the ambient field' },
  { key: 'noise', label: 'Noise', hint: 'Turbulence' },
]

function DriftRun() {
  const scroller = useContext(ScrollerContext)
  const runRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engine = useRef<DriftStage | null>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const run = runRef.current
    const el = stageRef.current
    const canvas = canvasRef.current
    if (!run || !el || !canvas) return
    // The scroller this page lives in: the project panel here, the window anywhere else
    const panel = scrollParent(run) ?? scroller?.current ?? null
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let stage: DriftStage
    try {
      stage = new DriftStage(canvas, pickTier(reduced), reduced)
    } catch {
      setFallback(true)
      return
    }
    engine.current = stage
    stage.onPhase = (phase) => {
      el.dataset.phase = String(phase)
    }
    stage.onEnergy = (e) => {
      el.style.setProperty('--drift-e', e.toFixed(3))
    }

    let alive = true
    void sampleWord(DRIFT.form.word).then((pts) => alive && stage.setWord(pts))

    // Scroll progress through the run: 0 as the stage pins, 1 as it lets go
    const progress = () => {
      const view = panel ? panel.clientHeight : window.innerHeight
      const top = run.getBoundingClientRect().top - (panel ? panel.getBoundingClientRect().top : 0)
      const p = Math.min(Math.max(-top / Math.max(run.offsetHeight - view, 1), 0), 1)
      stage.setProgress(p)
      el.style.setProperty('--drift-p', p.toFixed(4))
      // the invitation to scroll stays until the visitor has started
      if (p > 0.01) el.dataset.scrolled = ''
    }
    const scrollTarget: HTMLElement | Window = panel ?? window
    scrollTarget.addEventListener('scroll', progress, { passive: true })
    progress()

    const ro = new ResizeObserver(([e]) => stage.resize(e.contentRect.width, e.contentRect.height))
    ro.observe(el)
    // The field only runs once the panel has opened, so it doesn't compete with the opening
    let onScreen = false
    let opened = false
    void afterPanelOpens(() => !alive).then((ok) => {
      opened = ok
      if (ok) stage.setOnScreen(onScreen)
    })
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting
        stage.setOnScreen(onScreen && opened)
      },
      { threshold: 0 },
    )
    io.observe(el)

    // Pointer events: mouse, pen and touch alike. Touch keeps vertical panning for the page.
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      stage.pointerMove(e.clientX - r.left, e.clientY - r.top)
    }
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.drift-controls')) return
      local(e)
      stage.pointerDown()
      if (e.pointerType === 'mouse') el.setPointerCapture(e.pointerId)
    }
    const onUp = () => stage.pointerUp()
    const onLeave = () => stage.pointerLeave()
    el.addEventListener('pointermove', local)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onLeave)
    el.addEventListener('pointerleave', onLeave)

    stage.start()
    return () => {
      alive = false
      scrollTarget.removeEventListener('scroll', progress)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointermove', local)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onLeave)
      el.removeEventListener('pointerleave', onLeave)
      stage.dispose()
      engine.current = null
    }
  }, [scroller])

  const setControl = (key: keyof Controls) => (e: ChangeEvent<HTMLInputElement>) => {
    if (engine.current) engine.current.controls[key] = Number(e.target.value)
  }

  return (
    <section ref={runRef} className="drift-run" aria-label="Drift, interactive particle experiment">
      <div ref={stageRef} className={`drift-stage ${fallback ? 'is-fallback' : ''}`} data-phase="0">
        <canvas ref={canvasRef} className="drift-canvas" aria-hidden />
        {fallback && (
          <p className="drift-fallback" aria-hidden>
            Drift
          </p>
        )}

        <header className="drift-top">
          <p className="drift-mark">Drift</p>
          <p className="drift-meta">Interactive web experiment</p>
        </header>

        <ol className="drift-phases" aria-label="States">
          {PHASES.map((p, i) => (
            <li key={p} data-i={i}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {p}
            </li>
          ))}
        </ol>
        <i className="drift-progress" aria-hidden />
        <i className="drift-energy" aria-hidden />

        <div className="drift-hints" aria-live="polite">
          {HINTS.map((h, i) => (
            <p key={h} data-i={i}>
              {fallback && i === 0 ? 'This experiment needs WebGL' : h}
            </p>
          ))}
        </div>

        {!fallback && (
          <div className="drift-controls">
            {CONTROLS.map((c) => (
              <label key={c.key} title={c.hint}>
                <span>{c.label}</span>
                <input type="range" min={0} max={2} step={0.05} defaultValue={1} onChange={setControl(c.key)} aria-label={`${c.label}: ${c.hint}`} />
              </label>
            ))}
          </div>
        )}

        {!fallback && (
          <p className="drift-scroll">
            <span>Scroll</span>
            <i aria-hidden />
          </p>
        )}

        <p className="drift-calm" aria-hidden>
          Nothing stays still.
        </p>
      </div>
    </section>
  )
}
