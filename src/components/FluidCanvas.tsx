import { useEffect, useRef } from 'react'
import { config } from '../config'
import { scene } from '../lib/scene'

// [x, y] as fractions of the viewport, radius as a fraction of its longer side
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
const COUNT = BLOBS.length
const SATELLITES = 3
// Centre of the work-view clump, as fractions of the viewport (from top-left)
const CLUSTER = [0.78, 0.62]

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// Metaballs: each blob adds r²/d² to a field, and everything above 1.0 is filled,
// so nearby blobs melt into each other.
// Height R·sqrt(1 - 1/f) is an exact hemisphere for a lone blob, so its analytic
// gradient gives sphere-like normals that also stay smooth where blobs merge.
const FRAG = `
precision highp float;
const vec3 BG = vec3(${(0x19 / 255).toFixed(4)}); // #191919, matches --color-bg
uniform vec3 uBlobs[${COUNT}];
uniform vec3 uColor;
void main() {
  vec2 p = gl_FragCoord.xy;
  float f = 0.0;
  float rw = 0.0;
  vec2 g = vec2(0.0);
  for (int i = 0; i < ${COUNT}; i++) {
    vec2 d = p - uBlobs[i].xy;
    float d2 = max(dot(d, d), 1.0);
    float c = uBlobs[i].z * uBlobs[i].z / d2;
    f += c;
    rw += c * uBlobs[i].z;
    g -= 2.0 * c * d / d2;
  }
  float a = smoothstep(0.98, 1.02, f);
  if (a <= 0.0) {
    gl_FragColor = vec4(BG, 1.0);
    return;
  }

  float R = rw / f;
  float z = sqrt(max(1.0 - 1.0 / f, 1e-4));
  vec3 N = normalize(vec3(-R * g / (2.0 * z * f * f), 1.0));

  vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);
  float rim = pow(1.0 - N.z, 3.0);
  vec3 col = uColor * (0.15 + 0.95 * diff) + spec * 0.45 + uColor * rim * 0.2;
  gl_FragColor = vec4(mix(BG, col, a), 1.0);
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

function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => v + (b[i] - v) * t)
}

export type FluidMode = 'home' | 'work' | 'slider'
const MODES: FluidMode[] = ['home', 'work', 'slider']

export function FluidCanvas({ mode }: { mode: FluidMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modeRef = useRef(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
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
    const uColor = gl.getUniformLocation(program, 'uColor')
    const baseColor = hexToRgb(config.blobColor)
    let color = baseColor
    let parallax = 0

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
    const data = new Float32Array(COUNT * 3)
    // Per-blob weight of each mode; different rates make them arrive one after another
    const weights = MODES.map((md) => new Float32Array(COUNT).fill(modeRef.current === md ? 1 : 0))
    const eased = [0, 0, 0]
    const start = performance.now()
    let raf = 0

    const frame = (now: number) => {
      const t = ((now - start) / 1000) * speed
      const w = canvas.width
      const h = canvas.height
      const m = Math.max(w, h)
      const s = Math.min(w, h)
      const current = modeRef.current
      const cx = CLUSTER[0] * w
      const cy = (1 - CLUSTER[1]) * h

      const n = scene.colors.length
      const pos = n ? Math.min(Math.max(scene.position, 0), n - 1) : 0
      let targetColor = baseColor
      if (current === 'slider' && n) {
        const a = Math.floor(pos)
        const b = Math.min(a + 1, n - 1)
        targetColor = mix(hexToRgb(scene.colors[a]), hexToRgb(scene.colors[b]), pos - a)
      }
      color = mix(color, targetColor, 0.06)
      // Pieces drift against the drag direction, nearer (bigger) ones further.
      // Eased so the slider writing its state on mount doesn't make them jump.
      const targetParallax = n ? (pos - (n - 1) / 2) * 0.07 * w : 0
      parallax += (targetParallax - parallax) * 0.08

      BLOBS.forEach(([bx, by, br], i) => {
        const ph = i * 1.7

        const hx = (bx + Math.sin(t * (0.13 + (i % 5) * 0.03) + ph) * 0.05) * w
        const hy = (1 - by - Math.cos(t * (0.11 + (i % 4) * 0.035) + ph * 1.3) * 0.06) * h
        const hr = br * (1 + Math.sin(t * 0.4 + ph) * 0.1) * m

        // Work: a tight, slowly swirling clump; the last few drift around it as droplets
        const satellite = i >= COUNT - SATELLITES
        const ang = i * 2.39996 + t * (satellite ? 0.22 : 0.15)
        const dist = (satellite ? 0.24 + (i % 2) * 0.05 : Math.sqrt(i / COUNT) * 0.13) * s
        const wob = 0.014 * s
        const wx = cx + Math.cos(ang) * dist + Math.sin(t * 0.9 + ph) * wob
        const wy = cy + Math.sin(ang) * dist + Math.cos(t * 0.8 + ph * 1.3) * wob
        const wr = (satellite ? 0.028 : 0.042 + (i % 4) * 0.012) * s * (1 + Math.sin(t * 1.1 + ph) * 0.08)

        // Slider: the clump bursts into small pieces scattered around the cards
        const depth = 0.4 + (i % 3) * 0.45
        const sAng = i * 2.39996 + t * 0.03
        const sRad = 0.28 + ((i * 7) % 5) * 0.06
        const sx = (0.5 + Math.cos(sAng) * sRad * 1.05) * w + Math.sin(t * 0.5 + ph) * 0.012 * s - parallax * depth
        const sy = (0.5 + Math.sin(sAng) * sRad) * h + Math.cos(t * 0.45 + ph) * 0.014 * s
        const sr = (0.016 + (i % 4) * 0.006) * m * (0.6 + depth * 0.6) * (1 + Math.sin(t * 0.9 + ph) * 0.08)

        const rate = (0.018 + (i % 5) * 0.005) * (current === 'slider' ? 1.5 : 1)
        let sum = 0
        MODES.forEach((md, j) => {
          const wt = (weights[j][i] += ((current === md ? 1 : 0) - weights[j][i]) * rate)
          eased[j] = wt * wt * (3 - 2 * wt)
          sum += eased[j]
        })
        const [eh, ew, es] = eased.map((v) => v / sum)
        data[i * 3] = hx * eh + wx * ew + sx * es
        data[i * 3 + 1] = hy * eh + wy * ew + sy * es
        data[i * 3 + 2] = hr * eh + wr * ew + sr * es
      })

      gl.uniform3fv(uColor, color)
      gl.uniform3fv(uBlobs, data)
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

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
}
