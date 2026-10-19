'use client'

import { useEffect, useRef, useState } from 'react'
import photos from '@/data/home-campus-photos.json'

const [first, second] = photos
const sizes = '(max-aspect-ratio: 16/9) 178vh, 100vw'

export default function HomeCampusBackground() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [primaryReady, setPrimaryReady] = useState(false)
  const [primaryFailed, setPrimaryFailed] = useState(false)
  const [secondaryRequested, setSecondaryRequested] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const image = root.current?.querySelector<HTMLImageElement>('img[data-primary]')
    // A preloaded image can finish (or fail) before React attaches its handlers.
    if (image?.complete) {
      if (image.naturalWidth > 0) setPrimaryReady(true)
      else setPrimaryFailed(true)
    }
  }, [])

  useEffect(() => {
    if (!root.current || secondaryRequested || (!primaryReady && !primaryFailed)) return
    if (primaryFailed) { setSecondaryRequested(true); return }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      if (timer) clearTimeout(timer)
      if (visible && !document.hidden && !motion.matches) timer = setTimeout(() => setSecondaryRequested(true), 1500)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(root.current)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    return () => {
      if (timer) clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [primaryReady, primaryFailed, secondaryRequested])

  useEffect(() => {
    if (!ready || !primaryReady || primaryFailed || !root.current) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    let timer: ReturnType<typeof setInterval> | undefined
    const sync = () => {
      if (timer) clearInterval(timer)
      timer = undefined
      if (visible && !document.hidden && !motion.matches) timer = setInterval(() => setActive(value => 1 - value), 9000)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(root.current)
    document.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    sync()
    return () => {
      if (timer) clearInterval(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      motion.removeEventListener('change', sync)
    }
  }, [ready, primaryReady, primaryFailed])

  return <div ref={root} className="journey-campus-slideshow" aria-hidden="true">
    <img className="journey-campus-background" data-active={active === 0} src={first.placeholder} alt="" />
    <img data-primary className="journey-campus-background" data-active={active === 0} src={first.src} srcSet={first.srcSet} sizes={sizes} alt="" fetchPriority="high" decoding="async" onLoad={() => setPrimaryReady(true)} onError={() => setPrimaryFailed(true)} />
    {secondaryRequested && <img className="journey-campus-background" data-active={active === 1} src={second.src} srcSet={second.srcSet} sizes={sizes} alt="" fetchPriority="low" decoding="async" onLoad={() => { setReady(true); if (primaryFailed) setActive(1) }} />}
  </div>
}
