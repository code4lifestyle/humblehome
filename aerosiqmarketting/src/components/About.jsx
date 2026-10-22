import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

const DNABackground = lazy(() => import('./three/DNABackground.jsx'))

const pillars = [
  {
    title: 'Connect',
    copy: 'Experiences that build real relationships between your brand and your audience.',
  },
  {
    title: 'Convert',
    copy: 'Campaigns engineered to turn attention into measurable action and revenue.',
  },
  {
    title: 'Scale',
    copy: 'Systems that grow with you — consistent, data-led, and built for the long game.',
  },
]

const ease = [0.22, 1, 0.36, 1]

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden border-t border-white/5 bg-ink">
      {/* DNA helix background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 md:opacity-50">
        <Suspense fallback={<div className="h-full w-full bg-ink" />}>
          <DNABackground />
        </Suspense>
      </div>

      {/* Keep copy readable */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink via-ink/70 to-ink/40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-ink/80 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="mb-3 text-xs font-light uppercase tracking-[0.32em] text-signal">
              About Aerosiq
            </p>
            <h2 className="font-display text-3xl font-thin tracking-tight text-snow sm:text-4xl md:text-5xl">
              We are Aerosiq — Your Digital Growth Partners.
            </h2>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-light tracking-wide text-ink transition hover:bg-snow"
            >
              Work with us
              <span aria-hidden>→</span>
            </a>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease }}
              className="glass rounded-[1.5rem] p-6 md:p-8"
            >
              <p className="text-base font-light leading-relaxed text-fog md:text-lg">
                Aerosiq Marketing Agency is a results-driven digital marketing firm dedicated to
                elevating brands. We don&apos;t just run campaigns; we engineer digital experiences
                that connect, convert, and scale.
              </p>
              <p className="mt-5 text-sm font-light leading-relaxed text-mist md:text-base">
                With a proven track record across diverse sectors—from the culinary world to real
                estate and automotive—we understand that every industry requires a unique voice and
                a tailored strategy.
              </p>
              <p className="mt-5 text-sm font-light leading-relaxed text-mist md:text-base">
                Our team combines data-driven insights with bold creative design to ensure your
                brand doesn&apos;t just blend in, but stands out in a crowded digital landscape.
              </p>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.5, ease }}
                  className="glass-soft rounded-2xl p-5"
                >
                  <p className="font-display text-xs font-light uppercase tracking-[0.22em] text-signal">
                    0{i + 1}
                  </p>
                  <h3 className="font-display mt-2 text-xl font-light text-snow">{pillar.title}</h3>
                  <p className="mt-2 text-xs font-light leading-relaxed text-mist">{pillar.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
