'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export type ScrollChapter = { progress: number; duration: number }
type NextChapter = { selector: string; stageSelector: string; progress: number; duration: number }

// A fresh gesture starts one chapter. Completed scenes stay static until explicit replay.
// reducedProgress also selects the resting frame on an upward return (hero: 0, letter: 1).
export default function useScrollChapters(rootRef: RefObject<HTMLElement>, stageSelector: string, chapters: readonly ScrollChapter[], reducedProgress = 1, nextChapter?: NextChapter) {
  const [completed, setCompleted] = useState(false)
  const replayRef = useRef<() => void>(() => {})
  const replayAnimation = useCallback(() => replayRef.current(), [])
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const skipRef = useRef<() => void>(() => {})
  const skipAnimation = useCallback(() => skipRef.current(), [])
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let active = false
    let lastWrittenY = window.scrollY
    let lastGestureAt = -Infinity
    let settleUntil = 0
    let touchY: number | null = null
    let touchTriggered = false
    let finished = false
    let returnedUp = false
    let nextChapterStarted = false
    let lastY = window.scrollY
    const measure = () => {
      const stage = root.querySelector<HTMLElement>(stageSelector)
      const top = root.getBoundingClientRect().top + window.scrollY
      const distance = Math.max(0, root.offsetHeight - (stage?.offsetHeight ?? window.innerHeight))
      return { top, distance }
    }
    const finish = () => {
      if (finished) return
      const { top } = measure()
      const oldHeight = root.offsetHeight
      const y = window.scrollY
      finished = true
      setCompleted(true)
      root.dataset.animationCompleted = 'true'
      // Release the sticky scene's extra scroll space, preserving the visible page.
      const removed = Math.max(0, oldHeight - root.offsetHeight)
      if (removed && y > top) window.scrollTo({ top: y - Math.min(removed, y - top), behavior: 'instant' })
      lastY = window.scrollY
      lastWrittenY = window.scrollY
    }
    const syncProgress = () => {
      const { top, distance } = measure()
      const y = window.scrollY
      const raw = Math.max(0, Math.min(1, (y - top) / Math.max(1, distance)))
      if (motion.matches) { finish(); setProgress(reducedProgress) }
      else if (finished) {
        if (y < lastY - 1 && y < top + distance + 5) returnedUp = true
        setProgress(returnedUp ? reducedProgress : 1)
      } else if (!active && y < lastY - 1 && y >= top - window.innerHeight * .2 && raw > 0) {
        finish()
        returnedUp = true
        root.dataset.animationSkipped = 'true'
        setProgress(reducedProgress)
      } else {
        setProgress(raw)
        if (raw >= .999 && !active) finish()
      }
      lastY = y
    }
    const cancel = () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      active = false
      setPlaying(false)
    }
    const animate = (target: number, duration: number) => {
      const from = window.scrollY
      const to = Math.min(target, document.documentElement.scrollHeight - window.innerHeight)
      const start = performance.now()
      lastWrittenY = from
      active = true
      setPlaying(true)
      const tick = (now: number) => {
        // A scrollbar drag or navigation link can interrupt the sequence.
        if (Math.abs(window.scrollY - lastWrittenY) > 5) { cancel(); return }
        const value = Math.min(1, (now - start) / duration)
        const ease = value * value * (3 - 2 * value)
        window.scrollTo({ top: from + (to - from) * ease, behavior: 'instant' })
        lastWrittenY = window.scrollY
        if (value < 1) frame = window.requestAnimationFrame(tick)
        else {
          frame = 0
          active = false
          settleUntil = now + 300
          setPlaying(false)
          const { top, distance } = measure()
          if (!finished && to >= top + distance - 1) finish()
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    const advance = (direction: number, event: Event) => {
      if (event.defaultPrevented || motion.matches || (event.target as HTMLElement)?.closest?.('dialog, input, textarea, select, [contenteditable="true"]')) return
      const now = performance.now()
      if (direction < 0) {
        const { top } = measure()
        const y = window.scrollY
        if (active || y > top + 1) {
          cancel()
          finish()
          returnedUp = true
          root.dataset.animationSkipped = 'true'
          setProgress(reducedProgress)
        }
        settleUntil = 0
        return
      }
      if (active) { lastGestureAt = now; event.preventDefault(); return }
      if (finished) {
        // Only the first forward visit bridges to an unplayed scene automatically.
        const next = nextChapter && !nextChapterStarted && !returnedUp ? document.querySelector<HTMLElement>(nextChapter.selector) : null
        const nextStage = nextChapter && next?.querySelector<HTMLElement>(nextChapter.stageSelector)
        const { top, distance } = measure()
        if (next && nextStage && nextChapter && next.dataset.animationCompleted !== 'true' && window.scrollY >= top - window.innerHeight * .2 && window.scrollY <= top + distance + 5) {
          event.preventDefault()
          const freshGesture = now - lastGestureAt > 180
          lastGestureAt = now
          if (now < settleUntil || !freshGesture) return
          nextChapterStarted = true
          animate(next.getBoundingClientRect().top + window.scrollY + (next.offsetHeight - nextStage.offsetHeight) * nextChapter.progress, nextChapter.duration)
        }
        return
      }
      if (now < settleUntil) { lastGestureAt = now; event.preventDefault(); return }
      const stage = root.querySelector<HTMLElement>(stageSelector)
      if (!stage) return
      const top = root.getBoundingClientRect().top + window.scrollY
      const distance = root.offsetHeight - stage.offsetHeight
      const y = window.scrollY
      if (distance <= 0 || y < top - window.innerHeight * .2 || y > top + distance + 5) return
      const freshGesture = now - lastGestureAt > 180
      lastGestureAt = now
      if (!freshGesture) { event.preventDefault(); return }
      const progress = (y - top) / distance
      event.preventDefault()
      const chapter = chapters.find(chapter => chapter.progress > progress + .003)
      if (chapter) animate(top + distance * chapter.progress, chapter.duration)
      else finish()
    }

    skipRef.current = () => {
      cancel()
      root.dataset.animationSkipped = 'true'
      finish()
      settleUntil = performance.now() + 300
      returnedUp = false
      const { top, distance } = measure()
      window.scrollTo({ top: top + distance, behavior: 'instant' })
      lastY = window.scrollY
      setProgress(motion.matches ? reducedProgress : 1)
    }
    replayRef.current = () => {
      cancel()
      finished = false
      returnedUp = false
      setCompleted(false)
      root.dataset.animationCompleted = 'false'
      root.dataset.animationSkipped = 'false'
      const { top, distance } = measure()
      window.scrollTo({ top, behavior: 'instant' })
      lastY = window.scrollY
      setProgress(0)
      if (motion.matches) { skipRef.current(); return }
      animate(top + distance * chapters[0].progress, chapters[0].duration)
    }
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || Math.abs(event.deltaY) < 2) return
      advance(Math.sign(event.deltaY), event)
    }
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement)?.closest?.('button, a')) return
      if (['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(event.key)) advance(['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 1, event)
      if (event.key === 'Escape') cancel()
    }
    const touchStart = (event: TouchEvent) => { touchY = event.touches.length === 1 ? event.touches[0].clientY : null; touchTriggered = false }
    const touchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return
      const delta = touchY - event.touches[0].clientY
      if (Math.abs(delta) < 30) {
        const stage = root.querySelector<HTMLElement>(stageSelector)
        const top = root.getBoundingClientRect().top + window.scrollY
        if (delta > 0 && !motion.matches && stage && root.offsetHeight > stage.offsetHeight && window.scrollY >= top - window.innerHeight * .2 && window.scrollY <= top + root.offsetHeight - stage.offsetHeight + 5 && !(event.target as HTMLElement)?.closest?.('dialog, input, textarea, select, [contenteditable="true"]')) event.preventDefault()
        return
      }
      if (touchTriggered) { if (active) event.preventDefault(); return }
      advance(Math.sign(delta), event)
      touchTriggered = event.defaultPrevented
    }
    const visibility = () => { if (document.hidden) cancel() }
    syncProgress()
    window.addEventListener('scroll', syncProgress, { passive: true })
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: false })
    window.addEventListener('resize', cancel)
    motion.addEventListener('change', cancel)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancel()
      skipRef.current = () => {}
      replayRef.current = () => {}
      window.removeEventListener('scroll', syncProgress)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('resize', cancel)
      motion.removeEventListener('change', cancel)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [rootRef, stageSelector, chapters, reducedProgress, nextChapter])
  return { playing, progress, completed, skipAnimation, replayAnimation }
}
