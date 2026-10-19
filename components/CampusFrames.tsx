'use client'

import AnimationControl from './AnimationControl'
import { useEffect, useMemo, useRef, useState } from 'react'
import useViewportReveal from './useViewportReveal'
import optimizedPhotos from '@/data/optimized-campus-photos.json'
import collection from '@/data/campus-collection.json'
import CampusPhotoUpload from './CampusPhotoUpload'
import CampusWallPhoto from './CampusWallPhoto'
import { campusWallLayout } from '@/lib/campus-wall-layout'
import type { GalleryPhoto } from '@/lib/campus-photos-shared'
import './campus-photo-upload.css'

const legacy = [
  { key: '/campus/sunlit-path.jpg', title: '树影下的课间', category: '日常', width: 420, height: 280 },
  { key: '/campus/ginkgo-leaves.jpg', title: '银杏与校训', category: '四季', width: 420, height: 280 },
  { key: '/campus/window-tree.jpg', title: '窗外的夏天', category: '校园', width: 330, height: 325 },
  { key: '/campus/green-sky.jpg', title: '绿叶与蓝天', category: '四季', width: 420, height: 270 },
  { key: '/home-campus-blossoms-clean.png', title: '樱花长廊', category: '校园', width: 470, height: 265 },
  { key: '/home-campus-bench.jpg', title: '花影里的长椅', category: '日常', width: 430, height: 287 },
]
const optimized: Record<string, { src: string; thumbnail: string; srcSet: string }> = optimizedPhotos
const builtInPhotos: GalleryPhoto[] = [...collection, ...legacy.map((photo, index) => ({ ...photo, ...optimized[photo.key], id: `original-${index + 1}` }))]
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export default function CampusFrames() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const keyboardFocus = useRef<{ x: number; y: number } | null>(null)
  const requestRender = useRef<() => void>(() => {})
  const touch = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null)
  const suppressClick = useRef(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const [photosRequested, setPhotosRequested] = useState(false)
  const [sharedPhotos, setSharedPhotos] = useState<GalleryPhoto[]>([])
  const [loadError, setLoadError] = useState('')
  const [revision, setRevision] = useState(0)
  const allPhotos = useMemo(() => [...builtInPhotos, ...sharedPhotos], [sharedPhotos])
  const wall = useMemo(() => campusWallLayout(allPhotos), [allPhotos])
  const { completed, skipAnimation, replayAnimation } = useViewportReveal(sectionRef, '.campus-frames-heading, .campus-photo, .campus-frames-instruction', String(allPhotos.length))
  const photo = allPhotos.find(item => item.id === selected)

  useEffect(() => {
    if (!photosRequested) return
    const controller = new AbortController()
    setLoadError('')
    async function collectSharedPhotos() {
      let cursor: string | null = null
      const visited = new Set<string>()
      do {
        const response: Response = await fetch('/api/campus-photos' + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''), { cache: 'no-store', signal: controller.signal })
        const body: { items: GalleryPhoto[]; nextCursor?: string | null } = await response.json()
        if (!response.ok || !body || !Array.isArray(body.items)) throw Error('照片暂时无法加载')
        if (!controller.signal.aborted) setSharedPhotos(previous => [...previous, ...body.items.filter((item: GalleryPhoto) => !previous.some(old => old.id === item.id))])
        cursor = typeof body.nextCursor === 'string' ? body.nextCursor : null
        if (cursor && visited.has(cursor)) throw Error('照片读取暂未完成')
        if (cursor) visited.add(cursor)
      } while (cursor && !controller.signal.aborted)
    }
    void collectSharedPhotos().catch(() => { if (!controller.signal.aborted) setLoadError('同学们的照片暂时未能全部加载，已有照片仍可浏览。') })
    return () => controller.abort()
  }, [photosRequested, revision])

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setPhotosRequested(true); observer.disconnect() } }, { rootMargin: '600px' })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setEntered(true); return }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect() } }, { threshold: .08 })
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
    const viewport = viewportRef.current, world = worldRef.current, section = sectionRef.current
    if (!viewport || !world || !section) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncHeader = () => { document.documentElement.dataset.campusActive = section.getBoundingClientRect().top <= 88 ? 'true' : 'false' }
    syncHeader(); window.addEventListener('scroll', syncHeader, { passive: true })
    let frame = 0, visible = false
    let current: { x: number; y: number } | null = null
    const render = () => {
      frame = 0
      const scale = viewport.clientWidth <= 760 ? .64 : .9
      const maxX = 40, maxY = 40
      const minX = Math.min(maxX, viewport.clientWidth - wall.width * scale - 40)
      const minY = Math.min(maxY, viewport.clientHeight - wall.height * scale - 40)
      const centerX = clamp(viewport.clientWidth / 2 - wall.originX * scale, minX, maxX)
      const centerY = clamp(viewport.clientHeight / 2 - wall.originY * scale, minY, maxY)
      const follow = (position: number, center: number, min: number, max: number) => position < 0 ? center + (max - center) * -position : center + (min - center) * position
      const target = keyboardFocus.current ? {
        x: clamp(viewport.clientWidth / 2 - keyboardFocus.current.x * scale, minX, maxX),
        y: clamp(viewport.clientHeight / 2 - keyboardFocus.current.y * scale, minY, maxY),
      } : { x: follow(pointer.current.x, centerX, minX, maxX), y: follow(pointer.current.y, centerY, minY, maxY) }
      if (!current) current = { x: centerX, y: centerY }
      const easing = motion.matches ? 1 : .11
      current.x += (target.x - current.x) * easing; current.y += (target.y - current.y) * easing
      // Cursor position controls the view; there is no mouse dragging or pagination.
      world.style.transform = `translate(${current.x}px, ${current.y}px) scale(${scale})`
      world.style.setProperty('--camera-x', `${motion.matches ? 0 : pointer.current.x * -12}px`)
      world.style.setProperty('--camera-y', `${motion.matches ? 0 : pointer.current.y * -10}px`)
      viewport.scrollLeft = 0; viewport.scrollTop = 0
      const viewportBounds = viewport.getBoundingClientRect()
      if (keyboardFocus.current && (viewportBounds.top < 88 || viewportBounds.top > innerHeight * .55)) section.scrollIntoView({ block: 'start', behavior: 'instant' })
      if (visible && Math.hypot(target.x - current.x, target.y - current.y) > .2) frame = requestAnimationFrame(render)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    requestRender.current = schedule
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule() })
    observer.observe(viewport)
    const resize = new ResizeObserver(schedule); resize.observe(viewport)
    motion.addEventListener('change', schedule); schedule()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); motion.removeEventListener('change', schedule); window.removeEventListener('scroll', syncHeader); delete document.documentElement.dataset.campusActive; requestRender.current = () => {} }
  }, [wall.width, wall.height, wall.originX, wall.originY])

  function changePhoto(direction: number) {
    const index = allPhotos.findIndex(item => item.id === selected)
    setSelected(allPhotos[(index + direction + allPhotos.length) % allPhotos.length].id)
  }

  return <section id="campus-gallery" ref={sectionRef} className="campus-frames" data-entered={entered} onFocusCapture={() => { setEntered(true); setPhotosRequested(true) }} aria-labelledby="campus-frames-title">
    <div className="campus-frames-stage">
      <header className="campus-frames-heading"><span lang="en">BAOZHONG / THROUGH THE LENS</span><h2 id="campus-frames-title">镜头下的宝中</h2><p>那些每天经过的地方，值得再看一眼。</p></header>
      <AnimationControl completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />
      <div className="campus-gallery-toolbar"><CampusPhotoUpload /><span>{allPhotos.length} 张校园记忆 · 随光标慢慢发现</span>{loadError && <><button onClick={() => setRevision(value => value + 1)}>重新加载同学的照片</button><small role="status">{loadError}</small></>}</div>
      <div ref={viewportRef} className="campus-wall-viewport" tabIndex={0} role="group" aria-label="校园照片墙：移动光标探索，也可使用方向键；手机上滑动探索" onPointerDown={event => {
        suppressClick.current = false
        if (event.pointerType === 'mouse') return
        touch.current = { x: event.clientX, y: event.clientY, moved: false, id: event.pointerId }
      }} onPointerMove={event => {
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.pointerType === 'mouse') {
          if (dialogRef.current?.open) return
          // Hold a hovered photo steady for clicking; the surrounding space and edges guide the view.
          const edgeX = (event.clientX - bounds.left) / bounds.width * 2 - 1
          const edgeY = (event.clientY - bounds.top) / bounds.height * 2 - 1
          if ((event.target as HTMLElement).closest('.campus-photo') && Math.abs(edgeX) < .86 && Math.abs(edgeY) < .86) return
          pointer.current = { x: clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1), y: clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1) }
        } else {
          const drag = touch.current
          if (!drag || drag.id !== event.pointerId) return
          const dx = event.clientX - drag.x, dy = event.clientY - drag.y
          if (!drag.moved && Math.hypot(dx, dy) < 6) return
          if (!drag.moved) { drag.moved = true; suppressClick.current = true; event.currentTarget.setPointerCapture(event.pointerId) }
          const scale = bounds.width <= 760 ? .64 : .9
          pointer.current.x = clamp(pointer.current.x - dx / Math.max(200, (wall.width * scale - bounds.width) / 2), -1, 1)
          pointer.current.y = clamp(pointer.current.y - dy / Math.max(200, (wall.height * scale - bounds.height) / 2), -1, 1)
          drag.x = event.clientX; drag.y = event.clientY
        }
        keyboardFocus.current = null; requestRender.current()
      }} onPointerUp={() => { touch.current = null }} onPointerCancel={() => { touch.current = null }} onLostPointerCapture={() => { touch.current = null }} onKeyDown={event => {
        const movement: Record<string, [number, number]> = { ArrowLeft: [-.14, 0], ArrowRight: [.14, 0], ArrowUp: [0, -.14], ArrowDown: [0, .14] }
        const direction = movement[event.key]
        if (!direction) return
        event.preventDefault(); keyboardFocus.current = null
        pointer.current = { x: clamp(pointer.current.x + direction[0], -1, 1), y: clamp(pointer.current.y + direction[1], -1, 1) }; requestRender.current()
      }}>
        <div ref={worldRef} className="campus-frames-world" style={{ width: wall.width, height: wall.height }}>
          <div className="campus-star-cloud" aria-hidden="true" />
          <div className="campus-starfield" aria-hidden="true">{Array.from({ length: 240 }, (_, index) => <i key={index} style={{ left: `${(index * 431 + 173) % wall.width}px`, top: `${(index * 317 + 97) % wall.height}px`, width: index % 17 === 0 ? 3 : index % 5 === 0 ? 2 : 1, height: index % 17 === 0 ? 3 : index % 5 === 0 ? 2 : 1, opacity: .18 + index % 7 * .09, animationDelay: `${-index % 9}s`, animationDuration: `${5 + index % 7}s` }} />)}</div>
          {wall.photos.map(item => <CampusWallPhoto key={item.id} photo={item} viewport={viewportRef} enabled={photosRequested} onSelect={keyboard => { if (keyboard || !suppressClick.current) setSelected(item.id) }} onKeyboardFocus={() => { keyboardFocus.current = { x: item.x + item.width / 2, y: item.y + item.height / 2 }; requestRender.current() }} />)}
        </div>
      </div>
      <div className="campus-frames-instruction"><span lang="en">HOW TO EXPLORE</span><strong><span>移动光标，探索整面照片墙</span><span>滑动探索 · 点击放大</span></strong><small>点击照片 · 放大查看</small></div>
      <dialog ref={dialogRef} className="campus-photo-dialog" aria-label={photo?.title ?? '校园照片'} onClose={() => setSelected(null)} onCancel={() => setSelected(null)} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); changePhoto(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); changePhoto(1) } }}>
        {photo && <><button type="button" className="campus-photo-close" aria-label="关闭照片" onClick={() => setSelected(null)}>×</button><div className="campus-photo-large"><img src={photo.src} srcSet={photo.srcSet} sizes="90vw" alt={photo.title} decoding="async" /></div><footer><span>{photo.category} / {photo.title}</span><div><button type="button" aria-label="上一张照片" onClick={() => changePhoto(-1)}>←</button><button type="button" aria-label="下一张照片" onClick={() => changePhoto(1)}>→</button></div></footer></>}
      </dialog>
    </div>
  </section>
}
