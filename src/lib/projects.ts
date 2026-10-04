// A selected category's mass divides into one fragment per project. One organic system, four
// art-directed worlds: each category has its own constellation, and every project its own
// stable shape. Nothing here assumes a project count; it comes from the project data.
import { config, type CategoryId } from '../config'
import type { Vec3 } from './objectStates'

// The mass has 28 blobs to share out, so beyond this fragments would become too thin to read
export const MAX_PROJECTS = 9
// How far out from the mass's centre (object units) each fragment's region is anchored
const SEED_REACH = 0.9

// Each category's composition (landscape, object units centred on the mass, z toward the
// viewer), written in the order points are taken: with n projects the first n are used, then
// recentred and spread to fill the category's field, so fewer projects get more space and
// larger fragments, and more get a denser, deeper arrangement. The fourth value is visual
// weight: a fragment's relative size and how much of the mass it takes.
type Point = [x: number, y: number, z: number, weight: number]
const WORLDS: Record<CategoryId, { points: Point[]; field: [number, number] }> = {
  // A heavy left body against a sweeping fall to the lower right
  brand: {
    field: [2.0, 1.2],
    points: [
      [-1.7, 0.55, 0.45, 1.25],
      [1.55, -0.65, -0.2, 0.95],
      [-0.6, -1.05, -0.55, 0.8],
      [0.75, 0.95, -0.85, 0.7],
      [1.95, 0.5, 0.25, 0.85],
      [-1.95, -0.6, -0.3, 0.75],
      [0.1, 0.1, -1.0, 0.65],
      [-0.95, 1.2, -0.7, 0.7],
      [1.0, -1.25, 0.35, 0.75],
    ],
  },
  // A long, lateral, stepped band: wide, light, precise
  uiux: {
    field: [2.15, 1.0],
    points: [
      [-1.9, -0.25, 0.2, 0.9],
      [1.8, 0.35, 0.1, 1.0],
      [0.05, 0.8, -0.6, 0.75],
      [-0.7, -1.0, 0.45, 0.85],
      [0.95, -0.9, -0.4, 0.8],
      [-1.1, 0.95, -0.9, 0.7],
      [2.0, -0.9, 0.35, 0.75],
      [0.4, 0.0, -1.1, 0.6],
      [-2.0, 0.6, -0.2, 0.7],
    ],
  },
  // One near hero body, the rest held back deep: vertical tension
  'art-direction': {
    field: [1.85, 1.3],
    points: [
      [-0.35, 0.3, 0.6, 1.4],
      [1.45, 1.05, -0.8, 0.7],
      [1.6, -1.05, -0.2, 0.85],
      [-1.9, -1.2, -0.5, 0.8],
      [-1.6, 1.15, -0.4, 0.7],
      [0.5, -1.25, 0.3, 0.8],
      [0.45, 1.3, -1.0, 0.6],
      [2.1, 0.1, -0.9, 0.65],
      [-1.0, -0.2, -1.1, 0.6],
    ],
  },
  // Restless and scattered, weighted to the right, deep
  creative: {
    field: [2.05, 1.25],
    points: [
      [1.1, 0.4, 0.5, 1.15],
      [-1.8, -0.8, -0.3, 0.9],
      [1.9, -0.75, -0.6, 0.75],
      [-0.9, 1.0, -0.8, 0.8],
      [0.15, -1.15, 0.2, 0.85],
      [0.35, 1.2, -0.4, 0.7],
      [-1.95, 0.55, 0.1, 0.75],
      [2.0, 1.15, -1.0, 0.6],
      [-0.4, -0.15, -1.2, 0.6],
    ],
  },
}

export interface Placement {
  pos: Vec3
  // Fragment size (scales its shape) and share of the mass's blobs
  size: number
  weight: number
}

// Where a category's n fragments settle. Portrait screens turn the composition a quarter, so it
// runs top to bottom.
export function constellation(category: CategoryId, n: number, portrait: boolean): Placement[] {
  const { points, field } = WORLDS[category]
  const chosen = points.slice(0, Math.min(n, MAX_PROJECTS, points.length))
  if (chosen.length === 0) return []
  // Recentre and spread the chosen points to the category's field
  const cx = chosen.reduce((s, p) => s + p[0], 0) / chosen.length
  const cy = chosen.reduce((s, p) => s + p[1], 0) / chosen.length
  const ex = Math.max(...chosen.map((p) => Math.abs(p[0] - cx)), 1e-3)
  const ey = Math.max(...chosen.map((p) => Math.abs(p[1] - cy)), 1e-3)
  const spread = chosen.length === 1 ? 0 : Math.min(field[0] / ex, field[1] / ey, 1.6)
  // Fewer projects, stronger individual fragments
  const room = Math.min(Math.max(Math.sqrt(4 / chosen.length), 0.78), 1.3)
  return chosen.map(([x, y, z, weight]) => {
    const lx = (x - cx) * spread
    const ly = (y - cy) * spread
    return {
      pos: portrait ? [ly * 0.6, lx * 1.2, z] : [lx, ly, z],
      size: weight * room,
      weight,
    }
  })
}

// A small seeded generator, so every project's shape is the same on every visit
function seeded(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Project `index` of a category: its own body, built from `count` blobs. Not a ball: a curved
// spine of its own length and bend, thick at one point along it and thin at another, with
// lobes pushed out to one side, a dent pulled in on the other, and its own depth structure.
// Returns [x, y, z, radius] per blob, in the fragment's own units (before its size).
export function morphology(category: CategoryId, index: number, count: number): [number, number, number, number][] {
  const project = config.projects[category][index]
  const rnd = seeded(`${category}/${project?.id ?? index}/${project?.name ?? ''}`)
  const range = (lo: number, hi: number) => lo + (hi - lo) * rnd()
  // Every draw is taken, so a project's shape stays the same whichever parts are art-directed
  const seededShape = {
    length: range(0.45, 1.05),
    angle: range(0, Math.PI),
    bend: range(-0.55, 0.55),
    tilt: range(-0.45, 0.45),
    peak: range(0.15, 0.85),
    thick: range(0.26, 0.36),
    lean: range(0.25, 0.6),
    side: rnd() < 0.5 ? -1 : 1,
    lobes: 1 + Math.floor(rnd() * 3),
  }
  const art = project?.shape ?? {}
  let length = art.length ?? seededShape.length
  const angle = art.angle ?? seededShape.angle
  const bend = art.bend ?? seededShape.bend
  const [dx, dy] = [Math.cos(angle), Math.sin(angle)]
  const [nx, ny] = [-dy, dx]
  const tilt = seededShape.tilt
  const peak = art.peak ?? seededShape.peak
  const thick = art.thick ?? seededShape.thick
  const lean = art.lean ?? seededShape.lean
  const lobeSide = seededShape.side
  const lobes = Math.min(art.lobes ?? seededShape.lobes, Math.max(count - 3, 0))
  // Never longer than its blobs can span, so the body stays one connected piece
  const spine = count > 3 ? count - lobes : count
  length = Math.min(length, Math.max(spine - 1, 0.6) * thick * (1 - lean * 0.5) * 1.15)
  const out: [number, number, number, number][] = []
  for (let j = 0; j < count; j++) {
    const isLobe = j >= count - lobes && lobes > 0
    const t = isLobe ? range(0.1, 0.9) : count === 1 ? 0.5 : j / (count - 1 - lobes || 1)
    const s = (t - 0.5) * length
    // along the bent spine
    const off = bend * length * (0.25 - (t - 0.5) * (t - 0.5))
    let x = dx * s + nx * off
    let y = dy * s + ny * off
    let z = tilt * (t - 0.5) * length + range(-0.08, 0.08)
    // thickness swells toward its peak and thins away from it, unevenly
    let r = thick * (1 - lean + lean * Math.exp(-((t - peak) * (t - peak)) / 0.06)) * range(0.85, 1.12)
    if (isLobe) {
      // a lobe pushed out to one side, nearer the viewer or further from it
      const push = range(0.45, 0.75) * thick
      x += nx * push * lobeSide
      y += ny * push * lobeSide
      z += range(-0.2, 0.25)
      r *= range(0.62, 0.82)
    } else if (j % 3 === 1) {
      // a dent: this part of the body sits back toward the other side
      x -= nx * thick * 0.35 * lobeSide
      y -= ny * thick * 0.35 * lobeSide
      r *= 0.85
    }
    out.push([x, y, z, r])
  }
  return out
}

// How many of the mass's blobs each fragment takes: by weight, at least three each
export function shareBlobs(total: number, placements: Placement[]) {
  const n = placements.length
  const least = Math.min(3, Math.floor(total / Math.max(n, 1)))
  const sum = placements.reduce((s, p) => s + p.weight, 0) || 1
  const counts = placements.map((p) => Math.max(least, Math.round((total * p.weight) / sum)))
  let diff = total - counts.reduce((s, c) => s + c, 0)
  for (let k = 0; diff !== 0 && k < 400; k++) {
    const g = k % n
    if (diff > 0) {
      counts[g]++
      diff--
    } else if (counts[g] > least) {
      counts[g]--
      diff++
    }
  }
  return counts
}

// An entered project: its fragment tears open into a large left mass and a smaller, different
// right one, and the project panel sits in the irregular opening between them. Positions are
// fractions along the screen's long axis (u, 0 = left/top) and short axis (v); portrait screens
// swap the axes, so the masses open above and below instead. Radius is a fraction of the
// screen's short side; depth (object units) is in front of the panel above PANEL_Z, behind it
// below. The first slots of each side take the fragment's own blobs, the rest are lobes that
// grow inside the masses as the other fragments recede.
export type Slot = [u: number, v: number, r: number, depth: number]
export const PANEL_Z = 0.6
export const OPEN_LEFT: Slot[] = [
  [0.02, 0.52, 0.34, 0.3],
  [0.08, 0.2, 0.2, 0.4],
  [0.07, 0.83, 0.22, 0.25],
  // in front: one form crossing the panel's bottom-left corner, rising up and in unevenly
  [0.196, 0.9, 0.052, 1.2],
  [-0.06, 0.35, 0.22, 0.3],
  [-0.04, 0.7, 0.24, 0.3],
  [0.19, 0.81, 0.033, 1.15],
  [0.15, 0.1, 0.09, 0.5],
  [0.21, 0.952, 0.038, 1.2],
  // behind: a lobe slipping under the panel's bottom edge
  [0.27, 1.0, 0.09, 0.3],
  [0.1, 0.45, 0.15, 0.4],
  [0.12, 0.36, 0.1, 0.4],
  [-0.1, 0.55, 0.2, 0.2],
  [0.212, 0.862, 0.019, 1.15],
  [0.12, 0.27, 0.1, 0.45],
  [0.07, 0.62, 0.16, 0.35],
]
export const OPEN_RIGHT: Slot[] = [
  [1.0, 0.36, 0.26, 0.3],
  [0.93, 0.71, 0.17, 0.2],
  // in front: one restrained intrusion at the middle of the panel's right edge
  [0.893, 0.5, 0.044, 1.15],
  [1.06, 0.6, 0.2, 0.25],
  [0.97, 0.93, 0.13, 0.3],
  [0.95, 0.07, 0.12, 0.4],
  [1.04, 0.15, 0.16, 0.2],
  [0.905, 0.52, 0.08, 0.3],
  [1.08, 0.86, 0.18, 0.2],
  [0.884, 0.57, 0.026, 1.15],
  [0.99, 0.5, 0.15, 0.4],
  [0.9, 0.86, 0.07, 0.3],
]
// The panel's place in the opening, in the same fractions: [u0, u1, v0, v1]
const PANEL: [number, number, number, number] = [0.2, 0.88, 0.06, 0.94]
export const PANEL_RADIUS = 6
// Closing an open panel when its category or Work is left (s); Work's layers exit in 0.4 s
export const PANEL_LEAVE_S = 0.38

// The panel on screen (CSS px) for a viewport, and how far it's revealed (clipped open from its
// centre line) for an entering progress
export function panelRect(width: number, height: number) {
  const [u0, u1, v0, v1] = PANEL
  return height > width
    ? { left: v0 * width, top: u0 * height, width: (v1 - v0) * width, height: (u1 - u0) * height, portrait: true }
    : { left: u0 * width, top: v0 * height, width: (u1 - u0) * width, height: (v1 - v0) * height, portrait: false }
}
export const panelReveal = (enter: number) => {
  const x = Math.min(Math.max((enter - 0.72) / 0.28, 0), 1)
  return x * x * (3 - 2 * x)
}

// Assigns each blob to a fragment so every fragment grows out of one connected region of the
// mass, on the side facing where it will settle, with the blobs shared out evenly: each
// fragment claims the blobs nearest a point on the mass's outline toward its spot. `points`
// are blob positions on screen (object units from the mass's centre); `capacity` is how many
// blobs each fragment takes.
export function assignBlobs(points: [number, number][], targets: Vec3[], capacity: number[], out: Int8Array) {
  const n = targets.length
  const seeds = targets.map(([x, y]) => {
    const l = Math.hypot(x, y) || 1
    return [(x / l) * SEED_REACH, (y / l) * SEED_REACH]
  })
  const pairs: [score: number, blob: number, group: number][] = []
  points.forEach(([x, y], i) => {
    seeds.forEach(([sx, sy], g) => pairs.push([-Math.hypot(x - sx, y - sy), i, g]))
  })
  pairs.sort((a, b) => b[0] - a[0])
  out.fill(-1)
  const filled = new Array(n).fill(0)
  for (const [, i, g] of pairs) {
    if (out[i] !== -1 || filled[g] >= capacity[g]) continue
    out[i] = g
    filled[g]++
  }
}
