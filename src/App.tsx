import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FluidCanvas } from './components/FluidCanvas'
import { LoadingPage } from './components/LoadingPage'
import { LogoMark } from './components/LogoMark'
import { Menu } from './components/Menu'
import { SoundToggle } from './components/SoundToggle'
import { Work } from './components/Work'
import { config, type CategoryId } from './config'
import { object } from './lib/scene'

// #work/<category> opens a category's projects; #work/<category>/<project id> enters a project
type Route = { view: 'home' } | { view: 'work'; category: CategoryId | null; project: number | null }

function readRoute(): Route {
  const [view, id, projectId] = window.location.hash.slice(1).split('/')
  if (view !== 'work') return { view: 'home' }
  const category = config.categories.find((c) => c.id === id)?.id ?? null
  const index = category ? config.projects[category].findIndex((p) => p.id === projectId) : -1
  return { view: 'work', category, project: index >= 0 ? index : null }
}

function useRoute() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

const selectCategory = (id: CategoryId | null) => {
  window.location.hash = id ? `#work/${id}` : '#work'
}

const selectProject = (id: CategoryId, index: number | null) => {
  window.location.hash = index === null ? `#work/${id}` : `#work/${id}/${config.projects[id][index].id}`
}

const ease = [0.22, 1, 0.36, 1] as const
const heroLink ='text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:text-lg'

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  // First appearance: the Hero forms as the loading screen starts to lift. Only once, and not
  // at all with reduced motion.
  const reduced = useReducedMotion()
  const [intro, setIntro] = useState(() => !reduced)
  const [entering, setEntering] = useState(false)
  const route = useRoute()
  const inHero = route.view === 'home'

  const begin = () => {
    object.introAt = reduced ? 0 : performance.now()
    setEntering(true)
    // Later visits to the Hero just use its usual fade
    setTimeout(() => setIntro(false), 2600)
  }

  // Hero type: a short rise into place, revealed by its own clipping box
  const rise = (delay: number) =>
    intro
      ? {
          initial: { y: '110%', opacity: 0 },
          animate: entering ? { y: '0%', opacity: 1, transition: { duration: 0.75, ease, delay } } : undefined,
        }
      : {}
  // Controls that open overlays only fade, so no transform is ever left on their parents
  const appear = (delay: number) =>
    intro
      ? {
          initial: { opacity: 0 },
          animate: entering ? { opacity: 1, transition: { duration: 0.8, ease, delay } } : undefined,
        }
      : {}

  return (
    <>
      {!loadingComplete && <LoadingPage onStart={begin} onComplete={() => setLoadingComplete(true)} />}
      <main className="relative h-svh w-full overflow-hidden bg-bg">
        <FluidCanvas mode={route.view} />

        <header className="relative z-30 flex items-center justify-between p-5 sm:p-8">
          {/* The small mark belongs to the portfolio inside; the Hero has the large one */}
          <motion.a
            href="#"
            aria-label={config.name}
            aria-hidden={inHero}
            tabIndex={inHero ? -1 : undefined}
            initial={false}
            animate={inHero ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease, delay: inHero ? 0 : 0.4 }}
            className={`transition-opacity duration-300 hover:opacity-70 ${inHero ? 'pointer-events-none' : ''}`}
          >
            <LogoMark className="h-9 sm:h-10" />
          </motion.a>
          <motion.div {...appear(0.95)}>
            <Menu />
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {route.view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-10 px-5 sm:gap-14"
            >
              <h1>
                <span className="sr-only">{config.name}</span>
                {/* Revealed from the central pinch outward to both sides */}
                <motion.span
                  className="block"
                  initial={intro ? { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0 } : false}
                  animate={
                    entering
                      ? {
                          clipPath: 'inset(0% 0% 0% 0%)',
                          opacity: 1,
                          transition: {
                            clipPath: { duration: 1.1, ease, delay: 0.25 },
                            opacity: { duration: 0.35, delay: 0.25 },
                          },
                        }
                      : undefined
                  }
                >
                  <LogoMark className="h-[clamp(120px,22vw,250px)]" />
                </motion.span>
              </h1>
              <div className="flex gap-10 sm:gap-16">
                <span className="overflow-hidden pb-1">
                  <motion.a href="#work" className={`block ${heroLink}`} {...rise(0.7)}>
                    see my work
                  </motion.a>
                </span>
                <span className="overflow-hidden pb-1">
                  <motion.a href={`mailto:${config.email}`} className={`block ${heroLink}`} {...rise(0.78)}>
                    get in touch
                  </motion.a>
                </span>
              </div>
            </motion.div>
          ) : (
            <Work
              key="work"
              selected={route.category}
              project={route.project}
              onSelect={selectCategory}
              onClose={() => selectCategory(null)}
              onProject={selectProject}
            />
          )}
        </AnimatePresence>

        <motion.div className="absolute bottom-5 right-5 z-30 sm:bottom-8 sm:right-8" {...appear(1.0)}>
          <SoundToggle />
        </motion.div>
      </main>
    </>
  )
}
