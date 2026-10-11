'use client'

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import './community.css'

let openModals = 0
let originalOverflow = ''

export function Surface({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`community-surface ${className}`} style={style} onPointerMove={event => {
    if (event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--rx', `${-(event.clientY - box.top - box.height / 2) / box.height * 5}deg`)
    event.currentTarget.style.setProperty('--ry', `${(event.clientX - box.left - box.width / 2) / box.width * 5}deg`)
  }} onPointerLeave={event => { event.currentTarget.style.setProperty('--rx', '0deg'); event.currentTarget.style.setProperty('--ry', '0deg') }}>{children}</div>
}

export function CommunityModal({ children, title, close }: { children: ReactNode; title: string; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    if (openModals++ === 0) {
      originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    ref.current?.showModal()
    return () => {
      if (--openModals === 0) document.body.style.overflow = originalOverflow
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return <dialog ref={ref} className="community-dialog" aria-label={title} onCancel={event => { event.preventDefault(); close() }} onClick={event => {
    if (event.target !== event.currentTarget) return
    const box = event.currentTarget.getBoundingClientRect()
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close()
  }}>
    <button className="community-close" onClick={close} aria-label="关闭"><X /></button>{children}
  </dialog>
}

export function PageTurner({ page, total, change }: { page: number; total: number; change: (page: number) => void }) {
  const [jump, setJump] = useState('')
  if (total < 2) return null
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(i => i === 1 || i === total || Math.abs(i - page) <= 1)
  return <nav className="community-pagination" aria-label="分页">
    <button disabled={page === 1} onClick={() => change(page - 1)} aria-label="上一页"><ArrowLeft size={20} /></button>
    {pages.map((p, i) => <span key={p}>{i > 0 && p - pages[i - 1] > 1 && <span className="page-ellipsis">…</span>}<button aria-current={p === page ? 'page' : undefined} onClick={() => change(p)}>{String(p).padStart(2, '0')}</button></span>)}
    <button disabled={page === total} onClick={() => change(page + 1)} aria-label="下一页"><ArrowRight size={20} /></button>
    <form onSubmit={event => { event.preventDefault(); const target = Number(jump); if (Number.isInteger(target) && target >= 1 && target <= total) { change(target); setJump('') } }}><label>共 {total} 页 · 跳至 <input aria-label="跳转页码" type="number" min="1" max={total} value={jump} onChange={event => setJump(event.target.value)} /></label><button aria-label="跳转"><ArrowRight size={17} /></button></form>
  </nav>
}
