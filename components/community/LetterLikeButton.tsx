'use client'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Heart } from 'lucide-react'

type Props={count:number;selected:boolean;disabled?:boolean;title?:string;full?:boolean;onClick:()=>void}
export default function LetterLikeButton({count,selected,disabled,title,full=false,onClick}:Props){
 const previous=useRef({count,selected}),[motion,setMotion]=useState({from:count,direction:1,serial:0,action:'idle'})
 useLayoutEffect(()=>{const old=previous.current;if(old.count!==count||old.selected!==selected){setMotion(m=>({from:old.count,direction:count>=old.count?1:-1,serial:m.serial+1,action:old.selected!==selected?(selected?'like':'unlike'):'count'}));previous.current={count,selected}}},[count,selected])
 return <button className="letter-like letter-like-crafted" title={title} aria-pressed={selected} aria-label={`${selected?'取消喜欢':'喜欢'}这封信：${count}`} disabled={disabled} onClick={onClick}>
  <span className="letter-like-glyph" key={`heart-${motion.serial}`} data-action={motion.action} aria-hidden="true"><Heart size={21} strokeWidth={1.65}/><span className="letter-like-ring"/>{motion.action==='like'&&<span className="letter-like-particles">{Array.from({length:8},(_,i)=>{const angle=(i*45-20)*Math.PI/180;return <i key={i} style={{'--dx':`${Math.cos(angle)*(i%2?23:29)}px`,'--dy':`${Math.sin(angle)*(i%2?23:29)}px`,'--spark-delay':`${i%3*25}ms`} as CSSProperties}/>})}</span>}</span>
  <span className="letter-like-count" aria-hidden="true" key={`count-${motion.serial}`} data-moving={motion.serial>0} style={{'--count-enter':`${motion.direction*110}%`,'--count-leave':`${motion.direction*-110}%`} as CSSProperties}>{motion.serial>0&&<span className="letter-count-old">{motion.from}</span>}<span className="letter-count-current">{count}</span></span>
  {full&&<span className="letter-like-caption">人喜欢</span>}
 </button>
}
