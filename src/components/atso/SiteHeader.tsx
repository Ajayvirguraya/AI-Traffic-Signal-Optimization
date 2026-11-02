'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Menu, Route, X } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  ['01 Simulation', 'simulation'],
  ['02 Dataset', 'dataset'],
  ['03 Analytics', 'analytics'],
  ['04 Reports', 'reports'],
  ['05 About', 'about'],
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="ATSO home">
        <span className="brand-mark">
          <Route size={22} />
        </span>
        <span>ATSO</span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(([label, id]) => (
          <a href={`/#${id}`} key={id}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <span className="system-online">
          <span /> ATSO ENGINE ONLINE
        </span>
        <button
          className="button button-ghost menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {navItems.map(([label, id]) => (
              <a href={`/#${id}`} key={id} onClick={() => setMenuOpen(false)}>
                {label}
                <ChevronRight size={16} />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
