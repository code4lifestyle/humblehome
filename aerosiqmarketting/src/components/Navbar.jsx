import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AIMotionStrip from './AIMotionStrip'

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="flex shrink-0 items-center" aria-label="Aerosiq home">
          <img
            src="/aerosiq-logo.svg"
            alt="Aerosiq"
            className="h-9 w-9 md:h-10 md:w-10"
          />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-light tracking-wide text-fog/70 transition hover:text-signal"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="glass-soft rounded-full px-4 py-2 text-sm font-light tracking-wide text-signal transition hover:border-signal/40 hover:bg-signal/10"
        >
          Start a Project
        </a>
      </nav>
      <AIMotionStrip />
    </motion.header>
  )
}
