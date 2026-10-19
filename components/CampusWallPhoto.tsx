'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'
import type { GalleryPhoto } from '@/lib/campus-photos-shared'

export type WallPhoto = GalleryPhoto & { x: number; y: number; width: number; height: number; color: string }
export default function CampusWallPhoto({ photo, viewport, enabled, onSelect, onKeyboardFocus }: {
  photo: WallPhoto; viewport: RefObject<HTMLDivElement>; enabled: boolean
  onSelect: (keyboard: boolean) => void; onKeyboardFocus: () => void
}) {
  const tile = useRef<HTMLButtonElement>(null)
  const [requested, setRequested] = useState(false)
  useEffect(() => {
    if (!enabled || requested || !tile.current || !viewport.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRequested(true); observer.disconnect() }
    }, { root: viewport.current, rootMargin: '180px' })
    observer.observe(tile.current)
    return () => observer.disconnect()
  }, [enabled, requested, viewport])
  return <button ref={tile} type="button" className="campus-photo" data-photo-id={photo.id} style={{ left: photo.x, top: photo.y, width: photo.width, height: photo.height, backgroundColor: photo.color }} aria-label={`查看${photo.title}`} onClick={event => onSelect(event.detail === 0)} onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { setRequested(true); onKeyboardFocus() } }}>
    {requested && <img src={photo.thumbnail} alt={photo.title} draggable={false} decoding="async" fetchPriority="low" />}
    <span className="campus-photo-caption">{photo.category} / {photo.title}<span>↗</span></span>
  </button>
}
