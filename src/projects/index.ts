import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// Each project's own case study, by project id (see config.projects). Projects not listed here
// show the placeholder page.
//
// Every case study is its own chunk, code and styles, fetched the first time its project's page
// is built: the site's first load carries none of them, so adding projects never makes it heavier.
// `preloadCaseStudy` starts that fetch early (on hover, say), so the page is there when it opens.
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
  Object.entries(loaders).map(([id, load]) => [id, lazy(() => load().then((c) => ({ default: c })))]),
)

export function preloadCaseStudy(id: string) {
  void loaders[id]?.()
}
