const whatsapp = '923358019855'

function IconTikTok({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
    </svg>
  )
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.26 2.09 16.09 2 15 2c-3.03 0-5 1.79-5 5.5V9.5H7v4h3V22h4v-8.5z" />
    </svg>
  )
}

function IconWhatsApp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.52 5.32L2.1 21.9l4.72-1.24A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.8.73.75-2.73-.19-.31A8.08 8.08 0 0 1 3.9 12 8.1 8.1 0 0 1 12 3.9 8.1 8.1 0 0 1 20.1 12 8.1 8.1 0 0 1 12 20.1z" />
    </svg>
  )
}

const iconBtn =
  'flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-fog transition hover:border-signal/40 hover:text-signal'

export default function Footer() {
  return (
    <footer className="glass-nav border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-10 md:flex-row md:items-center md:px-8">
        <div>
          <a href="#top" className="inline-flex items-center" aria-label="Aerosiq home">
            <img src="/aerosiq-logo.svg" alt="Aerosiq" className="h-9 w-9 md:h-10 md:w-10" />
          </a>
          <p className="mt-2 text-sm font-light text-mist">We build brands that stand out.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.tiktok.com/"
            target="_blank"
            rel="noreferrer"
            className={iconBtn}
            aria-label="TikTok"
          >
            <IconTikTok className="h-4 w-4" />
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noreferrer"
            className={iconBtn}
            aria-label="Facebook"
          >
            <IconFacebook className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className={iconBtn}
            aria-label="WhatsApp"
          >
            <IconWhatsApp className="h-4 w-4" />
          </a>
        </div>

        <p className="text-xs font-light text-mist">
          © {new Date().getFullYear()} Aerosiq Marketing
        </p>
      </div>
    </footer>
  )
}
