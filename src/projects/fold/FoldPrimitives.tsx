import type { CSSProperties } from 'react'
import { PATH, VIEWBOX } from './wordmark'

// All flat artwork uses the same master path and the same undistorted fold geometry.
// Decorative unless given a label: the wordmark appears dozens of times, and the name is already
// in the text around it, so a screen reader shouldn't read "FOLD" at every one.
export function Mark({
  className = '',
  viewBox = VIEWBOX,
  style,
  label,
}: {
  className?: string
  viewBox?: string
  style?: CSSProperties
  label?: string
}) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      fill="currentColor"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path fillRule="evenodd" d={PATH} />
    </svg>
  )
}

export function FoldGraphic({ stage = 2, className = '' }: { stage?: 0 | 1 | 2; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {stage === 0 ? (
        <>
          <path d="M1 1H99V99H1Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <path d="M44 0 100 62" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
        </>
      ) : (
        <>
          <polygon points="100,0 44,0 100,62" fill="var(--orange)" />
          {stage === 2 && (
            <>
              <polygon points="100,0 70,0 100,32" fill="var(--red)" />
              <polygon points="100,32 100,62 80,42" fill="var(--deep-red)" />
            </>
          )}
        </>
      )}
    </svg>
  )
}
