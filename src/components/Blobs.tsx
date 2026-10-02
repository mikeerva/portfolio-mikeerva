import type { CSSProperties } from 'react'

// Bright animated blobs in the left top area for the logo
const blobs = [
  {
    className: 'left-[5%] top-[8%] size-[35vmax] bg-[#2a5a70] opacity-80',
    drift: 'drift-a',
    dur: '34s'
  },
  {
    className: 'left-[-5%] top-[20%] size-[28vmax] bg-[#1a3a4a] opacity-60',
    drift: 'drift-b',
    dur: '42s'
  },
]

export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`blob ${b.className}`}
          style={{ '--drift': b.drift, '--dur': b.dur, animationDelay: `${i * -6}s` } as CSSProperties}
        />
      ))}
    </div>
  )
}
