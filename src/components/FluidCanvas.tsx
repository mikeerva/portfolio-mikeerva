import { useEffect, useRef } from 'react'
import { config } from '../config'
import { BLOB_COUNT, MASS, blobPressure, objectLayout, perspective, place, yawOf } from '../lib/objectStates'
import { object, type ObjectFrame } from '../lib/scene'

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
precision highp float;
uniform vec4 uBlobs[${COUNT}];
uniform vec3 uColor;
uniform float uUnit;
uniform float uSharp;
uniform float uWork;
void main() {
  vec2 p = gl_FragCoord.xy;
  float f = 0.0;
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
    float c = pow(max(r2 / d2, 1e-12), uSharp);
    f += c;
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
  float a = smoothstep(0.98, 1.02, f);
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

export type FluidMode = 'home' | 'work'
const MODES: FluidMode[] = ['home', 'work']

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
    gl.uniform3fv(gl.getUniformLocation(program, 'uColor'), hexToRgb(config.blobColor))

    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const resize = () => {
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.15 : 1
    const data = new Float32Array(COUNT * 4)
    // Per-blob weight of each mode; different rates make them arrive one after another
    const weights = MODES.map((md) => new Float32Array(COUNT).fill(modeRef.current === md ? 1 : 0))
    const eased = [0, 0]
    // Each blob follows the object's state with its own lag, so turning feels soft rather than rigid
    const lag = new Float32Array(COUNT).fill(object.progress)
    let turn = object.progress
    const out: ObjectFrame = { turn, sway: 0, tilt: 0, zoom: 1, cx: 0, cy: 0, unit: 0 }
    let zoom = modeRef.current === 'work' ? 1 : HERO_ZOOM
    let tilt = 0
    const start = performance.now()
    let raf = 0

    const frame = (now: number) => {
      const t = ((now - start) / 1000) * speed
      const w = canvas.width
      const h = canvas.height
      const m = Math.max(w, h)
      const current = modeRef.current

      const k = w / Math.max(canvas.clientWidth, 1)
      const layout = objectLayout(canvas.clientWidth, canvas.clientHeight)
      const zoomTarget = current === 'home' ? HERO_ZOOM : object.selected ? 1.2 : object.hover ? 1.05 : 1
      zoom += (zoomTarget - zoom) * 0.035
      tilt += (object.tilt - tilt) * 0.08
      // The system's shared turn; individual blobs lag around it, the typography rides it exactly
      turn += (object.progress - turn) * 0.14
      const sway = Math.sin(t * 0.23) * 0.06
      const cy = layout.cy - Math.sin(t * 0.45) * layout.unit * 0.05
      const unit = layout.unit * k * zoom
      const ocx = layout.cx * k
      const ocy = h - cy * k

      if (current === 'work' && object.onFrame) {
        Object.assign(out, { turn, sway, tilt, zoom, cx: layout.cx, cy, unit: layout.unit })
        object.onFrame(out)
      }

      let workShare = 0
      for (let i = 0; i < COUNT; i++) {
        const ph = i * 1.7
        // Work-only blobs sit inside the mass with no size in the Hero, and grow out of it
        const [bx, by, br] = BLOBS[i] ?? [0, 0, 0]

        let hx = (bx + Math.sin(t * (0.13 + (i % 5) * 0.03) + ph) * 0.05) * w
        let hy = (1 - by - Math.cos(t * (0.11 + (i % 4) * 0.035) + ph * 1.3) * 0.06) * h
        const hr = br * (1 + Math.sin(t * 0.4 + ph) * 0.1) * m

        // Work: the same mass turning; each blob trails the turn at its own rate, so the
        // mass folds and stretches a little while moving and settles back into itself.
        // Internal pressure slowly swells some lobes outward while others draw back in.
        lag[i] += (object.progress - lag[i]) * (0.1 + (i % 5) * 0.025)
        const bend = Math.sin((lag[i] - Math.floor(lag[i])) * Math.PI)
        const [mx, my, mz, mr] = MASS[i]
        const push = 1 + blobPressure(i, t) * 0.2
        const [px, py, pz] = place([mx * push, my * push, mz * push], yawOf(lag[i]) + sway, tilt)
        const ox = px * (1 + bend * 0.08) + Math.sin(t * 0.21 + ph) * 0.015
        const oy = py * (1 - bend * 0.05) + Math.cos(t * 0.17 + ph * 1.3) * 0.015
        const or = mr * 1.07 * (1 + (push - 1) * 0.8)
        const persp = perspective(pz)
        const wx = ocx + ox * persp * unit
        const wy = ocy + oy * persp * unit
        const wr = or * persp * unit
        if (i >= BLOBS.length) {
          hx = wx
          hy = wy
        }

        const rate = 0.018 + (i % 5) * 0.005
        let sum = 0
        MODES.forEach((md, j) => {
          const wt = (weights[j][i] += ((current === md ? 1 : 0) - weights[j][i]) * rate)
          eased[j] = wt * wt * (3 - 2 * wt)
          sum += eased[j]
        })
        const eh = eased[0] / sum
        const ew = eased[1] / sum
        workShare += ew / COUNT
        data[i * 4] = hx * eh + wx * ew
        data[i * 4 + 1] = hy * eh + wy * ew
        data[i * 4 + 2] = hr * eh + wr * ew
        data[i * 4 + 3] = pz * ew
      }

      // One object unit of depth, in device px
      gl.uniform1f(uUnit, unit)
      gl.uniform1f(uSharp, 1 + workShare * 0.6)
      gl.uniform1f(uWork, workShare)
      gl.uniform4fv(uBlobs, data)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-[1] size-full" />
}
