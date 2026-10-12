'use client'

import { useEffect, useRef, useState } from 'react'

const photos = ['/home-campus-blossoms-clean.png', '/home-campus-bench.jpg']

export default function HomeCampusBackground() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const image = root.current?.querySelectorAll('img')[1]
    if (image?.complete && image.naturalWidth > 0) setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !root.current) return
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
  }, [ready])

  return <div ref={root} className="journey-campus-slideshow" aria-hidden="true">
    {photos.map((src, index) => <img key={src} className="journey-campus-background" data-active={active === index} src={src} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" onLoad={index === 1 ? () => setReady(true) : undefined} />)}
  </div>
}
