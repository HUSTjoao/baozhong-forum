'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> }
}

export default function useMajorNavigation() {
  const router = useRouter()
  return (event: MouseEvent<HTMLAnchorElement>, direction: 'open' | 'back') => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const href = event.currentTarget.href
    const target = new URL(href)
    const selector = direction === 'open' ? '.major-detail #overview.is-focused' : '.major-lens[data-resuming="true"] .lens-expanded'
    const doc = document as TransitionDocument
    event.preventDefault()
    if (document.documentElement.dataset.majorTransition) return
    document.documentElement.dataset.majorTransition = direction
    const update = async () => {
      router.push(href, { scroll: true })
      await new Promise<void>(resolve => {
        const started = performance.now()
        const check = () => {
          if (location.pathname === target.pathname && document.querySelector(selector)) setTimeout(resolve, 40)
          else if (performance.now() - started > 2500) resolve()
          else setTimeout(check, 16)
        }
        setTimeout(check, 0)
      })
    }
    const cleanup = () => { delete document.documentElement.dataset.majorTransition }
    if (doc.startViewTransition) {
      try { doc.startViewTransition(update).finished.then(cleanup, cleanup) } catch { void update().finally(cleanup) }
    } else {
      const old = document.querySelector(direction === 'open' ? '.major-lens' : '.major-detail')
      const leave = old?.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: direction === 'open' ? 'scale(.99)' : 'translateY(14px) scale(1.012)' }], { duration: 240, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })
      void (async () => {
        try {
          await leave?.finished
          await update()
          const next = document.querySelector(direction === 'open' ? '.major-detail' : '.major-lens')
          await next?.animate([{ opacity: 0, transform: direction === 'open' ? 'translateY(14px) scale(1.012)' : 'scale(.99)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 640, easing: 'cubic-bezier(.22,1,.36,1)' }).finished
        } finally { cleanup() }
      })()
    }
  }
}
