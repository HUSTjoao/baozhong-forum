'use client'
import { createContext, useContext, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

type ViewTransition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void }
type TransitionDocument = Document & { startViewTransition?: (update: () => Promise<void>) => ViewTransition }
type Travel = { id: string; scrollY: number; listHref?: string; listScrollTop?: number }
const TransitionContext = createContext<{ open: (event: MouseEvent<HTMLAnchorElement>, id: string) => void; close: (event: MouseEvent<HTMLAnchorElement>, id: string) => void } | null>(null)
const storageKey = 'campus-card-origin'
export function useCampusTransition() { return useContext(TransitionContext) }

export default function CampusTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const pending = useRef(false)
  const arrival = useRef<(() => void) | null>(null)
  const returning = useRef<Travel | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const departure = useRef<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!arrival.current) return
    if (pathname === '/universities' && returning.current) {
      const origin = returning.current
      document.querySelector('.uni-map-explorer')?.setAttribute('data-campus-returned', 'true')
      const grid = document.querySelector<HTMLElement>('.uni-grid')
      if (grid) grid.scrollTop = origin.listScrollTop || 0
      const card = document.querySelector<HTMLAnchorElement>('[data-campus-id="' + CSS.escape(origin.id) + '"]')
      if (card) {
        card.style.viewTransitionName = 'campus-card'
        card.setAttribute('data-campus-settled', 'true')
        window.scrollTo({ top: origin.scrollY, behavior: 'instant' as ScrollBehavior })
        const rect = card.getBoundingClientRect()
        if (rect.top < 100 || rect.bottom > innerHeight) card.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
        card.focus({ preventScroll: true })
      }
    }
    const destination = document.querySelector<HTMLElement>(pathname === '/universities' ? '[data-campus-id="' + CSS.escape(returning.current?.id || '') + '"]' : '.uni-school-summary')
    if (destination && departure.current) {
      const end = destination.getBoundingClientRect()
      const start = departure.current
      const style = document.documentElement.style
      style.setProperty('--campus-travel-width', end.width + 'px')
      style.setProperty('--campus-travel-height', end.height + 'px')
      style.setProperty('--campus-travel-from', `translate(${start.left}px, ${start.top}px) scale(${start.width / end.width}, ${start.height / end.height})`)
      style.setProperty('--campus-travel-to', `translate(${end.left}px, ${end.top}px) scale(1, 1)`)
    }
    const resolve = arrival.current
    arrival.current = null
    resolve()
  }, [pathname])

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string, back: boolean) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const doc = document as TransitionDocument
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    let origin: Travel = { id, scrollY: 0 }
    if (back) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
        if (saved?.id === id && Number.isFinite(saved.scrollY)) origin = saved
      } catch { /* The route still works when storage is unavailable. */ }
      returning.current = origin
    } else {
      origin = { id, scrollY: window.scrollY, listHref: location.pathname + location.search, listScrollTop: document.querySelector<HTMLElement>('.uni-grid')?.scrollTop || 0 }
      returning.current = null
      event.currentTarget.style.viewTransitionName = 'campus-card'
      try { sessionStorage.setItem(storageKey, JSON.stringify(origin)) } catch { /* Optional navigation memory. */ }
    }
    departure.current = (back ? doc.querySelector<HTMLElement>('.uni-school-summary') : event.currentTarget)?.getBoundingClientRect() || null
    doc.documentElement.dataset.campusTravel = back ? 'close' : 'open'
    const transition = doc.startViewTransition(() => new Promise<void>(resolve => {
      arrival.current = resolve
      timeout.current = setTimeout(() => { arrival.current = null; resolve(); transition.skipTransition() }, 5000)
      router.push(back ? (origin.listHref?.startsWith('/universities?') ? origin.listHref : '/universities') : '/universities/' + id, { scroll: !back })
    }))
    void transition.ready.catch(() => {})
    void transition.finished.catch(() => {}).finally(() => {
      if (timeout.current) clearTimeout(timeout.current)
      pending.current = false
      returning.current = null
      delete doc.documentElement.dataset.campusTravel
      doc.querySelectorAll<HTMLElement>('[data-campus-id]').forEach(card => { card.style.viewTransitionName = '' })
    })
  }
  return <TransitionContext.Provider value={{ open: (e, id) => navigate(e, id, false), close: (e, id) => navigate(e, id, true) }}>{children}</TransitionContext.Provider>
}

export function CampusReturnLink({ universityId }: { universityId: string }) {
  const transition = useCampusTransition()
  return <Link className="uni-back uni-return-card" href="/universities" onClick={event => transition?.close(event, universityId)}><svg viewBox="0 0 28 28" width="23" height="23" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 5 7 7m0-6v6H6m17 11-7-7m0 6v-6h6" /><path d="M4.5 16.5v7h7m12-12v-7h-7" opacity=".4" /></svg>收回卡片</Link>
}





