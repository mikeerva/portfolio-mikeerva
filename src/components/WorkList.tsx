import { motion } from 'framer-motion'
import { config, slug } from '../config'

const ease = [0.22, 1, 0.36, 1] as const

export function WorkList() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex items-center px-6 sm:px-[10vw]"
    >
      <div className="w-full max-w-xl text-cream">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease }}
          className="font-display text-[clamp(2rem,4vw,3rem)] font-bold"
        >
          Selected Works
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.9, ease }}
          className="mt-3 h-[3px] origin-left bg-cream"
        />
        <ul>
          {config.categories.map((c, i) => (
            <motion.li
              key={c.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + i * 0.1, duration: 0.7, ease }}
              className="border-b-[3px] border-cream"
            >
              <a href={`#work/${slug(c.name)}`} className="group flex items-center justify-between gap-6 py-4 sm:py-5">
                <span className="flex items-center gap-4">
                  <span className="h-9 w-1.5 rounded-full bg-cream transition-all duration-500 group-hover:w-3" />
                  <span className="text-xl font-semibold transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                    {c.name}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums sm:text-base">
                  {String(c.works.length).padStart(2, '0')}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
