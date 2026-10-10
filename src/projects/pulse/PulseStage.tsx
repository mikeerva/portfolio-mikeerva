import { useContext, useEffect, useRef } from 'react'
import { afterPanelOpens } from '../../lib/scene'
import { ScrollerContext } from '../scroll'
import { explodeOffset, lerp, smooth, stateAt, type StageKey, type StageState } from './timeline'

const GLB = '/projects/pulse/pulse-01.glb'
const DRACO = '/projects/pulse/draco/'

// The one live 3D stage of the case study. It sits sticky behind the whole article and shows
// through wherever a section is transparent and names a key (data-stage, optionally a fixed
// data-p); opaque sections simply pass over it. Each frame it finds the stage section across the
// middle of the panel, reads its scroll progress, damps that progress and draws the timeline's
// state for it — so camera, product, explode and light are all a deterministic function of
// scroll. It draws only while some stage section is on screen and something is still moving.
//
// Three.js and the 200 KB model load after the page has painted; until then (and with reduced
// motion, or without WebGL) the static renders stay in place. `onReady` lets the page hand over.
export function PulseStage({ onReady }: { onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const scroller = useContext(ScrollerContext)

  useEffect(() => {
    const el = host.current
    const panel = scroller?.current
    if (!el || !panel || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dispose = () => {}
    let cancelled = false
    run(el, panel, () => cancelled)
      .then((d) => {
        if (cancelled) return d()
        dispose = d
        onReady(true)
      })
      .catch((err: unknown) => {
        console.warn('PULSE stage unavailable, keeping the renders', err)
        onReady(false)
      })
    return () => {
      cancelled = true
      dispose()
    }
  }, [scroller, onReady])

  return <div ref={host} className="pl-stage3d" aria-hidden />
}

async function run(el: HTMLDivElement, panel: HTMLDivElement, cancelled: () => boolean) {
  // Loading and building the scene is heavy (the library, the model, the lighting on the GPU):
  // it waits until the panel has opened, the static renders standing in meanwhile
  if (!(await afterPanelOpens(cancelled))) return () => {}
  const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/DRACOLoader.js'),
    import('three/addons/environments/RoomEnvironment.js'),
  ])
  const draco = new DRACOLoader().setDecoderPath(DRACO)
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(GLB)
  draco.dispose()
  if (cancelled()) return () => {}

  const touch = matchMedia('(pointer: coarse)').matches
  // transparent: the studio backdrop is the stage element's own CSS gradient, so it closes with it
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.5 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.AgXToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  // Checking each shader for errors makes the page wait for the GPU to finish compiling it (about
  // a second on a phone); only worth it while developing
  renderer.debug.checkShaderErrors = import.meta.env.DEV
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
  scene.environment = env

  // the approved studio: a warm key, a cool rim, and the room's reflections
  const key = new THREE.DirectionalLight(0xffeedd, 1)
  const rim = new THREE.DirectionalLight(0xdfe8ff, 1)
  scene.add(key, rim, key.target, rim.target)

  const product = new THREE.Group()
  product.add(gltf.scene)
  scene.add(product)
  const parts: { obj: InstanceType<typeof THREE.Object3D>; off: number[] }[] = []
  gltf.scene.traverse((o) => {
    if ((o as InstanceType<typeof THREE.Mesh>).isMesh) parts.push({ obj: o, off: explodeOffset(o.name) })
  })

  const camera = new THREE.PerspectiveCamera(30, 1, 0.004, 20)
  const sections = () => Array.from(panel.querySelectorAll<HTMLElement>('[data-stage]'))
  let list = sections()

  // damped state: progress per key, the pointer, the entrance
  let curKey: StageKey = 'hero'
  let curP = 0
  let wasVisible = false
  let raf = 0
  let last = performance.now()
  const born = performance.now()
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
  let clip = 0

  const size = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    renderer.setSize(w, h, false)
    return w / h
  }
  let aspect = size()

  const read = () => {
    const view = panel.clientHeight
    const top0 = panel.getBoundingClientRect().top
    let active: HTMLElement | null = null
    let visible = false
    for (const s of list) {
      const r = s.getBoundingClientRect()
      const top = r.top - top0
      if (top < view && top + r.height > 0) visible = true
      if (top <= view * 0.5 && top + r.height > view * 0.5) active = s
    }
    if (!active) return { visible, key: null as StageKey | null, p: 0 }
    const fixed = active.dataset.p
    let p = 0
    if (fixed !== undefined) p = Number(fixed)
    else {
      const r = active.getBoundingClientRect()
      p = Math.min(Math.max(-(r.top - top0) / Math.max(r.height - view, 1), 0), 1)
    }
    return { visible, key: active.dataset.stage as StageKey, p }
  }

  const apply = (s: StageState, intro: number) => {
    // the entrance: out of darkness, a slow dolly in, the product settling from a slight turn
    const e = smooth(intro)
    const lightUp = lerp(0.0, 1, e)
    const dolly = 1 + 0.22 * (1 - e)
    const heroW = curKey === 'hero' ? 1 - smooth(curP * 1.6) : 0
    // a small, damped look around the product, only in the opening
    const yaw = ptr.x * 0.12 * heroW
    const pitch = -ptr.y * 0.05 * heroW
    const t = new THREE.Vector3(...s.target)
    const o = new THREE.Vector3(...s.pos).sub(t)
    const sph = new THREE.Spherical().setFromVector3(o)
    sph.radius *= dolly
    sph.theta += yaw
    sph.phi = Math.min(Math.max(sph.phi + pitch, 0.2), Math.PI - 0.2)
    camera.position.copy(t).add(new THREE.Vector3().setFromSpherical(sph))
    camera.up.set(0, 1, 0)
    camera.lookAt(t)

    // lens and shift, adapted to the panel like the renders: cover, or contain for the product views
    const halfWref = 18 / s.lens
    const halfHref = halfWref / s.refAspect
    const cover = aspect >= s.refAspect ? halfWref / aspect : halfHref
    const contain = aspect >= s.refAspect ? halfHref : halfWref / aspect
    const halfH = lerp(cover, contain, s.fit)
    const halfW = halfH * aspect
    camera.fov = (2 * Math.atan(halfH) * 180) / Math.PI
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    camera.projectionMatrix.elements[8] = (s.shift[0] * 2 * halfWref) / halfW
    camera.projectionMatrix.elements[9] = (s.shift[1] * 2 * halfWref) / halfH
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()

    product.rotation.y = s.rotY + 0.3 * (1 - e) * (curKey === 'hero' ? 1 : 0)
    const ex = smooth(s.explode)
    for (const { obj, off } of parts) obj.position.set(off[0] * ex, off[1] * ex, off[2] * ex)

    // light travels with the environment's rotation: the reflections move across the Ring
    key.intensity = s.key * 2.4 * lightUp
    rim.intensity = s.rim * 1.8 * lightUp
    scene.environmentIntensity = s.env * lightUp
    scene.environmentRotation.set(0, s.envRot, 0)
    key.position.set(Math.sin(s.envRot + 0.9) * 0.6, s.keyY, Math.cos(s.envRot + 0.9) * 0.6)
    rim.position.set(Math.sin(s.envRot + 3.6) * 0.6, 0.4, Math.cos(s.envRot + 3.6) * 0.6)
  }

  const portrait = () => matchMedia('(orientation: portrait)').matches
  const frame = (now: number) => {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const { visible, key: k, p } = read()
    el.classList.toggle('is-on', visible)
    if (!visible) {
      wasVisible = false
      return
    }
    if (k) {
      // a new key, or coming back from behind an opaque section: jump, don't glide
      if (k !== curKey || !wasVisible) {
        curKey = k
        curP = p
      } else curP += (p - curP) * (1 - Math.exp(-dt * 5))
    }
    wasVisible = true
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 3))
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 3))
    const intro = Math.min((now - born) / 2800, 1)
    apply(stateAt(curKey, curP, portrait()), intro)

    // the closing: the frame the product is seen through closes to the Ring's shape
    const c = curKey === 'coda' ? smooth((curP - 0.55) / 0.45) : 0
    if (Math.abs(c - clip) > 1e-4 || c === 0) {
      clip = c
      el.style.clipPath = c > 0 ? `inset(${c * 9}% ${c * 17}% ${c * 30}% round ${c * 14}%)` : ''
    }
    renderer.render(scene, camera)

    const moving = Math.abs(p - curP) > 1e-4 || intro < 1 || Math.abs(ptr.tx - ptr.x) > 1e-3 || Math.abs(ptr.ty - ptr.y) > 1e-3
    if (moving) wake()
  }
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = panel.getBoundingClientRect()
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1
    ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1
    wake()
  }
  const onLeave = () => {
    ptr.tx = 0
    ptr.ty = 0
    wake()
  }
  const ro = new ResizeObserver(() => {
    aspect = size()
    list = sections()
    wake()
  })
  // The materials' shaders compile in parallel, off the page's thread, before the first frame
  // needs them, instead of all at once inside it
  await renderer.compileAsync(scene, camera).catch(() => {})
  ro.observe(el)
  panel.addEventListener('scroll', wake, { passive: true })
  panel.addEventListener('pointermove', onPointer, { passive: true })
  panel.addEventListener('pointerleave', onLeave)
  last = performance.now()
  wake()

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    panel.removeEventListener('scroll', wake)
    panel.removeEventListener('pointermove', onPointer)
    panel.removeEventListener('pointerleave', onLeave)
    scene.traverse((o) => {
      const m = o as InstanceType<typeof THREE.Mesh>
      if (m.isMesh) {
        m.geometry.dispose()
        ;(Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat.dispose())
      }
    })
    env.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
}
