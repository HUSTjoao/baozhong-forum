'use client'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Minus, Plus, RotateCcw, Shuffle } from 'lucide-react'

type Point = { x: number; y: number }
function places(count: number): Point[] {
 const points:Point[]=[];let x=0,y=0,dx=1,dy=0,length=1,walked=0,turns=0
 for(let i=0;i<count;i++){points.push({x:x*430,y:y*350+(x%2)*24});x+=dx;y+=dy;walked++;if(walked===length){walked=0;[dx,dy]=[-dy,dx];turns++;if(turns%2===0)length++}}
 return points
}
export default function LettersVoyage<T extends {id:string}>({items,render,empty}:{items:T[];render:(item:T,index:number)=>ReactNode;empty:ReactNode}){
 const viewport=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null)
 const camera=useRef({x:0,y:0,zoom:1}),drag=useRef<{id:number;x:number;y:number;time:number;vx:number;vy:number}|null>(null)
 const moved=useRef(false),frame=useRef(0),[zoom,setZoom]=useState(100),[dragging,setDragging]=useState(false)
 const positions=useMemo(()=>places(items.length),[items.length]),layoutKey=items.map(item=>item.id).join('|')
 const paint=()=>{const c=camera.current;if(world.current)world.current.style.transform=`translate3d(${c.x}px,${c.y}px,0) scale(${c.zoom})`;viewport.current?.style.setProperty('--drift-x',`${c.x*.08}px`);viewport.current?.style.setProperty('--drift-y',`${c.y*.08}px`)}
 const clamp=()=>{const c=camera.current,reach=Math.max(700,Math.sqrt(items.length)*500)*c.zoom;c.x=Math.max(-reach,Math.min(reach,c.x));c.y=Math.max(-reach,Math.min(reach,c.y))}
 const stop=()=>{cancelAnimationFrame(frame.current);frame.current=0}
 const travel=(x:number,y:number)=>{stop();const from={...camera.current},start=performance.now(),duration=matchMedia('(prefers-reduced-motion:reduce)').matches?0:700;const tick=(now:number)=>{const t=duration?Math.min(1,(now-start)/duration):1,e=1-Math.pow(1-t,3);camera.current.x=from.x+(x-from.x)*e;camera.current.y=from.y+(y-from.y)*e;paint();if(t<1)frame.current=requestAnimationFrame(tick)};frame.current=requestAnimationFrame(tick)}
 const magnify=(value:number)=>{stop();const c=camera.current,next=Math.max(.55,Math.min(1.4,value)),ratio=next/c.zoom;c.x*=ratio;c.y*=ratio;c.zoom=next;clamp();paint();setZoom(Math.round(next*100))}
 useEffect(()=>{travel(0,0)},[layoutKey])
 useEffect(()=>{
  const el=viewport.current;if(!el)return
  const fit=()=>{const root=el.closest<HTMLElement>('.letters-roaming');if(root)root.style.setProperty('--voyage-height',`${Math.max(360,innerHeight-root.getBoundingClientRect().top)}px`)};fit();window.addEventListener('resize',fit)
  const wheel=(e:WheelEvent)=>{if((e.target as HTMLElement).closest('.voyage-controls,input,textarea'))return;e.preventDefault();stop();if(e.ctrlKey){magnify(camera.current.zoom*Math.exp(-e.deltaY*.003))}else{camera.current.x-=e.deltaX;camera.current.y-=e.deltaY;clamp();paint()}}
  el.addEventListener('wheel',wheel,{passive:false});return()=>{el.removeEventListener('wheel',wheel);window.removeEventListener('resize',fit);stop()}
 },[items.length])
 return <div ref={viewport} className={`letters-voyage${dragging?' is-dragging':''}`} tabIndex={0} aria-label="拖动探索寄语，方向键移动，Home 键回到起点" onKeyDown={e=>{if(e.target!==e.currentTarget)return;const step=180;const delta:Record<string,Point>={ArrowLeft:{x:step,y:0},ArrowRight:{x:-step,y:0},ArrowUp:{x:0,y:step},ArrowDown:{x:0,y:-step}};if(e.key==='Home'){e.preventDefault();travel(0,0)}else if(delta[e.key]){e.preventDefault();travel(camera.current.x+delta[e.key].x,camera.current.y+delta[e.key].y)}}}
 onPointerDown={e=>{moved.current=false;if(e.button!==0||(e.target as HTMLElement).closest('input,textarea,.voyage-controls'))return;stop();moved.current=false;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now(),vx:0,vy:0}}}
 onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const now=performance.now(),dx=e.clientX-d.x,dy=e.clientY-d.y,dt=Math.max(12,now-d.time);if(!moved.current&&Math.abs(dx)+Math.abs(dy)<5)return;if(!moved.current){moved.current=true;e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}camera.current.x+=dx;camera.current.y+=dy;d.vx=dx/dt;d.vy=dy/dt;d.x=e.clientX;d.y=e.clientY;d.time=now;clamp();paint()}}
 onPointerUp={e=>{const d=drag.current;if(!d)return;drag.current=null;setDragging(false);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(!moved.current||matchMedia('(prefers-reduced-motion:reduce)').matches)return;let vx=d.vx,vy=d.vy,last=performance.now();if(last-d.time>100)return;const glide=(now:number)=>{const dt=Math.min(32,now-last);last=now;vx*=Math.pow(.90,dt/16);vy*=Math.pow(.90,dt/16);camera.current.x+=vx*dt;camera.current.y+=vy*dt;clamp();paint();if(Math.abs(vx)+Math.abs(vy)>.015)frame.current=requestAnimationFrame(glide)};frame.current=requestAnimationFrame(glide)}}
 onPointerCancel={()=>{drag.current=null;setDragging(false);stop()}} onClickCapture={e=>{if(moved.current&&e.detail!==0){e.preventDefault();e.stopPropagation();moved.current=false}}}>
  <div className="voyage-atmosphere" aria-hidden="true"><i/><i/><i/><i/></div>
  <div className="voyage-world" ref={world}>{items.map((m,i)=><article key={m.id} className={`voyage-letter voyage-tone-${i%4}`} style={{left:positions[i].x-170,top:positions[i].y-140,'--letter-angle':`${[-2,1.5,-1,2][i%4]}deg`} as React.CSSProperties}>{render(m,i)}</article>)}</div>
  {!items.length&&<div className="voyage-empty">{empty}</div>}
  <div className="voyage-controls"><span>拖动，遇见一封信</span><div><button aria-label="缩小" onClick={()=>magnify(camera.current.zoom-.1)}><Minus size={18}/></button><span>{zoom}%</span><button aria-label="放大" onClick={()=>magnify(camera.current.zoom+.1)}><Plus size={18}/></button><i/><button aria-label="回到起点" onClick={()=>travel(0,0)}><RotateCcw size={18}/></button><button aria-label="随机遇见一封信" disabled={!items.length} onClick={()=>{const p=positions[Math.floor(Math.random()*items.length)];travel(-p.x*camera.current.zoom,-p.y*camera.current.zoom)}}><Shuffle size={18}/></button></div></div>
 </div>
}
