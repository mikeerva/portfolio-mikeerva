// The Work object: one irregular mass with four facets. Every category is the same
// mass turned a quarter further around its vertical axis, and each category's name
// sits on that facet, so the mass and the typography move as one rigid system.
// Object units: y up, +z toward the viewer, ~1 unit ≈ the mass's radius.

export type Vec3 = [x: number, y: number, z: number]
export type Blob = [x: number, y: number, z: number, r: number]

// The first 14 are also the Hero's blobs; the rest exist only in the Work object
// and grow out of it as the Hero gathers into the mass. Work-only blobs have radius 0
// in the Hero so they don't affect that scene.
export const BLOB_COUNT = 28
export const STATE_COUNT = 4

// Yaw of the whole system at a continuous state index; integers face a category forward
export const yawOf = (progress: number) => (-progress * Math.PI) / 2

// Camera distance in object units: near parts of the mass grow, far parts shrink,
// enough for the eye to read depth without bending the shape
export const CAMERA = 4.5
export const perspective = (z: number) => CAMERA / (CAMERA - z)

// Turn around the vertical axis, then tilt toward/away from the viewer
export function place([x, y, z]: Vec3, yaw: number, tilt: number): Vec3 {
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  const rx = x * c + z * s
  const rz = -x * s + z * c
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  return [rx, y * ct - rz * st, y * st + rz * ct]
}

// One amorphous mass: a dense core that rounded lobes push out of in every direction,
// toward the viewer as much as sideways and away. Each lobe is fused to the core by a
// neck blob, so the surface stretches between them instead of reading as separate balls,
// and a few lobes carry a smaller bulge that turns them into a soft, rounded corner.
export const MASS: Blob[] = [
  // core
  [0.0, 0.0, 0.0, 0.55],
  [0.12, 0.1, 0.2, 0.45],
  [-0.12, -0.08, -0.2, 0.45],
  // front, low left: reaches furthest toward the viewer, then bends outward
  [-0.3, -0.28, 0.45, 0.3],
  [-0.55, -0.5, 0.95, 0.42],
  [-0.88, -0.55, 0.9, 0.22],
  // front, high right, curling up
  [0.3, 0.3, 0.4, 0.3],
  [0.6, 0.55, 0.75, 0.38],
  [0.85, 0.75, 0.6, 0.2],
  // right, a rounded corner turning down
  [0.5, -0.1, -0.05, 0.32],
  [1.0, -0.2, 0.0, 0.38],
  [1.1, -0.55, 0.15, 0.2],
  // back, upper left, rising
  [-0.3, 0.35, -0.45, 0.3],
  [-0.55, 0.7, -0.85, 0.4],
  [-0.35, 1.0, -0.7, 0.22],
  // back, low right
  [0.3, -0.4, -0.45, 0.3],
  [0.55, -0.75, -0.85, 0.36],
  // crown, leaning forward
  [0.0, 0.5, 0.1, 0.32],
  [-0.1, 0.95, 0.25, 0.34],
  // left, set back, with a corner dropping away
  [-0.5, 0.05, -0.1, 0.32],
  [-1.0, 0.15, -0.25, 0.36],
  [-1.15, -0.15, -0.1, 0.2],
  // underside, toward the viewer
  [0.15, -0.5, 0.3, 0.3],
  [0.3, -0.95, 0.5, 0.32],
  // straight back, only seen in profile
  [0.05, 0.05, -0.55, 0.32],
  [0.15, -0.1, -1.1, 0.4],
  [0.45, 0.15, -1.1, 0.24],
  // straight forward, low right
  [0.25, -0.15, 0.95, 0.38],
]

// Each category name is a flat card travelling around the mass on a compact, invisible path.
// The card turns with the mass, so it reads normally only from the front, goes edge-on at the
// side and shows its back (mirrored) behind the mass.
// `at` is where it rests facing the viewer: floating just in front of the mass and within its
// silhouette, off-centre, in a region that suits the mass's outline at that orientation
// (`atPortrait` on portrait screens). `side` is how far out it passes the side (it's edge-on
// there, so it can pass close), `depth` how far behind the mass it goes, and `lift` its height
// at the side as a share of its resting height, so it mostly travels sideways and in depth
// rather than up and down.
export const FACETS: {
  at: Vec3
  atPortrait: Vec3
  side: number
  depth: number
  lift: number
  lines: string[]
}[] = [
  { at: [-0.33, -0.4, 1.2], atPortrait: [-0.3, -0.4, 1.2], side: 2.0, depth: 1.3, lift: 0.75, lines: ['Brand', 'Identity'] },
  { at: [0.4, 0.44, 1.2], atPortrait: [0.35, 0.44, 1.2], side: 1.95, depth: 1.4, lift: 0.7, lines: ['UI / UX'] },
  { at: [0.22, -0.33, 1.2], atPortrait: [0.18, -0.33, 1.2], side: 2.05, depth: 1.25, lift: 0.8, lines: ['Art', 'Direction'] },
  { at: [-0.18, 0.4, 1.2], atPortrait: [-0.12, 0.4, 1.2], side: 2.0, depth: 1.35, lift: 0.7, lines: ['Creative', 'Development'] },
]

const smooth = (lo: number, hi: number, v: number) => {
  const x = Math.min(Math.max((v - lo) / (hi - lo), 0), 1)
  return x * x * (3 - 2 * x)
}

// Slow pressure inside the mass: a few centres wander through it, and the volumes they
// pass swell and push outward while others ease back in, so one region grows as another
// settles, never in unison. Periods are tens of seconds.
const PRESSURE = [
  { rate: 0.11, drift: 0.05, phase: 0, tilt: 0.4 },
  { rate: 0.08, drift: -0.035, phase: 2.1, tilt: -0.6 },
  { rate: 0.14, drift: 0.025, phase: 4.2, tilt: 1.1 },
]
// Direction of each blob from the centre, and how much it's allowed to move (core: none)
const OUTWARD = MASS.map(([x, y, z]) => {
  const l = Math.hypot(x, y, z)
  return l < 0.3 ? [0, 0, 0, 0] : [x / l, y / l, z / l, Math.min(l, 1)]
})

// Pressure on blob `i` at time `t`, roughly -1..1: positive swells and pushes it out
export function blobPressure(i: number, t: number) {
  const [dx, dy, dz, reach] = OUTWARD[i]
  let p = 0
  for (const { rate, drift, phase, tilt } of PRESSURE) {
    const az = phase + t * drift
    const near = Math.max(0, Math.cos(tilt) * (dx * Math.sin(az) + dz * Math.cos(az)) + dy * Math.sin(tilt))
    p += near * near * near * Math.sin(t * rate + phase * 1.7)
  }
  return p * reach
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// Furthest a resting name sits around the mass from straight ahead; past this it would
// cross in front of the mass far too close to the viewer
const MAX_REST_ANGLE = (50 * Math.PI) / 180

// Facet `i`'s name at angle `phi` from the viewer: its position (object units) and its
// orientation about the vertical axis (radians), both from the same turn. The card turns
// exactly as far as the mass has, so its orientation is never corrected toward the viewer.
export function facetPath(i: number, phi: number, portrait: boolean): { pos: Vec3; lean: number } {
  const { side, depth, lift } = FACETS[i]
  const at = portrait ? FACETS[i].atPortrait : FACETS[i].at
  const turn = Math.min(Math.abs(phi), Math.PI)
  const toSide = smooth(0, Math.PI / 2, turn)
  const toBack = smooth(Math.PI / 2, Math.PI, turn)
  // The resting spot as a point on the path: its angle around the mass, radius and depth.
  // Its offset from straight ahead fades as it turns, so it's exactly at the side when
  // edge-on and exactly behind the mass when facing away.
  const restAngle = Math.sign(at[0]) * Math.min(Math.atan2(Math.abs(at[0]), at[2]), MAX_REST_ANGLE)
  const angle = phi + restAngle * Math.max(Math.cos(phi), 0)
  const r = lerp(lerp(Math.abs(at[0] / Math.sin(restAngle)), side, toSide), 0.9, toBack)
  const d = lerp(at[2] / Math.cos(restAngle), depth, toBack)
  const y = lerp(lerp(at[1], at[1] * lift, toSide), at[1] * lift * 0.4, toBack)
  return { pos: [r * Math.sin(angle), y, d * Math.cos(angle)], lean: phi }
}

// Where the object sits on screen, in CSS px (y from the top). Portrait screens get
// a relatively larger object placed higher, so it isn't just the desktop composition shrunk.
export function objectLayout(width: number, height: number) {
  const portrait = height > width
  return {
    cx: width * (portrait ? 0.5 : 0.49),
    cy: height * (portrait ? 0.45 : 0.49),
    unit: portrait ? Math.min(width * 0.23, height * 0.15) : Math.min(height * 0.225, width * 0.16),
  }
}
