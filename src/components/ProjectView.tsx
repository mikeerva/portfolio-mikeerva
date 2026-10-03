import type { Ref, RefObject, UIEvent } from 'react'
import type { Project } from '../config'
import { caseStudies } from '../projects'
import { ScrollerContext } from '../projects/scroll'

interface Props {
  project: Project
  panelRef: RefObject<HTMLDivElement | null>
  worldRef: Ref<HTMLDivElement>
  onScroll: (e: UIEvent<HTMLDivElement>) => void
}

// An open project. Two parts: the surrounding project world (large type set in the black space
// behind the panel and the purple masses; fixed, never scrolled, and reading --project-progress
// so it can later follow the chapter being read), and the panel itself, a scrollable editorial
// object placed in the opening the fragment tore. Both sit under the canvas, which draws the
// masses over or around them by depth. Projects positions and reveals them every frame.
// The panel is a size container: a case study sizes itself by the panel (cqw / cqh), not the
// window, and can stick and track scroll inside it.
export function ProjectView({ project, panelRef, worldRef, onScroll }: Props) {
  const CaseStudy = caseStudies[project.id]
  return (
    <>
      {/* Empty for now: project-specific type set in the space around the panel comes later */}
      <div ref={worldRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0" />

      <div
        ref={panelRef}
        onScroll={onScroll}
        className="@container absolute z-0 touch-pan-y select-text overflow-y-auto overflow-x-hidden overscroll-contain rounded-[6px] bg-cream text-neutral-900 opacity-0"
        style={{ pointerEvents: 'none', containerType: 'size' }}
      >
        <ScrollerContext.Provider value={panelRef}>
          {CaseStudy ? <CaseStudy /> : <Placeholder project={project} />}
        </ScrollerContext.Provider>
      </div>
    </>
  )
}

// Projects without a case study yet
const CHAPTERS = ['Idea', 'Identity', 'Photography', 'Packaging', 'Space', 'Digital', 'Closing']
function Placeholder({ project }: { project: Project }) {
  return (
    <>
      <header className="flex min-h-[70%] flex-col justify-end px-[9%] pb-[8%] pt-[12%]">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.35em] text-neutral-500">Case study</p>
        <h2 className="font-display text-[clamp(48px,11cqw,200px)] font-bold uppercase leading-[0.82] tracking-[-0.03em]">
          {project.name}
        </h2>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">Case study in preparation</p>
      </header>
      {CHAPTERS.map((chapter, i) => (
        <section key={chapter} data-chapter={i} className="border-t border-neutral-900/10 px-[9%] py-[9%]">
          <div className="mb-10 flex items-baseline gap-6">
            <span className="text-xs font-medium tabular-nums tracking-[0.3em] text-neutral-500">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-display text-[clamp(28px,4.4cqw,72px)] font-bold uppercase leading-none tracking-[-0.02em]">{chapter}</h3>
          </div>
          <div className="grid gap-[4%] @2xl:grid-cols-12">
            <p className="text-sm leading-relaxed text-neutral-600 @2xl:col-span-4">
              Placeholder text for the {chapter.toLowerCase()} chapter. The final copy, imagery and layout for this section come
              later; this block only stands in for its rhythm and length.
            </p>
            <div className={`aspect-[4/3] rounded-[3px] bg-neutral-900/[0.07] @2xl:col-span-8 ${i % 2 ? '@2xl:order-first' : ''}`} />
          </div>
        </section>
      ))}
      <footer className="px-[9%] pb-[14%] pt-[6%] text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
        End of case study
      </footer>
    </>
  )
}
