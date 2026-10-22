import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

const GlobeHero = lazy(() => import('./three/GlobeHero.jsx'))

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section id="top" className="relative min-h-dvh overflow-hidden bg-[#05060d]">
      {/* Background globe — pushed to the right */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-cyan-400/10 blur-3xl" />
            </div>
          }
        >
          <GlobeHero />
        </Suspense>
      </div>

      {/* Strong left veil so far-left copy stays clear */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[58%] bg-gradient-to-r from-[#05060d] via-[#05060d]/92 to-transparent md:w-[50%]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#05060d]/25" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-[#05060d] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-[#05060d]/70 to-transparent" />

      {/* Far-left content — no centered container */}
      <div className="relative z-10 flex min-h-dvh w-full items-end justify-start pb-16 pl-5 pr-5 pt-36 text-left md:items-start md:pb-24 md:pl-8 md:pr-8 md:pt-32 lg:pl-12 lg:pt-36 xl:pl-16">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full max-w-[28rem] font-mono sm:max-w-md md:mt-6 md:max-w-lg"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            <span className="text-[10px] font-normal uppercase tracking-[0.22em] text-cyan-200">
              Global brand network
            </span>
          </div>

          <div className="text-justify">
            <p className="mb-3 text-4xl font-light tracking-tight text-signal sm:text-5xl md:text-6xl lg:text-7xl">
              Aerosiq
            </p>

            <h1 className="text-3xl font-light leading-[1.25] tracking-tight text-snow sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              We Build Brands that{' '}
              <span className="text-fog">Stand Out</span>
            </h1>

            <div className="mt-5 space-y-4 text-sm font-light leading-relaxed text-mist sm:text-base md:text-lg">
              <p>
                Connect your SEO-optimized content seamlessly with your marketing strategy to create
                a consistent and effective digital presence. Align your content with your marketing
                goals to streamline workflows and improve overall efficiency.
              </p>
              <p>
                Save valuable time, maintain consistency across your marketing efforts, and
                accelerate business growth through a unified approach across all digital platforms.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-normal tracking-wide text-ink transition hover:bg-snow"
            >
              Explore Industries
              <span aria-hidden>→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-fog/25 bg-black/20 px-6 py-3 text-sm font-normal tracking-wide text-fog backdrop-blur-sm transition hover:border-signal hover:text-signal"
            >
              Book a Call
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <div className="flex flex-col items-center gap-2 font-mono text-[10px] font-light uppercase tracking-[0.35em] text-mist">
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-signal/40" />
        </div>
      </motion.div>
    </section>
  )
}
