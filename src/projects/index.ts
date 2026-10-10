import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// Each project's own case study, by project id (see config.projects). Projects not listed here
// show the placeholder page.
//
// Every case study is its own chunk, code and styles, fetched the first time its project's page
// is built: the site's first load carries none of them, so adding projects never makes it heavier.
// `preloadCaseStudy` starts that fetch early (on hover, say), so the page is there when it opens.
// The case studies' own type families, beyond the site's: asked for once, with the first case
// study fetched, so the site's first load doesn't wait on them. Resolves once they're declared.
const CASE_FONTS =
  'https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500&family=DM+Mono:wght@400;500&family=Archivo:wdth,wght@62..125,300..900&display=swap'
let caseFonts: Promise<void> | null = null
function loadCaseFonts() {
  caseFonts ??= new Promise<void>((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = CASE_FONTS
    link.onload = link.onerror = () => resolve()
    document.head.appendChild(link)
  })
  return caseFonts
}

const loaders: Record<string, () => Promise<ComponentType>> = {
  fold: () => import('./fold/FoldCaseStudy').then((m) => m.FoldCaseStudy),
  'open-shelf': () => import('./open-shelf/OpenShelfCaseStudy').then((m) => m.OpenShelfCaseStudy),
  decay: () => import('./decay/DecayCaseStudy').then((m) => m.DecayCaseStudy),
  plinth: () => import('./plinth/PlinthCaseStudy').then((m) => m.PlinthCaseStudy),
  tripmate: () => import('./uiux/UIUXCaseStudies').then((m) => m.TripMateCaseStudy),
  medicare: () => import('./uiux/UIUXCaseStudies').then((m) => m.MedicareCaseStudy),
  shoply: () => import('./uiux/UIUXCaseStudies').then((m) => m.ShoplyCaseStudy),
  fittrack: () => import('./fittrack/FitTrackCaseStudy').then((m) => m.FitTrackCaseStudy),
  drift: () => import('./drift/DriftCaseStudy').then((m) => m.DriftCaseStudy),
  pulse: () => import('./pulse/PulseCaseStudy').then((m) => m.PulseCaseStudy),
}

export const caseStudies: Record<string, LazyExoticComponent<ComponentType>> = Object.fromEntries(
  Object.entries(loaders).map(([id, load]) => [
    id,
    lazy(() => {
      void loadCaseFonts()
      return load().then((c) => ({ default: c }))
    }),
  ]),
)

// The web fonts a case study sets its type in, beyond the site's own. Fetched with it: arriving
// after it's built, they'd make the browser lay the whole page out a second time.
const MONO = ['400 1em "IBM Plex Mono"', '500 1em "IBM Plex Mono"']
const ARCHIVO = ['400 1em Archivo', '700 1em Archivo']
const fonts: Record<string, string[]> = {
  fold: ['400 1em Anton', ...MONO],
  fittrack: [...ARCHIVO, ...MONO],
  drift: [...ARCHIVO, ...MONO],
}

export function preloadCaseStudy(id: string) {
  void loaders[id]?.()
  // Once the families are declared, the case study's own are fetched too
  void loadCaseFonts().then(() => {
    for (const font of fonts[id] ?? []) document.fonts.load(font).catch(() => {})
  })
}
