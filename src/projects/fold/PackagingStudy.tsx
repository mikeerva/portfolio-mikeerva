import { useId, useState } from 'react'
import { PATH } from './wordmark'

const STEPS = [
  { name: 'Closed', text: 'The lid covers the tray. The wordmark stays clear; the colour gathers at the opening edge.' },
  { name: 'Fold', text: 'Release the seal and lift the lid along its rear crease. The coloured edge makes the movement easy to follow.' },
  { name: 'Open', text: 'The lid folds back to reveal the tray. The same graphic continues inside as a quieter return plane.' },
] as const

export function BoxDrawing({ step }: { step: number }) {
  const lid = ['130,130 340,130 405,190 195,190', '130,130 340,130 370,75 160,75', '130,130 340,130 340,35 130,35'][step]
  const logo = ['matrix(.14 0 .10 .09 170 140)', 'matrix(.14 0 -.04 .08 179 81)', 'matrix(.14 0 0 .14 165 50)'][step]
  return (
    <svg viewBox="0 0 540 340" role="img" aria-label={`Hinged pastry-box study: ${STEPS[step].name.toLowerCase()}`}>
      <ellipse cx="275" cy="285" rx="168" ry="16" fill="var(--ink)" opacity=".06" />
      <path d="M130 130H340L405 190H195Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M130 130 195 190V270L130 210Z" fill="var(--kraft)" stroke="var(--ink)" strokeWidth="1.5" />
      {step > 0 && (
        <>
          <path d="M142 141H330L386 181H198Z" fill="var(--kraft-light)" />
          <path d="M291 141H330L386 181Z" fill="var(--orange)" opacity=".7" />
        </>
      )}
      <path d="M195 190H405V270H195Z" fill="var(--kraft-light)" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="m350 190 55 0v80Z" fill="var(--orange)" />
      <path d="m375 190 30 0v44Z" fill="var(--red)" />
      <polygon points={lid} fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <g transform={logo} fill="var(--ink)">
        <path d={PATH} fillRule="evenodd" />
      </g>
      {step === 0 && (
        <>
          <path d="m340 130 65 60h-55Z" fill="var(--orange)" />
          <path d="m340 130 65 60h-27Z" fill="var(--red)" />
          <circle cx="295" cy="193" r="13" fill="var(--signal)" />
        </>
      )}
      {step > 0 && <path d="M130 130H340" stroke="var(--signal)" strokeWidth="2" strokeDasharray="5 5" />}
    </svg>
  )
}

export function CartonNet() {
  return (
    <svg
      viewBox="0 0 600 560"
      role="img"
      aria-label="Concept carton net with lid, tray base, side walls, tuck flap, cut edges and dashed crease lines. Not to scale."
    >
      <g fill="var(--kraft-light)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M180 70H420V100H460V250H420V300H470V450H420V500H180V450H130V300H180V250H140V100H180Z" />
      </g>
      <path d="M180 100H420V250H180Z" fill="var(--paper)" />
      <path d="m355 100 65 0v150Z" fill="var(--orange)" />
      <path d="m385 100 35 0v80Z" fill="var(--red)" />
      <path d="m370 300 50 0v150Z" fill="var(--orange)" opacity=".7" />
      <path d="m357 450 63 0v50Z" fill="var(--orange)" />
      <path d="m386 450 34 0v28Z" fill="var(--red)" />
      <g fill="none" stroke="var(--ink)" strokeWidth="1.2" strokeDasharray="6 5">
        <path d="M180 100H420M180 250H420M180 300H420M180 450H420M180 100V250M420 100V250M180 300V450M420 300V450" />
      </g>
      <g transform="translate(218 143) scale(.16)" fill="var(--ink)">
        <path d={PATH} fillRule="evenodd" />
      </g>
      <g className="fold-mono" fill="var(--ink)" textAnchor="middle" fontSize="11">
        <text x="300" y="90">
          TUCK
        </text>
        <text x="300" y="231">
          LID / OUTSIDE
        </text>
        <text x="300" y="279">
          HINGE
        </text>
        <text x="290" y="378">
          TRAY BASE
        </text>
        <text x="300" y="480">
          FRONT
        </text>
        <text x="155" y="378" transform="rotate(-90 155 378)">
          SIDE
        </text>
        <text x="445" y="378" transform="rotate(90 445 378)">
          SIDE
        </text>
      </g>
      <path d="M145 530H180" stroke="var(--ink)" strokeWidth="1.5" />
      <path d="M315 530H350" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="6 5" />
      <g className="fold-mono" fill="var(--ink)" fontSize="11">
        <text x="190" y="534">
          CUT EDGE
        </text>
        <text x="360" y="534">
          CREASE
        </text>
      </g>
    </svg>
  )
}

export function PackagingStudy() {
  const [step, setStep] = useState(0)
  const panelId = useId()
  return (
    <div className="fold-pack-study">
      <div className="fold-rule-heading">
        <h3 className="fold-display">Follow the opening.</h3>
        <p className="fold-copy">
          A hinged-carton concept explores how the graphic can follow a physical crease. Three views of one structure, with the master mark
          kept intact.
        </p>
      </div>
      <div className="fold-pack-study-grid">
        <div className="fold-pack-interactive">
          <div className="fold-pack-controls" role="group" aria-label="Packaging opening stages">
            {STEPS.map((s, i) => (
              <button key={s.name} type="button" aria-pressed={step === i} aria-controls={panelId} onClick={() => setStep(i)}>
                <span className="fold-mono">0{i + 1}</span> {s.name}
              </button>
            ))}
          </div>
          <div id={panelId}>
            <BoxDrawing step={step} />
            <p className="fold-copy" aria-live="polite">
              {STEPS[step].text}
            </p>
          </div>
        </div>
        <figure className="fold-net">
          <p className="fold-mono fold-eyebrow">Flat → formed</p>
          <CartonNet />
          <figcaption className="fold-copy">
            Concept net / not to scale. Exterior layout; the inner lid repeats the mark. Material thickness, closure tabs and production
            tolerances remain to be prototyped.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
