import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FluidCanvas } from './components/FluidCanvas'
import { LoadingPage } from './components/LoadingPage'
import { LogoMark } from './components/LogoMark'
import { Menu } from './components/Menu'
import { SoundToggle } from './components/SoundToggle'
import { Work } from './components/Work'
import { config, type CategoryId } from './config'

type Route = { view: 'home' } | { view: 'work'; category: CategoryId | null }

function readRoute(): Route {
  const [view, id] = window.location.hash.slice(1).split('/')
  if (view !== 'work') return { view: 'home' }
  return { view: 'work', category: config.categories.find((c) => c.id === id)?.id ?? null }
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

// Entry point for the next chapter: a selected category will hand off to its projects scene
const selectCategory = (id: CategoryId | null) => {
  window.location.hash = id ? `#work/${id}` : '#work'
}

const heroLink = 'text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:text-lg'

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const route = useRoute()

  return (
    <>
      {!loadingComplete && <LoadingPage onComplete={() => setLoadingComplete(true)} />}
      <main className="relative h-svh w-full overflow-hidden bg-bg">
        <FluidCanvas mode={route.view} />

        <header className="relative z-30 flex items-center justify-between p-5 sm:p-8">
          <a href="#" aria-label={config.name} className="transition-opacity duration-300 hover:opacity-70">
            <LogoMark className="h-9 sm:h-10" />
          </a>
          <Menu />
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
                <LogoMark className="h-[clamp(120px,22vw,250px)]" />
              </h1>
              <div className="flex gap-10 sm:gap-16">
                <a href="#work" className={heroLink}>
                  see my work
                </a>
                <a href={`mailto:${config.email}`} className={heroLink}>
                  get in touch
                </a>
              </div>
            </motion.div>
          ) : (
            <Work
              key="work"
              selected={route.category}
              onSelect={selectCategory}
              onClose={() => selectCategory(null)}
            />
          )}
        </AnimatePresence>

        <div className="absolute bottom-5 right-5 z-30 sm:bottom-8 sm:right-8">
          <SoundToggle />
        </div>
      </main>
    </>
  )
}
