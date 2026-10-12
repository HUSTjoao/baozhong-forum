'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
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

export function CommunityModal({ children, title, close, letterMotion = false, origin }: { children: ReactNode; title: string; close: () => void; letterMotion?: boolean; origin?: HTMLElement | null }) {
  const ref = useRef<HTMLDialogElement>(null),motion=useRef<Animation|null>(null),closing=useRef(false),latestClose=useRef(close),latestOrigin=useRef(origin),releaseSource=useRef<(()=>void)|null>(null)
  latestClose.current=close;latestOrigin.current=origin
  function sourceTransform(dialog:HTMLDialogElement){
    const source=latestOrigin.current?.closest<HTMLElement>('.voyage-letter')||latestOrigin.current;const target=source?.getBoundingClientRect(),box=dialog.getBoundingClientRect()
    if(!target||target.right<0||target.left>innerWidth||target.bottom<0||target.top>innerHeight)return 'translate3d(0,35px,0) scale(.86) rotate(-2deg)'
    const x=target.left+target.width/2-box.left-box.width/2,y=target.top+target.height/2-box.top-box.height/2
    return `translate3d(${x}px,${y}px,0) scale(${Math.max(.1,target.width/box.width)},${Math.max(.1,target.height/box.height)}) rotate(-2deg)`
  }
  const dismiss=()=>{
    if(closing.current)return
    const dialog=ref.current
    if(!letterMotion||!dialog||matchMedia('(prefers-reduced-motion:reduce)').matches){latestClose.current();return}
    closing.current=true
    const start=getComputedStyle(dialog).transform,opacity=getComputedStyle(dialog).opacity
    motion.current?.cancel();dialog.classList.add('letter-reading-closing')
    const target=sourceTransform(dialog)
    motion.current=dialog.animate([{transform:start==='none'?'none':start,opacity},{transform:target,opacity:0}],{duration:440,easing:'cubic-bezier(.4,0,.3,1)',fill:'forwards'})
    void motion.current.finished.then(()=>latestClose.current()).catch(()=>{})
  }
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    if (openModals++ === 0) {originalOverflow = document.body.style.overflow;document.body.style.overflow = 'hidden'}
    const dialog=ref.current;dialog?.showModal()
    if(letterMotion&&dialog&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
      const start=sourceTransform(dialog)
      motion.current=dialog.animate([{transform:start,opacity:.2},{transform:'perspective(1200px) translate3d(0,-6px,0) scale(1.012) rotateX(2deg)',opacity:1,offset:.78},{transform:'none',opacity:1}],{duration:640,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
    }
    return () => {
      motion.current?.cancel();releaseSource.current?.()
      if (--openModals === 0) document.body.style.overflow = originalOverflow
      if (previous?.isConnected) previous.focus({preventScroll:true})
    }
  }, [])
  useLayoutEffect(()=>{
    if(!letterMotion||!origin)return
    const paper=origin.closest<HTMLElement>('.voyage-letter'),floating=origin.closest<HTMLElement>('.voyage-float')
    const visibility=paper?.style.visibility||'',state=floating?.style.animationPlayState||''
    if(paper)paper.style.visibility='hidden';if(floating)floating.style.animationPlayState='paused'
    const release=()=>{if(paper)paper.style.visibility=visibility;if(floating)floating.style.animationPlayState=state};releaseSource.current=release;return()=>{release();if(releaseSource.current===release)releaseSource.current=null}
  },[origin,letterMotion])
  return <dialog ref={ref} className={`community-dialog${letterMotion?' letter-reading-dialog':''}`} aria-label={title} onCancel={event => { event.preventDefault(); dismiss() }} onClick={event => {
    if (event.target !== event.currentTarget) return
    const box = event.currentTarget.getBoundingClientRect()
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss()
  }}>
    <button className="community-close" onClick={dismiss} aria-label="关闭"><X /></button>{children}
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
