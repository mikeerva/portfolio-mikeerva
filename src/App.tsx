import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FluidCanvas } from './components/FluidCanvas'
import { LoadingPage } from './components/LoadingPage'
import { Menu } from './components/Menu'
import { SoundToggle } from './components/SoundToggle'
import { WorkList } from './components/WorkList'
import { WorkSlider } from './components/WorkSlider'
import { config, slug, type Category } from './config'
import { scene } from './lib/scene'

type Route = { view: 'home' } | { view: 'work' } | { view: 'category'; category: Category }

function readRoute(): Route {
  const hash = window.location.hash
  if (hash.startsWith('#work/')) {
    const category = config.categories.find((c) => slug(c.name) === hash.slice('#work/'.length))
    return category ? { view: 'category', category } : { view: 'work' }
  }
  return hash === '#work' ? { view: 'work' } : { view: 'home' }
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

const heroLink = 'text-base font-semibold lowercase text-cream transition-opacity duration-300 hover:opacity-70 sm:text-lg'

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const route = useRoute()

  // Set before the slider mounts (it waits for the list to fade out) so the background starts shifting right away
  const category = route.view === 'category' ? route.category : null
  useEffect(() => {
    if (!category) return
    scene.colors = category.works.map((w) => w.color)
    scene.position = 0
  }, [category])

  return (
    <>
      {!loadingComplete && <LoadingPage onComplete={() => setLoadingComplete(true)} />}
      <main className="relative h-svh w-full overflow-hidden bg-bg">
        <FluidCanvas mode={route.view === 'category' ? 'slider' : route.view} />

        <header className="relative z-10 flex justify-end p-5 sm:p-8">
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5"
            >
              <div className="flex gap-10 sm:gap-16">
                <a href="#work" className={heroLink}>
                  see my work
                </a>
                <a href={`mailto:${config.email}`} className={heroLink}>
                  get in touch
                </a>
              </div>
            </motion.div>
          ) : route.view === 'work' ? (
            <WorkList key="work" />
          ) : (
            <WorkSlider key={slug(route.category.name)} category={route.category} />
          )}
        </AnimatePresence>

        <div className="absolute bottom-5 right-5 z-10 sm:bottom-8 sm:right-8">
          <SoundToggle />
        </div>
      </main>
    </>
  )
}
