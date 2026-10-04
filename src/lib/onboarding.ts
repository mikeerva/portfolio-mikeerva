import { STATE_COUNT } from './objectStates'
import { object } from './scene'

// The facet "drag to explore" stands on: one state before 01's, so dragging right turns it away and
// brings 01 forward like any other name
export const ONBOARD_FACET = 1

// Once the visitor has dragged (or turned with the keys), the onboarding never returns this visit
let done = false
export const onboarding = {
  get done() {
    return done
  },
  finish() {
    done = true
  },
}

// Where the mass rests while onboarding: the nearest state one before an 01
export const onboardStart = (p: number) => Math.round((p - ONBOARD_FACET) / STATE_COUNT) * STATE_COUNT + ONBOARD_FACET

// On the way into Work, before its mass shows: take up the onboarding's resting orientation at
// once, so the mass never turns to it on its own
export function prepareWorkEntry() {
  if (done) return
  const target = onboardStart(object.progress)
  if (target !== object.progress) {
    object.progress = target
    object.jump = true
  }
}
