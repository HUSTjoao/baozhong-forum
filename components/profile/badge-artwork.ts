import { profileIdentity, type ProfileUser } from '@/lib/profile'
export interface BadgeProps { user: ProfileUser; school: string; stats: { questions: number; replies: number; letters: number } }
let fontsReady: Promise<unknown> | undefined
const serif = '"Badge Source Serif", "Songti SC", serif'
const numerals = serif
function prepareFonts() {
  return fontsReady ??= new FontFace('Badge Source Serif', 'url(/fonts/profile-source-serif.woff)').load().then(font => { document.fonts.add(font) })
}
export async function createBadgeArtwork(props: BadgeProps) {
  const load = (url: string): Promise<HTMLImageElement | null> => new Promise(resolve => { if (!url) return resolve(null); const image = new Image(); image.crossOrigin = 'anonymous'; image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = url })
  const [emblem, photo] = await Promise.all([load('/baoji-school-emblem.png'), load(props.user.avatarUrl || ''), prepareFonts()])
  const ink = '#343a3a', wine = '#843e39', muted = '#747c79'
  function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, max: number, size: number, color = ink, family = serif, weight = 400) {
    ctx.fillStyle = color
    do { ctx.font = `${weight} ${size}px ${family}`; if (ctx.measureText(value).width <= max || size <= 22) break; size -= 2 } while (true)
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
      if(emblem)ctx.drawImage(emblem,72,60,72,72)
      text(ctx,'宝鸡中学',168,94,370,34,'#ebedf0')
      text(ctx,'校园名片',168,134,360,25,'#b7c8cf')
      text(ctx,user.name,72,292,484,90,'#fff8ef',serif,400)
      text(ctx,profileIdentity(user),72,359,484,32,'#cfdee8')
      lines(ctx,user.role==='alumni' ? school || '宝鸡中学' : '宝鸡中学',72,444,484,37,2,'#edf0f4')
      if(user.role==='alumni'&&user.major)text(ctx,user.major,72,548,484,32,'#d3e0e8')
      const glass=ctx.createLinearGradient(0,615,0,728);glass.addColorStop(0,'#ffffff20');glass.addColorStop(1,'#e7eff00c');ctx.fillStyle=glass;ctx.beginPath();ctx.roundRect(48,615,984,113,25);ctx.fill();ctx.strokeStyle='#e7f1f044';ctx.lineWidth=1;ctx.stroke()
      const items=[[stats.questions,'提问'],[stats.replies,'回答'],[stats.letters,'寄语']]
      ctx.save();ctx.textAlign='center'
      items.forEach(([value,label],i)=>{const center=212+i*328;text(ctx,String(value),center,665,270,42,'#fff8ef',numerals,500);text(ctx,String(label),center,704,270,25,'#cbd8dd')})
      ctx.restore();ctx.strokeStyle='#e7f1f028';ctx.lineWidth=1
      ;[376,704].forEach(x=>{ctx.beginPath();ctx.moveTo(x,640);ctx.lineTo(x,704);ctx.stroke()})
    }else{
      const wash=ctx.createRadialGradient(920,570,20,920,570,620);wash.addColorStop(0,'#c4d8de22');wash.addColorStop(1,'#c4d8de00');ctx.fillStyle=wash;ctx.fillRect(0,0,1080,768)
      if(emblem){ctx.save();ctx.globalAlpha=.07;ctx.drawImage(emblem,674,314,330,330);ctx.restore()}
      text(ctx,'关于我',72,150,850,64,'#fff8ef',serif,400)
      const rule=ctx.createLinearGradient(72,0,1008,0);rule.addColorStop(0,'#e9d4b699');rule.addColorStop(.25,'#c4d9e744');rule.addColorStop(1,'#c4d9e700');ctx.strokeStyle=rule;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(72,192);ctx.lineTo(1008,192);ctx.stroke()
      lines(ctx,user.bio||'还没有写下个人介绍。',72,270,872,32,8,'#e6edf1')
    }
  })
  const strap=document.createElement('canvas');strap.width=128;strap.height=1024
  const ctx=strap.getContext('2d')!
  ctx.fillStyle=wine;ctx.fillRect(0,0,128,1024);ctx.fillStyle='#b89072';ctx.fillRect(9,0,2,1024);ctx.fillRect(117,0,2,1024)
  ctx.fillStyle='#f2e7d6';ctx.font=`30px ${serif}`;ctx.textAlign='center'
  for(let i=0;i<3;i++) [...'宝鸡中学'].forEach((ch,j)=>ctx.fillText(ch,64,65+i*335+j*48))
  return {front:faces[0].toDataURL('image/png'),back:faces[1].toDataURL('image/png'),strap:strap.toDataURL('image/png')}
}






