import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { services } from '../data/services'

const ease = [0.22, 1, 0.36, 1]

export default function Services() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const trackRef = useRef(null)
  const skipScrollRef = useRef(true)
  const current = services[index]

  const goTo = (next) => {
    if (next === index) return
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  const prev = () => goTo((index - 1 + services.length) % services.length)
  const next = () => goTo((index + 1) % services.length)

  // Horizontal track scroll only — never scroll the page
  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false
      return
    }
    const track = trackRef.current
    const el = track?.querySelector(`[data-idx="${index}"]`)
    if (!track || !el) return
    const left = el.offsetLeft - track.clientWidth / 2 + el.clientWidth / 2
    track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [index])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
          return
        }
      }
      if (e.key === 'ArrowRight') {
        setDirection(1)
        setIndex((i) => (i + 1) % services.length)
      }
      if (e.key === 'ArrowLeft') {
        setDirection(-1)
        setIndex((i) => (i - 1 + services.length) % services.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const slide = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0, filter: 'blur(6px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, filter: 'blur(6px)' }),
  }

  return (
    <section id="services" className="relative overflow-hidden border-t border-white/5 bg-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(194,181,162,0.05),_transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-light uppercase tracking-[0.32em] text-signal">
              Industries We Fuel
            </p>
            <h2 className="font-display text-3xl font-thin tracking-tight text-snow sm:text-4xl md:text-5xl">
              Nine verticals. One growth engine.
            </h2>
            <p className="mt-4 font-light text-mist md:text-lg">
              Browse each industry board for the full playbook — goals, capabilities, and how we grow
              the brand.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous industry"
              className="glass-soft flex h-11 w-11 items-center justify-center rounded-full text-fog transition hover:border-signal/40 hover:text-signal"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next industry"
              className="glass-soft flex h-11 w-11 items-center justify-center rounded-full text-fog transition hover:border-signal/40 hover:text-signal"
            >
              →
            </button>
            <span className="ml-2 font-display text-sm font-light tabular-nums text-mist">
              {current.id} / {String(services.length).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        {/* Horizontal industry track — not a vertical list */}
        <div
          ref={trackRef}
          className="mb-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, i) => {
            const active = i === index
            return (
              <button
                key={service.id}
                type="button"
                data-idx={i}
                onClick={() => goTo(i)}
                className={`group shrink-0 rounded-full px-4 py-2.5 text-left transition duration-300 ${
                  active ? 'glass' : 'border border-transparent hover:border-white/10'
                }`}
                style={
                  active
                    ? {
                        borderColor: `${service.accent}40`,
                        boxShadow: `0 0 0 1px ${service.accent}20`,
                      }
                    : undefined
                }
              >
                <span
                  className={`mr-2 font-display text-xs font-light tabular-nums ${
                    active ? 'text-signal' : 'text-mist/60'
                  }`}
                  style={active ? { color: service.accent } : undefined}
                >
                  {service.id}
                </span>
                <span
                  className={`font-display text-sm font-light whitespace-nowrap ${
                    active ? 'text-snow' : 'text-fog/55 group-hover:text-fog/80'
                  }`}
                >
                  {service.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Full-width detail board */}
        <div className="glass relative min-h-[420px] overflow-hidden rounded-[1.75rem] md:min-h-[460px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease }}
              className="relative grid gap-0 lg:grid-cols-[0.9fr_1.1fr]"
            >
              {/* Left: oversized number + outcome */}
              <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/6 p-7 md:p-10 lg:border-b-0 lg:border-r lg:border-white/6">
                <div
                  className="pointer-events-none absolute -left-6 -top-10 font-display text-[9rem] font-thin leading-none opacity-[0.07] md:text-[12rem]"
                  style={{ color: current.accent }}
                  aria-hidden
                >
                  {current.id}
                </div>

                <div className="relative">
                  <p
                    className="text-xs font-light uppercase tracking-[0.28em]"
                    style={{ color: current.accent }}
                  >
                    Industry dossier
                  </p>
                  <h3 className="font-display mt-4 max-w-sm text-3xl font-thin tracking-tight text-snow md:text-4xl lg:text-5xl">
                    {current.title}
                  </h3>
                </div>

                <div className="relative mt-10 space-y-4">
                  <div
                    className="inline-flex rounded-full px-3.5 py-1.5 text-xs font-light tracking-wide"
                    style={{
                      color: current.accent,
                      background: `${current.accent}14`,
                      border: `1px solid ${current.accent}30`,
                    }}
                  >
                    Goal · {current.outcome}
                  </div>
                  <p className="max-w-md text-sm font-light leading-relaxed text-mist md:text-base">
                    {current.detail}
                  </p>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 pt-2 text-sm font-light tracking-wide transition hover:opacity-80"
                    style={{ color: current.accent }}
                  >
                    Start this project
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </div>

              {/* Right: copy + capability grid */}
              <div className="relative flex flex-col justify-center p-7 md:p-10">
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.45, ease }}
                  className="max-w-xl text-base font-light leading-relaxed text-fog md:text-lg"
                >
                  {current.description}
                </motion.p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {current.tags.map((tag, i) => (
                    <motion.div
                      key={tag.name}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 + i * 0.06, duration: 0.45, ease }}
                      className="glass-soft rounded-2xl p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-sm font-light text-snow">{tag.name}</p>
                        <span
                          className="font-display text-[10px] font-light tabular-nums"
                          style={{ color: current.accent }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-light leading-relaxed text-mist">{tag.desc}</p>
                      <div
                        className="mt-3 h-px w-full origin-left"
                        style={{
                          background: `linear-gradient(90deg, ${current.accent}66, transparent)`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
            <motion.div
              className="h-full"
              style={{ backgroundColor: current.accent }}
              initial={false}
              animate={{ width: `${((index + 1) / services.length) * 100}%` }}
              transition={{ duration: 0.45, ease }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
