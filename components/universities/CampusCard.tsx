'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { campusTheme } from '@/lib/campus-themes'
import { useCampusTransition } from './CampusTransition'
import type { CSSProperties, PointerEvent } from 'react'

import { campusCulture } from '@/lib/campus-culture'

export type Campus = { id: string; name: string; englishName: string; motto: string; province: string; city: string; logoUrl: string | null; accent: string; level: string | null }

function CampusLocationIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3.5a7.5 7.5 0 0 0-7.5 7.5C8.5 17 16 23 16 23s7.5-6 7.5-12A7.5 7.5 0 0 0 16 3.5Z" /><circle cx="16" cy="11" r="2.5" /><path d="m8 19-4.5 3v5l8-2 9 2 8-3v-5l-5-1.5M11.5 25v-4M20.5 27v-5" /></svg>
}


function EnterCampusIcon() {
  return <svg viewBox="0 0 28 28" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21 21 7M10 7h11v11" /><path className="uni-enter-tail" d="M7 12v9h9" /></svg>
}

export default function CampusCard({ campus: u, index, active, onActivate }: { campus: Campus; index: number; active: boolean; onActivate: () => void }) {
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
    <div className="uni-card-identity"><div className="uni-logo">{u.logoUrl ? <img src={u.logoUrl} alt={u.name + '校徽'} width={96} height={96} /> : <span>{u.name[0]}</span>}</div><div className="uni-card-names"><h2>{u.name}</h2>{u.englishName && <p className="uni-campus-en" lang="en">{u.englishName}</p>}{culture ? <p className="uni-motto">{culture}</p> : !u.englishName && <p className="uni-catalog-pending">校园资料整理中</p>}</div></div>
    <div className="uni-card-bottom"><div className="uni-campus-meta"><CampusLocationIcon /><div><span>校园坐标</span><strong>{u.province === u.city ? u.city : u.province + ' · ' + u.city}</strong></div></div>{levels.length > 0 && <div className="uni-campus-levels" aria-label="学校等级">{levels.map(level => <span key={level}>{level}</span>)}</div>}</div>
  </Link>
}






