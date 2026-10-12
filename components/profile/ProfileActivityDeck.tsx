'use client'
import { Children, useEffect, useRef, useState, type ReactNode, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import CardSwapSource, { Card as CardSource } from './ReactBitsCardSwap'
import './activity-deck.css'
type DeckApi = {next:()=>void;prev:()=>void}
const CardSwap = CardSwapSource as unknown as ForwardRefExoticComponent<{children:ReactNode} & Record<string,unknown> & RefAttributes<DeckApi>>
const Card = CardSource as unknown as ForwardRefExoticComponent<{children:ReactNode;customClass?:string;className?:string} & RefAttributes<HTMLDivElement>>
export default function ProfileActivityDeck({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const api = useRef<{next:()=>void;prev:()=>void}|null>(null)
  const [width,setWidth] = useState(680)
  const [active,setActive] = useState(0)
  const [paused,setPaused] = useState(false)
  const [reduced,setReduced] = useState(false)
  const cards = Children.toArray(children)
  useEffect(()=>{
    const el=frame.current;if(!el)return
    const resize=new ResizeObserver(()=>setWidth(Math.max(245,Math.min(720,el.clientWidth-180))))
    resize.observe(el)
    const query=matchMedia('(prefers-reduced-motion: reduce)'); const update=()=>setReduced(query.matches)
    update();query.addEventListener('change',update)
    return()=>{resize.disconnect();query.removeEventListener('change',update)}
  },[])
  return <div className="profile-deck" ref={frame}>
    <div className="profile-deck-stage" onFocusCapture={()=>setPaused(true)}>
      <CardSwap ref={api} width={width} height={width<400?445:410} cardDistance={width<400?26:80} verticalDistance={width<400?82:115} depth={40} skewAmount={3} visibleCards={4} delay={6500} autoplay={!paused&&!reduced} pauseOnHover draggable speed={.9} bounce={.16} parallax={.09} hoverSpread={.1} dim={.4} cardRadius={18} intro theme="light" onChange={setActive} onCardClick={undefined} className="profile-card-swap" items={undefined}>
        {cards.map((card,i)=><Card key={i} customClass="profile-swap-tile" className="">{card}</Card>)}
      </CardSwap>
    </div>
    <div className="profile-deck-controls">
      <span className="profile-deck-position" aria-live="polite"><strong>{String(active+1).padStart(2,'0')}</strong><span>/ {String(cards.length).padStart(2,'0')}</span></span>
      <div><button type="button" onClick={()=>api.current?.prev()} disabled={cards.length<2} aria-label="上一张动态"><ArrowLeft size={19}/></button><button type="button" onClick={()=>setPaused(p=>!p)} disabled={cards.length<2||reduced} aria-label={paused?'继续轮换动态':'暂停轮换动态'} aria-pressed={paused}>{paused||reduced?<Play size={16}/>:<Pause size={16}/>}</button><button type="button" onClick={()=>api.current?.next()} disabled={cards.length<2} aria-label="下一张动态"><ArrowRight size={19}/></button></div>
    </div>
  </div>
}


