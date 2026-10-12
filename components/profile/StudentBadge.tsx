'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoveHorizontal, RotateCcw } from 'lucide-react'
import Lanyard from './ReactBitsLanyard'
import { createBadgeArtwork, type BadgeProps } from './badge-artwork'
import { profileIdentity } from '@/lib/profile'
import './student-badge.css'

export default function StudentBadge(props: BadgeProps & { actions?: ReactNode }) {
  const [images, setImages] = useState<{ front: string; back: string; strap: string } | null>(null)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [dragging, setDragging] = useState(false)
  const controls = useRef<{ flip: () => void; reset: () => void } | null>(null)
  useEffect(() => {
    let cancelled = false
    void createBadgeArtwork(props).then(art => { if (!cancelled) setImages(art) }).catch(() => { if (!cancelled) setUnavailable(true) })
    return () => { cancelled = true }
  }, [props.user, props.school, props.stats])
  const { user, school } = props
  return <section className="student-badge" aria-label={`${user.name}的校园名片`}>
    <div className="student-badge-stage" data-ready={ready && !unavailable} data-dragging={dragging} data-side={flipped ? 'back' : 'front'}>
      <div className="student-badge-shadow" aria-hidden="true" />
      {images && <Lanyard frontImage={images.front} backImage={images.back} strapImage={images.strap} imageFit="cover" cardColor="#334959" finish="profile" orientation="landscape" size={.62} strapLength={.3} strapColor="#773b35" strapWidth={.65} metal="silver" gravity={1} damping={.5} elasticity={.5} breeze={.08} interactive intro={false} controlsRef={controls} onReady={(ok: boolean) => { setReady(ok); setUnavailable(!ok) }} onFlipChange={setFlipped} onDragChange={setDragging} className="student-badge-original" style={{}} />}
      {(!ready || unavailable) && <div className="student-badge-fallback"><img className="badge-fallback-emblem" src="/baoji-school-emblem.png" alt="宝鸡中学校徽" /><span>宝鸡中学 · 校园名片</span>{user.avatarUrl && <img className="badge-fallback-avatar" src={user.avatarUrl} alt="" />}<h2>{user.name}</h2><p>{profileIdentity(user)}{school && ` · ${school}`}</p>{unavailable && <p>{user.bio}</p>}</div>}
    </div>
    <div className="student-badge-tools"><button className="badge-flip" type="button" onClick={() => controls.current?.flip()} disabled={!ready || unavailable} aria-label={flipped ? '翻到正面' : '翻到背面'} aria-pressed={flipped}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><rect x="7" y="9" width="15" height="11" rx="2" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.4"/><path d="m16 3 3 2-3 2M19 5h-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{flipped ? '查看正面' : '查看背面'}</span></button><button className="badge-reset" type="button" onClick={() => controls.current?.reset()} disabled={!ready || unavailable} aria-label="复位校园名片"><RotateCcw size={18}/><span>复位</span></button>{props.actions}</div>
    <p className="student-badge-hint"><MoveHorizontal size={22} aria-hidden="true" /><strong>按住名片，拖动试试</strong><span>松手回摆 · 点击翻面</span></p>
    <span className="student-badge-readable">宝鸡中学校徽，{user.name}，{profileIdentity(user)}，{school}，{user.bio}</span>
  </section>
}





