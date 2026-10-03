import type { ComponentType } from 'react'
import { DecayCaseStudy } from './decay/DecayCaseStudy'
import { FoldCaseStudy } from './fold/FoldCaseStudy'
import { OpenShelfCaseStudy } from './open-shelf/OpenShelfCaseStudy'
import { PlinthCaseStudy } from './plinth/PlinthCaseStudy'
import { TripMateCaseStudy, MedicareCaseStudy, ShoplyCaseStudy, FitTrackCaseStudy } from './uiux/UIUXCaseStudies'

// Each project's own case study, by project id (see config.projects). Projects not listed here
// show the placeholder page.
export const caseStudies: Record<string, ComponentType> = {
  fold: FoldCaseStudy,
  'open-shelf': OpenShelfCaseStudy,
  decay: DecayCaseStudy,
  plinth: PlinthCaseStudy,
  tripmate: TripMateCaseStudy,
  medicare: MedicareCaseStudy,
  shoply: ShoplyCaseStudy,
  fittrack: FitTrackCaseStudy,
}
