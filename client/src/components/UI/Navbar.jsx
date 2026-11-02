import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/',          label: 'Picture of the day' },
  { to: '/launches',  label: 'Launches'           },
  { to: '/iss',       label: 'ISS tracker'        },
  { to: '/asteroids', label: 'Asteroids'          },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const { pathname }          = useLocation()

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-[61px] border-b border-hairline bg-void/90 backdrop-blur-md">

        {/* Wordmark */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-glow opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-glow" />
          </span>
          <span className="font-display font-semibold tracking-[0.18em] text-sm text-body group-hover:text-glow transition-colors">
            ORION
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'text-glow'
                    : 'text-dim hover:text-body hover:bg-panel'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-glow/8 border border-glow/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 shrink-0"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <motion.span
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block h-px w-5 bg-body origin-center transition-colors"
          />
          <motion.span
            animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            className="block h-px w-5 bg-body"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block h-px w-5 bg-body origin-center"
          />
        </button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-md md:hidden flex flex-col pt-[61px]"
          >
            <nav className="flex flex-col px-6 pt-8 gap-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block px-4 py-3.5 rounded-xl text-lg font-display font-medium transition-colors ${
                        isActive
                          ? 'text-glow bg-glow/8 border border-glow/20'
                          : 'text-dim hover:text-body hover:bg-panel'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Bottom signature */}
            <div className="mt-auto px-6 pb-10">
              <p className="telemetry text-dim">Live NASA data · Updated in real time</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}