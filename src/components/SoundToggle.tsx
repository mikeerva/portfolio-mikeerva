import { useState, useSyncExternalStore } from 'react'
import { audio } from '../lib/audio'

export function SoundToggle() {
  const playing = useSyncExternalStore(
    (cb) => audio.subscribe(cb),
    () => audio.playing,
  )
  const [touched, setTouched] = useState(false)

  const toggle = () => {
    setTouched(true)
    audio.toggle().catch((err: unknown) => console.warn('Audio failed to start', err))
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Mute music' : 'Play music'}
      className="group relative flex items-center text-glow transition-colors duration-300 hover:text-white"
    >
      <span className="relative grid size-10 place-items-center">
        {/* The ring on its own, so it alone grows on hover */}
        <span className="absolute inset-0 rounded-full border border-glow/40 transition-[border-color,scale] duration-500 ease-out group-hover:scale-[1.15] group-hover:border-white/70" />
        {!touched && !playing && <span className="absolute inset-0 animate-ping rounded-full border border-glow/30" />}
        <span className="flex h-3.5 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[2px] origin-bottom rounded-full bg-current"
              style={{
                height: '100%',
                transform: playing ? undefined : 'scaleY(0.25)',
                animation: playing ? `eq ${0.7 + i * 0.17}s ease-in-out ${i * -0.2}s infinite` : undefined,
                transition: 'transform 0.4s',
              }}
            />
          ))}
        </span>
      </span>
    </button>
  )
}
