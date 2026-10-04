import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type CSSProperties } from 'react'
import { FluidCanvas } from './components/FluidCanvas'
import { LoadingPage } from './components/LoadingPage'
import { LogoMark } from './components/LogoMark'
import { Float } from './components/Float'
import { Menu } from './components/Menu'
import { SoundToggle } from './components/SoundToggle'
import { Work } from './components/Work'
import { config, type CategoryId } from './config'
import { prepareWorkEntry } from './lib/onboarding'

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
    let view = readRoute().view
    const onHash = () => {
      const next = readRoute()
      // Entering Work from the Hero: settle the mass's orientation before any of it shows
      if (view === 'home' && next.view === 'work' && !next.category) prepareWorkEntry()
      view = next.view
      setRoute(next)
    }
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
const heroLinks = {
  hidden: { opacity: 0, transition: { duration: 0.4 } },
  shown: { opacity: 1, transition: { duration: 0.6 } },
}
// Hovered, a link rises toward the viewer like a Work name coming forward: a touch larger and a
// little wider (opening its letters without changing the layout), its shadow thrown further off,
// lit lavender as if by the mass's highlights. The hover is read from a still wrapper (heroHover),
// so the link drifting or growing under the pointer can't switch it on and off.
const heroLink =
  'lift-shadow origin-center text-phi-md font-semibold lowercase text-cream transition-[scale,text-shadow,color] duration-500 ease-out group-hover:[scale:1.035_1.025] group-hover:text-glow group-hover:[--lift:0.85]'
const heroHover = 'group inline-block'
// The links' reveal window, with room inside it for their shadow and their hovered size (the
// negative margins keep the layout)
const heroLinkClip = 'block overflow-hidden px-3 pt-1 pb-3 -mx-3 -mt-1 -mb-2'

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

        <header className="relative z-30 flex items-center justify-between py-5 sm:py-8" style={{ paddingLeft: '40px', paddingRight: '40px' }}>
          {/* The small mark belongs to the portfolio inside; the Hero has the large one */}
          <motion.a
            href="#"
            aria-label={config.name}
            aria-hidden={inHero}
            tabIndex={inHero ? -1 : undefined}
            className={`lift-drop group ${inHero ? 'pointer-events-none' : ''}`}
            style={{ '--s': '40px' } as CSSProperties}
          >
            <LogoMark className="h-9 origin-left text-glow transition-[color,scale] duration-500 ease-out group-hover:scale-[1.06] group-hover:text-white sm:h-10" reveal={!inHero} delay={0.4} stroke={22} />
          </motion.a>
          <motion.div {...appear(0.95)}>
            <Menu />
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {route.view === 'home' ? (
            <motion.div
              key="home"
              initial="hidden"
              animate={intro && !entering ? 'hidden' : 'shown'}
              exit="hidden"
              className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-10 px-5 sm:gap-14"
            >
              <h1>
                <span className="sr-only">{config.name}</span>
                {/* Lit lavender for good, its two forms each adrift on their own; it doesn't respond
                    to the pointer */}
                <span className="lift-drop block" style={{ '--s': 'clamp(120px, 22vw, 250px)' } as CSSProperties}>
                  <LogoMark className="h-[clamp(120px,22vw,250px)] text-glow" reveal="inherit" delay={0.25} stroke={7} drift />
                </span>
              </h1>
              <motion.div className="flex gap-10 sm:gap-16" variants={heroLinks}>
                <span className={heroHover}>
                  <Float>
                    <span className={heroLinkClip}>
                      <motion.a href="#work" className={`block ${heroLink}`} {...rise(0.7)}>
                        see my work
                      </motion.a>
                    </span>
                  </Float>
                </span>
                <span className={heroHover}>
                  <Float phase={1.3}>
                    <span className={heroLinkClip}>
                      <motion.a href={`mailto:${config.email}`} className={`block ${heroLink}`} {...rise(0.78)}>
                        get in touch
                      </motion.a>
                    </span>
                  </Float>
                </span>
              </motion.div>
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

        <motion.div className="lift-drop absolute bottom-5 z-30 sm:bottom-8" style={{ right: '40px', '--s': '40px' } as CSSProperties} {...appear(1.0)}>
          <SoundToggle />
        </motion.div>
      </main>
    </>
  )
}
