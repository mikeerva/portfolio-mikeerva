import type { Screen } from './session'

// What sits beside the phone for each screen. App mode shows the goal; design mode adds the
// reasoning, the first structural pass of the screen and, where it helps, its small flow.
export interface Note {
  n: string
  label: string
  goal: string
  // What to do with the screen, in app mode
  try: string
  statement?: string
  points: [string, string][]
  // The screen's first wireframe, top to bottom: h = heading, t = text line, b = block,
  // r = row, c = primary action, n = big number
  wire: string
  flow?: string[]
}

export const NOTES: Record<Screen, Note> = {
  today: {
    n: '01',
    label: 'Today',
    goal: 'Answer one question immediately: “What should I do today?”',
    try: 'Press Start workout. Everything after it is the session.',
    points: [
      ['Hierarchy', 'Greeting, readiness, plan, action — read top to bottom in under three seconds.'],
      ['Primary CTA', 'The only orange on the screen, docked in the thumb zone. Nothing competes with it.'],
      ['Readiness', 'One number and one plain sentence. The app interprets the data; the user doesn’t have to.'],
    ],
    wire: 'tnbbrrrc',
    flow: ['Open', 'See plan', 'Start'],
  },
  workout: {
    n: '02',
    label: 'Workout',
    goal: 'Keep orientation clear during training.',
    try: 'Open any exercise — the order is a suggestion, not a lock.',
    points: [
      ['Progress', 'Measured in sets, not minutes — the unit the user actually controls.'],
      ['Order', 'Exercises keep their sequence. Done collapses to a tick, now is orange, next stays quiet.'],
      ['Freedom', 'Any row can be opened. Busy machine? Take the next one; the plan follows.'],
    ],
    wire: 'thbrrrrc',
  },
  exercise: {
    n: '03',
    label: 'Exercise',
    goal: 'Reduce decision-making during physical effort.',
    try: 'Log the set. Notice there is nothing else to press.',
    points: [
      ['Glanceable', 'Exercise and set number are the largest things on screen — readable from the bench.'],
      ['Two facts', 'What you did last time, what to aim for. Everything else waits.'],
      ['One action', 'A single 64 px button. There is nothing else to decide.'],
    ],
    wire: 'thnrrc',
  },
  log: {
    n: '04',
    label: 'Logging',
    goal: 'Minimum typing. Large touch targets. Fast one-handed interaction.',
    try: 'Change the load with + and −, then save. Rest starts on its own.',
    points: [
      ['Prefilled', 'Values start from the last set, so most sets are logged with one tap.'],
      ['Steppers', 'No keyboard covering the screen. ±2.5 kg and ±1 rep, 48 px targets.'],
      ['Feedback', 'Set volume updates live, so a mistyped load is visible before saving.'],
    ],
    wire: 'thbbtc',
    flow: ['Load + reps', 'Save', 'Rest'],
  },
  rest: {
    n: '05',
    label: 'Between sets',
    goal: 'Recover. Know what comes next. Nothing else.',
    try: 'Let the timer run, add 30 seconds, or skip straight to the next set.',
    statement: 'The important screen is the one used between sets.',
    points: [
      ['Large timer', 'Read at arm’s length, out of breath, without picking the phone up.'],
      ['Minimal information', 'The only full-bleed yellow in the product: rest has its own unmistakable state.'],
      ['Next action', 'The next set and its load are already on screen. Two choices while resting, then one: go.'],
    ],
    wire: 'tnbtrc',
  },
  complete: {
    n: '06',
    label: 'Feedback',
    goal: 'Close the session with something true, then get out of the way.',
    try: 'These numbers come from the sets you just logged.',
    points: [
      ['Earned, not gamified', 'No confetti, badges or streak alarms. Four real numbers from this session.'],
      ['One highlight', 'If something improved, say what — in kilograms, not points.'],
      ['Restrained motion', 'The numbers count up once. The moment lands, then the app is quiet again.'],
    ],
    wire: 'thnnnnc',
  },
  progress: {
    n: '07',
    label: 'Progress',
    goal: 'Progress should be understood, not decoded.',
    try: 'Open a recent session to see every set in it.',
    points: [
      ['Habit first', 'Sessions this week lead, because consistency is what the user can change today.'],
      ['Change over totals', '“+7.5 kg vs 4 weeks ago” instead of a raw lifetime number.'],
      ['Honest chart', 'Eight weeks, labelled in kg, this week in orange. No decorative score.'],
    ],
    wire: 'thnbbrr',
  },
  history: {
    n: '08',
    label: 'History',
    goal: 'Secondary by design: there when needed, never in the way.',
    try: 'Open a session to see every set in it.',
    points: [
      ['Scannable', 'Day, workout and totals on one line; details open in place.'],
      ['Same data', 'Today’s session lands here exactly as it was logged.'],
    ],
    wire: 'thrrrr',
  },
}

export const STEPS: Screen[] = ['today', 'workout', 'exercise', 'log', 'rest', 'complete', 'progress']
