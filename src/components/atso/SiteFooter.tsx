import { Route } from 'lucide-react'
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Route size={22} />
          </span>
          <span>ATSO</span>
        </Link>
        <div className="footer-identity">
          <strong>Adaptive Traffic Signal Optimization</strong>
          <p>Intelligent Traffic, Adaptive Signals</p>
          <span>AI-powered traffic optimization simulation.</span>
        </div>
      </div>
      <nav className="footer-links" aria-label="Legal and contact links">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms &amp; Conditions</Link>
        <Link href="/disclaimer">Disclaimer</Link>
        <a href="/#about">Contact</a>
      </nav>
      <div className="footer-bottom legal-footer-bottom">
        <span>© 2026 ATSO. All rights reserved.</span>
        <span>DEMO SIMULATION — NOT REAL-WORLD TRAFFIC CONTROL</span>
      </div>
    </footer>
  )
}
