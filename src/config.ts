// Personal details and content — edit here.

export interface Project {
  // Stable id: used in the URL (#work/<category>/<id>) and to pick the project's case study
  id: string
  name: string
  // Shown on the project's fragment label and in its case study; placeholders leave them out
  discipline?: string
  year?: number
  // Art direction for the project's purple fragment, overriding its seeded shape: spine length
  // (0.45–1.1), angle (radians, 0 = horizontal), bend (-0.6–0.6), thickness (0.24–0.38), how
  // much it swells at one point (0–0.6) and where (0–1), and its side lobes (0–3)
  shape?: { length?: number; angle?: number; bend?: number; thick?: number; lean?: number; peak?: number; lobes?: number }
  // 'live' once its case study is finished and can be entered; anything else shows as coming soon
  status?: 'live' | 'coming-soon'
}

export const isLive = (project: Project | undefined) => project?.status === 'live'

export const config = {
  name: 'Mike Androulakis',
  role: 'Creative Designer',
  email: 'mixahlerva@gmail.com',
  // Fluid background colour. Brand metallic blue alternative: '#2f6f8f'
  blobColor: '#5653c8',
  // Order matches the object's four designed states in src/lib/objectStates.ts
  categories: [
    { id: 'brand', name: 'Brand Identity' },
    { id: 'uiux', name: 'UI / UX' },
    { id: 'art-direction', name: 'Art Direction' },
    { id: 'creative', name: 'Creative Development' },
  ],
  // Each category's projects, in order. The count is read from here everywhere (up to 9).
  projects: {
    brand: [
      // Compact and doubled back on itself, like dough folded over
      {
        id: 'fold',
        name: 'Fold',
        discipline: 'Brand Identity / Hospitality',
        year: 2026,
        shape: { length: 0.55, angle: 0.5, bend: 0.58, thick: 0.36, lean: 0.25, peak: 0.3, lobes: 2 },
        status: 'live',
      },
      // Long, level and even: a shelf
      {
        id: 'open-shelf',
        name: 'Open Shelf',
        discipline: 'Brand Identity / Public Library',
        year: 2025,
        shape: { length: 1.08, angle: 0.06, bend: -0.08, thick: 0.27, lean: 0.12, peak: 0.6, lobes: 1 },
      },
      // A body trailing away into smaller and smaller echoes of itself
      {
        id: 'decay',
        name: 'Decay',
        discipline: 'Brand Identity / Music Festival',
        year: 2026,
        shape: { length: 0.98, angle: 2.55, bend: 0.32, thick: 0.31, lean: 0.6, peak: 0.08, lobes: 3 },
      },
      // Upright, still and single, with nothing extra
      {
        id: 'plinth',
        name: 'Plinth',
        discipline: 'Brand Identity / Gallery',
        year: 2025,
        shape: { length: 0.62, angle: 1.57, bend: 0, thick: 0.35, lean: 0.05, peak: 0.5, lobes: 0 },
      },
    ],
    uiux: [
      {
        id: 'fittrack',
        name: 'FitTrack',
        discipline: 'Fitness & wellness app',
        year: 2025,
        status: 'live',
        shape: { length: 0.84, angle: 0.9, bend: -0.4, thick: 0.31, lean: 0.42, peak: 0.78, lobes: 2 },
      },
      {
        id: 'tripmate',
        name: 'TripMate',
        discipline: 'Travel planning app',
        year: 2026,
        shape: { length: 0.96, angle: 0.16, bend: -0.18, thick: 0.3, lean: 0.25, peak: 0.7, lobes: 1 },
      },
      {
        id: 'medicare',
        name: 'Medicare',
        discipline: 'Doctor appointment app',
        year: 2026,
        shape: { length: 0.72, angle: 1.45, bend: 0.28, thick: 0.34, lean: 0.2, peak: 0.45, lobes: 2 },
      },
      {
        id: 'shoply',
        name: 'Shoply',
        discipline: 'E-commerce platform',
        year: 2025,
        shape: { length: 1.05, angle: 2.7, bend: 0.08, thick: 0.28, lean: 0.38, peak: 0.2, lobes: 1 },
      },
    ],
    'art-direction': [
      // Arched and closed, like a headband over two ear cups
      {
        id: 'pulse',
        name: 'Pulse',
        discipline: 'Art Direction / Brand Campaign',
        year: 2026,
        shape: { length: 0.6, angle: 0, bend: 0.55, thick: 0.34, lean: 0.5, peak: 0.5, lobes: 0 },
        status: 'live',
      },
      { id: 'night-shift', name: 'Night Shift', discipline: 'Art Direction / Music Video' },
      { id: 'still-life', name: 'Still Life', discipline: 'Art Direction / Product Campaign' },
      { id: 'afterglow', name: 'Afterglow', discipline: 'Art Direction / Album Artwork' },
    ],
    creative: [
      { id: 'signal', name: 'Signal', discipline: 'Creative Development / Live Visuals' },
      { id: 'loop', name: 'Loop', discipline: 'Creative Development / Motion System' },
      { id: 'strobe', name: 'Strobe', discipline: 'Creative Development / LED Stage Content' },
      { id: 'drift', name: 'Drift', discipline: 'Creative Development / Interactive Web', status: 'live' },
    ],
  } as Record<'brand' | 'uiux' | 'art-direction' | 'creative', Project[]>,
} as const

export type CategoryId = (typeof config.categories)[number]['id']
