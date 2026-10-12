'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, ArrowUpRight, Mail, RotateCcw, Trash2, Send } from 'lucide-react'
import { alumniMessagesApi, type AlumniMessage } from '@/lib/api-client'
import { getAllUniversities } from '@/data/universities'
import { CommunityModal } from '@/components/community/CommunityUI'
import LettersArrival from '@/components/community/LettersArrival'
import LettersVoyage from '@/components/community/LettersVoyage'
import LetterLikeButton from '@/components/community/LetterLikeButton'
import { exampleLetters, isExampleLetter } from '@/data/example-letters'
import './messages.css'
const author = (m: AlumniMessage) => m.user.nickname || m.user.name || (m.user as AlumniMessage['user'] & { username?: string }).username || '一位学长学姐'
const year = (value?: number | string) => !value ? '' : typeof value === 'number' ? `${value}届` : ({ gaoyi: '高一', gaoer: '高二', gaosan: '高三' }[value] || `${value}${/^\d{4}$/.test(value) ? '届' : ''}`)
const date = (value: string) => new Date(value).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
export default function MessagesPage() {
 const { data: session } = useSession()
 const [previewLetters,setPreviewLetters] = useState(exampleLetters)
 const [preview,setPreview] = useState(process.env.NODE_ENV === 'development')
 const [arrivalReplay, setArrivalReplay] = useState(0)
 const [messages, setMessages] = useState<AlumniMessage[]>([])
 const displayedMessages = preview ? previewLetters : messages
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [query, setQuery] = useState('')
 const [sort, setSort] = useState('最新来信')
 const readingOrigin=useRef<HTMLElement|null>(null)
 const [reading, setReading] = useState<string | null>(null)
 const [writing, setWriting] = useState(false)
 const [text, setText] = useState('')
 const [pending, setPending] = useState<string | null>(null)
 const [notice, setNotice] = useState('')
 const [deleting, setDeleting] = useState<string | null>(null)
 const universities = useMemo(() => getAllUniversities(), [])
 const university = (m: AlumniMessage) => universities.find(u => u.id === m.user.universityId)?.name || m.user.universityId || ''
 const liked = (m: AlumniMessage) => !!m.likesRel?.some(l => l.userId === (isExampleLetter(m.id) ? 'local-preview' : session?.user?.id))
 const user = session?.user as (NonNullable<typeof session>["user"] & { isMuted?: boolean }) | undefined
 const canWrite = !!user && (user.role === 'alumni' || (typeof user.graduationYear === 'number' && user.graduationYear <= new Date().getFullYear()) || (typeof user.graduationYear === 'string' && !!user.graduationYear && !['gaoyi', 'gaoer', 'gaosan'].includes(user.graduationYear)))
 async function load() {
  setLoading(true); setError('')
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000)
  try { setMessages(await alumniMessagesApi.list(controller.signal)) } catch (e) { setError(controller.signal.aborted ? '连接时间较长，请稍后重试。' : e instanceof Error ? e.message : '暂时无法连接来信收藏室') } finally { clearTimeout(timeout); setLoading(false) }
 }
 useEffect(() => { void load() }, [])
 const filtered = useMemo(() => displayedMessages.filter(m => `${m.content} ${author(m)} ${university(m)} ${m.user.major || ''}`.toLowerCase().includes(query.trim().toLowerCase()) && (sort !== '我喜欢的' || !!m.likesRel?.some(l => l.userId === (isExampleLetter(m.id) ? 'local-preview' : session?.user?.id)))).sort((a,b)=>sort==='最多喜欢' ? b.likes-a.likes : new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),[displayedMessages,query,sort,session?.user?.id,universities])
 const activeLetter = displayedMessages.find(m => m.id === reading)
 function compose() {
  if (!user) { setNotice('登录后，就可以写下你的来信。'); return }
  if (user.isMuted) { setNotice('你的账号暂时无法发布寄语。'); return }
  if (!canWrite) { setNotice('寄语由学长学姐书写。请在个人资料中填写毕业年份或选择学长学姐身份。'); return }
  setWriting(true)
 }
 async function save() {
  if (!canWrite || user?.isMuted || !text.trim() || text.trim().length > 500) return
  setPending('write')
  try {
   const message = await alumniMessagesApi.create(text.trim())
   if (message.isApproved !== false) setMessages(items => [message, ...items.filter(m => m.id !== message.id)])
   setWriting(false); setText(''); setPreview(false)
   setNotice(message.isApproved === false ? '来信已寄出，审核通过后会出现在收藏室。' : '寄语已发布。')
  } catch (e) { setNotice(e instanceof Error ? e.message : '发布失败，请稍后重试') } finally { setPending(null) }
 }
 async function like(id: string) {
  if(isExampleLetter(id)) {
   setPreviewLetters(items=>items.map(m=>{if(m.id!==id)return m;const selected=!!m.likesRel?.some(l=>l.userId==='local-preview');return {...m,likes:Math.max(0,m.likes+(selected?-1:1)),likesRel:selected?[]:[{userId:'local-preview'}]}}))
   return
  }
  if (!user?.id) { setNotice('登录后，就能为这封信留下一个喜欢。'); return }
  if (user.isMuted) { setNotice('你的账号暂时无法点赞。'); return }
  setPending(id)
  try { const updated = await alumniMessagesApi.toggleLike(id); setMessages(items => items.map(m => m.id === id ? { ...m, likes: updated.likes, likesRel: updated.likesRel } : m)) } catch (e) { setNotice(e instanceof Error ? e.message : '点赞失败') } finally { setPending(null) }
 }
 async function remove() {
  if (!deleting) return
  setPending(deleting)
  try { await alumniMessagesApi.delete(deleting); setMessages(items => items.filter(m => m.id !== deleting)); if (reading === deleting) setReading(null); setDeleting(null) } catch (e) { setDeleting(null); setNotice(e instanceof Error ? e.message : '删除失败') } finally { setPending(null) }
 }
 return <div className="community-page letters-space letters-roaming">
  <div className="community-shell">
   <header className="letters-hero voyage-header">
    <div className="voyage-heading"><span>来自学长学姐的信{process.env.NODE_ENV==='development'&&<button className="voyage-preview-toggle" onClick={()=>{setPreview(v=>!v);setReading(null);setQuery('');setSort('最新来信')}}>{preview?'示例预览 · 查看真实来信':'预览示例寄语'}</button>}</span><h1 tabIndex={-1}>把走过的路，寄给你。</h1></div>
    <div className="voyage-toolbar">
     <button className="voyage-replay voyage-replay-text" onClick={async()=>{if(document.fullscreenElement)await document.exitFullscreen();setArrivalReplay(v=>v+1)}}><RotateCcw size={18}/>再次播放动画</button>
     <button onClick={compose} className="voyage-write"><Send size={17}/>写寄语</button>
    </div>
   </header>
   <LettersVoyage items={filtered} empty={!preview && loading ? <div role="status"><Mail size={32}/><h2>来信正在路上…</h2></div> : !preview && error ? <div role="alert"><h2>暂时无法打开来信</h2><p>{error}</p><button onClick={load}>重新连接</button></div> : <div><Mail size={38}/><h2>{displayedMessages.length?'暂时没有找到这封信':'第一封信，等风也等你。'}</h2><p>{displayedMessages.length?'试试其他关键词，或查看全部来信。':'把经历和鼓励写下来，留给正在出发的人。'}</p>{displayedMessages.length&&<button onClick={()=>{setQuery('');setSort('最新来信')}}>查看全部来信</button>}</div>} render={(m)=><>
    <button className="voyage-letter-read" data-letter-id={m.id} onClick={e=>{readingOrigin.current=e.currentTarget;setReading(m.id)}} aria-label={`阅读${author(m)}的寄语`}><span className="voyage-letter-address">{[isExampleLetter(m.id)?'示例寄语':year(m.user.graduationYear)||'学长学姐',university(m)].filter(Boolean).join(' · ')}</span><p>{m.content}</p><span className="voyage-letter-open">读这封信<ArrowUpRight size={17}/></span></button>
    <footer><span className="voyage-letter-author">{isExampleLetter(m.id)?author(m):<Link href={`/users/${m.userId}`}>{author(m)}</Link>}<time>{isExampleLetter(m.id)?'虚构来信 · 排版预览':date(m.createdAt)}</time></span><LetterLikeButton count={m.likes||0} selected={liked(m)} title={isExampleLetter(m.id)?"示例点赞，仅在本次预览中生效":undefined} disabled={pending===m.id} onClick={()=>like(m.id)}/>{user?.id===m.userId&&<button aria-label="删除我的寄语" className="letter-delete" disabled={pending===m.id} onClick={()=>setDeleting(m.id)}><Trash2 size={17}/></button>}</footer>
   </>}/>
  </div>
  <LettersArrival replay={arrivalReplay}/>
  {activeLetter && <CommunityModal title={`${author(activeLetter)}的来信`} letterMotion origin={readingOrigin.current} close={() => setReading(null)}><article className="letter-full" key={activeLetter.id}><p className="letter-full-address">{author(activeLetter)}的寄语</p><div className="letter-full-content">{activeLetter.content}</div><div className="letter-full-sign">{isExampleLetter(activeLetter.id)?<span>{author(activeLetter)} · 虚构示例</span>:<Link href={`/users/${activeLetter.userId}`}>{author(activeLetter)}</Link>}<span>{[year(activeLetter.user.graduationYear), university(activeLetter), activeLetter.user.major].filter(Boolean).join(' · ')}</span><time>{date(activeLetter.createdAt)}</time></div><footer><LetterLikeButton count={activeLetter.likes||0} selected={liked(activeLetter)} full title={isExampleLetter(activeLetter.id)?"示例点赞，仅在本次预览中生效":undefined} disabled={pending===activeLetter.id} onClick={()=>like(activeLetter.id)}/><button className="community-text-button" disabled={displayedMessages.length < 2} onClick={() => { const index = displayedMessages.findIndex(m => m.id === reading); const next=displayedMessages[(index + 1) % displayedMessages.length];readingOrigin.current=document.querySelector<HTMLElement>(`[data-letter-id="${CSS.escape(next.id)}"]`);setReading(next.id) }}>读下一封<ArrowRight size={19} /></button></footer></article></CommunityModal>}
  {writing && <CommunityModal title="写一封寄语" close={() => { if (pending !== 'write') setWriting(false) }}><h2>把鼓励，寄给后来的人。</h2><p>写一点真实的大学生活、走过的弯路，或一句你曾希望听到的话。</p><label className="sr-only" htmlFor="letter-compose">寄语内容</label><textarea id="letter-compose" value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder="给正在出发的你：" autoFocus /><div className="dialog-note">{text.length} / 500 字 · {user?.nickname || user?.name || '学长学姐'}</div><footer><span className="dialog-note">最多 500 字</span><button className="community-primary" onClick={save} disabled={pending === 'write' || !text.trim()}><Send size={18} />{pending === 'write' ? '正在寄出…' : '寄出这封信'}</button></footer></CommunityModal>}
  {notice && <CommunityModal title="提示" close={() => setNotice('')}><h2>提示</h2><p>{notice}</p><footer><button className="community-primary" onClick={() => setNotice('')}>知道了</button>{!user && <Link href="/auth/login?callbackUrl=/messages">去登录 →</Link>}</footer></CommunityModal>}
  {deleting && <CommunityModal title="删除寄语" close={() => setDeleting(null)}><h2>收回这封来信？</h2><p>删除后无法恢复。</p><footer><button onClick={() => setDeleting(null)}>保留来信</button><button className="community-primary" disabled={!!pending} onClick={remove}>{pending ? '正在删除…' : '确认删除'}</button></footer></CommunityModal>}
 </div>
}
