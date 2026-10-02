import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Levels } from '../lib/audio'
import {
  backgroundParticleFragment,
  backgroundParticleVertex,
  shardFragment,
  shardVertex,
  sparkFragment,
  sparkVertex,
  tendrilFragment,
  tendrilVertex,
} from './shaders'

const GLOW = new THREE.Color('#2f9dff')
const WARM = new THREE.Color('#c27a45')

/** Deterministic PRNG so the tangle looks the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomUnit(rand: () => number) {
  const u = rand() * 2 - 1
  const a = rand() * Math.PI * 2
  const s = Math.sqrt(1 - u * u)
  return new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a))
}

/** Hundreds of tubes wandering over a spherical shell — the organic, knotted mass. */
function buildTendrils(count: number, rand: () => number) {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < count; i++) {
    const dir = randomUnit(rand)
    const axis = new THREE.Vector3().crossVectors(dir, randomUnit(rand)).normalize()
    // Most strands sit on the outer shell; some dive inward to catch the core light.
    const inner = rand() < 0.22
    const base = inner ? 0.42 + rand() * 0.3 : 0.8 + rand() * 0.22
    const steps = 6 + Math.floor(rand() * 6)
    const pts: THREE.Vector3[] = []
    for (let s = 0; s < steps; s++) {
      axis.applyAxisAngle(dir, (rand() - 0.5) * 1.1).normalize()
      dir.applyAxisAngle(axis, 0.28 + rand() * 0.32)
      pts.push(dir.clone().multiplyScalar(base + (rand() - 0.5) * 0.2))
    }
    // Mostly fine fibres, a few thick cords for structure
    const cord = rand() < 0.1
    const thick = cord ? 0.04 + rand() * 0.04 : 0.012 + rand() * 0.02
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps * 8, thick, cord ? 7 : 5, false)
    tube.deleteAttribute('uv')
    const seed = new Float32Array(tube.attributes.position.count).fill(rand())
    tube.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    parts.push(tube)
  }
  const merged = mergeGeometries(parts)
  for (const p of parts) p.dispose()
  return merged
}

export class DarkMatter {
  private renderer: THREE.WebGLRenderer
  private composer: EffectComposer
  private bloom: UnrealBloomPass
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
  private group = new THREE.Group()
  private uniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uKick: { value: 0 },
    uIntro: { value: 0 },
    uGlow: { value: GLOW },
    uWarm: { value: WARM },
    uPixelRatio: { value: 1 },
  }
  private core: THREE.Sprite
  private shards: THREE.InstancedMesh
  private pointer = new THREE.Vector2()
  private tilt = new THREE.Vector2()
  private spin = 0
  private time = 0
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor(canvas: HTMLCanvasElement) {
    const small = Math.min(window.innerWidth, window.innerHeight) < 700
    const rand = mulberry32(7)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75))
    // Background as scene.background, not setClearColor: RenderPass clears with a value three.js cached in
    // screen (sRGB) space, which OutputPass would then encode a second time. OutputPass also tone-maps
    // the background, so this linear value is chosen to come out as pure black (#000000) after ACES.
    this.scene.background = new THREE.Color().setRGB(0, 0, 0, THREE.LinearSRGBColorSpace)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.uniforms.uPixelRatio.value = this.renderer.getPixelRatio()

    this.scene.add(this.group)

    // Core glow — a soft additive sprite, visible through the gaps in the tangle
    const glowTex = new THREE.CanvasTexture(radialGradient())
    glowTex.colorSpace = THREE.SRGBColorSpace
    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: GLOW, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    )
    this.core.scale.setScalar(0.5)
    this.group.add(this.core)

    // Crystalline shards clustered around the centre
    const shardCount = small ? 26 : 40
    this.shards = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: shardVertex, fragmentShader: shardFragment }),
      shardCount,
    )
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    for (let i = 0; i < shardCount; i++) {
      const pos = randomUnit(rand).multiplyScalar(Math.pow(rand(), 1.6) * 0.38)
      q.setFromEuler(new THREE.Euler(rand() * 6, rand() * 6, rand() * 6))
      const s = 0.015 + rand() * 0.05
      m.compose(pos, q, new THREE.Vector3(s, s * (1.5 + rand() * 2.5), s))
      this.shards.setMatrixAt(i, m)
    }
    this.group.add(this.shards)

    // Sparks drifting inside the mass
    const sparkCount = small ? 500 : 900
    const sparkPos = new Float32Array(sparkCount * 3)
    const sparkSeed = new Float32Array(sparkCount)
    for (let i = 0; i < sparkCount; i++) {
      randomUnit(rand)
        .multiplyScalar(0.08 + Math.pow(rand(), 1.4) * 0.7)
        .toArray(sparkPos, i * 3)
      sparkSeed[i] = rand()
    }
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
    sparkGeo.setAttribute('aSeed', new THREE.BufferAttribute(sparkSeed, 1))
    this.group.add(
      new THREE.Points(
        sparkGeo,
        new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: sparkVertex,
          fragmentShader: sparkFragment,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      ),
    )

    // Background depth particles for atmosphere
    const bgCount = small ? 300 : 500
    const bgPos = new Float32Array(bgCount * 3)
    const bgSeed = new Float32Array(bgCount)
    for (let i = 0; i < bgCount; i++) {
      bgPos[i * 3] = (rand() - 0.5) * 4
      bgPos[i * 3 + 1] = (rand() - 0.5) * 4
      bgPos[i * 3 + 2] = (rand() - 0.5) * 2 - 2
      bgSeed[i] = rand()
    }
    const bgGeo = new THREE.BufferGeometry()
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3))
    bgGeo.setAttribute('aSeed', new THREE.BufferAttribute(bgSeed, 1))
    this.scene.add(
      new THREE.Points(
        bgGeo,
        new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: backgroundParticleVertex,
          fragmentShader: backgroundParticleFragment,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      ),
    )

    // The tangle itself
    this.group.add(
      new THREE.Mesh(
        buildTendrils(small ? 320 : 520, rand),
        new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: tendrilVertex,
          fragmentShader: tendrilFragment,
          side: THREE.DoubleSide,
        }),
      ),
    )

    this.group.scale.setScalar(0.7)

    // Multisampled target keeps edges smooth through post-processing
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
    this.composer =new EffectComposer(this.renderer, target)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    // High threshold: only the blue energy blooms, the dark mass stays crisp
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.8, 0.6, 0.3)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())

    this.resize()
  }

  resize() {
    const canvas = this.renderer.domElement
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    this.camera.aspect = w / h
    // Fill most of the shorter side: ~85% of the height on landscape, ~100% of the width on portrait
    const halfTan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const byHeight = 2.4 / (2 * halfTan * 0.88)
    const byWidth = 2.4 / (2 * halfTan * this.camera.aspect * 1.02)
    this.camera.position.z = Math.max(byHeight, byWidth)
    this.camera.updateProjectionMatrix()
  }

  /** Normalised pointer position, -1..1 */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  update(dt: number, levels: Levels) {
    const speed = this.reducedMotion ? 0.3 : 1
    dt = Math.min(dt, 0.05)
    this.time += dt * speed
    const u = this.uniforms
    u.uTime.value = this.time
    u.uBass.value = levels.bass
    u.uMid.value = levels.mid
    u.uTreble.value = levels.treble
    u.uKick.value = levels.kick
    u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.8)
    const intro = 1 - Math.pow(1 - u.uIntro.value, 3)

    this.spin += dt * speed * (0.045 + levels.mid * 0.08)
    this.tilt.lerp(this.pointer, 0.03)
    this.group.rotation.set(0.25 + this.tilt.y * 0.25, this.spin + this.tilt.x * 0.35, 0.12)

    this.core.scale.setScalar((1.3 + levels.bass * 0.6 + levels.kick * 0.3) * intro)
    this.core.material.opacity = (0.85 + levels.bass * 0.6) * intro
    this.shards.rotation.y = -this.spin * 1.6
    this.bloom.strength = 1.0 + levels.bass * 0.9 + levels.kick * 0.5

    this.composer.render()
  }

  dispose() {
    this.scene.traverse((obj) => {
      const o = obj as THREE.Mesh
      o.geometry?.dispose()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      for (const mat of mats) {
        ;(mat as THREE.SpriteMaterial).map?.dispose()
        mat.dispose()
      }
    })
    this.composer.dispose()
    this.renderer.dispose()
  }
}

function radialGradient() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)')
  grad.addColorStop(0.45, 'rgba(255,255,255,0.12)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return c
}
