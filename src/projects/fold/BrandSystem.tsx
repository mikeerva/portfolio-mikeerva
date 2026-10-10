import { FoldGraphic, Mark } from './FoldPrimitives'

const COLOURS = [
  { name: 'Paper', hex: '#EFE8DC', role: 'The canvas', colour: 'var(--paper)', ink: 'var(--ink)' },
  { name: 'Ink', hex: '#151311', role: 'Type & wordmark', colour: 'var(--ink)', ink: 'var(--paper)' },
  { name: 'Signal', hex: '#E8462A', role: 'The accent', colour: 'var(--signal)', ink: 'var(--ink)' },
]

export function BrandSystem() {
  return (
    <section className="fold-system fold-editorial" aria-labelledby="fold-system-title">
      <p className="fold-mono fold-eyebrow">02 — The visual system</p>
      <div className="fold-section-intro">
        <h2 id="fold-system-title" className="fold-display fold-section-title">
          A few rules.
          <br />
          <span>Many forms.</span>
        </h2>
        <p className="fold-copy">
          A compact wordmark, a direct typographic voice and a corner of colour. Each has a job; the same rules carry from a receipt to a
          shopfront.
        </p>
      </div>

      <div className="fold-type-specimen">
        <div className="fold-type-lead">
          <p className="fold-mono fold-eyebrow">01 / Voice — Anton</p>
          <p className="fold-display fold-type-sample">
            Good
            <br />
            things
            <br />
            <span>inside.</span>
          </p>
          <p className="fold-copy">Short, oversized headlines. A clear invitation from across the street.</p>
        </div>
        <div className="fold-type-detail">
          <div>
            <p className="fold-mono fold-eyebrow">02 / Information — IBM Plex Mono</p>
            <p className="fold-mono fold-mono-sample">
              COFFEE / BAKERY
              <br />
              ATHENS / EVERY DAY
              <br />
              08:00 — 18:00
              <br />
              ORDER 0247 — € 3.80
            </p>
            <p className="fold-copy">Names, numbers and navigation. One steady rhythm for the small details.</p>
          </div>
          <div>
            <p className="fold-mono fold-eyebrow">03 / Reading — Inter</p>
            <p className="fold-body-sample">
              Coffee in hand.
              <br />
              The city ahead.
            </p>
            <p className="fold-copy">Simple, open text for longer copy and the ordering interface.</p>
          </div>
        </div>
      </div>

      <div className="fold-palette" aria-label="Primary brand colours">
        {COLOURS.map((c) => (
          <div key={c.name} style={{ background: c.colour, color: c.ink }}>
            <span className="fold-mono">{c.hex}</span>
            <div>
              <p className="fold-display">{c.name}</p>
              <p className="fold-mono">{c.role}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="fold-copy fold-palette-note">
        Kraft and concrete come from the materials. Red, orange and a darker return plane give the fold its depth.
      </p>

      <div className="fold-rule-heading">
        <h3 className="fold-display">From corner to signature.</h3>
        <p className="fold-copy">
          Start at an edge. Turn a plane. Add the return. Rotate the whole motif for another corner; keep its proportions intact.
        </p>
      </div>
      <div className="fold-construction">
        {(['Define the edge', 'Turn the plane', 'Add depth'] as const).map((label, i) => (
          <figure key={label}>
            <div className="fold-construction-drawing">
              <FoldGraphic stage={i as 0 | 1 | 2} />
            </div>
            <figcaption className="fold-mono">
              0{i + 1} / {label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="fold-artwork-row" aria-label="Master wordmark applications">
        <figure>
          <div className="fold-artwork fold-artwork-sticker">
            <div>
              <Mark />
            </div>
          </div>
          <figcaption className="fold-mono">Seal / one-colour master</figcaption>
        </figure>
        <figure>
          <div className="fold-artwork fold-artwork-card">
            <Mark />
            <p className="fold-mono">
              Brunch / Bakery
              <br />
              Specialty coffee / All day
            </p>
            <FoldGraphic />
          </div>
          <figcaption className="fold-mono">Lockup / consistent proportions</figcaption>
        </figure>
        <figure>
          <div className="fold-artwork fold-artwork-receipt">
            <div>
              <Mark />
              <p className="fold-mono">
                01 Coffee
                <br />
                01 Croissant
              </p>
              <hr />
              <p className="fold-mono">Good things ahead.</p>
            </div>
          </div>
          <figcaption className="fold-mono">Receipt / small-scale application</figcaption>
        </figure>
      </div>
      <p className="fold-copy fold-palette-note">
        One master drawing, always scaled as a whole. These flat artworks show the exact mark used throughout the digital identity.
      </p>
    </section>
  )
}
