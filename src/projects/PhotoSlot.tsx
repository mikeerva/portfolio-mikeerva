import { useState, type CSSProperties } from 'react'

// A place for a production photograph that doesn't exist yet. It loads `src`; while the file is
// missing it shows a labelled slot with the filename and what the picture should be, so dropping
// the final file into public/ fills it with no code change.
export function PhotoSlot({
  src,
  brief,
  className = '',
  style,
  tone = 'light',
}: {
  src: string
  brief: string
  className?: string
  style?: CSSProperties
  tone?: 'light' | 'dark'
}) {
  const [missing, setMissing] = useState(false)
  const file = src.split('/').pop()
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {!missing && (
        <img src={src} alt={brief} loading="lazy" decoding="async" onError={() => setMissing(true)} className="block size-full object-cover" />
      )}
      {missing && (
        <div
          role="img"
          aria-label={`Photograph to come: ${brief}`}
          className={`absolute inset-0 flex flex-col justify-between p-[4%] font-mono text-[10px] uppercase leading-snug tracking-[0.06em] ${
            tone === 'dark' ? 'bg-white/[0.04] text-white/45 outline-white/20' : 'bg-black/[0.035] text-black/45 outline-black/20'
          } outline-1 -outline-offset-1 outline-dashed`}
        >
          <span>Photograph to come</span>
          <span className="max-w-[36ch] normal-case tracking-normal">{brief}</span>
          <span>{file}</span>
        </div>
      )}
    </div>
  )
}
