'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

// Each visit starts at most one entrance sequence; replay is an explicit action.
export default function useViewportReveal(rootRef: RefObject<HTMLElement>, selector: string, routeKey?: string | null, batchGap = 550) {
  const [completed, setCompleted] = useState(false)
  const skipRef = useRef<() => void>(() => {})
  const replayRef = useRef<() => void>(() => {})
  const skipAnimation = useCallback(() => skipRef.current(), [])
  const replayAnimation = useCallback(() => replayRef.current(), [])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const layers = root.querySelectorAll<HTMLElement>(selector)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const waiting = new Set<HTMLElement>()
    const timers = new Map<HTMLElement, number>()
    let flushTimer = 0
    let finishTimer = 0
    let nextBatchAt = 0
    let started = false
    let finished = false
    let lastY = window.scrollY
    root.dataset.animationCompleted = 'false'
    root.dataset.revealMode = 'animated'
    setCompleted(false)
    const clearPending = () => {
      window.clearTimeout(flushTimer)
      window.clearTimeout(finishTimer)
      flushTimer = 0
      timers.forEach(timer => window.clearTimeout(timer))
      timers.clear()
      waiting.clear()
      nextBatchAt = 0
    }
    const finish = () => {
      clearPending()
      finished = true
      root.dataset.animationCompleted = 'true'
      setCompleted(true)
      root.dataset.revealMode = 'instant'
      layers.forEach(layer => { layer.dataset.reveal = 'true' })
    }
    const revealBatch = () => {
      flushTimer = 0
      if (finished) return
      const batch = Array.from(waiting)
      waiting.clear()
      if (!batch.length) return
      started = true
      for (let index = batch.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1))
        ;[batch[index], batch[other]] = [batch[other], batch[index]]
      }
      const groupSize = batch.length <= 4 ? 1 : Math.ceil(batch.length / 3)
      const now = performance.now()
      const start = Math.max(now, Math.min(nextBatchAt, now + batchGap * 3))
      batch.forEach((layer, index) => {
        const group = Math.floor(index / groupSize)
        layer.dataset.revealBatch = String(group)
        const timer = window.setTimeout(() => {
          timers.delete(layer)
          layer.dataset.reveal = 'true'
        }, start - now + group * batchGap)
        timers.set(layer, timer)
      })
      nextBatchAt = start + Math.floor((batch.length - 1) / groupSize) * batchGap
      // Finish after the final visible layer's CSS entrance, including stagger.
      window.clearTimeout(finishTimer)
      finishTimer = window.setTimeout(finish, nextBatchAt - now + (batchGap < 550 ? 900 : 2700))
    }
    const queueVisible = () => {
      layers.forEach(layer => {
        const rect = layer.getBoundingClientRect()
        if (layer.dataset.reveal !== 'true' && !timers.has(layer) && rect.bottom > 0 && rect.top < window.innerHeight - 60 && rect.right > 0 && rect.left < window.innerWidth) waiting.add(layer)
      })
      if (waiting.size && !flushTimer) flushTimer = window.setTimeout(revealBatch, 60)
    }
    skipRef.current = finish
    replayRef.current = () => {
      clearPending()
      finished = false
      root.dataset.animationCompleted = 'false'
      started = false
      setCompleted(false)
      root.dataset.revealMode = 'animated'
      layers.forEach(layer => { layer.dataset.reveal = 'false' })
      if (motion.matches) { finish(); return }
      // Force a style boundary so the same keyframes can run again.
      void root.offsetHeight
      queueVisible()
    }
    const onScroll = () => {
      const y = window.scrollY
      const bounds = root.getBoundingClientRect()
      if (y < lastY - 1 && started && bounds.bottom > 0 && bounds.top < window.innerHeight) finish()
      lastY = y
    }
    const observer = new IntersectionObserver(entries => {
      if (finished) return
      entries.forEach(entry => {
        const layer = entry.target as HTMLElement
        if (entry.isIntersecting && layer.dataset.reveal !== 'true' && !timers.has(layer)) waiting.add(layer)
      })
      if (waiting.size && !flushTimer) flushTimer = window.setTimeout(revealBatch, 60)
    }, { threshold: .15, rootMargin: '0px 0px -60px 0px' })
    const rootObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && started && !finished) finish()
    })
    layers.forEach(layer => { layer.dataset.reveal = 'false'; observer.observe(layer) })
    rootObserver.observe(root)
    if (motion.matches) finish()
    const revealFocusedLayer = (event: FocusEvent) => {
      const layer = (event.target as HTMLElement).closest<HTMLElement>(selector)
      if (layer && root.contains(layer)) finish()
    }
    root.addEventListener('focusin', revealFocusedLayer)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      skipRef.current = () => {}
      replayRef.current = () => {}
      clearPending()
      observer.disconnect()
      rootObserver.disconnect()
      root.removeEventListener('focusin', revealFocusedLayer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [rootRef, selector, routeKey, batchGap])
  return { completed, skipAnimation, replayAnimation }
}
