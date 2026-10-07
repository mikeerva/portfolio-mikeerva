import { DRIFT } from './config'

// The one particle population DRIFT is made of, and the forces that move it.
//
// Every particle has a rest position that is itself alive: its place in the FLOW composition
// carried by slow travelling waves, or, as FORM comes in, its place in the word. A spring pulls
// it toward that rest; drag bleeds energy; the cursor adds forces (never positions). Every input
// only changes forces, so moving, holding, dragging and letting go are one system, not effects.
// Plain typed arrays and one loop: no allocation per frame.

export interface Pointer {
  active: boolean // over the stage
  down: boolean
  // camera position and the cursor's ray (unit direction), world space
  ox: number
  oy: number
  oz: number
  dx: number
  dy: number
  dz: number
  // the cursor's smoothed velocity on the interaction plane, and its speed
  vx: number
  vy: number
  speed: number
  presence: number // 0..1: a cursor that stops moving fades out of the field
  charge: number // 0..1, tension built by holding
  release: number // tension being let go this frame (consumed by the step)
}

export interface Controls {
  gravity: number // 0..2, the pull back to rest
  flow: number // 0..2, the ambient field
  noise: number // 0..2, turbulence
}

export interface Phase {
  form: number // 0..1, how far the rest positions have become the word
  calm: number // 0..1, the settling at the end
  gentle: number // 1, or less for reduced motion
}

// Small seeded generator, so the composition is the same on every visit
function rng(seed: number) {
  let h = seed >>> 0
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Three loose currents with uneven thickness, and a sparse dust through the whole volume
const CURRENTS = [
  { share: 0.33, y: 1.45, amp: 0.55, freq: 0.55, phase: 0.4, thick: 0.24, z: -0.6, zs: 1.0 },
  { share: 0.31, y: -0.35, amp: 0.85, freq: 0.38, phase: 2.1, thick: 0.36, z: 0.35, zs: 1.2 },
  { share: 0.22, y: -2.1, amp: 0.45, freq: 0.7, phase: 4.0, thick: 0.2, z: -1.7, zs: 0.9 },
]

export class Field {
  readonly count: number
  active: number
  readonly base: Float32Array
  readonly form: Float32Array
  // 1: holds the letterform; 2: halo, the same word loosened into depth around it
  readonly role: Uint8Array
  // when this particle joins the word (0..1), shared by its neighbours so organisation travels
  readonly delay: Float32Array
  readonly pos: Float32Array
  readonly vel: Float32Array
  readonly seed: Float32Array
  readonly tear: Float32Array
  readonly speed: Float32Array
  hasWord = false
  // the word's half extents in the world, for knowing when a gesture is inside it
  readonly box = { w: 0, h: 0 }

  constructor(count: number) {
    this.count = this.active = count
    this.base = new Float32Array(count * 3)
    this.form = new Float32Array(count * 3)
    this.role = new Uint8Array(count)
    this.delay = new Float32Array(count)
    this.pos = new Float32Array(count * 3)
    this.vel = new Float32Array(count * 3)
    this.seed = new Float32Array(count)
    this.tear = new Float32Array(count)
    this.speed = new Float32Array(count)
    this.compose()
  }

  private compose() {
    const r = rng(7)
    const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(Math.PI * 2 * r())
    const { base, pos, seed, role, delay, count } = this
    for (let i = 0; i < count; i++) {
      const pick = r()
      let x: number, y: number, z: number
      let acc = 0
      const c = CURRENTS.find((cur) => (acc += cur.share) > pick)
      if (c) {
        x = (r() * 2 - 1) * 8.5
        const swell = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(x * 0.6 + c.phase * 1.7))
        y = c.y + c.amp * Math.sin(x * c.freq + c.phase) + gauss() * c.thick * swell
        z = c.z + gauss() * c.zs * 0.6
      } else {
        x = (r() * 2 - 1) * 8.5
        y = (r() * 2 - 1) * 4.2
        z = -6 + r() * 8.5
      }
      base[i * 3] = pos[i * 3] = x
      base[i * 3 + 1] = pos[i * 3 + 1] = y
      base[i * 3 + 2] = pos[i * 3 + 2] = z
      seed[i] = r()
      role[i] = r() < DRIFT.form.halo ? 2 : 1
      // slow waves across the field decide who organises first; a little personal variation
      const wave = 0.5 + 0.5 * Math.sin(x * 0.42 + y * 0.9 + 1.3) * Math.cos(y * 0.35 - x * 0.12)
      delay[i] = Math.min(1, Math.max(0, wave * 0.8 + seed[i] * 0.2))
    }
  }

  // The word's points (x, y pairs, normalised to the word's width) scaled into the world, and
  // every particle given one of them. Runs on load and on resize only.
  //
  // Targets: the glyph samples in a fixed shuffled order, so any number of particles covers the
  // letters evenly (and a device that sheds particles keeps an even word).
  // Assignment: particles and targets are both ranked left to right and cut into matching
  // columns, then ranked by height inside each column. Neighbours in the field become neighbours
  // in the word, so forming reads as currents converging, never as everything crossing everything.
  setWord(points: Float32Array, width: number) {
    const n = points.length / 2
    if (!n) return
    const { form, role, base, seed, count } = this
    const r = rng(11)
    const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(Math.PI * 2 * r())
    const order = new Uint32Array(n)
    for (let k = 0; k < n; k++) order[k] = k
    for (let k = n - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1))
      const t = order[k]
      order[k] = order[j]
      order[j] = t
    }
    const tx = new Float32Array(count)
    const ty = new Float32Array(count)
    const jitter = 0.0035 * width
    for (let i = 0; i < count; i++) {
      const k = order[i % n]
      tx[i] = points[k * 2] * width + (r() - 0.5) * jitter
      ty[i] = points[k * 2 + 1] * width + (r() - 0.5) * jitter
    }

    const parts = Array.from({ length: count }, (_, i) => i).sort((a, b) => base[a * 3] - base[b * 3])
    const targets = Array.from({ length: count }, (_, i) => i).sort((a, b) => tx[a] - tx[b])
    const columns = 40
    const per = Math.ceil(count / columns)
    for (let c = 0; c < columns; c++) {
      const ps = parts.slice(c * per, (c + 1) * per).sort((a, b) => base[a * 3 + 1] - base[b * 3 + 1])
      const ts = targets.slice(c * per, (c + 1) * per).sort((a, b) => ty[a] - ty[b])
      for (let k = 0; k < ps.length; k++) {
        const i = ps[k]
        const t = ts[k]
        const i3 = i * 3
        // a shallow volume: the plane bends a little across the word, each point near it
        let z = 0.14 * Math.sin(tx[t] * 0.9 + ty[t] * 0.6) + (seed[i] - 0.5) * 0.22
        let x = tx[t]
        let y = ty[t]
        if (role[i] === 2) {
          // halo: the same place in the word, loosened and pushed into depth
          x += gauss() * 0.06 * width
          y += gauss() * 0.05 * width
          z += gauss() * 1.1
        }
        form[i3] = x
        form[i3 + 1] = y
        form[i3 + 2] = z
      }
    }
    let h = 0
    for (let k = 1; k < points.length; k += 2) h = Math.max(h, Math.abs(points[k]))
    this.box.w = width / 2
    this.box.h = h * width
    this.hasWord = true
  }

  // RELEASE: the structure lets go. Every particle is handed the gesture's momentum (strongest
  // near where it broke, never zero), a little spread across it and into depth, and its spring
  // is loosened so it travels before the field takes it back. Not a radial burst: it all goes
  // the way the hand went.
  scatter(dirX: number, dirY: number, power: number, cx: number, cy: number) {
    const len = Math.hypot(dirX, dirY) || 1
    const ux = dirX / len
    const uy = dirY / len
    const { pos, vel, seed, tear, active } = this
    for (let i = 0; i < active; i++) {
      const i3 = i * 3
      const dx = pos[i3] - cx
      const dy = pos[i3 + 1] - cy
      const near = Math.exp(-(dx * dx + dy * dy) / 6)
      const s = seed[i]
      const s2 = (s * 7.31) % 1
      const s3 = (s * 13.77) % 1
      // most of the push where the hand broke it; elsewhere the word mostly loosens and spreads
      const along = power * (0.12 + 0.88 * near) * (0.3 + 1.4 * s)
      const across = power * (s2 - 0.5) * (0.7 + 0.6 * near)
      // away from the line of the gesture, so it opens rather than travels as a block
      const side = (dy * ux - dx * uy) >= 0 ? 1 : -1
      const open = power * 0.35 * near * side
      vel[i3] += ux * along - uy * (across + open)
      vel[i3 + 1] += uy * along + ux * (across + open)
      vel[i3 + 2] += power * 0.8 * (s3 - 0.5)
      tear[i] = Math.max(tear[i], 0.6 + 0.8 * near)
    }
  }

  step(dt: number, t: number, p: Pointer, c: Controls, ph: Phase) {
    const P = DRIFT.pointer
    const { base, form, role, delay, pos, vel, seed, tear, speed, active } = this
    const g = ph.gentle
    const calm = ph.calm
    const ampFlow = DRIFT.flow.amplitude * c.flow * (1 - calm * 0.45) * (0.4 + 0.6 * g)
    const noise = DRIFT.turbulence * c.noise * (1 - calm * 0.6) * g
    const formOn = this.hasWord ? ph.form : 0
    // the field senses structure before any letter shows: its own motion quietens first
    const quiet = 1 - 0.78 * Math.min(formOn * 1.6, 1)
    const spring = DRIFT.spring * (0.35 + 0.65 * c.gravity)
    const damp = Math.exp(-DRIFT.damping * (1 + calm * 0.5) * dt)
    const tearDecay = Math.exp(-DRIFT.tear.recovery * dt)
    const ts = t * DRIFT.flow.speed
    const T1 = ts * 0.21, T2 = ts * 0.13, T3 = ts * 0.17, T4 = ts * 0.11, T5 = ts * 0.12

    // The cursor's field, sized by how fast it moves
    const R = Math.min(P.radius + p.speed * P.radiusPerSpeed, P.radiusMax)
    const R2 = R * R
    const reach = R * P.attractReach
    const reach2 = reach * reach
    const hold = R * 1.6
    const hold2 = hold * hold
    const free = R * 1.9
    const free2 = free * free
    const live = (p.active && p.presence > 0.01) || p.charge > 0 || p.release > 0
    const here = p.presence
    // in the word, a gesture deforms along its direction more than it pushes outward
    const push = P.displace * (p.down ? 0.15 : 0.12 + 0.88 * Math.min(p.speed / 3, 1)) * g * here * (1 - 0.45 * formOn)
    const pull = P.attract * g * here
    const brush = (p.down ? P.dragImpulse : P.impulse) * g * (1 + 0.7 * formOn)
    const gather = P.gather * p.charge * g
    const swirl = P.swirl * p.charge * g
    const release = p.release * g
    const tearGain = DRIFT.tear.gain * formOn

    for (let i = 0; i < active; i++) {
      const i3 = i * 3
      const bx = base[i3], by = base[i3 + 1], bz = base[i3 + 2]
      const s = seed[i]
      const sp = s * 0.8
      const amp = ampFlow * (role[i] === 2 ? 0.5 + 0.5 * quiet : quiet)

      // Rest: the composition carried by the field...
      let tx = bx + amp * (0.8 * Math.sin(by * 0.55 + T1 + sp) + 0.45 * Math.sin(bz * 0.8 + T2))
      let ty = by + amp * (0.75 * Math.sin(bx * 0.42 + T3 + sp * 1.3) + 0.35 * Math.cos(bz * 0.6 - T4))
      let tz = bz + amp * 1.1 * Math.sin(bx * 0.3 + by * 0.4 + T5)
      // ...or, as FORM arrives, the word: each particle joins when the wave reaches it, then holds
      // its place while still breathing a little with the field
      let settled = 0
      if (formOn > 0) {
        let kf = (formOn - delay[i] * 0.42) / 0.58
        kf = kf < 0 ? 0 : kf > 1 ? 1 : kf
        if (kf > 0) {
          const e = kf * kf * (3 - 2 * kf)
          settled = role[i] === 1 ? e : e * 0.4
          const fx = form[i3] + (tx - bx) * 0.05
          const fy = form[i3 + 1] + (ty - by) * 0.05
          const fz = form[i3 + 2] + (tz - bz) * 0.08
          tx += (fx - tx) * e
          ty += (fy - ty) * e
          tz += (fz - tz) * e
        }
      }

      let px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2]
      let vx = vel[i3], vy = vel[i3 + 1], vz = vel[i3 + 2]

      // Return: firmer once a particle holds its place in the word, loosened while torn
      const k = (spring * (1 + settled * 1.6)) / (1 + tear[i] * DRIFT.tear.softness)
      let ax = (tx - px) * k
      let ay = (ty - py) * k
      let az = (tz - pz) * k

      // Turbulence
      // Turbulence, all but gone once a particle holds its place in the word
      const nz0 = noise * (1 - settled * 0.92)
      if (nz0 > 0) {
        ax += nz0 * Math.sin(py * 1.7 + t * 0.9 + s * 3)
        ay += nz0 * Math.sin(px * 1.9 - t * 0.8 + s * 2)
        az += nz0 * 0.6 * Math.sin((px + py) * 1.3 + t * 0.7)
      }

      // The cursor: distance to its ray, so every depth under it feels it, nearer ones more
      if (live) {
        const wx = px - p.ox, wy = py - p.oy, wz = pz - p.oz
        const along = wx * p.dx + wy * p.dy + wz * p.dz
        const qx = wx - p.dx * along, qy = wy - p.dy * along, qz = wz - p.dz * along
        const r2 = qx * qx + qy * qy + qz * qz
        const far = r2 > reach2 && r2 > free2
        if (!far) {
          const r = Math.sqrt(r2) + 1e-4
          const nx = -qx / r, ny = -qy / r, nz = -qz / r // toward the ray
          const depth = 1 / (1 + pz * pz * 0.12)
          // medium range: the field leans in
          if (p.active && r2 < reach2) {
            const f = 1 - r2 / reach2
            const fa = f * f * pull * depth
            ax += nx * fa
            ay += ny * fa
            az += nz * fa
          }
          // close: pushed off the ray, and handed the gesture's momentum
          if (p.active && r2 < R2) {
            const q = 1 - r2 / R2
            const f = q * q * depth
            ax -= nx * push * f
            ay -= ny * push * f
            az -= nz * push * f
            ax += p.vx * brush * f
            ay += p.vy * brush * f
            if (tearGain > 0) tear[i] += f * p.speed * tearGain * dt * 10
          }
          // held: the local field draws in and twists, storing tension
          if (gather > 0 && r2 < hold2) {
            const q = 1 - r2 / hold2
            const f = q * q * depth
            ax += nx * gather * f + (p.dy * nz - p.dz * ny) * swirl * f
            ay += ny * gather * f + (p.dz * nx - p.dx * nz) * swirl * f
            az += nz * gather * f + (p.dx * ny - p.dy * nx) * swirl * f
          }
          // let go: the stored tension returns as velocity, along the gesture
          if (release > 0 && r2 < free2) {
            const q = 1 - r2 / free2
            const f = q * q * depth
            vx += (-nx * release + p.vx * 0.35) * f
            vy += (-ny * release + p.vy * 0.35) * f
            vz += -nz * release * f
            if (tearGain > 0) tear[i] += f * release * DRIFT.tear.gain * 3
          }
        }
      }

      vx = (vx + ax * dt) * damp
      vy = (vy + ay * dt) * damp
      vz = (vz + az * dt) * damp
      px += vx * dt
      py += vy * dt
      pz += vz * dt
      pos[i3] = px
      pos[i3 + 1] = py
      pos[i3 + 2] = pz
      vel[i3] = vx
      vel[i3 + 1] = vy
      vel[i3 + 2] = vz
      const v = Math.sqrt(vx * vx + vy * vy + vz * vz) * 0.33
      speed[i] = v > 1 ? 1 : v
      if (tear[i] > 0) tear[i] = tear[i] > 3 ? 3 : tear[i] * tearDecay
    }
    p.release = 0
  }
}
