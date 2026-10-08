import { useSyncExternalStore } from 'react'

// The panel swaps axes on portrait screens (see panelRect), so that is when a slot's separate
// portrait composition is used
const PORTRAIT = '(orientation: portrait)'
const subscribe = (cb: () => void) => {
  const mq = matchMedia(PORTRAIT)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
export const usePortrait = () => useSyncExternalStore(subscribe, () => matchMedia(PORTRAIT).matches)
