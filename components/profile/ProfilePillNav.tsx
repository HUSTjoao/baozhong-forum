'use client'
// Adapted from React Bits PillNav, Copyright (c) 2026 David Haz.
// MIT + Commons Clause: ./REACT-BITS-LICENSE.md
// Source: https://github.com/DavidHDev/react-bits/tree/main/src/content/Components/PillNav
// Retains its circle sizing and paired rolling labels; native animations replace GSAP.
import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import './PillNav.css'
type Item = { id:string; title:string; count?:number }
export default function ProfilePillNav({items,activeId,onSelect}:{items:Item[];activeId:string;onSelect:(id:string)=>void}) {
  const buttons=useRef<(HTMLButtonElement|null)[]>([])
  const animations=useRef(new Map<Element,Animation>())
  const active=useRef(activeId);active.current=activeId
  const reduce=useRef(false)
  const signature=items.map(i=>`${i.id}:${i.title}:${i.count??''}`).join('|')
  function paint(index:number,enter:boolean,instant=false){
    const button=buttons.current[index];if(!button)return
    const circle=button.querySelector<HTMLElement>('.hover-circle')!
    const label=button.querySelector<HTMLElement>('.pill-label')!
    const over=button.querySelector<HTMLElement>('.pill-label-hover')!
    const h=button.clientHeight
    const states:[HTMLElement,string,number][]=[[circle,`translateX(-50%) scale(${enter?1.2:0})`,1],[label,`translateY(${enter?-(h+8):0}px)`,1],[over,`translateY(${enter?0:h+12}px)`,enter?1:0]]
    states.forEach(([el,transform,opacity])=>{
      const current=getComputedStyle(el);const from={transform:current.transform,opacity:current.opacity}
      animations.current.get(el)?.cancel();el.style.transform=transform;el.style.opacity=String(opacity)
      if(instant||reduce.current)return
      const animation=el.animate([from,{transform,opacity}],{duration:enter?380:250,easing:'cubic-bezier(.22,1,.36,1)'})
      animations.current.set(el,animation)
    })
  }
  useLayoutEffect(()=>{
    let disposed=false
    const query=matchMedia('(prefers-reduced-motion: reduce)');reduce.current=query.matches
    const layout=()=>{
      if(disposed)return
      buttons.current.forEach((pill,i)=>{
        if(!pill)return
        const circle=pill.querySelector<HTMLElement>('.hover-circle')!
        const w=pill.clientWidth,h=pill.clientHeight
        const radius=((w*w)/4+h*h)/(2*h),diameter=Math.ceil(2*radius)+2
        const delta=Math.ceil(radius-Math.sqrt(Math.max(0,radius*radius-(w*w)/4)))+1
        circle.style.width=`${diameter}px`;circle.style.height=`${diameter}px`;circle.style.bottom=`-${delta}px`;circle.style.transformOrigin=`50% ${diameter-delta}px`
        paint(i,pill.dataset.id===active.current,true)
      })
    }
    const observer=new ResizeObserver(layout);buttons.current.forEach(button=>{if(button)observer.observe(button)})
    layout();void document.fonts.ready.then(layout)
    const change=()=>{reduce.current=query.matches;layout()};query.addEventListener('change',change)
    return()=>{disposed=true;observer.disconnect();query.removeEventListener('change',change);animations.current.forEach(a=>a.cancel());animations.current.clear()}
  },[signature])
  useLayoutEffect(()=>{buttons.current.forEach((button,i)=>{if(button)paint(i,button.dataset.id===activeId)})},[activeId])
  function keyboard(event:KeyboardEvent<HTMLButtonElement>,i:number){
    let next=i
    if(event.key==='ArrowRight')next=(i+1)%items.length
    else if(event.key==='ArrowLeft')next=(i-1+items.length)%items.length
    else if(event.key==='Home')next=0
    else if(event.key==='End')next=items.length-1
    else return
    event.preventDefault();buttons.current[next]?.focus();onSelect(items[next].id)
  }
  const label=(item:Item)=><>{item.title}{item.count!==undefined&&<span className="pill-count">{item.count}</span>}</>
  return <nav className="profile-tabs profile-pill-nav" aria-label="个人主页内容"><div className="profile-pill-track" role="tablist" aria-label="个人主页内容">{items.map((item,i)=><button key={item.id} type="button" className={`pill${activeId===item.id?' is-active':''}`} role="tab" aria-selected={activeId===item.id} aria-controls="profile-content" tabIndex={activeId===item.id?0:-1} data-id={item.id} ref={el=>{buttons.current[i]=el}} onClick={()=>onSelect(item.id)} onKeyDown={e=>keyboard(e,i)} onMouseEnter={()=>paint(i,true)} onMouseLeave={()=>paint(i,active.current===item.id)} onFocus={()=>paint(i,true)} onBlur={()=>paint(i,active.current===item.id)}><span className="hover-circle" aria-hidden="true"/><span className="label-stack"><span className="pill-label">{label(item)}</span><span className="pill-label-hover" aria-hidden="true">{label(item)}</span></span></button>)}</div></nav>
}
