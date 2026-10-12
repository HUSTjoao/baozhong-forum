'use client'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Minus, Plus, RotateCcw, Shuffle, Maximize, Minimize } from 'lucide-react'

type Point = { x: number; y: number }
function places(count: number): Point[] {
 const points:Point[]=[];let x=0,y=0,dx=1,dy=0,length=1,walked=0,turns=0
 for(let i=0;i<count;i++){points.push({x:x*430,y:y*350+(x%2)*24});x+=dx;y+=dy;walked++;if(walked===length){walked=0;[dx,dy]=[-dy,dx];turns++;if(turns%2===0)length++}}
 return points
}
export default function LettersVoyage<T extends {id:string}>({items,render,empty}:{items:T[];render:(item:T,index:number)=>ReactNode;empty:ReactNode}){
 const viewport=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null)
 const orbits=useRef<(HTMLDivElement|null)[]>([]),size=useRef({width:0,height:0})
 const camera=useRef({x:0,y:0,zoom:1}),drag=useRef<{id:number;x:number;y:number;time:number;vx:number;vy:number}|null>(null)
 const fullscreenMode=useRef(false),fallbackMode=useRef(false),savedOverflow=useRef<string|null>(null)
 const [fullscreen,setFullscreen]=useState(false),[zoom,setZoom]=useState(100)
 const moved=useRef(false),frame=useRef(0),[dragging,setDragging]=useState(false)
 const positions=useMemo(()=>places(items.length),[items.length]),layoutKey=items.map(item=>item.id).join('|')
 const paint=()=>{
  const c=camera.current;if(world.current)world.current.style.transform=`translate3d(${c.x}px,${c.y}px,0) scale(${c.zoom})`
  viewport.current?.style.setProperty('--drift-x',`${c.x*.08}px`);viewport.current?.style.setProperty('--drift-y',`${c.y*.08}px`)
  const {width,height}=size.current;if(!width||!height)return
  const bend=(n:number)=>{const t=Math.min(1.2,Math.max(0,(Math.abs(n)-.32)/.88));return t*t*(3-2*Math.min(1,t))}
  positions.forEach((p,i)=>{
   const el=orbits.current[i];if(!el)return
   const nx=(p.x*c.zoom+c.x)/(width*.55),ny=(p.y*c.zoom+c.y)/(height*.6),bx=bend(nx),by=bend(ny),depth=Math.min(1.8,bx*bx+by*by)
   const turnY=Math.sign(nx)*Math.min(72,bx*58),turnX=-Math.sign(ny)*Math.min(58,by*44)
   el.style.transform=`perspective(1050px) translate3d(${-Math.sign(nx)*bx*25}px,${-Math.sign(ny)*by*18}px,${-depth*145}px) rotateY(${turnY}deg) rotateX(${turnX}deg)`
   el.style.opacity=`${1-Math.min(.38,depth*.19)}`
   el.style.setProperty('--orbit-shade',`${Math.min(.20,depth*.11)}`)
   el.style.setProperty('--orbit-light-angle',`${nx>0?110:250}deg`)
  })
 }

 const clamp=()=>{const c=camera.current,reach=Math.max(700,Math.sqrt(items.length)*500)*c.zoom;c.x=Math.max(-reach,Math.min(reach,c.x));c.y=Math.max(-reach,Math.min(reach,c.y))}
 const stop=()=>{cancelAnimationFrame(frame.current);frame.current=0}
 const travel=(x:number,y:number)=>{stop();const from={...camera.current},start=performance.now(),duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:700;const tick=(now:number)=>{const t=duration?Math.min(1,(now-start)/duration):1,e=1-Math.pow(1-t,3);camera.current.x=from.x+(x-from.x)*e;camera.current.y=from.y+(y-from.y)*e;paint();if(t<1)frame.current=requestAnimationFrame(tick)};frame.current=requestAnimationFrame(tick)}
 const magnify=(value:number)=>{stop();const c=camera.current,next=Math.max(.55,Math.min(1.4,value)),ratio=next/c.zoom;c.x*=ratio;c.y*=ratio;c.zoom=next;clamp();paint();setZoom(Math.round(next*100))}
 const changeFullscreen=(active:boolean)=>{
  const root=viewport.current?.closest<HTMLElement>('.letters-roaming');if(!root)return
  if(active&&savedOverflow.current===null){savedOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden'}
  if(!active&&savedOverflow.current!==null){document.body.style.overflow=savedOverflow.current;savedOverflow.current=null}
  root.classList.toggle('voyage-fullscreen',active);fullscreenMode.current=active;setFullscreen(active)
 }
 const toggleFullscreen=async()=>{
  const root=viewport.current?.closest<HTMLElement>('.letters-roaming');if(!root)return
  if(document.fullscreenElement===root){await document.exitFullscreen();return}
  if(fullscreenMode.current){fallbackMode.current=false;changeFullscreen(false);return}
  try{if(!root.requestFullscreen)throw Error('Fullscreen unavailable');await root.requestFullscreen()}catch{fallbackMode.current=true;changeFullscreen(true)}
 }
 useEffect(()=>{
  const root=viewport.current?.closest<HTMLElement>('.letters-roaming')
  const sync=()=>{if(document.fullscreenElement===root){fallbackMode.current=false;changeFullscreen(true)}else if(!fallbackMode.current){changeFullscreen(false)}}
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&fallbackMode.current&&!document.querySelector('dialog[open]')){e.preventDefault();fallbackMode.current=false;changeFullscreen(false)}}
  document.addEventListener('fullscreenchange',sync);document.addEventListener('keydown',escape)
  return()=>{document.removeEventListener('fullscreenchange',sync);document.removeEventListener('keydown',escape);root?.classList.remove('voyage-fullscreen');if(savedOverflow.current!==null){document.body.style.overflow=savedOverflow.current;savedOverflow.current=null}if(root&&document.fullscreenElement===root)void document.exitFullscreen().catch(()=>{})}
 },[])
 useEffect(()=>{travel(0,0)},[layoutKey])
 useEffect(()=>{
  const el=viewport.current;if(!el)return
  const fit=()=>{const root=el.closest<HTMLElement>('.letters-roaming');if(root)root.style.setProperty('--voyage-height',`${Math.max(360,innerHeight-root.getBoundingClientRect().top)}px`);size.current={width:el.clientWidth,height:el.clientHeight};paint()};fit();window.addEventListener('resize',fit);const observer=new ResizeObserver(fit);observer.observe(el)
  const wheel=(e:WheelEvent)=>{if((e.target as HTMLElement).closest('.voyage-controls,input,textarea'))return;e.preventDefault();stop();if(e.ctrlKey){magnify(camera.current.zoom*Math.exp(-e.deltaY*.003))}else{camera.current.x-=e.deltaX;camera.current.y-=e.deltaY;clamp();paint()}}
  el.addEventListener('wheel',wheel,{passive:false});return()=>{el.removeEventListener('wheel',wheel);window.removeEventListener('resize',fit);observer.disconnect();stop()}
 },[items.length])
 return <div ref={viewport} className={`letters-voyage${dragging?' is-dragging':''}`} tabIndex={0} aria-label="拖动探索寄语，方向键移动，Home 键回到起点，加减键缩放" onKeyDown={e=>{if(e.target!==e.currentTarget)return;const step=180;const delta:Record<string,Point>={ArrowLeft:{x:step,y:0},ArrowRight:{x:-step,y:0},ArrowUp:{x:0,y:step},ArrowDown:{x:0,y:-step}};if(e.key==='+'||e.key==='='){e.preventDefault();magnify(camera.current.zoom+.1)}else if(e.key==='-'){e.preventDefault();magnify(camera.current.zoom-.1)}else if(e.key==='Home'){e.preventDefault();travel(0,0)}else if(delta[e.key]){e.preventDefault();travel(camera.current.x+delta[e.key].x,camera.current.y+delta[e.key].y)}}}
 onPointerDown={e=>{moved.current=false;if(e.button!==0||(e.target as HTMLElement).closest('input,textarea,.voyage-controls'))return;stop();moved.current=false;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),vx:0,vy:0}}}
 onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dx=e.clientX-d.x,dy=e.clientY-d.y,dt=Math.max(12,now-d.time);if(!moved.current&&Math.abs(dx)+Math.abs(dy)<5)return;if(!moved.current){moved.current=true;e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}camera.current.x+=dx;camera.current.y+=dy;d.vx=dx/dt;d.vy=dy/dt;d.x=e.clientX;d.y=e.clientY;d.time=now;clamp();paint()}}
 onPointerUp={e=>{const d=drag.current;if(!d)return;drag.current=null;setDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!moved.current||matchMedia('(prefers-reduced-motion:reduce)').matches)return;let vx=d.vx,vy=d.vy,last=performance.now();if(last-d.time>100)return;const glide=(now:number)=>{const dt=Math.min(32,now-last);last=now;vx*=Math.pow(.90,dt/16);vy*=Math.pow(.90,dt/16);camera.current.x+=vx*dt;camera.current.y+=vy*dt;clamp();paint();if(Math.abs(vx)+Math.abs(vy)>.015)frame.current=requestAnimationFrame(glide)};frame.current=requestAnimationFrame(glide)}}
 onPointerCancel={()=>{drag.current=null;setDragging(false);stop()}} onClickCapture={e=>{if(moved.current&&e.detail!==0){e.preventDefault();e.stopPropagation();moved.current=false}}}>
  <div className="voyage-atmosphere" aria-hidden="true"><i/><i/><i/><i/></div>
  <div className="voyage-paper-space"><div className="voyage-world" ref={world}>{items.map((m,i)=><div key={m.id} ref={el=>{orbits.current[i]=el}} className="voyage-orbit" style={{left:positions[i].x-170,top:positions[i].y-140}}><div className="voyage-float" style={{'--letter-angle':`${[-2,1.5,-1,2][i%4]}deg`,'--float-duration':`${7+i%4*1.1}s`,'--float-delay':`${-i*1.7}s`} as React.CSSProperties}><article className={`voyage-letter voyage-tone-${i%4}`}>{render(m,i)}</article></div></div>)}</div></div>
  {!items.length&&<div className="voyage-empty">{empty}</div>}

  <div className="voyage-controls"><span>拖动，遇见一封信</span><div><button aria-label="缩小" onClick={()=>magnify(camera.current.zoom-.1)} disabled={zoom<=55}><Minus size={18}/></button><span>{zoom}%</span><button aria-label="放大" onClick={()=>magnify(camera.current.zoom+.1)} disabled={zoom>=140}><Plus size={18}/></button><i/><button aria-label="回到起点" onClick={()=>travel(0,0)}><RotateCcw size={18}/></button><button aria-label="随机遇见一封信" disabled={!items.length} onClick={()=>{const p=positions[Math.floor(Math.random()*items.length)];travel(-p.x*camera.current.zoom,-p.y*camera.current.zoom)}}><Shuffle size={18}/></button><i/><button className="voyage-fullscreen-button" aria-pressed={fullscreen} aria-label={fullscreen?'退出全屏':'全屏阅读'} onClick={()=>void toggleFullscreen()}>{fullscreen?<Minimize size={18}/>:<Maximize size={18}/>}<span>{fullscreen?'退出全屏':'全屏阅读'}</span></button></div></div>

 </div>
}
