import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { assetSrc, FORMAT, SLOTS, type Box, type Frame, type Slot, type SlotKey } from './assets'
import { usePortrait } from './portrait'
import { squircleIn } from './ring'

// One visual slot of the case study, by its key in SLOTS. Loads the slot's file for this
// orientation; a loop plays its video over the poster while in view. While the file doesn't exist
// it shows the designed placeholder: everything around the slot is final, only the picture is
// missing. `children` sit over the media (type, the Ring trace).
export function PulseMedia({
  slot,
  fit = 'cover',
  eager = false,
  compact = false,
  tone = 'dark',
  className = '',
  style,
  children,
}: {
  slot: SlotKey
  fit?: 'cover' | 'contain'
  eager?: boolean
  compact?: boolean
  tone?: 'dark' | 'light'
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const s: Slot = SLOTS[slot]
  const portrait = usePortrait()
  const frame = (portrait && s.portrait) || s.frame
  return (
    <div className={`pl-media ${className}`} style={style}>
      <MediaFrame key={frame.file} slot={s} frame={frame} fit={fit} eager={eager} compact={compact} tone={tone} />
      {children}
    </div>
  )
}

function MediaFrame({
  slot,
  frame,
  fit,
  eager,
  compact,
  tone,
}: {
  slot: Slot
  frame: Frame
  fit: 'cover' | 'contain'
  eager: boolean
  compact: boolean
  tone: 'dark' | 'light'
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  if (state === 'missing') return <Placeholder slot={slot} frame={frame} compact={compact} tone={tone} />
  return (
    <>
      <img
        src={assetSrc(frame.file)}
        alt={slot.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onLoad={() => setState('ready')}
        onError={() => setState('missing')}
        className={`pl-img ${state === 'ready' ? 'is-loaded' : ''}`}
        style={{ objectFit: fit, objectPosition: frame.focus }}
      />
      {state === 'ready' && frame.video && <LoopVideo src={assetSrc(frame.video)} eager={eager} focus={frame.focus} />}
    </>
  )
}

// Muted, looping and inline, playing only while most of it is on screen and never with reduced
// motion (the poster under it stays). It shows once it is actually playing, so it never flashes.
function LoopVideo({ src, eager, focus }: { src: string; eager: boolean; focus?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const video = ref.current
    if (!video || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.preload = 'auto'
          video.play().catch(() => {})
        } else video.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload={eager ? 'metadata' : 'none'}
      aria-hidden
      onPlaying={() => setPlaying(true)}
      className={`pl-video ${playing ? 'is-playing' : ''}`}
      style={{ objectPosition: focus }}
    />
  )
}

// A placeholder that is already the composition: graphite ground, a pool of light and the
// subject's outline (a Ring squircle) where the subject will sit — drawn through the same cover
// crop as the final image — the zones that must stay clear, and the asset's ID, brief and format.
function Placeholder({ slot, frame, compact, tone }: { slot: Slot; frame: Frame; compact: boolean; tone: 'dark' | 'light' }) {
  const id = useId()
  const [w, h] = frame.size
  const px = (b: Box): Box => [(b[0] / 100) * w, (b[1] / 100) * h, (b[2] / 100) * w, (b[3] / 100) * h]
  const sub = frame.subject && px(frame.subject)
  return (
    <div
      role="img"
      aria-label={`Asset to come, ${slot.id}: ${slot.brief}`}
      className={`pl-ph pl-ph--${tone} ${compact ? 'is-compact' : ''}`}
    >
      <svg className="pl-ph-guide" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id={`${id}l`}>
            <stop offset="0" stopColor="currentColor" stopOpacity="0.11" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        {sub && (
          <>
            <ellipse
              cx={sub[0] + sub[2] / 2}
              cy={sub[1] + sub[3] / 2}
              rx={Math.max(sub[2], sub[3]) * 1.1}
              ry={Math.max(sub[2], sub[3]) * 1.1}
              fill={`url(#${id}l)`}
            />
            <path d={squircleIn(sub)} className="pl-ph-subject" />
            <path
              d={`M${sub[0] + sub[2] / 2} ${sub[1] + sub[3] / 2 - 18}v36M${sub[0] + sub[2] / 2 - 18} ${sub[1] + sub[3] / 2}h36`}
              className="pl-ph-cross"
            />
          </>
        )}
        {frame.ring && <path d={frame.ring} className="pl-ph-ring" />}
      </svg>
      {!compact &&
        frame.clear?.map(({ box: [x, y, bw, bh], label }) => (
          <div key={`${x}-${y}`} className="pl-ph-zone" style={{ left: `${x}%`, top: `${y}%`, width: `${bw}%`, height: `${bh}%` }}>
            <span>{label}</span>
          </div>
        ))}
      <div className={`pl-ph-info pl-ph-info--${frame.infoAt ?? slot.infoAt ?? 'br'}`}>
        <p className="pl-ph-id">
          {slot.id}
          {compact && <span> · {frame.ratio}</span>}
        </p>
        {!compact && <p className="pl-ph-brief">{slot.brief}</p>}
        {!compact && (
          <p className="pl-ph-meta">
            {FORMAT[slot.kind]} · {frame.ratio} · {w}×{h}
          </p>
        )}
        {!compact && (
          <p className="pl-ph-meta">
            {frame.file}
            {frame.video ? ` · ${frame.video}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
