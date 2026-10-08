import { CUP_AXES, SHOT_CAMERAS, type ShotCamera } from './stage-cams'

// The PULSE motion system: what the one live 3D stage shows at every point of the page, as pure
// functions of (key, progress). Each 3D section of the page names a key; its scroll progress
// (0..1) picks a state on that key's track. Cameras start from the Blender shots' own cameras
// (stage-cams.ts), so the live product meets the renders exactly; between keyframes the camera
// travels on an orbit around a moving target (spherical interpolation), never in a straight line
// through the product.

export type Vec3 = [number, number, number]
export type StageKey = 'hero' | 'ring' | 'build' | 'coda'

export interface StageState {
  pos: Vec3
  target: Vec3
  lens: number
  shift: [number, number]
  // the frame the shot was composed for, and how it adapts to the panel: 0 = cover (crop, like
  // the renders), 1 = contain (the whole product always in frame)
  refAspect: number
  fit: number
  // product
  rotY: number
  explode: number
  // light: key and rim strength, environment strength and its rotation (reflections travel)
  key: number
  // the key light's height above the product (m): high for modelling, low to graze the Ring
  keyY: number
  rim: number
  env: number
  envRot: number
}

const cam = (name: string, portrait: boolean): ShotCamera =>
  SHOT_CAMERAS[portrait && SHOT_CAMERAS[`${name}_portrait`] ? `${name}_portrait` : name] ??
  SHOT_CAMERAS[`${name}_desk`] ??
  SHOT_CAMERAS[`${name}_desktop`]

function fromShot(c: ShotCamera, light: Partial<StageState> = {}, fit = 0): StageState {
  return {
    pos: c.pos as Vec3,
    target: c.target as Vec3,
    lens: c.lens,
    shift: c.shift as [number, number],
    refAspect: c.aspect,
    fit,
    rotY: 0,
    explode: 0,
    key: 1,
    keyY: 0.55,
    rim: 0.5,
    env: 0.4,
    envRot: 0,
    ...light,
  }
}

// The same camera, moved around its target: yaw and pitch in degrees, distance as a factor
function orbit(s: StageState, yaw: number, pitch = 0, dist = 1, over: Partial<StageState> = {}): StageState {
  const o = sub(s.pos, s.target)
  const { r, az, el } = toSph(o)
  return { ...s, pos: add(s.target, fromSph(r * dist, az + rad(yaw), clampEl(el + rad(pitch)))), ...over }
}

// ------------------------------------------------------------------ tracks

type Track = [t: number, s: StageState][]

const HERO_LIGHT = { key: 1.15, rim: 0.55, env: 0.32 }
const RING_LIGHT = { key: 0.9, rim: 0.35, env: 0.75 }
const BUILD_LIGHT = { key: 1.4, rim: 0.8, env: 0.6 }
const CODA_LIGHT = { key: 1.0, rim: 0.3, env: 0.18 }
// the hero's set light at the end: one low line of light from the front, grazing the Ring
const FINAL_LIGHT = { key: 1.5, keyY: 0.12, rim: 0.12, env: 0.08, envRot: -0.9 }

function tracks(portrait: boolean): Record<StageKey, Track> {
  const hero = fromShot(cam('hero', portrait), HERO_LIGHT)
  const ring = fromShot(cam('ring', portrait), { ...RING_LIGHT, envRot: Math.PI * 1.1 })
  // the orbit the hero leaves on: around toward the +X cup, a little closer
  const heroOut = orbit(hero, 26, 3, 0.86, { ...HERO_LIGHT, envRot: 0.5 })
  // the ring's approach: on the macro camera's own line of sight, further back
  const ringFar = { ...ring, pos: add(ring.target, scale(sub(ring.pos, ring.target), 4.2)), lens: 70, envRot: Math.PI * 0.55 }
  const front = fromShot(SHOT_CAMERAS.view_front, BUILD_LIGHT, 1)
  const side = fromShot(SHOT_CAMERAS.view_side, { ...BUILD_LIGHT, envRot: 0.6 }, 1)
  const q = fromShot(SHOT_CAMERAS.view_34, { ...BUILD_LIGHT, envRot: 1.2 }, 1)
  const exploded = orbit(q, 6, 2, 1.28, { explode: 1, envRot: 1.6 })
  // close on the right cup, exploded: the cushion, liner and flange stand apart from the shell
  const cupT = add(CUP_AXES.centreR as Vec3, [0.0, 0.0, 0.0])
  const cupClose: StageState = {
    ...exploded,
    target: add(cupT, [-0.03, 0, 0]),
    pos: add(cupT, [-0.07, 0.05, 0.52]),
    lens: 58,
    fit: 0.6,
    explode: 1,
    envRot: 2.3,
  }
  const finalCam = fromShot(cam('final', portrait), { ...FINAL_LIGHT, rotY: -Math.PI / 2 })
  const codaIn = { ...orbit(hero, -18, 6, 1.12), ...CODA_LIGHT, rotY: -0.35, envRot: 1.0 }
  return {
    hero: [
      [0, hero],
      [1, heroOut],
    ],
    ring: [
      [0, heroOut],
      [0.32, ringFar],
      [0.6, ring],
      // the render has taken over: the live product falls dark behind the line and the sign
      [0.8, ring],
      [0.9, { ...ring, key: 0, rim: 0, env: 0 }],
      [1, { ...ring, key: 0, rim: 0, env: 0 }],
    ],
    build: [
      [0, front],
      [0.14, front],
      [0.3, side],
      [0.48, exploded],
      [0.66, cupClose],
      [0.84, { ...q, explode: 0, envRot: 2.8 }],
      [1, { ...q, envRot: 3.0 }],
    ],
    coda: [
      [0, codaIn],
      [0.62, finalCam],
      [1, finalCam],
    ],
  }
}

let cache: { portrait: boolean; t: Record<StageKey, Track> } | null = null
export function stateAt(key: StageKey, p: number, portrait: boolean): StageState {
  if (!cache || cache.portrait !== portrait) cache = { portrait, t: tracks(portrait) }
  const track = cache.t[key]
  if (p <= track[0][0]) return track[0][1]
  for (let i = 1; i < track.length; i++) {
    const [t1, s1] = track[i]
    const [t0, s0] = track[i - 1]
    if (p <= t1) return mix(s0, s1, smooth((p - t0) / Math.max(t1 - t0, 1e-6)))
  }
  return track[track.length - 1][1]
}

// ------------------------------------------------------------------ interpolation

function mix(a: StageState, b: StageState, t: number): StageState {
  const target = lerp3(a.target, b.target, t)
  const sa = toSph(sub(a.pos, a.target))
  const sb = toSph(sub(b.pos, b.target))
  let daz = sb.az - sa.az
  if (daz > Math.PI) daz -= Math.PI * 2
  if (daz < -Math.PI) daz += Math.PI * 2
  const r = Math.exp(lerp(Math.log(sa.r), Math.log(sb.r), t))
  return {
    pos: add(target, fromSph(r, sa.az + daz * t, lerp(sa.el, sb.el, t))),
    target,
    lens: Math.exp(lerp(Math.log(a.lens), Math.log(b.lens), t)),
    shift: [lerp(a.shift[0], b.shift[0], t), lerp(a.shift[1], b.shift[1], t)],
    refAspect: lerp(a.refAspect, b.refAspect, t),
    fit: lerp(a.fit, b.fit, t),
    rotY: lerp(a.rotY, b.rotY, t),
    explode: lerp(a.explode, b.explode, t),
    key: lerp(a.key, b.key, t),
    keyY: lerp(a.keyY, b.keyY, t),
    rim: lerp(a.rim, b.rim, t),
    env: lerp(a.env, b.env, t),
    envRot: lerp(a.envRot, b.envRot, t),
  }
}

// a heavier ease than smoothstep: weight gathers, then lets go — the brand's press and release
export const smooth = (x: number) => {
  const t = Math.min(Math.max(x, 0), 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const rad = (d: number) => (d * Math.PI) / 180
const clampEl = (e: number) => Math.min(Math.max(e, -1.35), 1.35)
function toSph([x, y, z]: Vec3) {
  const r = Math.hypot(x, y, z)
  return { r, az: Math.atan2(x, z), el: Math.asin(y / r) }
}
function fromSph(r: number, az: number, el: number): Vec3 {
  return [r * Math.cos(el) * Math.sin(az), r * Math.sin(el), r * Math.cos(el) * Math.cos(az)]
}

// ------------------------------------------------------------------ exploded view

// How far each approved part moves apart, in metres at full explode, and along what: the cup's
// own outward axis (outer parts out, inner parts in) or straight up (the headband). Only the
// existing parts move; nothing is added or reshaped, and at 0 every part is exactly in place.
const OUT: [match: string, metres: number][] = [
  ['Signature Ring', 0.03],
  ['faceplate', 0.03],
  ['wordmark', 0.03],
  ['housing', 0.012],
  ['flange', -0.014],
  ['liner', -0.024],
  ['cushion', -0.036],
]
const UP: [match: string, metres: number][] = [
  ['outer shell', 0.034],
  ['inner padding', 0.02],
  ['end cuff', 0.026],
  ['crown receiver', 0.014],
  ['connector', 0.016],
]
export function explodeOffset(name: string): Vec3 {
  const side = name.endsWith('|L') || name.startsWith('12 Left') ? 'L' : 'R'
  const axis = CUP_AXES[side] as Vec3
  for (const [m, d] of OUT) if (name.includes(m)) return scale(axis, d)
  for (const [m, d] of UP) if (name.includes(m)) return [0, d, 0]
  return [0, 0, 0]
}
