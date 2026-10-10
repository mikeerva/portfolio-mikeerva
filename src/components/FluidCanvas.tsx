import { useEffect, useRef } from 'react'
import { config, type CategoryId } from '../config'
import { BLOB_COUNT, MASS, blobPressure, objectLayout, perspective, place, yawOf } from '../lib/objectStates'
import {
  assignBlobs,
  constellation,
  MAX_PROJECTS,
  morphology,
  shareBlobs,
  type Placement,
  OPEN_LEFT,
  OPEN_RIGHT,
  openSlot,
  PANEL_LEAVE_S,
  PANEL_RADIUS,
  PANEL_Z,
  panelRect,
  panelReveal,
} from '../lib/projects'
import { object, type ObjectFrame } from '../lib/scene'
import { ABOUT_CLOSE_S, ABOUT_OPEN_AT_S, ABOUT_OPEN_S, ABOUT_SLOTS, ABOUT_SWEEP_S, aboutLayout } from '../lib/about'

// Hero layout: [x, y] as fractions of the viewport, radius as a fraction of its longer side
const BLOBS: [number, number, number][] = [
  [0.06, 0.12, 0.07],
  [0.18, 0.78, 0.09],
  [0.04, 0.55, 0.06],
  [0.33, 0.08, 0.05],
  [0.4, 0.88, 0.06],
  [0.62, 0.1, 0.08],
  [0.78, 0.55, 0.1],
  [0.92, 0.18, 0.07],
  [0.96, 0.78, 0.08],
  [0.56, 0.5, 0.06],
  [0.27, 0.42, 0.05],
  [0.8, 0.94, 0.06],
  [0.1, 0.97, 0.06],
  [0.68, 0.78, 0.05],
]
const COUNT = BLOB_COUNT
// Work object scale while in the Hero, so entering Work reads as the camera pulling back
const HERO_ZOOM = 1.8
// Dividing into project fragments: how long the selected mass rests before dividing, how long
// dividing, merging back and opening a fragment onto its project take (s), and how tightly each
// fragment gathers its part of the mass and how large its blobs become
const SETTLE_S = 0.25
const SPLIT_S = 2.2
const MERGE_S = 2.2
const ENTER_S = 3
// Each fragment's own character: when it leaves (`delay`, share of
// the division), how far its path bows sideways (`curve`) and through depth (`dip`), how far it
// carries past its spot (`over`), how much it turns on the way (`spin` in the screen plane,
// `roll` in and out of it; radians), and its living drift once there: amplitudes (object units)
// and angular rates (rad/s, periods of roughly 11–24 s) and phases, so no two move together.
const DRIFT = [
  { delay: 0.04, curve: 0.34, dip: 0.22, over: 0.12, spin: 0.32, roll: 0.2,
    x: 0.07, wx: 0.41, px: 0, y: 0.06, wy: 0.53, py: 1.3, z: 0.1, wz: 0.33, pz: 2.1,
    wr: 0.29, pr: 0.5, wq: 0.23, pq: 1.7, wb: 0.47 },
  { delay: 0, curve: -0.28, dip: -0.18, over: 0.1, spin: -0.24, roll: 0.3,
    x: 0.05, wx: 0.37, px: 2, y: 0.07, wy: 0.45, py: 0.4, z: 0.12, wz: 0.27, pz: 0.7,
    wr: 0.33, pr: 2.4, wq: 0.26, pq: 0.3, wb: 0.55 },
  { delay: 0.07, curve: 0.22, dip: 0.3, over: 0.14, spin: 0.2, roll: -0.34,
    x: 0.06, wx: 0.31, px: 4.1, y: 0.05, wy: 0.39, py: 2.8, z: 0.09, wz: 0.36, pz: 3.3,
    wr: 0.25, pr: 1.1, wq: 0.31, pq: 2.6, wb: 0.39 },
  { delay: 0.02, curve: -0.32, dip: 0.14, over: 0.09, spin: -0.3, roll: -0.18,
    x: 0.08, wx: 0.29, px: 1.2, y: 0.05, wy: 0.43, py: 3.6, z: 0.11, wz: 0.3, pz: 5.2,
    wr: 0.36, pr: 3.9, wq: 0.21, pq: 4.4, wb: 0.51 },
  { delay: 0.05, curve: 0.26, dip: -0.22, over: 0.11, spin: 0.26, roll: 0.24,
    x: 0.06, wx: 0.35, px: 5.3, y: 0.06, wy: 0.49, py: 4.9, z: 0.1, wz: 0.38, pz: 1.4,
    wr: 0.31, pr: 5.6, wq: 0.28, pq: 3.2, wb: 0.43 },
  { delay: 0.08, curve: -0.24, dip: 0.2, over: 0.13, spin: -0.22, roll: -0.28,
    x: 0.07, wx: 0.33, px: 3.4, y: 0.05, wy: 0.41, py: 5.8, z: 0.09, wz: 0.34, pz: 4.6,
    wr: 0.27, pr: 0.9, wq: 0.24, pq: 5.1, wb: 0.49 },
]
const MAX_DELAY = Math.max(...DRIFT.map((d) => d.delay))
// The swelling that starts a division: how far (object units) each region bulges toward its
// fragment, and over what share of the division it builds
const PRESSURE_OUT = 0.3
const PRESSURE_RISE = 0.3
// How much of a hovered fragment's pressure each blob takes, by blob: uneven, so some lobes
// swell much more than others and the outline changes
const SWELL = [0.35, 1, 0.55, 0.2, 0.85, 0.45, 0.7, 0.25, 0.95, 0.4, 0.6, 0.3, 0.8, 0.5]

const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
const ramp = (lo: number, hi: number, v: number) => {
  const x = Math.min(Math.max((v - lo) / (hi - lo), 0), 1)
  return x * x * (3 - 2 * x)
}
// Eases in and out but moves gently through the middle, where the necks stretch and part
const parting = (x: number) => 0.45 * x + 0.55 * smoother(x)

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// Transparent outside the mass, so DOM layers stacked under the canvas are hidden
// exactly where the mass covers them.
// Metaballs: each blob adds r²/d² to a field, and everything above 1.0 is filled,
// so nearby blobs melt into each other.
// Height R·sqrt(1 - 1/f) is an exact hemisphere for a lone blob, so its analytic
// gradient gives sphere-like normals that also stay smooth where blobs merge.
// uSharp raises each blob's contribution to a power: 1 in the Hero (classic soft
// metaballs), higher in Work so lobes stay distinct and leave creases between them.
// Height is computed from f^(1/uSharp), which keeps it an exact hemisphere per blob.
// In Work each blob is also a sphere at a depth (w, object units). The visible surface is
// the front-most of those spheres, blended by a smooth maximum, so a volume pushing toward
// the viewer really bulges out of the body, the creases where volumes meet stay soft, and
// volumes hidden behind the body don't show through. Toward the silhouette it hands over
// to the metaball normal, which owns the rim. Near volumes are lit brighter than far ones.
// uWork is 0 in the Hero, which keeps the plain metaball shading.
const FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
// How much a value changes across one screen pixel: measured directly where the GPU can, so it
// holds however the field is warped; otherwise from the field's own (unwarped) gradient
#ifdef GL_OES_standard_derivatives
#define PER_PX(v, grad) length(vec2(dFdx(v), dFdy(v)))
#else
#define PER_PX(v, grad) length(grad)
#endif
uniform vec4 uBlobs[${COUNT}];
uniform vec3 uColor;
uniform float uUnit;
uniform float uSharp;
uniform float uWork;
// An open project's panel: its rectangle (device px, GL coordinates), corner radius, how far
// it's revealed, and its depth. The panel lies under this canvas, so wherever the material
// within its rectangle is deeper than the panel, the material is cleared to show the panel in
// front; nearer lobes stay drawn over it.
uniform vec4 uPanel;
uniform float uPanelR;
uniform float uPanelA;
uniform float uPanelZ;
uniform float uTime;
uniform float uFrag;
float panelDist(vec2 p) {
  vec2 c = (uPanel.xy + uPanel.zw) * 0.5;
  vec2 q = abs(p - c) - (uPanel.zw - uPanel.xy) * 0.5 + uPanelR;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uPanelR;
}
void main() {
  vec2 p = gl_FragCoord.xy;
  // Around the panel's edges the material is warped by slow, uneven, non-repeating distortion,
  // so where it meets the panel its contour is irregular rather than made of round blob edges.
  // Elsewhere nothing changes.
  // The same warp shapes the separated project fragments, so their outlines are irregular bodies
  // rather than round blob edges
  if (uPanelA > 0.0 || uFrag > 0.0) {
    float zone = uPanelA > 0.0 ? (1.0 - smoothstep(uUnit * 0.15, uUnit * 0.75, abs(panelDist(p)))) * uPanelA : 0.0;
    zone = max(zone, uFrag);
    vec2 s = p / uUnit;
    vec2 wv = vec2(
      sin(s.y * 2.3 + s.x * 0.7 + uTime * 0.11) + 0.55 * sin(s.y * 5.1 - s.x * 3.7 - uTime * 0.07) + 0.3 * sin(s.x * 8.3 + s.y * 6.1),
      sin(s.x * 2.9 - s.y * 1.1 - uTime * 0.09) + 0.55 * sin(s.x * 4.6 + s.y * 4.2 + uTime * 0.13) + 0.3 * sin(s.y * 9.7 - s.x * 5.3)
    );
    p += wv * uUnit * 0.085 * zone;
  }
  float f = 0.0;
  float ff = 0.0;
  float fb = 0.0;
  float rw = 0.0;
  vec2 g = vec2(0.0);
  // Smooth maximum of the sphere fronts, taken relative to a height nothing exceeds.
  // Only in Work; the Hero skips it entirely.
  float k = max(uUnit * 0.3, 1.0);
  float top = uUnit * 2.5;
  float se = 0.0;
  vec2 gh = vec2(0.0);
  float sz = 0.0;
  for (int i = 0; i < ${COUNT}; i++) {
    vec4 b = uBlobs[i];
    vec2 d = p - b.xy;
    float d2 = max(dot(d, d), 1.0);
    float r2 = b.z * b.z;
    // The Hero's exponent is exactly 1: skip pow (a log and an exp per blob per pixel)
    float c = uSharp == 1.0 ? r2 / d2 : pow(max(r2 / d2, 1e-12), uSharp);
    f += c;
    ff += b.w > uPanelZ ? c : 0.0;
    fb += b.w > uPanelZ ? 0.0 : c;
    rw += c * b.z;
    g -= 2.0 * uSharp * c * d / d2;

    // A rounded cap with no rim, so blending caps never draws a seam. Never zero-sized:
    // Work-only blobs have no radius in the Hero, and dividing by it would poison every pixel.
    float R = max(b.z * 1.25, 1.0);
    float h = b.w * uUnit + R - d2 / R;
    vec2 gi = -2.0 * d / R;
    // Clamped so it can neither overflow nor vanish, whatever the frame's sizes
    float e = uWork > 0.0 ? exp(clamp((h - top) / k, -60.0, 0.0)) : 0.0;
    se += e;
    gh += e * gi;
    sz += e * b.w;
  }
  // The edge is the field's soft band (0.98–1.02), widened to at least a canvas pixel either
  // side, measured from the field's slope: drawn below the screen's density and scaled up
  // (phones), the outline stays smooth instead of stepping. Only ever widened, never narrowed,
  // so inside the mass, where the slope spikes at each blob's centre, nothing changes.
  float a = max(smoothstep(0.98, 1.02, f), smoothstep(-1.0, 1.0, (f - 1.0) / max(PER_PX(f, g), 1e-6)));
  // The near lobes' field over an open panel (below), measured here while every pixel still runs
  float lobes = ff + min(fb * 0.35, 0.45) * smoothstep(0.15, 0.5, ff);
  float lobesPx = max(PER_PX(lobes, g), 1e-6);
  if (a <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float F = pow(f, 1.0 / uSharp);
  vec2 gF = F / (uSharp * f) * g;
  float R = rw / f;
  float z = sqrt(max(1.0 - 1.0 / F, 1e-4));
  vec3 Nm = normalize(vec3(-R * gF / (2.0 * z * F * F), 1.0));
  vec3 N = Nm;
  float depth = 0.0;
  if (uWork > 0.0 && se > 0.0) {
    vec3 Nf = normalize(vec3(-gh / se, 1.0));
    depth = uWork * sz / se;
    N = normalize(mix(Nm, Nf, uWork * smoothstep(0.05, 0.55, z)));
  }
  if (uPanelA > 0.0) {
    float inside = 1.0 - smoothstep(-1.0, 1.0, panelDist(gl_FragCoord.xy));
    // Over the panel only the near lobes' own outline is drawn, so where they cross its edge
    // they keep their rounded contour. Where a near lobe is already present, the mass behind
    // lends it some of its field, so it swells out of the mass's edge instead of sitting there
    // as a separate disc; on its own, the mass behind never shows over the panel. What it lends
    // is capped, so a large mass right behind the edge can't stretch the lobe into a flat slab.
    // Its outline is widened to a pixel the same way as the mass's edge
    float behind = 1.0 - max(smoothstep(0.98, 1.02, lobes), smoothstep(-1.0, 1.0, (lobes - 1.0) / lobesPx));
    a *= 1.0 - inside * behind * uPanelA;
  }

  vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
  float rim = pow(1.0 - N.z, 3.0);
  float near = clamp(1.0 + depth * 0.35, 0.65, 1.4);
  vec3 col = uColor * (0.2 + 0.9 * diff) * near + spec * 0.45 + uColor * rim * 0.2;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error')
  return s
}

export type FluidMode = 'home' | 'work' | 'about'
const MODES: FluidMode[] = ['home', 'work', 'about']

export function FluidCanvas({ mode }: { mode: FluidMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true })
    if (!gl) return
    // For measuring the outline in screen pixels; the shader falls back without it
    gl.getExtension('OES_standard_derivatives')

    const program = gl.createProgram()!
    try {
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
    } catch (err) {
      console.warn('Fluid background unavailable', err)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uBlobs = gl.getUniformLocation(program, 'uBlobs')
    const uUnit = gl.getUniformLocation(program, 'uUnit')
    const uSharp = gl.getUniformLocation(program, 'uSharp')
    const uWork = gl.getUniformLocation(program, 'uWork')
    const uPanel = gl.getUniformLocation(program, 'uPanel')
    const uPanelR = gl.getUniformLocation(program, 'uPanelR')
    const uPanelA = gl.getUniformLocation(program, 'uPanelA')
    gl.uniform1f(gl.getUniformLocation(program, 'uPanelZ'), PANEL_Z)
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uFrag = gl.getUniformLocation(program, 'uFrag')
    gl.uniform3fv(gl.getUniformLocation(program, 'uColor'), hexToRgb(config.blobColor))

    // Render resolution (canvas px per CSS px). Every pixel runs the whole blob loop, so this is
    // what the frame costs. The material is soft enough to be drawn below the screen's density and
    // scaled up, so phones start lower, and any device that can't keep up steps down further.
    const touch = window.matchMedia('(pointer: coarse)').matches
    const maxScale = Math.min(window.devicePixelRatio, touch ? 1 : 1.5)
    const minScale = 0.75
    let scale = maxScale
    // Cached so the frame never reads layout
    let cw = 1
    let ch = 1
    const resize = () => {
      cw = Math.max(canvas.clientWidth, 1)
      ch = Math.max(canvas.clientHeight, 1)
      canvas.width = Math.round(cw * scale)
      canvas.height = Math.round(ch * scale)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    // Frame pacing: after a warm-up, two slow windows in a row lower the resolution a step
    const WINDOW = 45
    let paceFrames = 0
    let paceTime = 0
    let slowWindows = 0
    const pace = (dtMs: number, now: number) => {
      if (now - start < 2500 || scale <= minScale) return
      paceFrames++
      paceTime += dtMs
      if (paceFrames < WINDOW) return
      // Averaging over 22 ms is under ~45 fps
      slowWindows = paceTime / paceFrames > 22 ? slowWindows + 1 : 0
      paceFrames = 0
      paceTime = 0
      if (slowWindows >= 2) {
        slowWindows = 0
        scale = Math.max(minScale, scale * 0.8)
        resize()
      }
    }

    const speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.15 : 1
    const data = new Float32Array(COUNT * 4)
    // Per-blob weight of each mode; different rates make them arrive one after another
    const weights = MODES.map((md) => new Float32Array(COUNT).fill(modeRef.current === md ? 1 : 0))
    const eased = [0, 0, 0]
    // Each blob follows the object's state with its own lag, so turning feels soft rather than rigid
    const lag = new Float32Array(COUNT).fill(object.progress)
    let turn = object.progress
    const out: ObjectFrame = {
      vw: 1,
      vh: 1,
      turn,
      sway: 0,
      tilt: 0,
      zoom: 1,
      cx: 0,
      cy: 0,
      unit: 0,
      split: 0,
      enter: 0,
      fragments: new Float32Array(MAX_PROJECTS * 3),
    }
    let zoom = modeRef.current === 'work' ? 1 : HERO_ZOOM
    let tilt = 0
    const start = performance.now()
    let last = start
    let raf = 0
    let drawn = 0

    // Each blob's place in the whole mass this frame (object units; x, y, z, radius)
    const base = new Float32Array(COUNT * 4)
    // Division into project fragments: which fragment each blob belongs to, each fragment's
    // centre in the whole mass, how lifted toward the viewer it is (pointer hover), and the
    // fragment being entered. `split` and `enter` run linearly in time, 0..1, toward what the
    // route asks for, so every transition can reverse from wherever it is.
    const groupOf = new Int8Array(COUNT).fill(-1)
    let groups = 0
    const centre = new Float32Array(MAX_PROJECTS * 3)
    const members = new Float32Array(MAX_PROJECTS)
    const lift = new Float32Array(MAX_PROJECTS)
    let split = 0
    let enter = 0
    let sinceWork = modeRef.current === 'work' ? 0 : 10
    let entered = -1
    let settled = 0
    // Each blob's position on screen this frame (device px; x, y, radius), for the fragments' extents
    const screen = new Float32Array(COUNT * 3)
    // Hero: the pointer (CSS px) builds pressure in the material near it, which swells and leans
    // toward it, then eases back once it moves on. Touch only presses while touching.
    const pointer = { x: 0, y: 0, in: false }
    const heroPress = new Float32Array(COUNT)
    let pressX = 0
    let pressY = 0
    let pressSnap = true
    // For each Work-only blob, the shared volume it sinks into in the Hero
    const hostOf = new Int8Array(COUNT).fill(-1)
    let linkPull = 0
    // About: time since it was entered and since it was left (s), and how far the portrait has
    // risen open (0..1, linear)
    let wasAbout = modeRef.current === 'about'
    let aboutClock = wasAbout ? 10 : 0
    let leaveClock = 10
    let portraitOpen = wasAbout ? 1 : 0
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.in = e.pointerType !== 'touch' || e.buttons > 0
    }
    const onTouchEnd = (e: PointerEvent) => {
      if (e.pointerType === 'touch') pointer.in = false
    }
    // Leaving the window (no element to move on to)
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.in = false
    }
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('pointerup', onTouchEnd)
    window.addEventListener('pointercancel', onTouchEnd)
    document.addEventListener('pointerout', onPointerOut)
    // The category being divided, and each blob's place in its project's own shape
    // ([x, y, z, radius], fragment units before its size)
    let divided: CategoryId | null = null
    const shape = new Float32Array(COUNT * 4)
    let placements: Placement[] = []
    // Each fragment's centre on screen last frame (device px)
    const fragC = new Float32Array(MAX_PROJECTS * 2)
    // Opening a fragment: each blob's place in the opened view (index into the left slots, then
    // the right ones), and whether that's been worked out for the current opening
    const slotOf = new Int8Array(COUNT)
    let slotsFor = false
    const assignSlots = (g: number) => {
      const portrait = ch > cw
      // Along the long axis, from left (landscape) or top (portrait; GL y runs upward)
      const along = (i: number) => (portrait ? -screen[i * 3 + 1] : screen[i * 3])
      const own: number[] = []
      const rest: number[] = []
      for (let i = 0; i < COUNT; i++) (groupOf[i] === g ? own : rest).push(i)
      own.sort((a, b) => along(a) - along(b))
      const nLeft = Math.min(Math.round((own.length * 4) / 7), OPEN_LEFT.length)
      const free: number[] = []
      for (let j = 0; j < OPEN_LEFT.length + OPEN_RIGHT.length; j++) free.push(j)
      const take = (j: number) => free.splice(free.indexOf(j), 1)
      own.slice(0, nLeft).forEach((i, k) => {
        slotOf[i] = k
        take(k)
      })
      // The right side's main body takes the fragment's outermost blob
      own.slice(nLeft).reverse().forEach((i, k) => {
        slotOf[i] = OPEN_LEFT.length + k
        take(OPEN_LEFT.length + k)
      })
      rest.forEach((i, k) => (slotOf[i] = free[k % free.length]))
    }

    const frame = (now: number) => {
      const t = ((now - start) / 1000) * speed
      pace(now - last, now)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const w = canvas.width
      const h = canvas.height
      const m = Math.max(w, h)
      const current = modeRef.current
      const portrait = ch > cw

      const k = w / cw
      const layout = objectLayout(cw, ch)
      const zoomTarget = current !== 'work' ? HERO_ZOOM : object.open ? 1 : object.hover ? 1.05 : 1
      const inAbout = current === 'about'
      if (inAbout && !wasAbout) aboutClock = 0
      if (!inAbout && wasAbout) leaveClock = 0
      wasAbout = inAbout
      aboutClock += dt
      leaveClock += dt
      portraitOpen = Math.min(
        Math.max(portraitOpen + (inAbout && aboutClock > ABOUT_OPEN_AT_S ? dt / ABOUT_OPEN_S : -dt / ABOUT_CLOSE_S), 0),
        1,
      )
      const aboutReveal = portraitOpen * portraitOpen * (3 - 2 * portraitOpen)
      const frame0 = aboutLayout(cw, ch).frame
      zoom += (zoomTarget - zoom) * 0.035
      tilt += (object.tilt - tilt) * 0.08
      // A new resting orientation set without a turn: taken up at once rather than turned to
      if (object.jump) {
        object.jump = false
        turn = object.progress
        lag.fill(object.progress)
      }
      // The system's shared turn; individual blobs lag around it, the typography rides it exactly
      turn += (object.progress - turn) * 0.14
      const sway = Math.sin(t * 0.23) * 0.08
      const cy = layout.cy - Math.sin(t * 0.45) * layout.unit * 0.07
      const unit = layout.unit * k * zoom
      const ocx = layout.cx * k
      const ocy = h - cy * k

      // Work: the same mass turning; each blob trails the turn at its own rate, so the
      // mass folds and stretches a little while moving and settles back into itself.
      // Internal pressure slowly swells some lobes outward while others draw back in.
      for (let i = 0; i < COUNT; i++) {
        const ph = i * 1.7
        lag[i] += (object.progress - lag[i]) * (0.1 + (i % 5) * 0.025)
        const bend = Math.sin((lag[i] - Math.floor(lag[i])) * Math.PI)
        const [mx, my, mz, mr] = MASS[i]
        const push = 1 + blobPressure(i, t) * 0.27
        const [px, py, pz] = place([mx * push, my * push, mz * push], yawOf(lag[i]) + sway, tilt)
        base[i * 4] = px * (1 + bend * 0.08) + Math.sin(t * 0.21 + ph) * 0.025
        base[i * 4 + 1] = py * (1 - bend * 0.05) + Math.cos(t * 0.17 + ph * 1.3) * 0.025
        base[i * 4 + 2] = pz
        base[i * 4 + 3] = mr * 1.07 * (1 + (push - 1) * 0.8)
      }

      // Selected: once the mass has come to rest on the category for a moment, it divides.
      // Closed: it merges again, but only once nothing is entered.
      const atRest = Math.abs(object.progress - Math.round(object.progress)) < 0.003 && Math.abs(turn - object.progress) < 0.01
      settled = object.open && atRest ? settled + dt : 0
      if (object.open && object.projects > 0) {
        if (split === 0 && settled >= SETTLE_S && object.category) {
          // One fragment per project in the data, placed by the category's own constellation,
          // each taking a share of the mass by its weight and becoming its project's own shape
          divided = object.category
          groups = Math.min(object.projects, MAX_PROJECTS)
          const placed = constellation(divided, groups, portrait)
          const points: [number, number][] = []
          for (let i = 0; i < COUNT; i++) points.push([base[i * 4], base[i * 4 + 1]])
          assignBlobs(points, placed.map((p) => p.pos), shareBlobs(COUNT, placed), groupOf)
          for (let g = 0; g < groups; g++) {
            const own: number[] = []
            for (let i = 0; i < COUNT; i++) if (groupOf[i] === g) own.push(i)
            morphology(divided, g, own.length).forEach((b, k) => shape.set(b, own[k] * 4))
          }
          split = 1e-4
        }
        if (split > 0) split = Math.min(1, split + dt / SPLIT_S)
      } else if (enter === 0) {
        split = Math.max(0, split - dt / MERGE_S)
      }
      // A fragment starts opening: share out where every blob goes in the opened view. The
      // fragment's own blobs, ordered left to right, become the main bodies of the two sides;
      // every other blob fills the remaining lobes.
      if (object.focus >= 0 && enter === 0 && split >= 1 && (object.focus !== entered || !slotsFor)) {
        entered = object.focus
        assignSlots(entered)
        slotsFor = true
      }
      enter = Math.min(1, Math.max(0, enter + ((object.open && object.focus >= 0 && split >= 1 ? dt : -dt) / ENTER_S)))
      if (enter === 0) slotsFor = false
      if (divided) placements = constellation(divided, groups, portrait)
      const worldIndex = config.categories.findIndex((c) => c.id === divided)
      // The open view on screen (device px): screen axes for layout fractions, and the panel
      const long = portrait ? h : w
      const short = portrait ? w : h
      const rBase = Math.min(short, long * 0.625)
      const reveal = panelReveal(enter)

      centre.fill(0)
      members.fill(0)
      for (let i = 0; i < COUNT; i++) {
        const g = groupOf[i]
        if (g < 0 || g >= groups) continue
        centre[g * 3] += base[i * 4]
        centre[g * 3 + 1] += base[i * 4 + 1]
        centre[g * 3 + 2] += base[i * 4 + 2]
        members[g]++
      }
      for (let g = 0; g < groups; g++) {
        for (let a = 0; a < 3; a++) centre[g * 3 + a] /= Math.max(members[g], 1)
        // Pressure builds and releases gradually, never snapping
        lift[g] += ((object.hoverProject === g && enter === 0 && split >= 1 ? 1 : 0) - lift[g]) * 0.055
      }
      const s = split
      // The other fragments recede into the dark and are gone before their blobs regrow as lobes
      const gone = ramp(0, 0.36, enter)

      // The pressure point trails the pointer a little, so it moves through the material softly.
      // Over a Hero link it settles on the link instead, and the material nearest it draws toward
      // it harder.
      const link = current === 'home' ? object.heroLink : null
      linkPull += ((link ? 1 : 0) - linkPull) * (1 - Math.exp(-dt / 0.9))
      const pressing = pointer.in || !!link
      const gx = (link ? link.x : pointer.x) * k
      const gy = h - (link ? link.y : pointer.y) * k
      if (pressSnap && pressing) {
        pressX = gx
        pressY = gy
        pressSnap = false
      }
      const follow = 1 - Math.exp(-dt / 0.7)
      pressX += (gx - pressX) * follow
      pressY += (gy - pressY) * follow

      let workShare = 0
      for (let i = 0; i < COUNT; i++) {
        const ph = i * 1.7
        // Work-only blobs sit inside the mass with no size in the Hero, and grow out of it
        const [bx, by, br] = BLOBS[i] ?? [0, 0, 0]

        let hx = (bx + Math.sin(t * (0.13 + (i % 5) * 0.03) + ph) * 0.05) * w
        let hy = (1 - by - Math.cos(t * (0.11 + (i % 4) * 0.035) + ph * 1.3) * 0.06) * h
        let hr = br * (1 + Math.sin(t * 0.4 + ph) * 0.1) * m
        if (br > 0 && speed === 1) {
          // Builds slowly and releases more slowly still; the nearer the pointer to a volume, the
          // more it swells and leans toward it, so the outline bulges where the pointer is.
          // Measured from where the volume rests, so its own lean never feeds back into it, and the
          // lean fades out toward its centre, so it never flips as the pointer crosses it.
          const dx = pressX - hx
          const dy = pressY - hy
          const d = Math.hypot(dx, dy) || 1
          const near = pressing ? 1 - ramp(hr * 0.2, hr + m * (0.25 - 0.08 * linkPull), d) : 0
          const tau = near > heroPress[i] ? 1.4 : 2.2
          heroPress[i] += (near - heroPress[i]) * (1 - Math.exp(-dt / tau))
          const press = heroPress[i] * heroPress[i] * (3 - 2 * heroPress[i]) * (1 + 0.6 * linkPull)
          const lean = m * 0.014 * press * ramp(0, hr, d)
          hx += (dx / d) * lean
          hy += (dy / d) * lean
          hr += m * 0.015 * press
        }

        let ox = base[i * 4]
        let oy = base[i * 4 + 1]
        let oz = base[i * 4 + 2]
        let or = base[i * 4 + 3]
        // Depth the surface is shaded with; the approach toward the viewer only moves it
        let depth = oz
        const g = groupOf[i]
        if (s > 0 && g >= 0 && g < groups && placements[g]) {
          // The blob leaves its part of the mass for its place in its project's own shape, while
          // that part pulls away toward the fragment's spot in the category's constellation.
          // Blobs on the leading side go first and the trailing ones follow, so the parts stretch
          // apart on thinning necks before they part.
          const {
            pos: [px, py, pz],
            size,
          } = placements[g]
          const drift = DRIFT[(g + worldIndex * 2) % DRIFT.length]
          const spread = size
          const rx = shape[i * 4]
          const ry = shape[i * 4 + 1]
          const rz = shape[i * 4 + 2]
          const pl = Math.hypot(px, py) || 1
          const dx = px / pl
          const dy = py / pl
          const lead = Math.min(Math.max(0.5 + ((ox * px + oy * py) / pl) * 0.45, 0), 1)
          // Small blobs move with their region rather than ahead of or behind it, so none of them
          // shows as a separate bead or a late droplet
          const heft = Math.min(Math.max(base[i * 4 + 3] / 0.4, 0.35), 1)
          const delay = (1 - lead) * 0.38 * heft + drift.delay
          const si = parting(Math.min(Math.max((s - delay) / (1 - 0.38 - MAX_DELAY), 0), 1))

          // Like a droplet leaving a liquid body: it curves sideways and through depth on its way
          // out, carries a little past its spot and drifts back into it, each fragment its own way.
          // Its living drift is already under way as it arrives, so it never comes to a stop.
          const arc = Math.sin(Math.PI * si)
          const past = Math.sin(Math.PI * Math.min(Math.max((si - 0.5) / 0.5, 0), 1)) ** 2
          const live = si
          const tx = px - dy * drift.curve * arc + dx * drift.over * past + drift.x * Math.sin(t * drift.wx + drift.px) * live
          const ty = py + dx * drift.curve * arc + dy * drift.over * past + drift.y * Math.sin(t * drift.wy + drift.py) * live
          const tz = pz + drift.dip * arc + drift.z * Math.sin(t * drift.wz + drift.pz) * live
          // ...and it turns as it goes, keeping a slow sway in and out of the screen plane
          const turnZ = drift.spin * si + 0.12 * Math.sin(t * drift.wr + drift.pr) * live
          const turnY = drift.roll * si + 0.16 * Math.sin(t * drift.wq + drift.pq) * live
          const cz = Math.cos(turnZ)
          const sz = Math.sin(turnZ)
          const cyw = Math.cos(turnY)
          const syw = Math.sin(turnY)
          let qx = rx * cz - ry * sz
          const qy = rx * sz + ry * cz
          let qz = rz
          ;[qx, qz] = [qx * cyw + qz * syw, -qx * syw + qz * cyw]

          // Hover: internal pressure. It gathers in one or two lobes of the fragment, which inflate,
          // push outward and toward the viewer and stir a little, while the rest of the body
          // barely changes, so the outline itself changes rather than the same shape getting bigger
          const share = SWELL[i % SWELL.length]
          const swell = lift[g] * share * share * share
          const stir = 1 + 0.05 * swell * Math.sin(t * 1.3 + i * 2.1)
          const pushOut = 1 + 0.4 * swell
          const breathe = 1 + 0.035 * Math.sin(t * drift.wb + i * 1.3) * live
          // Internal pressure comes first: while the mass is still one body, each region bulges
          // out toward where its fragment will go, most on its outer side, so every side of the
          // outline swells into lobes before anything leaves
          const press = smoother(Math.min(s / PRESSURE_RISE, 1)) * lead * heft
          ox += dx * PRESSURE_OUT * press
          oy += dy * PRESSURE_OUT * press
          or *= 1 + 0.12 * press
          ox += (tx + qx * spread * pushOut - ox) * si
          oy += (ty + qy * spread * pushOut - oy) * si
          oz += (tz + qz * spread * pushOut + 0.4 * swell - oz) * si
          or += (shape[i * 4 + 3] * size * (1 + 0.45 * swell) * stir * breathe - or) * si
          depth = oz
          if (gone > 0 && g !== entered) {
            oz -= 2 * gone
            or *= 1 - gone
            depth = oz
          }
        }
        const persp = perspective(Math.min(oz, 4))
        let wx = ocx + ox * persp * unit
        let wy = ocy + oy * persp * unit
        let wr = or * persp * unit

        // Opening onto the project, in screen space. The entered fragment holds a moment, then
        // stretches across the middle of the view, tears, and its two sides travel out to the
        // large uneven masses either side of the opening. The other blobs, once gone, grow back
        // as lobes inside those masses. Every slot keeps its own slow life.
        if (enter > 0 && slotsFor && g >= 0 && g < groups) {
          const [su, sv, sr, sd] = openSlot(slotOf[i], portrait)
          const u = su + 0.006 * Math.sin(t * (0.21 + 0.013 * i) + i * 1.7)
          const v = sv + 0.009 * Math.cos(t * (0.17 + 0.011 * i) + i * 2.3)
          const lx = portrait ? v * w : u * w
          const ly = h - (portrait ? u * h : v * h)
          const lr = sr * rBase * (1 + 0.05 * Math.sin(t * (0.23 + 0.01 * i) + i) + 0.14 * blobPressure(i, t))
          if (g === entered) {
            // Stretched: drawn out along the long axis around the middle of the view
            const fx = fragC[g * 2]
            const fy = fragC[g * 2 + 1]
            const stretchX = portrait ? w / 2 + (wx - fx) * 0.85 : w / 2 + (wx - fx) * 3.2
            const stretchY = portrait ? h / 2 + (wy - fy) * 3.2 : h / 2 + (wy - fy) * 0.85
            const stagger = ((i * 37) % 7) * 0.012
            const a = ramp(0.08 + stagger, 0.42 + stagger, enter)
            const b = ramp(0.36 + stagger, 0.88 + stagger, enter)
            wx += (stretchX - wx) * a
            wy += (stretchY - wy) * a
            wr *= 1 + 0.55 * a
            wx += (lx - wx) * b
            wy += (ly - wy) * b
            wr += (lr - wr) * b
            depth += (sd - depth) * b
          } else if (enter > 0.36) {
            // Pushes out from inside its side's main body to its own lobe, as internal pressure.
            // It hands over from its fragment's spot while it has no size either side (0.36–0.44),
            // since its position still leaks into whatever it's blended with (e.g. the Hero)
            const [au, av] = openSlot(slotOf[i] < OPEN_LEFT.length ? 0 : OPEN_LEFT.length, portrait)
            const ax = portrait ? av * w : au * w
            const ay = h - (portrait ? au * h : av * h)
            const grow = ramp(0.6 + ((i * 29) % 9) * 0.012, 0.98, enter)
            const hand = ramp(0.36, 0.44, enter)
            wx += (ax + (lx - ax) * grow - wx) * hand
            wy += (ay + (ly - ay) * grow - wy) * hand
            wr += (lr * grow - wr) * hand
            depth += (sd - depth) * hand
          }
        }
        screen[i * 3] = wx
        screen[i * 3 + 1] = wy
        screen[i * 3 + 2] = wr

        // About: its place around the portrait's frame, with the same slow life as an opened
        // project's lobes
        const [su, sv, sr, sd] = ABOUT_SLOTS[i]
        const ax = (frame0.left + (su + 0.012 * Math.sin(t * (0.21 + 0.013 * i) + i * 1.7)) * frame0.width) * k
        const ay = h - (frame0.top + (sv + 0.015 * Math.cos(t * (0.17 + 0.011 * i) + i * 2.3)) * frame0.height) * k
        const ar = sr * frame0.height * k * (1 + 0.05 * Math.sin(t * (0.23 + 0.01 * i) + i) + 0.14 * blobPressure(i, t))

        if (i >= BLOBS.length) {
          // Work-only: it belongs to the shared volume it sits in within the Work mass (chosen
          // while fully in Work, kept through any transition), and in the Hero it sits at that
          // volume's centre as drawn this frame. So leaving Work it travels inside its volume and
          // shrinks into it (and grows out of it the other way), never lingering or flying off
          // as a droplet. About's own blobs do the same with their place there.
          const inA = weights[2][i] > weights[1][i]
          if (hostOf[i] < 0 || weights[1][i] > 0.999 || weights[2][i] > 0.999) {
            let best = Infinity
            for (let j = 0; j < BLOBS.length; j++) {
              const s = Math.hypot((inA ? ax : wx) - data[j * 4], (inA ? ay : wy) - data[j * 4 + 1]) - data[j * 4 + 2]
              if (s < best) {
                best = s
                hostOf[i] = j
              }
            }
          }
          hx = data[hostOf[i] * 4]
          hy = data[hostOf[i] * 4 + 1]
        }

        // The About sweep: entering, a volume waits until the sweep has reached where it is in the
        // Hero, so the left of the screen gathers first; leaving, the portrait closes first and
        // the volumes let go from the right
        const heroX = (BLOBS[i] ?? BLOBS[Math.max(hostOf[i], 0)])[0]
        const hold = inAbout
          ? aboutClock < heroX * ABOUT_SWEEP_S
          : weights[2][i] > 0.001 && leaveClock < ABOUT_CLOSE_S * 0.6 + (1 - heroX) * ABOUT_SWEEP_S * 0.6
        const rate = 0.018 + (i % 5) * 0.005
        let sum = 0
        MODES.forEach((md, j) => {
          const wt = hold ? weights[j][i] : (weights[j][i] += ((current === md ? 1 : 0) - weights[j][i]) * rate)
          eased[j] = wt * wt * (3 - 2 * wt)
          sum += eased[j]
        })
        const eh = eased[0] / sum
        const ew = eased[1] / sum
        const ea = eased[2] / sum
        // Away from the Hero: in Work, in About, or between the two
        const away = ew + ea
        const fx = away > 1e-6 ? (wx * ew + ax * ea) / away : wx
        const fy = away > 1e-6 ? (wy * ew + ay * ea) / away : wy
        const fDepth = depth * ew + sd * ea
        workShare += away / COUNT
        data[i * 4] = hx * eh + fx * away
        data[i * 4 + 1] = hy * eh + fy * away
        data[i * 4 + 2] = hr * eh + wr * ew + ar * ea
        data[i * 4 + 3] = fDepth
        if (i >= BLOBS.length) {
          // Work-only blobs reach their volume's centre (and depth) early, while still large and
          // merged with it, and only then shrink away there, where they leave no mark (small
          // anywhere else, they show as a bead or a pinpoint dimple)
          const stay = away * away * away
          const hostDepth = data[hostOf[i] * 4 + 3]
          data[i * 4] = hx + (fx - hx) * stay
          data[i * 4 + 1] = hy + (fy - hy) * stay
          data[i * 4 + 3] = hostDepth + (fDepth - hostDepth) * stay
        }
      }

      // Also while leaving Work: its layers ride the frame until they've faded out and unmounted
      if (current === 'work' || object.onFrame || object.onProjectsFrame) {
        // Each fragment on screen (CSS px): radius-weighted centre and a rough extent
        const f = out.fragments
        f.fill(0)
        for (let g = 0; g < groups; g++) {
          let sx = 0
          let sy = 0
          let sw = 0
          for (let i = 0; i < COUNT; i++) {
            if (groupOf[i] !== g) continue
            sx += screen[i * 3] * screen[i * 3 + 2]
            sy += screen[i * 3 + 1] * screen[i * 3 + 2]
            sw += screen[i * 3 + 2]
          }
          const fx = sx / Math.max(sw, 1e-6)
          const fy = sy / Math.max(sw, 1e-6)
          let r = 0
          for (let i = 0; i < COUNT; i++) {
            if (groupOf[i] !== g) continue
            r = Math.max(r, Math.hypot(screen[i * 3] - fx, screen[i * 3 + 1] - fy) + screen[i * 3 + 2] * 0.8)
          }
          f[g * 3] = fx / k
          f[g * 3 + 1] = (h - fy) / k
          f[g * 3 + 2] = r / k
          // Where the fragment was before any opening moved it, for its stretch
          if (enter === 0) {
            fragC[g * 2] = fx
            fragC[g * 2 + 1] = fy
          }
        }
        Object.assign(out, { vw: cw, vh: ch, turn, sway, tilt, zoom, cx: layout.cx, cy, unit: layout.unit, split, enter })
        object.onFrame?.(out)
        object.onProjectsFrame?.(out)
      }

      // One object unit of depth, in device px
      gl.uniform1f(uUnit, unit)
      // Back in the Hero the Work weights only approach zero; snap them, so the shader's
      // Hero-only shortcuts apply
      if (workShare < 1e-3) workShare = 0
      gl.uniform1f(uSharp, 1 + workShare * 0.6)
      gl.uniform1f(uWork, workShare)
      // Leaving Work or the category: the panel and its cut-out close back into their centre line
      // together (Projects closes the panel on the same curve), so no gap or dimmed material shows
      sinceWork = current === 'work' && object.open ? 0 : sinceWork + dt
      const open = Math.min(reveal, 1 - ramp(0, PANEL_LEAVE_S, sinceWork))
      // The panel as revealed so far: it opens from its centre line outward along the long axis
      if (aboutReveal > 0) {
        // About's portrait takes the panel's place in the material: the same cut-out, rising
        // open from the frame's bottom edge
        const top = frame0.top + frame0.height * (1 - aboutReveal)
        gl.uniform4f(uPanel, frame0.left * k, h - (frame0.top + frame0.height) * k, (frame0.left + frame0.width) * k, h - top * k)
        gl.uniform1f(uPanelA, ramp(0, 0.08, aboutReveal))
      } else {
        const pr = panelRect(cw, ch)
        const clipX = pr.portrait ? 0 : (pr.width * (1 - open)) / 2
        const clipY = pr.portrait ? (pr.height * (1 - open)) / 2 : 0
        gl.uniform4f(
          uPanel,
          (pr.left + clipX) * k,
          h - (pr.top + pr.height - clipY) * k,
          (pr.left + pr.width - clipX) * k,
          h - (pr.top + clipY) * k,
        )
        // The last sliver of a closing cut-out fades rather than lingering as a hairline
        gl.uniform1f(uPanelA, reveal * (sinceWork > 0 ? ramp(0, 0.08, open) : 1))
      }
      object.onAboutFrame?.(aboutReveal)
      gl.uniform1f(uPanelR, PANEL_RADIUS * k)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uFrag, ramp(0.5, 1, split) * (1 - ramp(0.05, 0.4, enter)) * workShare)
      gl.uniform4fv(uBlobs, data)
      // Hidden under the loading screen or the open menu, it holds its last frame. A few frames
      // are always drawn, so the shader is compiled and warm before anything is shown.
      drawn++
      if (!(object.covered || object.menuCovered) || drawn < 4) gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointerup', onTouchEnd)
      window.removeEventListener('pointercancel', onTouchEnd)
      document.removeEventListener('pointerout', onPointerOut)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-[1] size-full" />
}
