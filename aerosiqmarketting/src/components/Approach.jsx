import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

const SignalOrbit = lazy(() => import('./three/SignalOrbit.jsx'))

const steps = [
  {
    title: 'Discover',
    copy: 'We map your market, audience, and competitors — then lock a positioning that actually differentiates.',
  },
  {
    title: 'Create',
    copy: 'SEO-ready content, scroll-stopping visuals, and platform-native campaigns that stay on-brand everywhere.',
  },
  {
    title: 'Amplify',
    copy: 'Paid + organic distribution, retargeting, and review systems that compound into measurable growth.',
  },
]

export default function Approach() {
  return (
    <section id="approach" className="relative overflow-hidden border-t border-white/5 bg-ink-soft">
      {/* New orbital signal animation */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full max-w-2xl opacity-30 md:opacity-45">
        <Suspense fallback={<div className="h-full w-full bg-ink-soft" />}>
          <SignalOrbit />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink-soft/40 to-ink-soft" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <p className="mb-3 text-xs font-light uppercase tracking-[0.32em] text-signal">
          How We Work
        </p>
        <h2 className="font-display max-w-xl text-3xl font-thin tracking-tight text-snow sm:text-4xl md:text-5xl">
          Consistency across every channel — without the chaos.
        </h2>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-[1.35rem] p-6 md:p-7"
            >
              <p className="font-display text-5xl font-thin text-signal/25">0{i + 1}</p>
              <h3 className="font-display mt-3 text-2xl font-light text-snow">{step.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-mist md:text-base">
                {step.copy}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
