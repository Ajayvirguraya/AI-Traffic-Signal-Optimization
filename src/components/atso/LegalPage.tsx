import { type ReactNode } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'

type LegalPageProps = {
  title: string
  subtitle: string
  description: string
  children: ReactNode
  showUpdated?: boolean
}

export function LegalSection({
  number,
  title,
  children,
}: {
  number?: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="legal-section">
      <div className="legal-section-heading">
        {number && <span>{number}</span>}
        <h2>{title}</h2>
      </div>
      <div className="legal-section-content">{children}</div>
    </section>
  )
}

export default function LegalPage({
  title,
  subtitle,
  description,
  children,
  showUpdated = true,
}: LegalPageProps) {
  return (
    <div className="app-shell legal-shell">
      <SiteHeader />
      <main className="legal-main">
        <div className="legal-document">
          <Link className="legal-back" href="/">
            <ArrowLeft size={15} /> Back to ATSO
          </Link>
          <header className="legal-hero">
            <span className="eyebrow">
              <span /> ATSO LEGAL
            </span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {showUpdated && (
              <div className="legal-updated">
                <ShieldCheck size={15} />
                <span>Last Updated: October 2026</span>
              </div>
            )}
          </header>
          <article className="legal-content">
            <div className="legal-product-name">
              <span>ATSO</span>
              <strong>Adaptive Traffic Signal Optimization</strong>
            </div>
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
