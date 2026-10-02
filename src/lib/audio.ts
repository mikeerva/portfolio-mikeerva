// Music playback + frequency analysis. One shared instance: a media element can only
// be wired into the Web Audio graph once, and React StrictMode mounts effects twice.

export const track = {
  src: '/audio/dark-fog.mp3',
  title: 'Dark Fog',
  artist: 'Kevin MacLeod',
  url: 'https://incompetech.com',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
}

export interface Levels {
  /** 0..1, smoothed */
  bass: number
  mid: number
  treble: number
  /** sudden bass increase this frame, 0..1 */
  kick: number
}

type Band = [lowHz: number, highHz: number]
const BANDS: Record<'bass' | 'mid' | 'treble', Band> = {
  bass: [30, 160],
  mid: [300, 2000],
  treble: [3000, 10000],
}

class AudioEngine {
  readonly el: HTMLAudioElement
  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private gain: GainNode | null = null
  private bins = new Uint8Array(0)
  // Running peaks so quiet passages still produce visible motion.
  private peak = { bass: 0.25, mid: 0.2, treble: 0.1 }
  private levels: Levels = { bass: 0, mid: 0, treble: 0, kick: 0 }
  private listeners = new Set<() => void>()

  constructor() {
    this.el = new Audio(track.src)
    this.el.loop = true
    this.el.preload = 'none'
    this.el.crossOrigin = 'anonymous'
    for (const ev of ['play', 'pause', 'ended']) this.el.addEventListener(ev, () => this.emit())
  }

  get playing() {
    return !this.el.paused
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private emit() {
    for (const fn of this.listeners) fn()
  }

  private setup() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.78
    this.gain = this.ctx.createGain()
    this.gain.gain.value = 0
    this.ctx.createMediaElementSource(this.el).connect(this.analyser)
    this.analyser.connect(this.gain).connect(this.ctx.destination)
    this.bins = new Uint8Array(this.analyser.frequencyBinCount)
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  async play() {
    this.setup()
    await this.ctx!.resume()
    await this.el.play()
    this.fade(0.4, 1.5)
  }

  pause() {
    if (!this.ctx) return
    this.fade(0, 0.4)
    window.setTimeout(() => this.el.pause(), 400)
  }

  async toggle() {
    if (this.playing) this.pause()
    else await this.play()
  }

  private fade(to: number, seconds: number) {
    const g = this.gain!.gain
    const now = this.ctx!.currentTime
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(to, now + seconds)
  }

  private band([lo, hi]: Band) {
    const hzPerBin = this.ctx!.sampleRate / 2 / this.bins.length
    const start = Math.max(1, Math.floor(lo / hzPerBin))
    const end = Math.min(this.bins.length - 1, Math.ceil(hi / hzPerBin))
    let sum = 0
    for (let i = start; i <= end; i++) sum += this.bins[i]
    return sum / (end - start + 1) / 255
  }

  /** Call once per animation frame. Returns smoothed, normalised band levels. */
  read(): Levels {
    const l = this.levels
    if (!this.analyser || this.el.paused) {
      // Ease back to rest when paused
      l.bass *= 0.94
      l.mid *= 0.94
      l.treble *= 0.94
      l.kick *= 0.85
      return l
    }

    this.analyser.getByteFrequencyData(this.bins)
    const prevBass = l.bass
    for (const key of ['bass', 'mid', 'treble'] as const) {
      const raw = this.band(BANDS[key])
      this.peak[key] = Math.max(raw, this.peak[key] * 0.9995)
      const target = Math.min(1, raw / Math.max(this.peak[key], 0.05))
      // Fast attack, slow release
      const k = target > l[key] ? 0.35 : 0.08
      l[key] += (target - l[key]) * k
    }
    l.kick = Math.max(l.kick * 0.88, Math.min(1, Math.max(0, l.bass - prevBass) * 6))
    return l
  }
}

export const audio = new AudioEngine()
