'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { campusTheme } from '@/lib/campus-themes'
import { useCampusTransition } from './CampusTransition'
import type { CSSProperties, PointerEvent } from 'react'
import { useEffect, useRef } from 'react'

import UniversityEmblem from './UniversityEmblem'
import { campusCulture } from '@/lib/campus-culture'

export type Campus = { id: string; name: string; englishName: string; motto: string; province: string; city: string; logoUrl: string | null; accent: string; level: string | null }

function CampusLocationIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3.5a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 23 16 23s7.5-6 7.5-12A7.5 7.5 0 0 0 16 3.5Z" /><circle cx="16" cy="11" r="2.5" /><path d="m8 19-4.5 3v5l8-2 9 2 8-3v-5l-5-1.5M11.5 25v-4M20.5 27v-5" /></svg>
}


function EnterCampusIcon() {
  return <svg viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21 21 7M10 7h11v11" /><path className="uni-enter-tail" d="M7 12v9h9" /></svg>
}

export default function CampusCard({ campus: u, index, active, onActivate }: { campus: Campus; index: number; active: boolean; onActivate: () => void }) {
  const names = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = names.current
    if (!root) return
    let disposed = false
    let frame = 0
    const fit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (disposed) return
        root.querySelectorAll<HTMLElement>('[data-card-fit]').forEach(text => {
          const slot = text.parentElement!
          const maximum = parseFloat(getComputedStyle(slot).fontSize)
          const fits = () => text.getBoundingClientRect().height <= slot.clientHeight + .5 && text.scrollWidth <= slot.clientWidth + .5
          text.style.fontSize = `${maximum}px`
          if (fits()) return
          let low = Math.min(10, maximum), high = maximum
          for (let step = 0; step < 8; step++) {
            const size = (low + high) / 2
            text.style.fontSize = `${size}px`
            if (fits()) low = size; else high = size
          }
          text.style.fontSize = `${Math.floor(low * 10) / 10}px`
        })
      })
    }
    const observer = new ResizeObserver(fit)
    observer.observe(root)
    fit()
    void document.fonts.ready.then(() => { if (!disposed) fit() })
    document.fonts.addEventListener('loadingdone', fit)
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.fonts.removeEventListener('loadingdone', fit) }
  }, [u.name, u.englishName, u.motto, u.id])
  const theme = campusTheme(u.id, u.accent)
  const culture = campusCulture(u.id, u.motto)
  const transition = useCampusTransition()
  const router = useRouter()
  function prepare() {
    onActivate()
    router.prefetch('/universities/' + u.id)
  }
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const card = event.currentTarget
    card.removeAttribute('data-campus-settled')
    const rect = card.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    card.style.setProperty('--campus-rotate-y', ((x - .5) * 10).toFixed(2) + 'deg')
    card.style.setProperty('--campus-rotate-x', ((.5 - y) * 8).toFixed(2) + 'deg')
    card.style.setProperty('--campus-light-x', (x * 100).toFixed(1) + '%')
    card.style.setProperty('--campus-light-y', (y * 100).toFixed(1) + '%')
  }
  function reset(event: PointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty('--campus-rotate-x', '0deg')
    event.currentTarget.style.setProperty('--campus-rotate-y', '0deg')
  }
  const levels = ['985', '211', '双一流'].filter(level => u.level?.split(/[／/、,，·\s]+/).includes(level))
  return <Link className={'uni-campus uni-accent-' + theme.key} href={'/universities/' + u.id} data-campus-id={u.id} onClick={event => transition?.open(event, u.id)} aria-label={'了解' + u.name + '，查看学校介绍与讨论'} onMouseEnter={prepare} onFocus={prepare} onPointerMove={move} onPointerLeave={reset} data-map-active={active} style={{ '--campus-order': index, '--campus-entry-delay': ((index % 6) * .11) + 's', '--u-accent': theme.ink, '--campus-card-wash': theme.card } as CSSProperties}>
    <span className="uni-enter-campus"><EnterCampusIcon /></span>
    <div className="uni-card-identity"><div className="uni-logo"><UniversityEmblem src={u.logoUrl} name={u.name} size={96} priority={index < 3} /></div><div ref={names} className="uni-card-names"><h2 title={u.name}><span data-card-fit>{u.name}</span></h2><p className="uni-campus-en" lang="en" title={u.englishName}>{u.englishName && <span data-card-fit>{u.englishName}</span>}</p><p className={culture ? 'uni-motto' : 'uni-catalog-pending'} title={culture || undefined}><span data-card-fit>{culture || (!u.englishName ? '校园资料整理中' : '')}</span></p></div></div>
    <div className="uni-card-bottom"><div className="uni-campus-meta"><CampusLocationIcon /><div><span>校园坐标</span><strong>{u.province === u.city ? u.city : u.province + ' · ' + u.city}</strong></div></div>{levels.length > 0 && <div className="uni-campus-levels" aria-label="学校等级">{levels.map(level => <span key={level}>{level}</span>)}</div>}</div>
  </Link>
}






