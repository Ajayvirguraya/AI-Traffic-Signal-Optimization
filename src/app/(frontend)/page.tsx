'use client'

import dynamic from 'next/dynamic'

const ATSOApp = dynamic(() => import('@/components/atso/ATSOApp'), {
  ssr: false,
  loading: () => (
    <main className="loading-shell">
      <span className="eyebrow">
        <span /> ATSO ENGINE
      </span>
      <strong>Loading adaptive traffic simulation…</strong>
    </main>
  ),
})

export default function HomePage() {
  return <ATSOApp />
}
