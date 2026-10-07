// FitTrack's demo session: the sample plan, the history it builds on, and the state machine the
// prototype runs on. Visual components only read this state and dispatch actions to it.

export type Screen = 'today' | 'workout' | 'exercise' | 'log' | 'rest' | 'complete' | 'progress' | 'history'

export const SCREEN_TITLE: Record<Screen, string> = {
  today: 'Today',
  workout: 'Workout',
  exercise: 'Exercise',
  log: 'Log set',
  rest: 'Rest',
  complete: 'Workout complete',
  progress: 'Progress',
  history: 'History',
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: [number, number]
  // Last session's working set, the starting point for logging
  previous: { kg: number; reps: number }
  step: number
}

export interface SetLog {
  kg: number
  reps: number
}

export const PLAN = {
  name: 'Upper Body',
  minutes: 45,
  exercises: [
    { id: 'bench', name: 'Bench Press', sets: 3, reps: [8, 10], previous: { kg: 60, reps: 10 }, step: 2.5 },
    { id: 'pulldown', name: 'Lat Pulldown', sets: 3, reps: [10, 12], previous: { kg: 52.5, reps: 12 }, step: 2.5 },
    { id: 'press', name: 'Shoulder Press', sets: 3, reps: [8, 10], previous: { kg: 20, reps: 10 }, step: 1 },
    { id: 'row', name: 'Cable Row', sets: 3, reps: [10, 12], previous: { kg: 45, reps: 12 }, step: 2.5 },
  ] as Exercise[],
}

export const REST_S = 90

// Sessions already in the log this week and before it (sample data)
export interface PastWorkout {
  id: string
  day: string
  date: string
  name: string
  minutes: number
  sets: number
  volume: number
  lines: [string, string][]
}
export const HISTORY: PastWorkout[] = [
  {
    id: 'mon',
    day: 'MON',
    date: 'Oct 6',
    name: 'Lower Body',
    minutes: 52,
    sets: 14,
    volume: 6240,
    lines: [['Back Squat', '3 × 8 · 80 kg'], ['Romanian Deadlift', '3 × 10 · 70 kg'], ['Split Squat', '3 × 10 · 16 kg'], ['Leg Curl', '3 × 12 · 35 kg'], ['Calf Raise', '2 × 15 · 60 kg']],
  },
  {
    id: 'sat',
    day: 'SAT',
    date: 'Oct 4',
    name: 'Full Body',
    minutes: 40,
    sets: 11,
    volume: 4310,
    lines: [['Trap Bar Deadlift', '3 × 6 · 90 kg'], ['Push-up', '3 × 15 · BW'], ['Goblet Squat', '3 × 10 · 24 kg'], ['Plank', '2 × 45 s']],
  },
  {
    id: 'thu',
    day: 'THU',
    date: 'Oct 2',
    name: 'Upper Body',
    minutes: 44,
    sets: 12,
    volume: 4520,
    lines: [['Bench Press', '3 × 10 · 60 kg'], ['Lat Pulldown', '3 × 12 · 52.5 kg'], ['Shoulder Press', '3 × 10 · 20 kg'], ['Cable Row', '3 × 12 · 45 kg']],
  },
]
// Weekly training volume (kg) for the weeks before this one, oldest first
export const WEEKS = [9800, 11200, 10400, 12600, 13100, 12200, 14300]
// The training week is the last seven days: Thu, Sat and Mon are in it before today
export const WEEK_DONE_BEFORE = 3
export const WEEK_TARGET = 4
// Planned sessions over the block, and how many were trained before today
export const BLOCK_PLANNED = 31
export const BLOCK_DONE_BEFORE = 26
// Bench press working weight four weeks ago
export const BENCH_BASE = 55

export interface State {
  screen: Screen
  exercise: number
  logs: SetLog[][]
  draft: SetLog
  rest: { total: number; left: number } | null
  finished: boolean
  opened: string | null
  // Which way the last screen change went, for the slide
  dir: 1 | -1
}

export const initial: State = {
  screen: 'today',
  exercise: 0,
  logs: PLAN.exercises.map(() => []),
  draft: { ...PLAN.exercises[0].previous },
  rest: null,
  finished: false,
  opened: null,
  dir: 1,
}

export type Action =
  | { type: 'go'; screen: Screen }
  | { type: 'start' }
  | { type: 'select'; exercise: number }
  | { type: 'log' }
  | { type: 'draft'; kg?: number; reps?: number }
  | { type: 'save' }
  | { type: 'tick' }
  | { type: 'extend' }
  | { type: 'next' }
  | { type: 'finish' }
  | { type: 'open'; id: string | null }
  | { type: 'jump'; screen: Screen }
  | { type: 'reset' }

const ORDER: Screen[] = ['today', 'workout', 'exercise', 'log', 'rest', 'complete', 'progress', 'history']
const dirTo = (from: Screen, to: Screen): 1 | -1 => (ORDER.indexOf(to) >= ORDER.indexOf(from) ? 1 : -1)
const to = (s: State, screen: Screen): State => ({ ...s, screen, dir: dirTo(s.screen, screen) })

// The set to log next for an exercise: the last one logged today, else last session's
const draftFor = (s: State, i: number): SetLog => {
  const done = s.logs[i]
  return { ...(done[done.length - 1] ?? PLAN.exercises[i].previous) }
}
const firstOpen = (logs: SetLog[][]) => PLAN.exercises.findIndex((e, i) => logs[i].length < e.sets)

// A finished sample session, for jumping straight to the end of the journey
export const sampleLogs = (): SetLog[][] => [
  [{ kg: 62.5, reps: 10 }, { kg: 62.5, reps: 9 }, { kg: 62.5, reps: 8 }],
  [{ kg: 55, reps: 12 }, { kg: 55, reps: 11 }, { kg: 55, reps: 10 }],
  [{ kg: 20, reps: 10 }, { kg: 22, reps: 8 }, { kg: 22, reps: 8 }],
  [{ kg: 47.5, reps: 12 }, { kg: 47.5, reps: 12 }, { kg: 47.5, reps: 11 }],
]

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'go':
      return to(s, a.screen)
    case 'start':
      return to({ ...s, exercise: Math.max(firstOpen(s.logs), 0) }, 'workout')
    case 'select':
      return to({ ...s, exercise: a.exercise, draft: draftFor(s, a.exercise) }, 'exercise')
    case 'log':
      return to({ ...s, draft: draftFor(s, s.exercise) }, 'log')
    case 'draft':
      return {
        ...s,
        draft: {
          kg: Math.min(Math.max(a.kg ?? s.draft.kg, 0), 300),
          reps: Math.min(Math.max(a.reps ?? s.draft.reps, 1), 30),
        },
      }
    case 'save': {
      const logs = s.logs.map((l, i) => (i === s.exercise ? [...l, { ...s.draft }] : l))
      const done = firstOpen(logs) === -1
      if (done) return to({ ...s, logs, rest: null, finished: true }, 'complete')
      return to({ ...s, logs, rest: { total: REST_S, left: REST_S } }, 'rest')
    }
    case 'tick':
      return s.rest && s.rest.left > 0 ? { ...s, rest: { ...s.rest, left: s.rest.left - 1 } } : s
    case 'extend':
      return s.rest ? { ...s, rest: { total: s.rest.total + 30, left: s.rest.left + 30 } } : s
    case 'next': {
      // After rest: the next set of this exercise, or back to the plan with the next one marked
      if (s.logs[s.exercise].length < PLAN.exercises[s.exercise].sets) return to({ ...s, rest: null, draft: draftFor(s, s.exercise) }, 'exercise')
      return { ...s, rest: null, exercise: Math.max(firstOpen(s.logs), 0), screen: 'workout', dir: -1 }
    }
    case 'finish':
      return to({ ...s, rest: null, finished: true }, 'complete')
    case 'open':
      return { ...s, opened: a.id }
    case 'jump': {
      // From the step rail: make whatever the screen needs true, then show it
      if (a.screen === 'rest') {
        const logs = s.logs[s.exercise].length ? s.logs : s.logs.map((l, i) => (i === s.exercise ? [{ ...s.draft }] : l))
        return to({ ...s, logs, finished: false, rest: { total: REST_S, left: REST_S } }, 'rest')
      }
      if (a.screen === 'complete' || a.screen === 'progress') {
        const any = s.logs.some((l) => l.length)
        return to({ ...s, logs: any ? s.logs : sampleLogs(), finished: true, rest: null }, a.screen)
      }
      if (a.screen === 'log' || a.screen === 'exercise') return to({ ...s, rest: null, draft: draftFor(s, s.exercise) }, a.screen)
      return to({ ...s, rest: null }, a.screen)
    }
    case 'reset':
      return { ...initial, dir: -1 }
  }
}

// What the session adds up to so far
export function summary(s: State) {
  const sets = s.logs.reduce((n, l) => n + l.length, 0)
  const volume = s.logs.reduce((v, l) => v + l.reduce((a, x) => a + x.kg * x.reps, 0), 0)
  const exercises = s.logs.filter((l) => l.length).length
  // A believable clock: warm-up, then roughly a minute of work and a rest per set
  const minutes = sets ? 8 + Math.round(sets * (1 + REST_S / 60) + sets * 0.6) : 0
  const bench = Math.max(0, ...s.logs[0].map((l) => l.kg))
  return { sets, volume: Math.round(volume), exercises, minutes, bench }
}

// Consecutive weeks, up to this one, that met the weekly session target
export const STREAK_WEEKS = 6
// Planned sessions in the block the trainee missed (by position), for the session marks
export const MISSED = [6, 13, 19, 24]

// The block as it stands once today's sample session is done: the same figures the Progress
// screen shows, gathered for the case study's closing visual
export function blockStats() {
  const today = summary({ ...initial, logs: sampleLogs(), finished: true })
  const weeks = [...WEEKS, HISTORY.reduce((v, h) => v + h.volume, 0) + today.volume]
  const avg = (w: number[]) => w.reduce((a, b) => a + b, 0) / w.length
  const sessions = BLOCK_DONE_BEFORE + 1
  return {
    weeks,
    sessions,
    planned: BLOCK_PLANNED,
    consistency: Math.round((sessions / BLOCK_PLANNED) * 100),
    // The last four weeks against the first four
    volumeChange: Math.round((avg(weeks.slice(4)) / avg(weeks.slice(0, 4)) - 1) * 100),
    bench: today.bench - BENCH_BASE,
    streak: STREAK_WEEKS,
  }
}

export const fmtKg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
export const fmtNum = (n: number) => n.toLocaleString('en-US')
export const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
