import { DRIFT, type Tier } from './config'
import { Field, type Controls, type Pointer } from './field'

// The renderer around the field, in plain WebGL: one program, one draw of the whole population
// as points. (three.js would add half a megabyte for what is a camera and a shader.) A camera
// that barely moves, the cursor turned into a world-space ray, and a loop that only runs while
// the stage is on screen and the tab is visible. Scroll progress (0..1) is set from outside and
// drives the phases; a slow device sheds particles on its own.

const VERT = `
attribute vec3 position;
attribute float aSeed;
attribute float aSpeed;
uniform mat4 uView;
uniform mat4 uProj;
uniform float uSize;
uniform float uDpr;
uniform float uCamZ;
uniform float uForm;
varying float vAlpha;
varying float vSpeed;
void main() {
  vec4 mv = uView * vec4(position, 1.0);
  float depth = -mv.z;
  // mostly fine points; a rare few slightly larger
  float grain = 0.75 + 1.05 * pow(aSeed, 7.0);
  gl_PointSize = clamp(uSize * uDpr * grain * (uCamZ / depth), 0.7 * uDpr, 3.0 * uDpr);
  // space, not fog: deep points dim, none come too close
  float far = smoothstep(19.0, 6.5, depth);
  float near = smoothstep(2.5, 5.0, depth);
  // organised, the points read a touch clearer; nothing grows
  vAlpha = (0.42 + 0.58 * fract(aSeed * 7.13)) * far * near * (1.0 + 0.18 * uForm);
  vSpeed = aSpeed;
  gl_Position = uProj * mv;
}
`

const FRAG = `
precision mediump float;
varying float vAlpha;
varying float vSpeed;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, d) * vAlpha * (0.8 + vSpeed * 0.5);
  // warm ivory; moving fast, it cools, barely
  vec3 ivory = vec3(0.96, 0.92, 0.84);
  vec3 cool = vec3(0.80, 0.87, 0.96);
  gl_FragColor = vec4(mix(ivory, cool, smoothstep(0.3, 1.0, vSpeed) * 0.5), a);
}
`

const BG = [0.039, 0.039, 0.035] // #0a0a09

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

export function pickTier(reduced: boolean): Tier {
  if (reduced) return 'reduced'
  const coarse = matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  if (coarse || small) return 'low'
  if ((navigator.hardwareConcurrency || 8) <= 4) return 'medium'
  return 'high'
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
  return s
}

export class DriftStage {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private buffers: WebGLBuffer[] = []
  private posBuf: WebGLBuffer
  private speedBuf: WebGLBuffer
  private u: Record<'view' | 'proj' | 'size' | 'dpr' | 'camZ' | 'form', WebGLUniformLocation | null>
  readonly field: Field
  readonly controls: Controls = { gravity: 1, flow: 1, noise: 1 }
  private pointer: Pointer = { active: false, down: false, ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: -1, vx: 0, vy: 0, speed: 0, presence: 0, charge: 0, release: 0 }
  // camera: position, basis (right, up, forward), matrices
  private cam = { x: 0, y: 0, z: DRIFT.camera.z, r: [1, 0, 0], u: [0, 1, 0], f: [0, 0, -1], aspect: 1 }
  private view = new Float32Array(16)
  private proj = new Float32Array(16)
  private ndc = { x: 0, y: 0 }
  private hit = { x: 0, y: 0, has: false }
  private gentle: number
  private dpr: number
  // RELEASE state: how much of the word's structure holds, whether it has been broken, and the
  // tension the visitor has built toward breaking it
  private hold = 1
  private broken = false
  private energy = 0
  private shownEnergy = -1
  // views of the live part of the buffers, remade only when the particle count changes
  private views: { n: number; pos: Float32Array<ArrayBufferLike>; speed: Float32Array<ArrayBufferLike> } = { n: -1, pos: new Float32Array(0), speed: new Float32Array(0) }
  onEnergy: (e: number) => void = () => {}
  private progress = 0 // where the scroll is
  private shown = 0 // where the system is: follows the scroll closely, without its jitter
  private phase = -1
  private raf = 0
  private onScreen = true
  private tabVisible = !document.hidden
  private lost = false
  private last = 0
  private time = 0
  private width = 1
  private height = 1
  private word: Float32Array | null = null
  // performance watch: frame time over a window, and how many times we've stepped down
  private watch = { frames: 0, sum: 0, drops: 0 }
  onPhase: (phase: number) => void = () => {}

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, tier: Tier, reduced: boolean) {
    this.canvas = canvas
    const { count, dpr } = DRIFT.tiers[tier]
    this.gentle = reduced ? 0.35 : 1
    this.dpr = Math.min(window.devicePixelRatio || 1, dpr)
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' })
    if (!gl) throw new Error('webgl')
    this.gl = gl

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link')
    this.program = program
    gl.useProgram(program)
    this.u = {
      view: gl.getUniformLocation(program, 'uView'),
      proj: gl.getUniformLocation(program, 'uProj'),
      size: gl.getUniformLocation(program, 'uSize'),
      dpr: gl.getUniformLocation(program, 'uDpr'),
      camZ: gl.getUniformLocation(program, 'uCamZ'),
      form: gl.getUniformLocation(program, 'uForm'),
    }

    this.field = new Field(count)
    const attr = (name: string, data: Float32Array, size: number, usage: number) => {
      const buf = gl.createBuffer()!
      this.buffers.push(buf)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, data, usage)
      const loc = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      return buf
    }
    this.posBuf = attr('position', this.field.pos, 3, gl.DYNAMIC_DRAW)
    this.speedBuf = attr('aSpeed', this.field.speed, 1, gl.DYNAMIC_DRAW)
    attr('aSeed', this.field.seed, 1, gl.STATIC_DRAW)

    gl.uniform1f(this.u.size, DRIFT.size)
    gl.uniform1f(this.u.dpr, this.dpr)
    gl.uniform1f(this.u.camZ, DRIFT.camera.z)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE) // additive: light gathers where particles do
    gl.clearColor(BG[0], BG[1], BG[2], 1)

    canvas.addEventListener('webglcontextlost', this.onLost)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  // --- outside world ------------------------------------------------------------------------

  resize(w: number, h: number) {
    if (w < 2 || h < 2 || this.lost) return
    this.width = w
    this.height = h
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.cam.aspect = w / h
    this.updateProjection()
    this.layoutWord()
    this.updateCamera()
    this.render()
  }

  setWord(points: Float32Array) {
    this.word = points
    this.layoutWord()
  }

  // The word spans most of what the camera sees at the interaction plane
  private layoutWord() {
    if (!this.word) return
    const visW = this.visibleHeight() * this.cam.aspect
    this.field.setWord(this.word, visW * (this.cam.aspect < 1 ? DRIFT.form.widthPortrait : DRIFT.form.width))
  }

  private visibleHeight() {
    return 2 * DRIFT.camera.z * Math.tan(((DRIFT.camera.fov / 2) * Math.PI) / 180)
  }

  setProgress(p: number) {
    this.progress = p
    // back up into the forming zone: a broken word is allowed to rebuild
    if (this.broken && p < DRIFT.phases.rebuild) this.broken = false
    this.updatePhase()
  }

  // 0 flow, 1 form, 2 release (the word holds and can be broken), 3 calm
  private updatePhase() {
    const p = this.progress
    const { formIn, calm } = DRIFT.phases
    const phase = this.broken ? 3 : p < formIn[0] ? 0 : p < formIn[1] ? 1 : p < calm[0] ? 2 : 3
    if (phase !== this.phase) {
      this.phase = phase
      this.onPhase(phase)
    }
  }

  // Tension builds only from fast gestures inside the formed word; enough of it breaks the word
  private updateRelease(dt: number, formed: number) {
    const R = DRIFT.release
    const P = this.pointer
    const box = this.field.box
    const inside =
      P.active && this.hit.has && Math.abs(this.hit.x) < box.w * 1.08 && Math.abs(this.hit.y) < box.h * 1.6 + 0.3
    if (!this.broken && formed > 0.9 && inside) {
      // measured against the width on view, so the same gesture counts the same on any screen
      const visW = this.visibleHeight() * this.cam.aspect
      const speed = P.speed * (8 / Math.max(visW, 1))
      const over = Math.max(0, speed - R.threshold)
      this.energy += over * dt * (P.down ? R.gainDrag : R.gainMove)
    }
    this.energy *= Math.exp(-R.decay * dt)
    if (!this.broken && this.energy >= 1) {
      this.broken = true
      this.energy = 0
      const power = Math.min(P.speed * R.power, R.powerMax) * this.gentle
      this.field.scatter(P.vx, P.vy, power, this.hit.x, this.hit.y)
      this.updatePhase()
    }
    const e = Math.min(this.energy, 1)
    if (Math.abs(e - this.shownEnergy) > 0.01) {
      this.shownEnergy = e
      this.onEnergy(e)
    }
    const target = this.broken ? 0 : 1
    this.hold += (target - this.hold) * (1 - Math.exp(-dt * (this.broken ? R.letGo : R.regrow)))
  }

  pointerMove(x: number, y: number) {
    this.ndc.x = (x / this.width) * 2 - 1
    this.ndc.y = -(y / this.height) * 2 + 1
    this.pointer.active = true
  }
  pointerDown() {
    this.pointer.down = true
  }
  pointerUp() {
    if (!this.pointer.down) return
    this.pointer.down = false
    // what was held is given back, through the field
    this.pointer.release = this.pointer.charge * DRIFT.pointer.release
    this.pointer.charge = 0
  }
  pointerLeave() {
    this.pointerUp()
    this.pointer.active = false
    this.hit.has = false
  }

  setOnScreen(on: boolean) {
    this.onScreen = on
    this.schedule()
  }

  start() {
    this.schedule()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.canvas.removeEventListener('webglcontextlost', this.onLost)
    document.removeEventListener('visibilitychange', this.onVisibility)
    const gl = this.gl
    for (const b of this.buffers) gl.deleteBuffer(b)
    gl.deleteProgram(this.program)
    // The context itself goes with its canvas. (Forcing it lost here would leave the canvas
    // unusable if the same element is mounted again, as React's development double-mount does.)
  }

  // --- loop ---------------------------------------------------------------------------------

  private onVisibility = () => {
    this.tabVisible = !document.hidden
    this.schedule()
  }

  private onLost = (e: Event) => {
    e.preventDefault()
    this.lost = true
    this.schedule()
  }

  private schedule() {
    const run = this.onScreen && this.tabVisible && !this.lost
    if (run && !this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    // clamp: a stall or a returning tab never throws the simulation
    const dt = Math.min((now - this.last) / 1000, 1 / 30)
    this.last = now
    if (dt <= 0) return
    this.time += dt
    this.updatePointer(dt)
    const { formIn, formOut, calm } = DRIFT.phases
    this.shown += (this.progress - this.shown) * (1 - Math.exp(-dt * 7))
    const p = this.shown
    const formed = smooth(formIn[0], formIn[1], p) * (1 - smooth(formOut[0], formOut[1], p))
    this.updateRelease(dt, formed)
    const form = formed * this.hold
    this.gl.uniform1f(this.u.form, form)
    this.field.step(dt, this.time, this.pointer, this.controls, {
      form,
      // once broken, the calm arrives as the structure lets go
      calm: Math.max(smooth(calm[0], calm[1], p), this.broken ? 1 - this.hold : 0),
      gentle: this.gentle,
    })
    const gl = this.gl
    const n = this.field.active
    const v = this.views
    if (v.n !== n) {
      v.n = n
      v.pos = this.field.pos.subarray(0, n * 3)
      v.speed = this.field.speed.subarray(0, n)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, v.pos)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.speedBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, v.speed)
    this.render()
    this.adapt(dt)
  }

  private render() {
    const gl = this.gl
    gl.uniformMatrix4fv(this.u.view, false, this.view)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, this.field.active)
  }

  // --- camera -------------------------------------------------------------------------------

  private updateProjection() {
    const near = 0.5
    const far = 40
    const f = 1 / Math.tan(((DRIFT.camera.fov / 2) * Math.PI) / 180)
    const p = this.proj
    p.fill(0)
    p[0] = f / this.cam.aspect
    p[5] = f
    p[10] = (far + near) / (near - far)
    p[11] = -1
    p[14] = (2 * far * near) / (near - far)
    this.gl.uniformMatrix4fv(this.u.proj, false, p)
  }

  // Look at the origin from (x, y, z): an orthonormal basis and the view matrix from it
  private updateCamera() {
    const c = this.cam
    let fx = -c.x, fy = -c.y, fz = -c.z
    const fl = Math.hypot(fx, fy, fz)
    fx /= fl
    fy /= fl
    fz /= fl
    // right = forward × world up (0, 1, 0)
    let rx = -fz, rz = fx
    const rl = Math.hypot(rx, rz)
    rx /= rl
    rz /= rl
    const ry = 0
    // up = right × forward
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx
    c.r[0] = rx; c.r[1] = ry; c.r[2] = rz
    c.u[0] = ux; c.u[1] = uy; c.u[2] = uz
    c.f[0] = fx; c.f[1] = fy; c.f[2] = fz
    const v = this.view
    v[0] = rx; v[1] = ux; v[2] = -fx; v[3] = 0
    v[4] = ry; v[5] = uy; v[6] = -fy; v[7] = 0
    v[8] = rz; v[9] = uz; v[10] = -fz; v[11] = 0
    v[12] = -(rx * c.x + ry * c.y + rz * c.z)
    v[13] = -(ux * c.x + uy * c.y + uz * c.z)
    v[14] = fx * c.x + fy * c.y + fz * c.z
    v[15] = 1
  }

  // The cursor as a ray from the camera; its velocity measured where it meets the plane z = 0
  private updatePointer(dt: number) {
    const P = this.pointer
    const c = this.cam
    // the camera leans a little toward the cursor, for parallax, slowly
    const k = 1 - Math.exp(-dt * 1.5)
    c.x += ((P.active ? this.ndc.x * DRIFT.camera.parallax : 0) - c.x) * k
    c.y += ((P.active ? this.ndc.y * DRIFT.camera.parallax : 0) - c.y) * k
    this.updateCamera()

    const tanH = Math.tan(((DRIFT.camera.fov / 2) * Math.PI) / 180)
    const sx = this.ndc.x * tanH * c.aspect
    const sy = this.ndc.y * tanH
    let dx = c.r[0] * sx + c.u[0] * sy + c.f[0]
    let dy = c.r[1] * sx + c.u[1] * sy + c.f[1]
    let dz = c.r[2] * sx + c.u[2] * sy + c.f[2]
    const dl = Math.hypot(dx, dy, dz)
    dx /= dl
    dy /= dl
    dz /= dl
    P.ox = c.x
    P.oy = c.y
    P.oz = c.z
    P.dx = dx
    P.dy = dy
    P.dz = dz

    let rvx = 0
    let rvy = 0
    if (P.active && Math.abs(dz) > 1e-4) {
      const t = -c.z / dz
      const hx = c.x + dx * t
      const hy = c.y + dy * t
      if (this.hit.has) {
        rvx = (hx - this.hit.x) / dt
        rvy = (hy - this.hit.y) / dt
      }
      this.hit.x = hx
      this.hit.y = hy
      this.hit.has = true
    }
    const s = 1 - Math.exp(-dt * DRIFT.pointer.velocitySmoothing)
    P.vx += (rvx - P.vx) * s
    P.vy += (rvy - P.vy) * s
    P.speed = Math.hypot(P.vx, P.vy)
    // presence rises with movement (or a held press) and fades over a couple of seconds of stillness
    const moving = P.active && (P.speed > 0.15 || P.down)
    P.presence += ((moving ? 1 : 0) - P.presence) * (1 - Math.exp(-dt * (moving ? 6 : 0.6)))
    P.charge = P.down ? Math.min(1, P.charge + dt / DRIFT.pointer.chargeTime) : 0
  }

  // A device that can't keep up sheds a third of the particles, at most twice
  private adapt(dt: number) {
    const w = this.watch
    if (w.drops >= 2) return
    w.frames++
    w.sum += dt
    if (w.frames < 90) return
    const avg = w.sum / w.frames
    w.frames = 0
    w.sum = 0
    if (avg > 1 / 42) {
      w.drops++
      this.field.active = Math.floor(this.field.active * 0.66)
    }
  }
}
