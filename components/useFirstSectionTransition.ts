'use client'

import { useEffect, useRef, type RefObject } from 'react'

// Bridge to the next unplayed scene once; later visits retain native scrolling.
export default function useFirstSectionTransition(rootRef: RefObject<HTMLElement>, nextSelector: string, completed: boolean) {
  const consumed = useRef(false)
  const returned = useRef(false)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let active = false
    let writtenY = window.scrollY
    let lastGesture = -Infinity
    let touchY: number | null = null
    let touchTriggered = false
    const cancel = () => {
      cancelAnimationFrame(frame)
      frame = 0
      active = false
      root.dataset.transitionPlaying = 'false'
    }
    const advance = (direction: number, event: Event) => {
      if (event.defaultPrevented || motion.matches || (event.target as HTMLElement)?.closest?.('dialog, input, textarea, select, [contenteditable="true"]')) return
      const bounds = root.getBoundingClientRect()
      if (direction < 0) {
        if (active || (bounds.top < 120 && bounds.bottom > 0)) returned.current = true
        cancel()
        return
      }
      if (active) { event.preventDefault(); return }
      const next = document.querySelector<HTMLElement>(nextSelector)
      if (!completed || consumed.current || returned.current || !next || next.dataset.animationCompleted === 'true' || bounds.top > 120 || bounds.bottom <= 0 || bounds.bottom > innerHeight + 160) return
      event.preventDefault()
      const now = performance.now()
      const fresh = now - lastGesture > 180
      lastGesture = now
      if (!fresh) return
      consumed.current = true
      active = true
      root.dataset.transitionPlaying = 'true'
      const from = scrollY
      const target = Math.min(next.getBoundingClientRect().top + from, document.documentElement.scrollHeight - innerHeight)
      writtenY = from
      const tick = (time: number) => {
        if (Math.abs(scrollY - writtenY) > 5) { cancel(); return }
        const t = Math.min(1, (time - now) / 1000)
        window.scrollTo({ top: from + (target - from) * t * t * (3 - 2 * t), behavior: 'instant' })
        writtenY = scrollY
        if (t < 1) frame = requestAnimationFrame(tick)
        else cancel()
      }
      frame = requestAnimationFrame(tick)
    }
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && Math.abs(event.deltaY) >= 2 && Math.abs(event.deltaY) >= Math.abs(event.deltaX)) advance(Math.sign(event.deltaY), event)
    }
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement)?.closest?.('button, a')) return
      if (['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(event.key)) advance(['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 1, event)
    }
    const touchStart = (event: TouchEvent) => { touchY = event.touches.length === 1 ? event.touches[0].clientY : null; touchTriggered = false }
    const touchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return
      const delta = touchY - event.touches[0].clientY
      if (Math.abs(delta) < 30) return
      if (touchTriggered) { if (active) event.preventDefault(); return }
      advance(Math.sign(delta), event)
      touchTriggered = event.defaultPrevented
    }
    const visibility = () => { if (document.hidden) cancel() }
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: false })
    window.addEventListener('resize', cancel)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancel()
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('resize', cancel)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [rootRef, nextSelector, completed])
}

