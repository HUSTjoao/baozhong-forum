'use client'

import { useEffect, useRef } from 'react'

type Point = { x: number; y: number; time: number; width: number }

// One transient canvas per section; it never receives input or blocks links.
export default function InkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const surface = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !surface || !context) return
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let points: Point[] = []
    let frame = 0
    let width = 0
    let height = 0
    let lifetime = 1100
    let previous: Point | null = null

    const resize = () => {
      const bounds = surface.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      points = []
      previous = null
    }
    const draw = (now: number) => {
      frame = 0
      context.clearRect(0, 0, width, height)
      points = points.filter(point => now - point.time < lifetime)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1]
        const to = points[index]
        // Do not connect across a pointer exit, scroll, or a long pause.
        if (to.time - from.time > 100 || Math.hypot(to.x - from.x, to.y - from.y) > 150) continue
        const fade = Math.pow(1 - (now - to.time) / lifetime, 2)
        const start = index > 1 ? { x: (points[index - 2].x + from.x) / 2, y: (points[index - 2].y + from.y) / 2 } : from
        const end = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
        for (const [scale, alpha, blur] of [[1.9, .022, 28], [1.2, .04, 18], [.65, .018, 12]]) {
          context.beginPath()
          context.moveTo(start.x, start.y)
          context.quadraticCurveTo(from.x, from.y, end.x, end.y)
          context.lineWidth = (from.width + to.width) / 2 * scale
          context.strokeStyle = `rgba(218, 214, 200, ${fade * alpha})`
          context.shadowColor = context.strokeStyle
          context.shadowBlur = blur
          context.stroke()
        }
      }
      context.shadowBlur = 0
      if (points.length) frame = requestAnimationFrame(draw)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !pointer.matches || motion.matches) return
      const bounds = surface.getBoundingClientRect()
      const now = performance.now()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0
      if (previous && distance < 4) return
      const speed = previous ? distance / Math.max(8, now - previous.time) : 0
      const targetWidth = Math.max(32, Math.min(82, 78 - speed * 16))
      const point = { x, y, time: now, width: previous ? previous.width * .55 + targetWidth * .45 : targetWidth }
      lifetime = 1100
      points.push(point)
      points = points.slice(-80)
      previous = point
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const leave = () => { previous = null; lifetime = 450 }
    const reset = () => { points = []; previous = null; context.clearRect(0, 0, width, height) }
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    surface.addEventListener('pointermove', move, { passive: true })
    surface.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', reset, { passive: true })
    pointer.addEventListener('change', reset)
    motion.addEventListener('change', reset)
    resize()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      surface.removeEventListener('pointermove', move)
      surface.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', reset)
      pointer.removeEventListener('change', reset)
      motion.removeEventListener('change', reset)
    }
  }, [])

  return <canvas ref={canvasRef} className="home-ink-trail" aria-hidden="true" />
}
