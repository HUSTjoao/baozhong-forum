'use client'
import { memo, useEffect, useMemo, useRef } from 'react'

import crittersArt from './critters-art.json'

const CritterEyes = memo(function CritterEyes({markup}:{markup:string}) {
 const drawing = useMemo(() => ({__html:markup}), [markup])
 return <g className="auth-critter-blink" dangerouslySetInnerHTML={drawing}/>
})

export default function AuthCompanions({privateEntry,failed,reaction}:{privateEntry:boolean;failed:boolean;reaction:number}){
 const actors=useRef<(HTMLDivElement|null)[]>([])
 const privateRef=useRef(privateEntry);privateRef.current=privateEntry
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion:reduce)')
  const positions=Array.from({length:4},()=>({x:0,y:0,head:0,tx:0,ty:0}));let frame=0,previous=0,dirty=true;let boxes:DOMRect[]=[]
  const animate=(time:number)=>{
   const dt=Math.min(40,previous?time-previous:16);previous=time;let moving=false
   const eyeEase=1-Math.exp(-dt/80),headEase=1-Math.exp(-dt/180)
   positions.forEach((p,i)=>{p.x+=(p.tx-p.x)*eyeEase;p.y+=(p.ty-p.y)*eyeEase;p.head+=(p.tx-p.head)*headEase;if(Math.abs(p.tx-p.x)+Math.abs(p.ty-p.y)+Math.abs(p.tx-p.head)>.002)moving=true;const el=actors.current[i];if(!el)return;el.style.setProperty('--look-x',`${p.x*2.6}px`);el.style.setProperty('--look-y',`${p.y*1.8}px`);el.style.setProperty('--head-angle',`${p.head*(5+i)}deg`);el.style.setProperty('--body-x',`${p.head*2}px`);el.style.setProperty('--body-y',`${p.y}px`);el.style.setProperty('--body-angle',`${p.head*2}deg`)});
   frame=moving?requestAnimationFrame(animate):0;if(!moving)previous=0
  }
  const start=()=>{if(!frame&&!reduced.matches)frame=requestAnimationFrame(animate)}
  const aim=(x:number,y:number)=>{if(reduced.matches)return;if(dirty){boxes=actors.current.map(el=>el?.getBoundingClientRect()??new DOMRect());dirty=false}boxes.forEach((box,i)=>{positions[i].tx=Math.max(-1,Math.min(1,(x-box.left-box.width/2)/300));positions[i].ty=Math.max(-1,Math.min(1,(y-box.top-box.height*.4)/250))});start()}
  const look=(event:PointerEvent)=>{if(event.pointerType!=='touch'&&!privateRef.current)aim(event.clientX,event.clientY)}
  const followInput=(event:Event)=>{const input=event.target;if(!(input instanceof HTMLInputElement)||!input.closest('.auth-form-panel')||input.dataset.private)return;const box=input.getBoundingClientRect();aim(box.left+25+Math.min(box.width-50,input.value.length*8),box.top+box.height/2)}
  const reset=()=>{positions.forEach(p=>{p.tx=0;p.ty=0});start()};const invalidate=()=>{dirty=true}
  const motionChanged=()=>{if(!reduced.matches)return;cancelAnimationFrame(frame);frame=0;previous=0;actors.current.forEach(el=>el&&['--look-x','--look-y','--head-angle','--body-x','--body-y','--body-angle'].forEach(key=>el.style.removeProperty(key)))}
  window.addEventListener('pointermove',look,{passive:true});window.addEventListener('resize',invalidate,{passive:true});window.addEventListener('scroll',invalidate,{passive:true,capture:true});document.addEventListener('pointerleave',reset);document.addEventListener('focusin',followInput);document.addEventListener('input',followInput);reduced.addEventListener('change',motionChanged)
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',look);window.removeEventListener('resize',invalidate);window.removeEventListener('scroll',invalidate,true);document.removeEventListener('pointerleave',reset);document.removeEventListener('focusin',followInput);document.removeEventListener('input',followInput);reduced.removeEventListener('change',motionChanged)}
 },[])
 return <div className="auth-companions auth-doodle-companions auth-critters-companions" data-private={privateEntry} data-failed={failed} aria-hidden="true">{crittersArt.map((art,i)=><div className={`auth-actor auth-actor-${i}`} key={i} ref={el=>{actors.current[i]=el}}><div className="auth-actor-float"><svg viewBox="0 0 100 105" fill="none">
  <defs><clipPath id={`auth-critter-bust-${i}`}><rect width="100" height="99"/></clipPath></defs>
  <g key={reaction} className={reaction>0?'auth-face-react':undefined}>
   <g className="auth-character-body">
    <g clipPath={`url(#auth-critter-bust-${i})`}>
     <g dangerouslySetInnerHTML={{__html:art.body}}/>
     <g transform="translate(34 75)" dangerouslySetInnerHTML={{__html:art.pattern}}/>
     <g className="auth-face-follow">
      <g transform="translate(28 53)" dangerouslySetInnerHTML={{__html:art.cheeks}}/>
      <g transform="translate(27 36)">
       <g className="auth-open-eyes"><CritterEyes markup={art.eyes}/></g>
       <g className="auth-closed-eyes" dangerouslySetInnerHTML={{__html:art.closed}}/>
      </g>
      <g transform="translate(36 60)" className="auth-critter-mouth" dangerouslySetInnerHTML={{__html:failed?art.frown:art.mouth}}/>
     </g>
    </g>
    <g className="auth-critter-paws" fill={art.color}>
     <ellipse cx="29" cy="99" rx="7" ry="4"/><ellipse cx="71" cy="99" rx="7" ry="4"/>
     <path d="M27 98v2M30 98v2M69 98v2M72 98v2" stroke="#1e293b" strokeOpacity=".25" strokeLinecap="round" strokeWidth=".8"/>
    </g>
   </g>
  </g>
 </svg></div></div>)}</div>
}
