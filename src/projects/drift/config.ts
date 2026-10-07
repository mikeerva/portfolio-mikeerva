// DRIFT tuning, in one place. World units: the camera sits 9 units from the interaction plane
// (z = 0), which then shows about 6.5 units of height. Forces are accelerations (units / s²).

export type Tier = 'high' | 'medium' | 'low' | 'reduced'

export const DRIFT = {
  // Kept deliberately light: the portfolio's own scene keeps running around the panel, so DRIFT
  // has to share the frame. Counts are ceilings; a slow device drops further on its own.
  tiers: {
    high: { count: 16000, dpr: 1.75 },
    medium: { count: 11000, dpr: 1.5 },
    low: { count: 6000, dpr: 1.25 },
    reduced: { count: 5000, dpr: 1.25 },
  } as Record<Tier, { count: number; dpr: number }>,

  camera: { fov: 40, z: 9, parallax: 0.22 },

  // The ambient field: travelling low-frequency waves that move every particle's rest position
  flow: { amplitude: 0.42, speed: 1 },
  // Fine turbulence, applied as a force
  turbulence: 0.55,

  // Equilibrium: spring toward the (moving) rest position, and drag
  spring: 3.1,
  damping: 2.0,

  pointer: {
    radius: 0.8, // base reach of the close field (distance to the cursor's ray)
    radiusPerSpeed: 0.045, // faster gestures reach further...
    radiusMax: 1.65, // ...up to this
    displace: 15, // close range: particles are pushed off the ray
    attract: 2.4, // medium range: the field bends toward the cursor
    attractReach: 2.5, // × radius
    impulse: 2.2, // share of the cursor's velocity handed to particles
    dragImpulse: 5.2, // while held: the brush
    gather: 9, // while held: the local field draws in...
    swirl: 3.2, // ...and twists
    chargeTime: 1.2, // seconds of hold to full tension
    release: 6.5, // what full tension gives back when let go
    velocitySmoothing: 14, // per second
  },

  // Tearing: a hard hit loosens a particle's spring for a few seconds
  tear: { gain: 0.035, softness: 4, recovery: 0.35 },

  // FORM: the same particles take the word
  form: { word: 'DRIFT', halo: 0.16, width: 0.76, widthPortrait: 0.88 },

  size: 1.9, // point size in px at the interaction plane, before DPR

  // Scroll choreography over the stage's run (0..1)
  phases: {
    formIn: [0.08, 0.44] as [number, number],
    // if the word is never broken, the end of the run dissolves it gently instead
    formOut: [0.86, 0.98] as [number, number],
    calm: [0.9, 1] as [number, number],
    // scrolling back above this rebuilds a broken word
    rebuild: 0.3,
  },

  // RELEASE: tension builds from fast gestures inside the formed word; at 1 it breaks
  release: {
    threshold: 2.6, // cursor speed (units / s) below which nothing builds
    gainDrag: 0.24, // per unit of speed over the threshold, per second, while held
    gainMove: 0.07, // the same, without holding
    decay: 0.9, // per second
    power: 0.5, // scatter impulse per unit of gesture speed
    powerMax: 5.5,
    letGo: 2.2, // how fast the word's hold goes once broken (per second)
    regrow: 0.9, // how fast it comes back when rebuilt
  },
}
