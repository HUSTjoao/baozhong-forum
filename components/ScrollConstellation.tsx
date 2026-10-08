'use client'

import { useEffect, useState } from 'react'

/** A brief constellation accompanies the first downward scroll on each visit. */
export default function ScrollConstellation() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let previousY = window.scrollY
    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      const currentY = window.scrollY
      const movingDown = currentY > previousY
      previousY = currentY
      if (!movingDown || currentY < 24 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      window.removeEventListener('scroll', onScroll)
      setActive(true)
      timer = setTimeout(() => setActive(false), 7200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [])

  if (!active) return null

  return (
    <div className="scroll-constellation" aria-hidden="true">
      <svg className="constellation-map" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <g className="constellation-route constellation-route-left">
          <path pathLength="1" d="M 35 80 L 125 180 L 70 295 L 165 410 L 100 555" />
          <circle cx="35" cy="80" r="2" /><circle cx="125" cy="180" r="3" />
          <circle cx="70" cy="295" r="2" /><circle cx="165" cy="410" r="3" /><circle cx="100" cy="555" r="2" />
        </g>
        <g className="constellation-route constellation-route-right">
          <path pathLength="1" d="M 960 120 L 880 250 L 945 360 L 835 485 L 920 630" />
          <circle cx="960" cy="120" r="2" /><circle cx="880" cy="250" r="3" />
          <circle cx="945" cy="360" r="2" /><circle cx="835" cy="485" r="3" /><circle cx="920" cy="630" r="2" />
        </g>
      </svg>
      <span className="constellation-trail constellation-trail-one" />
      <span className="constellation-trail constellation-trail-two" />
      <span className="constellation-note constellation-note-one">从宝中出发</span>
      <span className="constellation-note constellation-note-two">大学的我们</span>
      <span className="constellation-note constellation-note-three">在这里相逢</span>
    </div>
  )
}
