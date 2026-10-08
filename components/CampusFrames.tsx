'use client'

import AnimationControl from './AnimationControl'
import { useEffect, useRef, useState } from 'react'
import useViewportReveal from './useViewportReveal'

type Category = '全部' | '校园' | '日常' | '四季'
type Frame = { id: number; title: string; category: Category; x: number; y: number; width: number; height: number; color: string; src: string | null }

// Replace src with local campus photos when the collection is ready.
const frames: Frame[] = [
  { id: 1, title: '晨光', category: '四季', x: 220, y: 130, width: 180, height: 240, color: '#e5e3d8', src: null },
  { id: 2, title: '教学楼', category: '校园', x: 580, y: 60, width: 260, height: 180, color: '#dde1da', src: null },
  { id: 3, title: '窗边', category: '日常', x: 1080, y: 80, width: 180, height: 220, color: '#e6e2dc', src: null },
  { id: 4, title: '树影', category: '四季', x: 1480, y: 190, width: 230, height: 170, color: '#dfe3d5', src: null },
  { id: 5, title: '走廊', category: '校园', x: 70, y: 520, width: 220, height: 160, color: '#e3e3dc', src: null },
  { id: 6, title: '课间', category: '日常', x: 490, y: 430, width: 170, height: 230, color: '#e5e0d7', src: null },
  { id: 7, title: '操场', category: '校园', x: 900, y: 400, width: 270, height: 190, color: '#dce1d8', src: null },
  { id: 8, title: '午后', category: '四季', x: 1370, y: 550, width: 180, height: 250, color: '#e8e3d8', src: null },
  { id: 9, title: '放学路上', category: '日常', x: 1740, y: 460, width: 180, height: 160, color: '#e0e4de', src: null },
  { id: 10, title: '校园一角', category: '校园', x: 290, y: 870, width: 230, height: 180, color: '#e1e2d5', src: null },
  { id: 11, title: '秋天', category: '四季', x: 780, y: 800, width: 180, height: 250, color: '#e7dfd3', src: null },
  { id: 12, title: '同行', category: '日常', x: 1170, y: 990, width: 260, height: 180, color: '#e3e1dd', src: null },
  { id: 13, title: '晚自习', category: '日常', x: 1640, y: 920, width: 170, height: 220, color: '#dadfd8', src: null },
]

export default function CampusFrames() {
  const sectionRef = useRef<HTMLElement>(null)
  const { completed, skipAnimation, replayAnimation } = useViewportReveal(sectionRef, '.campus-frames-heading, .campus-photo, .campus-frames-instruction')
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pan = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const cruise = useRef({ x: 0, y: 0 })
  const lastMove = useRef(0)
  const dragging = useRef<{ x: number; y: number; moved: boolean; pointer: number } | null>(null)
  const suppressClick = useRef(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [entered, setEntered] = useState(false)
  const visibleFrames = frames
  const photo = frames.find(frame => frame.id === selected)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setEntered(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setEntered(true); observer.disconnect() }
    }, { threshold: .08 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (selected !== null && !dialog.open) dialog.showModal()
    if (selected === null && dialog.open) dialog.close()
  }, [selected])

  useEffect(() => {
    const stage = stageRef.current
    const world = worldRef.current
    const section = sectionRef.current
    if (!stage || !world || !section) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncHeader = () => { document.documentElement.dataset.campusActive = section.getBoundingClientRect().top <= 88 ? 'true' : 'false' }
    syncHeader()
    window.addEventListener('scroll', syncHeader, { passive: true })
    let frame = 0
    let visible = false
    let last = 0
    let current = { x: 0, y: 0 }
    const render = (now: number) => {
      frame = 0
      const scale = stage.clientWidth <= 760 ? .64 : .9
      const maxX = Math.max(0, (2000 * scale - stage.clientWidth) / 2 + 60)
      const maxY = Math.max(80, (1350 * scale - stage.clientHeight) / 2)
      const elapsed = Math.min(2, (now - last) / 16.67 || 1)
      last = now
      if (now - lastMove.current > 100) {
        cruise.current.x *= Math.pow(.9, elapsed)
        cruise.current.y *= Math.pow(.9, elapsed)
      }
      if (!dragging.current && !motion.matches) {
        pan.current.x += (velocity.current.x - cruise.current.x * 2.2) * elapsed
        pan.current.y += (velocity.current.y - cruise.current.y * 1.6) * elapsed
        velocity.current.x *= Math.pow(.91, elapsed)
        velocity.current.y *= Math.pow(.91, elapsed)
      }
      pan.current.x = Math.max(-maxX, Math.min(maxX, pan.current.x))
      pan.current.y = Math.max(-maxY, Math.min(maxY, pan.current.y))
      const target = { x: pan.current.x - (motion.matches ? 0 : cruise.current.x * 125), y: pan.current.y - (motion.matches ? 0 : cruise.current.y * 85) }
      const easing = motion.matches ? 1 : 1 - Math.pow(.76, elapsed)
      current.x += (target.x - current.x) * easing
      current.y += (target.y - current.y) * easing
      world.style.transform = `translate(${(stage.clientWidth - 2000 * scale) / 2 + current.x}px, ${(stage.clientHeight - 1350 * scale) / 2 + current.y + 55}px) scale(${scale})`
      world.style.setProperty('--camera-x', `${motion.matches ? 0 : cruise.current.x * -24}px`)
      world.style.setProperty('--camera-y', `${motion.matches ? 0 : cruise.current.y * -18}px`)
      if (visible) frame = requestAnimationFrame(render)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { last = 0; schedule() } }, { rootMargin: '100px' })
    observer.observe(stage)
    const resize = new ResizeObserver(schedule)
    resize.observe(stage)
    schedule()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); window.removeEventListener('scroll', syncHeader); delete document.documentElement.dataset.campusActive }
  }, [])

  const changePhoto = (direction: number) => {
    const index = visibleFrames.findIndex(frame => frame.id === selected)
    setSelected(visibleFrames[(index + direction + visibleFrames.length) % visibleFrames.length].id)
  }

  return (
    <section ref={sectionRef} className="campus-frames" data-entered={entered} onFocusCapture={() => setEntered(true)} aria-labelledby="campus-frames-title">
      <div ref={stageRef} className="campus-frames-stage" data-dragging={isDragging} onPointerDown={event => {
        if (event.button !== 0 || (event.target as HTMLElement).closest('.campus-frames-controls, .campus-photo-dialog, .section-animation-skip')) return
        suppressClick.current = false
        dragging.current = { x: event.clientX, y: event.clientY, moved: false, pointer: event.pointerId }
        velocity.current = { x: 0, y: 0 }
      }} onPointerMove={event => {
        const drag = dragging.current
        if (!drag) {
          if (event.pointerType === 'mouse') {
            lastMove.current = performance.now()
            const bounds = event.currentTarget.getBoundingClientRect()
            cruise.current = (event.target as HTMLElement).closest('.campus-frames-controls, .campus-photo-dialog, .section-animation-skip') ? { x: 0, y: 0 } : { x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: (event.clientY - bounds.top) / bounds.height * 2 - 1 }
          }
          return
        }
        if (drag.pointer !== event.pointerId) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        if (!drag.moved && Math.hypot(dx, dy) < 5) return
        if (!drag.moved) { event.currentTarget.setPointerCapture(event.pointerId); drag.moved = true; setIsDragging(true); suppressClick.current = true }
        pan.current.x += dx
        pan.current.y += event.pointerType === 'touch' ? 0 : dy
        velocity.current = { x: dx * .6, y: event.pointerType === 'touch' ? 0 : dy * .6 }
        drag.x = event.clientX
        drag.y = event.clientY
      }} onPointerLeave={() => { cruise.current = { x: 0, y: 0 } }} onPointerUp={() => { dragging.current = null; setIsDragging(false) }} onPointerCancel={() => { dragging.current = null; setIsDragging(false); velocity.current = { x: 0, y: 0 } }} onLostPointerCapture={() => { dragging.current = null; setIsDragging(false) }}>
        <header className="campus-frames-heading"><span lang="en">BAOZHONG / THROUGH THE LENS</span><h2 id="campus-frames-title">镜头下的宝中</h2><p>那些每天经过的地方，值得再看一眼。</p></header>
        <AnimationControl completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />
        <div ref={worldRef} className="campus-frames-world">
          <div className="campus-star-cloud" aria-hidden="true" />
          <div className="campus-starfield" aria-hidden="true">{Array.from({ length: 240 }, (_, index) => <i key={index} style={{ left: `${(index * 431 + 173) % 3600 - 800}px`, top: `${(index * 317 + 97) % 2950 - 800}px`, width: index % 17 === 0 ? 3 : index % 5 === 0 ? 2 : 1, height: index % 17 === 0 ? 3 : index % 5 === 0 ? 2 : 1, opacity: .18 + index % 7 * .09, animationDelay: `${-index % 9}s`, animationDuration: `${5 + index % 7}s` }} />)}</div>
          {frames.map(frame => <button key={frame.id} type="button" className="campus-photo" data-placeholder={!frame.src} style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height, backgroundColor: frame.src ? frame.color : 'transparent' }} aria-label={`查看${frame.title}，照片待补`} onClick={event => { if (!suppressClick.current || event.detail === 0) setSelected(frame.id) }}>
            {frame.src ? <img src={frame.src} alt={frame.title} draggable={false} /> : <span className="campus-photo-placeholder"><span>{String(frame.id).padStart(2, '0')}</span><strong>{frame.title}</strong><small>校园照片待补</small></span>}
            <span className="campus-photo-caption">{frame.category} / {frame.title}<span>↗</span></span>
          </button>)}
        </div>
        <div className="campus-frames-instruction"><span lang="en">HOW TO EXPLORE</span><strong><span>移动鼠标，探索照片</span><span>左右拖动，探索校园</span></strong><small>点击照片 · 放大查看</small></div>
        <dialog ref={dialogRef} className="campus-photo-dialog" aria-label={photo?.title ?? '校园照片'} onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); changePhoto(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); changePhoto(1) } }}>
          {photo && <><button type="button" className="campus-photo-close" aria-label="关闭照片" onClick={() => setSelected(null)}>×</button><div className="campus-photo-large" style={{ backgroundColor: photo.src ? photo.color : 'transparent' }}>{photo.src ? <img src={photo.src} alt={photo.title} /> : <div className="campus-photo-placeholder"><span>{String(photo.id).padStart(2, '0')}</span><strong id="campus-photo-title">{photo.title}</strong><small>这张校园照片，等你来补上。</small></div>}</div><footer><span>{photo.category} / {photo.title}</span><div><button type="button" aria-label="上一张照片" onClick={() => changePhoto(-1)}>←</button><button type="button" aria-label="下一张照片" onClick={() => changePhoto(1)}>→</button></div></footer></>}
        </dialog>
      </div>
    </section>
  )
}
