import { profileIdentity, type ProfileUser } from '@/lib/profile'
export interface BadgeProps { user: ProfileUser; school: string; stats: { questions: number; replies: number; letters: number } }
let fontsReady: Promise<unknown> | undefined
const serif = '"Badge Source Sans", "Segoe UI", sans-serif'
const numerals = serif
function prepareFonts() {
  return fontsReady ??= new FontFace('Badge Source Sans', 'url(/fonts/profile-source-sans.woff)').load().then(font => { document.fonts.add(font) })
}
export async function createBadgeArtwork(props: BadgeProps) {
  const load = (url: string): Promise<HTMLImageElement | null> => new Promise(resolve => { if (!url) return resolve(null); const image = new Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = url })
  const [emblem, photo] = await Promise.all([load('/baoji-school-emblem.png'), load(props.user.avatarUrl || ''), prepareFonts()])
  const ink = '#343a3a', wine = '#843e39', muted = '#747c79'
  function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, max: number, size: number, color = ink, family = serif) {
    ctx.fillStyle = color
    do { ctx.font = `400 ${size}px ${family}`; if (ctx.measureText(value).width <= max || size <= 22) break; size -= 2 } while (true)
    if (ctx.measureText(value).width > max) { while (value.length > 1 && ctx.measureText(value + '…').width > max) value = value.slice(0, -1); value += '…' }
    ctx.fillText(value, x, y)
  }
  function lines(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, max: number, size: number, count: number, color = ink) {
    ctx.font = `400 ${size}px ${serif}`; ctx.fillStyle = color
    const rows: string[] = []; let row = ''
    for (const ch of value) {
      if (ch === '\n' || ctx.measureText(row + ch).width > max) { rows.push(row); row = ''; if (rows.length === count) { rows[count-1] = rows[count-1].slice(0,-1) + '…'; break } }
      if (ch !== '\n') row += ch
    }
    if (row && rows.length < count) rows.push(row)
    rows.forEach((r,i) => ctx.fillText(r,x,y+i*size*1.6))
  }
  const faces = [document.createElement('canvas'), document.createElement('canvas')]
  const {user,school,stats} = props
  faces.forEach((surface,index) => {
    surface.width=1080;surface.height=768
    const ctx=surface.getContext('2d')!
    ctx.fillStyle='#334859';ctx.fillRect(0,0,1080,768);const base=ctx.createLinearGradient(0,0,1080,768);base.addColorStop(0,'#334859');base.addColorStop(.5,'#344859');base.addColorStop(1,'#496878');ctx.fillStyle=base;ctx.fillRect(0,0,1080,768)
    const glow=ctx.createRadialGradient(900,190,10,820,320,660);glow.addColorStop(0,'#97abb566');glow.addColorStop(.5,'#7593ab22');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(0,0,1080,768)
    // Fine patterned foil and the spectrum frame echo React Bits Profile Card.
    ctx.save();ctx.strokeStyle='#c8d9ed0b';ctx.lineWidth=1
    for(let x=-768;x<1080;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+768,768);ctx.stroke()}ctx.restore()
    const rim=ctx.createLinearGradient(0,0,1080,768);rim.addColorStop(0,'#b7dbe7');rim.addColorStop(.33,'#dbbcd7');rim.addColorStop(.68,'#a7c9ec');rim.addColorStop(1,'#9cd6c1');ctx.strokeStyle=rim;ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(13,13,1054,742,42);ctx.stroke()
    if(index===0){
      // Mask the avatar softly into the foil field, without a rectangular photo frame.
      if(photo){const portrait=document.createElement('canvas');portrait.width=502;portrait.height=530;const pc=portrait.getContext('2d')!;const ratio=Math.max(502/photo.width,530/photo.height);const w=photo.width*ratio,h=photo.height*ratio;pc.drawImage(photo,(502-w)/2,(530-h)/2,w,h);pc.globalCompositeOperation='destination-in';const mask=pc.createLinearGradient(0,0,502,0);mask.addColorStop(0,'#0000');mask.addColorStop(.15,'#0008');mask.addColorStop(.42,'#000f');mask.addColorStop(.85,'#000f');mask.addColorStop(1,'#0000');pc.fillStyle=mask;pc.fillRect(0,0,502,530);const lower=pc.createLinearGradient(0,0,0,530);lower.addColorStop(0,'#0000');lower.addColorStop(.12,'#000f');lower.addColorStop(.74,'#000f');lower.addColorStop(1,'#0000');pc.fillStyle=lower;pc.fillRect(0,0,502,530);ctx.drawImage(portrait,552,101)}
      if(emblem)ctx.drawImage(emblem,64,62,74,74)
      text(ctx,'宝鸡中学',160,98,370,36,'#ebedf0')
      text(ctx,'校园名片',163,135,360,24,'#b7c8cf')
      text(ctx,user.name,64,281,489,62,'#f8f3ec')
      text(ctx,profileIdentity(user),64,337,485,28,'#d9e4eb')
      lines(ctx,user.role==='alumni' ? school || '宝鸡中学' : '宝鸡中学',64,425,475,31,2,'#edf0f4')
      if(user.role==='alumni'&&user.major)text(ctx,user.major,64,526,475,27,'#d3e0e8')
      const glass=ctx.createLinearGradient(0,615,0,728);glass.addColorStop(0,'#ffffff20');glass.addColorStop(1,'#e7eff00c');ctx.fillStyle=glass;ctx.beginPath();ctx.roundRect(48,615,984,113,25);ctx.fill();ctx.strokeStyle='#e7f1f044';ctx.lineWidth=1;ctx.stroke()
      const items=[[stats.questions,'提问'],[stats.replies,'回答'],[stats.letters,'寄语']];items.forEach(([value,label],i)=>{text(ctx,String(value),80+i*203,682,96,39,'#f3f0ec',numerals);text(ctx,String(label),164+i*203,682,106,24,'#cbd8dd')})
      text(ctx,String(new Date(user.createdAt).getFullYear())+' 年加入',790,682,203,22,'#b7cbd2')
    }else{
      if(emblem){ctx.save();ctx.globalAlpha=.05;ctx.drawImage(emblem,708,275,275,275);ctx.restore()}
      text(ctx,'写在名片背面',64,138,900,41,'#eef0ec')
      lines(ctx,user.bio||'还没有写下个人介绍。',64,230,952,28,10,'#dce4e8')
      ctx.strokeStyle='#d5e4ec44';ctx.beginPath();ctx.moveTo(64,687);ctx.lineTo(1016,687);ctx.stroke()
      text(ctx,user.name,64,740,640,32,'#f5eee8')
    }
  })
  const strap=document.createElement('canvas');strap.width=128;strap.height=1024
  const ctx=strap.getContext('2d')!
  ctx.fillStyle=wine;ctx.fillRect(0,0,128,1024);ctx.fillStyle='#b89072';ctx.fillRect(9,0,2,1024);ctx.fillRect(117,0,2,1024)
  ctx.fillStyle='#f2e7d6';ctx.font=`30px ${serif}`;ctx.textAlign='center'
  for(let i=0;i<3;i++) [...'宝鸡中学'].forEach((ch,j)=>ctx.fillText(ch,64,65+i*335+j*48))
  return {front:faces[0].toDataURL('image/png'),back:faces[1].toDataURL('image/png'),strap:strap.toDataURL('image/png')}
}






