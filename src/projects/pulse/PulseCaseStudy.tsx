import { useState, type CSSProperties, type ReactNode } from 'react'
import { useInView, useScrollProgress } from '../scroll'
import { SLOTS, type SlotKey } from './assets'
import { PulseMedia } from './PulseMedia'
import { PulseStage } from './PulseStage'
import { usePortrait } from './portrait'
import { squircle } from './ring'
import { PATH, VIEWBOX } from './wordmark'
import './pulse.css'

// PULSE: art direction for a fictional premium audio brand, told as one product film. The approved
// 3D headphones are the main character: a single live stage (PulseStage) sits behind the whole
// article and the transparent sections that name a key (data-stage) let it through. The product
// emerges from darkness (01), the camera travels into its Signature Ring and cuts to the macro
// render (02), its parts move apart and return (03), and it turns to profile at the end (coda).
// The chapters where sound acts on the world (04 Physical, 05 Campaign) and the system (06) are
// rendered images and video, opaque over the stage. Without WebGL, or with reduced motion, every
// 3D moment falls back to its render, which is already in place underneath.
export function PulseCaseStudy() {
  const [live, setLive] = useState(false)
  return (
    <article className={`pulse ${live ? 'is-3d' : ''}`}>
      <PulseStage onReady={setLive} />
      <Silence />
      <Intro />
      <TheRing />
      <Construction />
      <Physical />
      <Campaign />
      <Identity />
      <Coda />
      <footer className="pl-foot">
        <p className="pl-label">Feel the sound.</p>
        <div>
          <span>Pulse</span>
          <span>Art Direction / Brand Campaign</span>
          <span>2026</span>
        </div>
      </footer>
    </article>
  )
}

// ---------------------------------------------------------------- shared

// The wordmark: the outlined master once it exists (wordmark.ts), typeset until then
function Wordmark({ className = '' }: { className?: string }) {
  if (VIEWBOX && PATH)
    return (
      <svg viewBox={VIEWBOX} className={`pl-wm-svg ${className}`} role="img" aria-label="PULSE">
        <path d={PATH} fill="currentColor" />
      </svg>
    )
  return <span className={`pl-wm ${className}`}>PULSE</span>
}

// One-time reveals. 'track': type released from wide tracking to its own, like pressure letting
// go. 'fade': opacity only. 'aperture': media opening from a Ring-shaped window — watched through
// an unclipped wrapper, since a fully clipped element never counts as in view.
function Reveal({
  as: Tag = 'div',
  kind = 'track',
  delay = 0,
  className = '',
  style,
  children,
}: {
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'figure' | 'ol'
  kind?: 'track' | 'fade' | 'aperture'
  delay?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const ref = useInView<HTMLElement>(kind === 'aperture' ? 0.12 : 0.35)
  const d = { ['--d' as string]: `${delay}s` }
  if (kind === 'aperture')
    return (
      <Tag ref={ref as never} className={className} style={style}>
        <div className="pl-aperture" style={d}>
          {children}
        </div>
      </Tag>
    )
  return (
    <Tag ref={ref as never} className={`pl-${kind} ${className}`} style={{ ...style, ...d }}>
      {children}
    </Tag>
  )
}

// A chapter's opening: number, name and the motion stage it plays, then its one idea
function ChapterHead({
  n,
  title,
  stage,
  heading,
  lede,
  hold,
}: {
  n: string
  title: string
  stage: string
  heading: ReactNode
  lede: string
  // over the live stage: the key it shows meanwhile (at that key's first frame)
  hold?: string
}) {
  return (
    <header className={`pl-head ${hold ? 'is-over' : ''}`} data-stage={hold} data-p={hold ? '0' : undefined}>
      <p className="pl-head-k pl-label">
        <span>{n}</span>
        <span>{title}</span>
        <span className="pl-head-stage">{stage}</span>
      </p>
      <Reveal as="h2" className="pl-head-h pl-display">
        {heading}
      </Reveal>
      <Reveal as="p" kind="fade" delay={0.25} className="pl-lede pl-head-lede">
        {lede}
      </Reveal>
    </header>
  )
}

function Caption({ n, title, note }: { n?: string; title: string; note?: string }) {
  return (
    <figcaption className="pl-cap">
      {n && <span>{n}</span>}
      <span>{title}</span>
      {note && <span className="pl-cap-note">{note}</span>}
    </figcaption>
  )
}

// ---------------------------------------------------------------- 01 Silence

// Near darkness, the product found by light. The stage holds while the type lets go and the
// frame falls back to black — the silence the next chapter breaks.
function Silence() {
  const ref = useScrollProgress<HTMLElement>('pin')
  return (
    <section ref={ref} className="pl-silence" data-chapter={0} data-stage="hero">
      <div className="pl-stage">
        <PulseMedia slot="hero" eager className="pl-fill pl-silence-media" />
        <div className="pl-silence-type">
          <div>
            <Reveal as="h1" className="pl-silence-mark">
              <Wordmark />
            </Reveal>
            <Reveal as="p" kind="fade" delay={0.5} className="pl-label pl-silence-sub">
              Wireless audio
            </Reveal>
          </div>
          <Reveal as="p" delay={0.35} className="pl-silence-line pl-display">
            <span>Feel</span>
            <span>the</span>
            <span>sound.</span>
          </Reveal>
        </div>
        <Reveal kind="fade" delay={0.9} className="pl-silence-meta pl-label">
          <span>Pulse 01 — Signature Ring</span>
          <span>Art Direction / Brand Campaign · 2026</span>
        </Reveal>
        <div className="pl-silence-veil" aria-hidden />
      </div>
    </section>
  )
}

const ABOUT: [string, string][] = [
  ['Role', 'Art direction, brand identity, campaign, motion direction'],
  ['Deliverables', 'Identity system, product art direction, campaign, motion language'],
  ['Year', '2026'],
  ['Note', 'Self-initiated concept. Every image is rendered in Blender from one approved 3D master of the product.'],
]

function Intro() {
  return (
    <section className="pl-intro is-over" data-chapter={1} data-stage="ring" data-p="0">
      <Reveal as="h2" className="pl-intro-h pl-display">
        Sound becomes physical.
      </Reveal>
      <div className="pl-intro-body">
        <Reveal as="p" kind="fade" className="pl-lede">
          PULSE is a premium audio brand built around one question: what would happen if sound had physical force? The
          campaign keeps the world real and lets sound do the one impossible thing — press, bend and displace what it
          touches. It does not visualise music. It visualises what sound feels like.
        </Reveal>
        <dl className="pl-about">
          {ABOUT.map(([k, v]) => (
            <div key={k}>
              <dt className="pl-label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 02 The Ring

// Object → signature → system. Live, the camera travels from the whole product into the Ring and
// stops exactly on the macro render's camera; the render takes over (the same frame, now with its
// depth of field), an SVG line traces the Ring along it — measured from the 3D master, in the
// render's own pixels — the photograph falls away and the line closes into the Ring as a sign.
function TheRing() {
  const trace = useScrollProgress<HTMLDivElement>('pin')
  const portrait = usePortrait()
  const f = (portrait && SLOTS.ringMacro.portrait) || SLOTS.ringMacro.frame
  const [w, h] = f.size
  const sign = portrait ? squircle(w / 2, h / 2, w * 0.3, h * 0.21) : squircle(w / 2, h / 2, w * 0.15, h * 0.27)
  return (
    <section className="pl-chapter" data-chapter={2}>
      <ChapterHead
        n="02"
        title="The Ring"
        stage="Compression"
        heading={
          <>
            A detail becomes
            <br />
            the identity.
          </>
        }
        lede="A thin metallic ring follows the edge of each ear cup. It is the one line on the product that catches light — and the line everything else in PULSE is drawn from."
        hold="ring"
      />
      <div ref={trace} className="pl-trace" data-stage="ring">
        <div className="pl-stage">
          <PulseMedia slot="ringMacro" className="pl-fill pl-trace-media" />
          <svg className="pl-trace-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
            <path d={f.ring} pathLength={1} className="pl-trace-arc" />
            <path d={sign} pathLength={1} className="pl-trace-sign" />
          </svg>
          <ol className="pl-trace-steps pl-label">
            <li>Object</li>
            <li>Signature</li>
            <li>System</li>
          </ol>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 03 Construction

const BUILD_STEPS: [string, string][] = [
  ['Front', 'Two cups, one axis of symmetry'],
  ['Side', 'The Ring, square to the eye'],
  ['Apart', 'Each part moves along its own cup’s axis'],
  ['Cushion', 'Deep black, a soft squircle opening'],
  ['Together', 'PULSE 01, as approved'],
]

// The product taken apart by the camera and by its own parts: front, side, the parts moving apart
// along each cup's axis, a close look at the cushion, then back together. The approved parts only
// move; nothing is added or reshaped, and at rest each is exactly in place.
function Construction() {
  const build = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section className="pl-chapter" data-chapter={3}>
      <ChapterHead
        n="03"
        title="Construction"
        stage="Tension"
        heading={
          <>
            Built like
            <br />
            an instrument.
          </>
        }
        lede="Two mirrored squircle cups, a ring of warm satin metal, a headband drawn as one line. Taken apart, it is still only what it needs to be."
        hold="build"
      />
      <div ref={build} className="pl-build" data-stage="build">
        <div className="pl-stage">
          <PulseMedia slot="view34" fit="contain" compact className="pl-fill pl-build-fallback" />
          <ol className="pl-build-steps">
            {BUILD_STEPS.map(([title, note], i) => (
              <li key={title}>
                <span className="pl-label">0{i + 1}</span>
                <span className="pl-build-title pl-display">{title}</span>
                <span className="pl-label">{note}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="pl-mats">
        {(
          [
            ['mat1', 'Cushion', 'Deep black leather'],
            ['mat2', 'Connector', 'Dark metal meets the cup'],
            ['mat3', 'Marking', 'The wordmark, beside the Ring'],
          ] as [SlotKey, string, string][]
        ).map(([slot, title, note], i) => (
          <Reveal key={slot} as="figure" kind="aperture" delay={i * 0.12} className="pl-mat">
            <PulseMedia slot={slot} className="pl-ratio-45" />
            <Caption n={`0${i + 1}`} title={title} note={note} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 04 Sound becomes physical

// The first study opens out of a Ring-shaped window: the pressure boundary, held by scroll
function Physical() {
  const ap = useScrollProgress<HTMLDivElement>('pin')
  return (
    <section className="pl-chapter pl-opaque" data-chapter={4}>
      <ChapterHead
        n="04"
        title="Sound becomes physical"
        stage="Release"
        heading={
          <>
            Real world.
            <br />
            One impossible response.
          </>
        }
        lede="Each study keeps everything true but one thing. Fabric, dust and water behave as they should — until sound reaches them."
      />
      <div ref={ap} className="pl-ap">
        <div className="pl-stage pl-ap-stage">
          <figure className="pl-ap-figure">
            <div className="pl-ap-ring" aria-hidden />
            <div className="pl-ap-clip">
              <PulseMedia slot="phys1" className="pl-fill" />
            </div>
          </figure>
          <p className="pl-ap-cap pl-label">
            <span>Study 01 — Fabric</span>
            <span>Compression</span>
          </p>
        </div>
      </div>
      <Reveal as="p" className="pl-principle pl-display">
        Real pressure travels in circles.
        <br />
        PULSE pressure follows the Ring.
      </Reveal>
      <div className="pl-studies">
        <Reveal as="figure" kind="aperture" className="pl-study pl-study-a">
          <PulseMedia slot="phys2" className="pl-ratio-45" />
          <Caption n="02" title="Dust & light" note="Release" />
        </Reveal>
        <Reveal as="figure" kind="aperture" delay={0.15} className="pl-study pl-study-b">
          <PulseMedia slot="phys3" className="pl-ratio-45" />
          <Caption n="03" title="Water" note="Decay" />
        </Reveal>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- 05 Campaign

// The layout opens out: one full frame, one wide one, then the product and its posters. The
// Ring stays out of this chapter; the campaign stands on its own.
function Campaign() {
  const hero = useScrollProgress<HTMLDivElement>('cross')
  return (
    <section className="pl-chapter pl-opaque" data-chapter={5}>
      <ChapterHead
        n="05"
        title="Campaign"
        stage="Propagation"
        heading="Feel the sound."
        lede="The Ring leaves the product and becomes architecture: a hall lit only through an opening in its shape. The world stays still; only what sound reaches responds."
      />
      <div ref={hero} className="pl-camp-hero">
        <PulseMedia slot="campSpace" className="pl-fill pl-camp-hero-media" />
        <Reveal as="p" className="pl-camp-line pl-display">
          <span>Don’t just hear it.</span>
          <span>Feel it.</span>
        </Reveal>
      </div>
      <Reveal as="figure" kind="aperture" className="pl-camp-arch">
        <PulseMedia slot="campArch" className="pl-ratio-arch" />
        <Caption title="Architecture" note="The opening in the shape of the Ring" />
      </Reveal>
      <div className="pl-camp-row">
        <Reveal as="figure" kind="aperture" className="pl-camp-product">
          <PulseMedia slot="campProduct" className="pl-ratio-45" />
          <Caption title="Product" note="Displacement" />
        </Reveal>
        <div className="pl-camp-note">
          <p className="pl-label">Out of home</p>
          <Reveal as="p" kind="fade" className="pl-lede">
            The posters are set in the page from the campaign renders and the real wordmark, so the type is always the
            brand’s own and the product is always the approved one.
          </Reveal>
        </div>
      </div>
      <div className="pl-posters">
        <Poster slot="campSpace" layout="a" />
        <Poster slot="campProduct" layout="b" delay={0.12} />
        <Poster slot="campArch" layout="c" delay={0.24} />
      </div>
    </section>
  )
}

// A campaign poster set in the page from a campaign image and the real wordmark — never an
// AI-lettered one — so the type is always the brand's own
function Poster({ slot, layout, delay = 0 }: { slot: SlotKey; layout: 'a' | 'b' | 'c'; delay?: number }) {
  return (
    <Reveal as="figure" kind="aperture" delay={delay} className={`pl-poster pl-poster-${layout}`}>
      <PulseMedia slot={slot} compact className="pl-ratio-poster">
        <div className="pl-poster-type">
          <Wordmark className="pl-poster-mark" />
          <p className="pl-poster-line">
            <span>Feel</span>
            <span>the</span>
            <span>sound.</span>
          </p>
          <p className="pl-poster-foot">
            <span>Pulse 01</span>
            <span>Wireless audio</span>
          </p>
        </div>
      </PulseMedia>
      <Caption title={`Poster ${layout.toUpperCase()}`} note="2 : 3" />
    </Reveal>
  )
}

// ---------------------------------------------------------------- 06 Identity

const COLOURS: [string, string, string][] = [
  ['Graphite black', '#0B0B0B', 'Primary'],
  ['Charcoal', '#1A1A1A', 'Secondary'],
  ['Stone', '#E8E5DF', 'Background'],
  ['Silver grey', '#A7A7A7', 'Accent'],
  ['Warm taupe', '#AFA89E', 'Supporting'],
]
const PARTS: [string, string][] = [
  ['Signature Ring', 'Thin · metallic · continuous'],
  ['Ear cup', 'Soft squircle, superellipse n 4'],
  ['Marking', 'PULSE / 01 · tone on tone'],
]
const PRINCIPLES: [string, string, string][] = [
  ['01', 'Compression', 'Weight gathers. Slow in, held.'],
  ['02', 'Release', 'Fast out, long decay.'],
  ['03', 'Propagation', 'Pressure travels through what it meets.'],
  ['04', 'Silence', 'Every movement returns to stillness.'],
]

// Only after the brand has been felt is it explained — and briefly
function Identity() {
  return (
    <section className="pl-chapter pl-identity" data-chapter={6}>
      <ChapterHead
        n="06"
        title="Identity"
        stage="System"
        heading="An engineered system."
        lede="A wordmark that reads as construction, a neutral world of graphite and stone, and one shape — the Ring — that every graphic is drawn from."
      />
      <div className="pl-id-mark">
        <Reveal className="pl-id-wm">
          <Wordmark />
        </Reveal>
        <div className="pl-id-rules pl-label">
          <span>Uppercase · generous tracking</span>
          <span>Feel the sound.</span>
          <span>Never stretched, outlined, warped or lit</span>
        </div>
      </div>

      <div className="pl-views">
        {(
          [
            ['viewFront', 'Front'],
            ['viewSide', 'Side'],
            ['viewBack', 'Back'],
            ['view34', '3/4'],
          ] as [SlotKey, string][]
        ).map(([slot, title], i) => (
          <Reveal key={slot} as="figure" kind="aperture" delay={i * 0.08} className="pl-view">
            <PulseMedia slot={slot} fit="contain" tone="light" compact className="pl-ratio-1" />
            <Caption title={title} />
          </Reveal>
        ))}
      </div>
      <p className="pl-views-note pl-label">The product master — every image and every live frame on this page comes from this one model</p>

      <div className="pl-id-grid">
        <figure className="pl-blueprint">
          <Blueprint />
          <dl className="pl-parts">
            {PARTS.map(([k, v]) => (
              <div key={k}>
                <dt className="pl-label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </figure>
        <div className="pl-id-side">
          <ul className="pl-swatches">
            {COLOURS.map(([name, hex, role]) => (
              <li key={hex}>
                <span className="pl-swatch" style={{ background: hex }} />
                <span>{name}</span>
                <span>{hex}</span>
                <span>{role}</span>
              </li>
            ))}
          </ul>
          <div className="pl-type">
            <div>
              <p className="pl-label">Display — Inter Tight</p>
              <p className="pl-type-display">Aa</p>
              <p className="pl-type-set pl-display">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            </div>
            <div>
              <p className="pl-label">Text — Inter</p>
              <p className="pl-type-text">Aa</p>
              <p className="pl-type-set">abcdefghijklmnopqrstuvwxyz 0123456789</p>
            </div>
          </div>
        </div>
      </div>

      <Reveal as="ol" kind="fade" className="pl-principles">
        {PRINCIPLES.map(([n, name, note], i) => (
          <li key={n} className={`pl-pr pl-pr-${i + 1}`}>
            <svg viewBox="0 0 120 120" aria-hidden>
              {i === 2 && (
                <>
                  <path d={squircle(60, 60, 30, 36)} className="pl-pr-wave" />
                  <path d={squircle(60, 60, 30, 36)} className="pl-pr-wave" />
                  <path d={squircle(60, 60, 30, 36)} className="pl-pr-wave" />
                </>
              )}
              {i === 1 && <path d={squircle(60, 60, 30, 36)} className="pl-pr-echo" />}
              <path d={squircle(60, 60, 30, 36)} className="pl-pr-ring" />
            </svg>
            <span className="pl-label">{n}</span>
            <h3>{name}</h3>
            <p>{note}</p>
          </li>
        ))}
      </Reveal>
    </section>
  )
}

// The ear cup in side view, drawn from the same superellipse as every graphic ring
function Blueprint() {
  return (
    <svg viewBox="0 0 400 420" className="pl-bp" role="img" aria-label="Blueprint of the PULSE 01 ear cup and its Signature Ring">
      <path d="M200 20V62" className="pl-bp-guide" />
      <rect x="186" y="10" width="28" height="64" rx="14" className="pl-bp-line" />
      <path d={squircle(200, 230, 130, 160)} className="pl-bp-line" />
      <path d={squircle(200, 230, 121, 151)} className="pl-bp-ring" />
      <path d="M40 230H360M200 60V400" className="pl-bp-guide" />
      <text x="262" y="318" className="pl-bp-mark">
        PULSE
      </text>
      <text x="262" y="332" className="pl-bp-mark">
        01
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- Coda

// Back to restraint: the product turns to profile, the light falls to one line along the Ring, it
// settles, and the frame it is seen through closes to the Ring's shape as the page ends
function Coda() {
  const ref = useScrollProgress<HTMLElement>('pin')
  return (
    <section ref={ref} className="pl-coda" data-chapter={7} data-stage="coda">
      <div className="pl-stage">
        <div className="pl-coda-clip">
          <PulseMedia slot="final" className="pl-fill" />
        </div>
        <Reveal className="pl-coda-type">
          <Wordmark className="pl-coda-mark" />
          <p className="pl-label">Feel the sound.</p>
        </Reveal>
        <p className="pl-coda-k pl-label">
          <span>Coda</span>
          <span>Silence</span>
        </p>
      </div>
    </section>
  )
}
