import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/5 bg-ink">
      {/* Technology image background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/tech-bg.jpg"
          alt=""
          aria-hidden
          className="h-full w-full scale-105 object-cover opacity-50 brightness-110 contrast-125"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/80" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div>
          <p className="mb-3 text-xs font-light uppercase tracking-[0.32em] text-signal">
            Let&apos;s Build
          </p>
          <h2 className="font-display text-3xl font-thin tracking-tight text-snow sm:text-4xl md:text-5xl">
            Ready for a brand that actually stands out?
          </h2>
          <p className="mt-4 max-w-md font-light text-mist md:text-lg">
            Tell us about your business. We&apos;ll reply with a clear growth plan — not a generic
            pitch deck.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onSubmit={onSubmit}
          className="glass space-y-4 rounded-[1.5rem] p-6 md:p-8"
        >
          {sent ? (
            <p className="py-10 text-center font-display text-2xl font-light text-signal">
              Thanks — we&apos;ll be in touch soon.
            </p>
          ) : (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs font-light uppercase tracking-[0.2em] text-mist">
                  Name
                </span>
                <input
                  required
                  name="name"
                  className="glass-input w-full rounded-xl px-4 py-3 font-light text-snow outline-none transition placeholder:text-mist/50"
                  placeholder="Alex Rivera"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-light uppercase tracking-[0.2em] text-mist">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  className="glass-input w-full rounded-xl px-4 py-3 font-light text-snow outline-none transition placeholder:text-mist/50"
                  placeholder="alex@brand.com"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-light uppercase tracking-[0.2em] text-mist">
                  Industry
                </span>
                <select
                  name="industry"
                  className="glass-input w-full rounded-xl px-4 py-3 font-light text-snow outline-none transition"
                  defaultValue=""
                >
                  <option value="" disabled className="bg-ink">
                    Select your industry
                  </option>
                  <option className="bg-ink">Restaurants & Street Food</option>
                  <option className="bg-ink">Real Estate</option>
                  <option className="bg-ink">Construction</option>
                  <option className="bg-ink">Schools & Colleges</option>
                  <option className="bg-ink">Fitness & Wellness</option>
                  <option className="bg-ink">Hospitality & Tourism</option>
                  <option className="bg-ink">Auto & Motorcycle Showrooms</option>
                  <option className="bg-ink">Beauty & Aesthetics</option>
                  <option className="bg-ink">Hair Salons</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-light uppercase tracking-[0.2em] text-mist">
                  Project notes
                </span>
                <textarea
                  name="message"
                  rows={4}
                  className="glass-input w-full resize-none rounded-xl px-4 py-3 font-light text-snow outline-none transition placeholder:text-mist/50"
                  placeholder="What are you looking to grow?"
                />
              </label>
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-signal py-3.5 text-sm font-light tracking-wide text-ink transition hover:bg-snow"
              >
                Send Message
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  )
}
