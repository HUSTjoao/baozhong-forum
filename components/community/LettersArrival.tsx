'use client'

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import './letters-arrival.css'

type Coordinate = [number, number]
// Globe land outlines: Natural Earth ne_110m_land, public-domain data.
type World = { features: { geometry: { type: string; coordinates: Coordinate[][] | Coordinate[][][] } }[] }
type ArrivalDocument = Document & { lettersArrivalPlayed?: boolean }
const destination: Coordinate = [107.2, 34.36]
// Symbolic routes; these are not locations inferred from alumni accounts.
const origins: Coordinate[] = [[-74,40.7],[-122.4,37.8],[-0.12,51.5],[2.35,48.9],[151.2,-33.9],[103.8,1.35],[139.7,35.7],[116.4,39.9],[121.5,31.2],[113.3,23.1],[13.4,52.5],[55.3,25.2]]
const rad = Math.PI / 180
const ease = (x: number) => { const t = Math.max(0, Math.min(1,x)); return t*t*(3-2*t) }
function Globe({ started, plane }: { started: number; plane: RefObject<HTMLDivElement> }) {
 const canvas = useRef<HTMLCanvasElement>(null)
 useEffect(() => {
  const el = canvas.current, ctx = el?.getContext('2d')
  if (!el || !ctx) return
  let frame = 0, width = 0, height = 0, lastDraw = 0
  const texture = document.createElement('canvas'); texture.width=4096; texture.height=2048
  const textureContext=texture.getContext('2d')!
  let land: Uint8ClampedArray | null = null
  const gpuCanvas=document.createElement('canvas'),gl=gpuCanvas.getContext('webgl',{alpha:true,premultipliedAlpha:false})
  let program:WebGLProgram|null=null,gpuTexture:WebGLTexture|null=null
  if(gl){
   const shader=(type:number,source:string)=>{const sh=gl.createShader(type)!;gl.shaderSource(sh,source);gl.compileShader(sh);return sh}
   const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 point;void main(){gl_Position=vec4(point,0.,1.);}')
   const fragment=shader(gl.FRAGMENT_SHADER,`precision highp float;uniform vec2 resolution;uniform vec2 center;uniform float radius;uniform vec2 camera;uniform sampler2D land;
    void main(){vec2 n=(gl_FragCoord.xy-center)/radius;float r=dot(n,n);if(r>1.){gl_FragColor=vec4(0.);return;}float z=sqrt(1.-r);float sl=sin(camera.x),cl=cos(camera.x),sb=sin(camera.y),cb=cos(camera.y);
     vec3 w=vec3(-n.x*sl-n.y*sb*cl+z*cb*cl,n.x*cl-n.y*sb*sl+z*cb*sl,n.y*cb+z*sb);
     vec2 uv=vec2((atan(w.y,w.x)+3.14159265)/6.2831853,(1.57079633-asin(clamp(w.z,-1.,1.)))/3.14159265);
     float mask=texture2D(land,uv).a;float light=.57+.43*max(0.,z*.8-n.x*.3+n.y*.32);
     gl_FragColor=vec4(mix(vec3(28.,65.,76.),vec3(116.,153.,139.),mask)/255.*light,1.-smoothstep(.995,1.,r));}`)
   program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program)
   if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);program=null}else{
    gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
    const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0)
    gpuTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,gpuTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]))
    gl.deleteShader(vertex);gl.deleteShader(fragment)
   }
  }
  const sphere=document.createElement('canvas');sphere.width=384;sphere.height=384
  const sphereContext=sphere.getContext('2d')!, pixels=sphereContext.createImageData(384,384)
  const normals: { offset:number; x:number; y:number; z:number }[]=[]
  for(let y=0;y<384;y++)for(let x=0;x<384;x++){const nx=(x+0.5-192)/192,ny=-(y+0.5-192)/192,r=nx*nx+ny*ny;if(r<=1)normals.push({offset:(y*384+x)*4,x:nx,y:ny,z:Math.sqrt(1-r)})}
  const controller = new AbortController()
  fetch('/world-land.geojson', { signal: controller.signal }).then(r => r.json()).then((data: World) => {
   textureContext.fillStyle='#87a798'
   data.features.forEach(feature=>{
    const polygons=feature.geometry.type==='Polygon' ? [feature.geometry.coordinates as Coordinate[][]] : feature.geometry.coordinates as Coordinate[][][]
    polygons.forEach(rings=>{for(const shift of [-4096,0,4096]){textureContext.beginPath();rings.forEach(ring=>{let previous=ring[0][0];ring.forEach(([longitude,latitude],i)=>{let lon=longitude;while(lon-previous>180)lon-=360;while(lon-previous < -180)lon+=360;previous=lon;const x=(lon+180)/360*4096+shift,y=(90-latitude)/180*2048;if(i===0)textureContext.moveTo(x,y);else textureContext.lineTo(x,y)});textureContext.closePath()});textureContext.fill('evenodd')}})
   })
   land=textureContext.getImageData(0,0,4096,2048).data
   if(gl&&gpuTexture){gl.bindTexture(gl.TEXTURE_2D,gpuTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texture)}
  }).catch(() => {})
  const resize = () => { width=el.clientWidth; height=el.clientHeight; const dpr=Math.min(devicePixelRatio,2);el.width=width*dpr;el.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(gl){gpuCanvas.width=el.width;gpuCanvas.height=el.height;gl.viewport(0,0,el.width,el.height)} }
  const observer=new ResizeObserver(resize);observer.observe(el);resize()
  function draw(now: number) {
   if (!ctx) return
   if(now-lastDraw<(gl&&program?15:30)){frame=requestAnimationFrame(draw);return}lastDraw=now
   const t=(now-started)/1000, approach=ease((t-4.4)/2.8)
   const radius=Math.min(width*.36,height*.37)*(1+approach*3.4), cx=width/2,cy=height*.47+approach*height*.03
   const lon=(-70+t*37)*(1-approach)+destination[0]*approach,lat=18*(1-approach)+destination[1]*approach
   const project=(point: Coordinate, lift=1) => {
    const a=point[0]*rad-lon*rad,b=point[1]*rad,l=lat*rad
    return { x:cx+radius*lift*Math.cos(b)*Math.sin(a), y:cy-radius*lift*(Math.cos(l)*Math.sin(b)-Math.sin(l)*Math.cos(b)*Math.cos(a)), z:Math.sin(l)*Math.sin(b)+Math.cos(l)*Math.cos(b)*Math.cos(a) }
   }
   ctx.clearRect(0,0,width,height)
   const halo=ctx.createRadialGradient(cx,cy,radius*.7,cx,cy,radius*1.25);halo.addColorStop(0,'#dcbb8200');halo.addColorStop(.65,'#93c1bb19');halo.addColorStop(1,'#93c1bb00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,radius*1.25,0,Math.PI*2);ctx.fill()
   const ocean=ctx.createRadialGradient(cx-radius*.35,cy-radius*.4,0,cx,cy,radius);ocean.addColorStop(0,'#365d63');ocean.addColorStop(.7,'#193c47');ocean.addColorStop(1,'#0d252f');ctx.fillStyle=ocean;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill()
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip()
   // Inverse-map every visible sphere pixel into a wrapped world texture.
   // Land crossing the horizon is never closed with a straight chord.
   const sinLon=Math.sin(lon*rad),cosLon=Math.cos(lon*rad),sinLat=Math.sin(lat*rad),cosLat=Math.cos(lat*rad)
   if(gl&&program){
    const dpr=el!.width/width;gl.useProgram(program);gl.uniform2f(gl.getUniformLocation(program,'center'),cx*dpr,(height-cy)*dpr);gl.uniform1f(gl.getUniformLocation(program,'radius'),radius*dpr);gl.uniform2f(gl.getUniformLocation(program,'camera'),lon*rad,lat*rad);gl.drawArrays(gl.TRIANGLES,0,6);ctx.drawImage(gpuCanvas,0,0,width,height)
   }else{
   normals.forEach(n=>{
    const wx=-n.x*sinLon-n.y*sinLat*cosLon+n.z*cosLat*cosLon,wy=n.x*cosLon-n.y*sinLat*sinLon+n.z*cosLat*sinLon,wz=n.y*cosLat+n.z*sinLat
    const longitude=Math.atan2(wy,wx),latitude=Math.asin(Math.max(-1,Math.min(1,wz)))
    const tx=Math.min(4095,Math.max(0,Math.floor((longitude+Math.PI)/(2*Math.PI)*4096))),ty=Math.min(2047,Math.max(0,Math.floor((Math.PI/2-latitude)/Math.PI*2048)))
    const isLand=land ? land[(ty*4096+tx)*4+3]/255 : 0
    const light=.57+.43*Math.max(0,n.z*.8-n.x*.3+n.y*.32)
    pixels.data[n.offset]=(28+isLand*88)*light;pixels.data[n.offset+1]=(65+isLand*88)*light;pixels.data[n.offset+2]=(76+isLand*63)*light;pixels.data[n.offset+3]=255
   })
   sphereContext.putImageData(pixels,0,0);ctx.drawImage(sphere,cx-radius,cy-radius,radius*2,radius*2)
   }
   ctx.strokeStyle='#bdd8d219';ctx.lineWidth=.6
   const line=(points: Coordinate[])=>{ctx.beginPath();let open=false;points.forEach(point=>{const p=project(point);if(p.z>0){if(open)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);open=true}else open=false});ctx.stroke()}
   for(let latitude=-60;latitude<=60;latitude+=30)line(Array.from({length:121},(_,i)=>[i*3-180,latitude]))
   for(let longitude=-180;longitude<180;longitude+=30)line(Array.from({length:61},(_,i)=>[longitude,i*3-90]))
   ctx.restore()
   origins.forEach((origin,index)=>{
    const start=project(origin);if(start.z>0){ctx.fillStyle='#e8ca91';ctx.beginPath();ctx.arc(start.x,start.y,1.8,0,Math.PI*2);ctx.fill()}
    const progress=Math.min(1,Math.max(0,(t-.8-index*.16)/(index===11 ? 4.64 : 3.8)))
    if(!progress)return
    // Great-circle interpolation keeps the flight curves on the spherical globe.
    const vector=(p:Coordinate)=>[Math.cos(p[1]*rad)*Math.cos(p[0]*rad),Math.cos(p[1]*rad)*Math.sin(p[0]*rad),Math.sin(p[1]*rad)]
    const a=vector(origin),b=vector(destination),angle=Math.acos(Math.max(-1,Math.min(1,a.reduce((sum,v,i)=>sum+v*b[i],0))))
    const flight=(u:number)=>{const sa=Math.sin((1-u)*angle)/Math.sin(angle),sb=Math.sin(u*angle)/Math.sin(angle),v=a.map((n,i)=>n*sa+b[i]*sb);return project([Math.atan2(v[1],v[0])/rad,Math.atan2(v[2],Math.hypot(v[0],v[1]))/rad],1+Math.sin(u*Math.PI)*.16)}
    ctx.beginPath();let open=false;for(let j=0;j<=55;j++){const p=flight(progress*j/55);if(p.z>0){if(open)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);open=true}else open=false}ctx.strokeStyle='#e6c99262';ctx.lineWidth=1;ctx.stroke()
    const p=flight(progress),prev=flight(Math.max(0,progress-.012))
    if(index===11&&t>=4.4&&t<7.2&&plane.current){
     const capture=ease((t-4.4)/.5),zoom=ease((t-4.4)/2.8),size=plane.current.clientWidth
     const scale=18/size+(0.7-18/size)*zoom
     plane.current.style.left=`${p.x}px`;plane.current.style.top=`${p.y}px`
     plane.current.style.opacity=`${capture}`
     plane.current.style.transform=`translate(-50%,-50%) rotate(${Math.atan2(p.y-prev.y,p.x-prev.x)*180/Math.PI}deg) scale(${scale})`
    }
    if(p.z>0&&progress<.98&&!(index===11&&t>=4.9)){ctx.save();if(index===11&&t>=4.4)ctx.globalAlpha=1-ease((t-4.4)/.5);ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(p.y-prev.y,p.x-prev.x));ctx.fillStyle='#fff3d6';ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-6,-5);ctx.lineTo(-2,0);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();ctx.strokeStyle='#af997c';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(9,0);ctx.stroke();ctx.restore()}
   })
   const home=project(destination);if(home.z>0){ctx.strokeStyle='#f4d69b80';ctx.lineWidth=1;ctx.beginPath();ctx.arc(home.x,home.y,7+Math.sin(t*2)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe4af';ctx.beginPath();ctx.arc(home.x,home.y,3,0,Math.PI*2);ctx.fill();}
   if(t<7.2)frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);controller.abort();observer.disconnect();gl?.getExtension('WEBGL_lose_context')?.loseContext()}
 },[started,plane])
 return <canvas ref={canvas} className="arrival-globe" aria-hidden="true"/>
}
function PaperPlane() {
 const faces=[
  {points:'18,24 346,110 92,110 18,24',fill:'url(#arrival-wing-light)'},
  {points:'18,196 92,110 346,110 18,196',fill:'url(#arrival-wing-warm)'},
  {points:'92,110 346,110 116,101 92,110',fill:'url(#arrival-fold-shadow)'},
  {points:'92,110 116,119 346,110 92,110',fill:'url(#arrival-fold-soft)'}
 ]
 return <svg className="arrival-plane-model" viewBox="0 0 360 220" aria-hidden="true"><defs>
  <linearGradient id="arrival-wing-light" x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#fffdf4"/><stop offset=".65" stopColor="#eee5d3"/><stop offset="1" stopColor="#cbbda4"/></linearGradient>
  <linearGradient id="arrival-wing-warm" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#f8f0df"/><stop offset=".55" stopColor="#e2d6bd"/><stop offset="1" stopColor="#fffbee"/></linearGradient>
  <linearGradient id="arrival-fold-shadow"><stop stopColor="#b5a78e"/><stop offset="1" stopColor="#e8dfcc"/></linearGradient>
  <linearGradient id="arrival-fold-soft"><stop stopColor="#d2c5ad"/><stop offset="1" stopColor="#fff9e9"/></linearGradient>
 </defs>{faces.map((face,i)=><polygon key={i} points={face.points} fill={face.fill} stroke="#c0ac8b60" strokeWidth=".7"/>)}
 <path className="arrival-plane-crease" d="M18 24 116 101 346 110M18 196 116 119 346 110M92 110H346" fill="none" stroke="#fffdf3b0" strokeWidth=".8"/>
 </svg>
}
export default function LettersArrival({ replay = 0 }: { replay?: number }) {
 const [active,setActive]=useState(true),[stage,setStage]=useState('globe'),[started,setStarted]=useState(0)
 const plane=useRef<HTMLDivElement>(null)
 useLayoutEffect(()=>{
  if((stage!=='approach'&&stage!=='zoom')||!plane.current)return
  const el=plane.current, start=el.style.transform
  const closeScale=Math.min(1.25,innerWidth*.92/el.clientWidth)
  const end=`translate(-50%,-50%) rotate(${stage==='approach' ? -8 : 0}deg) scale(${closeScale})`
  const motion=el.animate([{transform:start,left:el.style.left,top:el.style.top},{transform:end,left:'50%',top:'50%'}],{duration:stage==='approach'?1000:1900,easing:'cubic-bezier(.32,0,.18,1)',fill:'forwards'})
  return()=>{el.style.transform=end;el.style.left='50%';el.style.top='50%';motion.cancel()}
 },[stage])
 const skip=useRef<HTMLButtonElement>(null)
 const release=useRef<(() => void) | null>(null)
 const finish=()=>{release.current?.();release.current=null;(document as ArrivalDocument).lettersArrivalPlayed=true;setActive(false);requestAnimationFrame(()=>document.querySelector<HTMLElement>('.letters-hero h1')?.focus({preventScroll:true}))}
 useLayoutEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || (!replay&&(document as ArrivalDocument).lettersArrivalPlayed)){setActive(false);return}
  setActive(true);setStage('globe');setStarted(performance.now())
  const oldOverflow=document.body.style.overflow,content=document.querySelector<HTMLElement>('.letters-space>.community-shell'),previous=document.activeElement as HTMLElement|null
  document.body.style.overflow='hidden';if(content)content.inert=true
  const focusTimer=setTimeout(()=>skip.current?.focus({preventScroll:true}),50)
  const stages:[number,string][]=[[4400,'flight'],[7200,'approach'],[8200,'zoom'],[10100,'reveal']]
  const timers=stages.map(([time,name])=>setTimeout(()=>setStage(name),time));timers.push(setTimeout(finish,11300))
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')finish()};document.addEventListener('keydown',escape)
  release.current=()=>{timers.forEach(clearTimeout);clearTimeout(focusTimer);document.body.style.overflow=oldOverflow;if(content)content.inert=false;document.removeEventListener('keydown',escape);if(previous?.isConnected)previous.focus({preventScroll:true})}
  return()=>{release.current?.();release.current=null}
 },[replay])
 if(!active || !started)return null
 return createPortal(<div className="letters-arrival" data-stage={stage} role="dialog" aria-modal="true" onKeyDown={event => { if(event.key === 'Tab'){event.preventDefault();skip.current?.focus()} }} aria-label="来自世界各地的寄语，纸飞机飞回宝中">
  <div className="arrival-stars" aria-hidden="true"/>{started>0&&<Globe started={started} plane={plane}/>}
  <div className="arrival-copy"><span>致，正在出发的你</span><h2>走得再远，<br/>总有一些话想带回宝中。</h2><p>让一封封寄语，飞向最初的地方。</p></div>
  <div ref={plane} className="arrival-flight-plane"><div className="arrival-paper-pose"><PaperPlane/></div></div>
  <div className="arrival-home-caption" aria-hidden="true">宝鸡 · 宝鸡中学</div>
  <div className="arrival-warm-wash" aria-hidden="true"/>
  <button ref={skip} className="arrival-skip" onClick={finish}>跳过开场 <span>↗</span></button><div className="arrival-progress" aria-hidden="true"><i/></div>
 </div>,document.body)
}
