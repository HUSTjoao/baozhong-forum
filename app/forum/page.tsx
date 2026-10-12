'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, MessageCircle, Search, Trash2, X, Plus, PenLine, Compass, ChevronUp, ChevronDown } from 'lucide-react'
import { questionsApi, formatRelativeTime, type Question } from '@/lib/api-client'
import { CommunityModal, PageTurner } from '@/components/community/CommunityUI'
import { forumTopics as topics, forumTopicOf as topicOf } from '@/data/forum-topics'
import { exampleQuestions, isExampleQuestion, type ExampleQuestion } from '@/data/example-questions'
import './forum.css'
const wheelStep = 80
export default function ForumPage() {
 const { data: session } = useSession()
 const [questions, setQuestions] = useState<Question[]>([])
 const [showExamples,setShowExamples] = useState(process.env.NODE_ENV === 'development')
 const [exampleVotes,setExampleVotes] = useState<Record<string,boolean>>({})
 const [exampleDetail,setExampleDetail] = useState<ExampleQuestion|null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [query, setQuery] = useState('')
 const [category, setCategory] = useState('全部')
 const [sort, setSort] = useState('最新')
 const [page, setPage] = useState(1)
 const [pending, setPending] = useState<string | null>(null)
 const [notice, setNotice] = useState('')
 const [deleting, setDeleting] = useState<string | null>(null)
 const board = useRef<HTMLElement>(null)
 const wheel = useRef<HTMLElement>(null)
 const wheelFrame = useRef(0)
 const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const selectedTopic = Math.max(0, topics.findIndex(topic => topic.name === category))
 useEffect(() => () => { if (wheelTimer.current) clearTimeout(wheelTimer.current); cancelAnimationFrame(wheelFrame.current) }, [])
 function shapeWheel() {
  const position = (wheel.current?.scrollTop || 0) / wheelStep
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  wheel.current?.querySelectorAll<HTMLButtonElement>('button').forEach((button, index) => {
   const distance = index - position
   const angle = Math.max(-1.4, Math.min(1.4, distance * wheelStep / 205))
   button.style.setProperty('--wheel-angle', `${reduced ? 0 : -angle * 180 / Math.PI}deg`)
   button.style.setProperty('--wheel-y', `${reduced ? 0 : 205 * Math.sin(angle) - distance * wheelStep}px`)
   button.style.setProperty('--wheel-z', `${reduced ? 0 : 205 * (Math.cos(angle) - 1)}px`)
   button.style.setProperty('--wheel-opacity', `${Math.max(.07, 1 - Math.abs(distance) * .27)}`)
  })
 }
 useLayoutEffect(() => { shapeWheel() }, [])
 function selectCategory(name: string) {
  setCategory(name)
  wheel.current?.scrollTo({ top: Math.max(0, topics.findIndex(topic => topic.name === name)) * wheelStep, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
 }
 function settleWheel() {
  cancelAnimationFrame(wheelFrame.current)
  wheelFrame.current = requestAnimationFrame(shapeWheel)
  if (wheelTimer.current) clearTimeout(wheelTimer.current)
  wheelTimer.current = setTimeout(() => {
   const position = wheel.current?.scrollTop || 0
   const index = Math.max(0, Math.min(topics.length - 1, Math.round(position / wheelStep)))
   setCategory(topics[index].name)
  }, 140)
 }
 async function load() {
  setLoading(true); setError('')
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000)
  try { setQuestions(await questionsApi.list(controller.signal)) } catch (e) { setError(controller.signal.aborted ? '连接时间较长，请稍后重试。' : e instanceof Error ? e.message : '暂时无法连接讨论区') } finally { clearTimeout(timeout); setLoading(false) }
 }
 useEffect(() => { void load() }, [])
 const publicQuestions = useMemo(() => showExamples ? exampleQuestions.map(q=>({...q,likes:q.likes+(exampleVotes[q.id]?1:0)})) : questions.filter(q => !q.majorId && !q.universityId?.trim()), [questions,showExamples,exampleVotes])
 const filtered = useMemo(() => publicQuestions.filter(q => (category === '全部' || topicOf(q.category) === category) && `${q.title} ${q.content}`.toLowerCase().includes(query.trim().toLowerCase()) && (sort !== '等你回答' || !q.repliesCount)).sort((a, b) => sort === '热议' ? (b.repliesCount + b.likes) - (a.repliesCount + a.likes) : new Date(b.date).getTime() - new Date(a.date).getTime()), [publicQuestions, category, query, sort])
 const total = Math.max(1, Math.ceil(filtered.length / 12)), current = Math.min(page, total)
 useEffect(() => { setPage(1) }, [category, query, sort])
 function turn(next: number) { setPage(next); board.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }
 function openExample(event:React.MouseEvent,id:string) {
  if (!isExampleQuestion(id)) return
  event.preventDefault();setExampleDetail(exampleQuestions.find(q=>q.id===id)||null)
 }
 async function like(id: string) {
  if (isExampleQuestion(id)) {setExampleVotes(votes=>({...votes,[id]:!votes[id]}));return}
  if (!session?.user?.id) { setNotice('请先登录后点赞。'); return }
  if ((session.user as typeof session.user & { isMuted?: boolean }).isMuted) { setNotice('你的账号暂时无法点赞。'); return }
  setPending(id)
  try { const updated = await questionsApi.toggleLike(id); setQuestions(items => items.map(q => q.id === id ? { ...q, likes: updated.likes, likesRel: updated.likesRel } : q)) } catch (e) { setNotice(e instanceof Error ? e.message : '点赞失败，请稍后重试') } finally { setPending(null) }
 }
 async function remove() {
  if (!deleting) return
  setPending(deleting)
  try { await questionsApi.delete(deleting); setQuestions(items => items.filter(q => q.id !== deleting)); setDeleting(null) } catch (e) { setNotice(e instanceof Error ? e.message : '删除失败'); setDeleting(null) } finally { setPending(null) }
 }
 return <div className="community-page forum-space forum-hub">
  <div className="hub-backdrop" aria-hidden="true">
   <div className="hub-paper-grain"/><i className="hub-color-wash hub-wash-ochre"/><i className="hub-color-wash hub-wash-blue"/>
   <div className="hub-paper-plane hub-paper-plane-one"/><div className="hub-paper-plane hub-paper-plane-two"/>
   <svg className="hub-background-lines" viewBox="0 0 1600 1100" fill="none" preserveAspectRatio="xMidYMin slice">
    <g stroke="currentColor" strokeWidth=".8"><path d="M-120 200C130 80 260 260 180 490S-50 640 110 910"/><path d="M-105 214C140 96 270 273 194 499S-34 654 124 924" opacity=".45"/><path d="M1200-50C1040 170 1460 190 1500 380S1280 760 1690 930"/><path d="M1218-40C1056 184 1476 202 1517 394S1298 774 1708 943" opacity=".45"/></g>
    <g stroke="currentColor" strokeWidth="1.2" opacity=".8"><path d="M65 660h110a20 20 0 0 1 20 20v62a20 20 0 0 1-20 20h-48l-30 25v-25H65a20 20 0 0 1-20-20v-62a20 20 0 0 1 20-20Z"/><path d="M80 693h78M80 714h51"/><path d="M1388 77h114a16 16 0 0 1 16 16v49a16 16 0 0 1-16 16h-33l-24 20v-20h-57a16 16 0 0 1-16-16V93a16 16 0 0 1 16-16Z"/><path d="M1402 104h75M1402 124h48"/></g>
    <g stroke="currentColor" opacity=".65"><path d="M239 180v22m-11-11h22M1320 660v22m-11-11h22"/><circle cx="146" cy="358" r="4"/><circle cx="1437" cy="475" r="5"/><circle cx="105" cy="873" r="2"/></g>
   </svg>
  </div>
  <div className="community-shell">
   <header className="hub-header">
    <div className="hub-masthead">
     <div className="hub-brand-line">
      <svg className="hub-dialogue-mark" viewBox="0 0 56 56" fill="none" aria-hidden="true">
       <path d="M10 8h25a9 9 0 0 1 9 9v16a9 9 0 0 1-9 9H22L10 49V38a9 9 0 0 1-8-9V17a9 9 0 0 1 8-9Z" fill="#efe5db" stroke="#cec1b2" strokeWidth="1.4"/>
       <path d="M23 16h22a9 9 0 0 1 9 9v14a9 9 0 0 1-9 9H33l-10 7V44a9 9 0 0 1-8-9V25a9 9 0 0 1 8-9Z" fill="#79474a"/>
       <path d="M25 28h18M25 35h12" stroke="#fff5e9" strokeWidth="2.4" strokeLinecap="round"/>
      </svg>
      <h1>问答论坛</h1>
     </div>
     <p>在这里，交换真实的经验。</p>
    </div>
    <label className="hub-search"><Search size={20} /><input aria-label="搜索问题" placeholder="搜索你关心的问题" value={query} onChange={e => setQuery(e.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="清除搜索"><X size={18} /></button>}</label>
    <Link href="/forum/ask" className="hub-ask"><Plus size={20} />提问</Link>
   </header>
   <div className="hub-layout">
    <aside className="hub-topics hub-topic-picker"><h2><Compass size={20} />话题</h2><div className="hub-wheel-shell"><button className="hub-wheel-arrow" aria-label="上一个话题" disabled={selectedTopic === 0} onClick={() => selectCategory(topics[selectedTopic - 1].name)}><ChevronUp size={20}/></button><div className="hub-wheel-window"><div className="hub-wheel-selection" aria-hidden="true"/><nav ref={wheel} className="hub-topic-wheel" aria-label="话题筛选" onScroll={settleWheel} onKeyDown={event => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? topics.length - 1 : Math.max(0, Math.min(topics.length - 1, selectedTopic + (event.key === 'ArrowDown' ? 1 : -1)))
      selectCategory(topics[index].name)
      wheel.current?.querySelectorAll<HTMLButtonElement>('button')[index]?.focus({ preventScroll: true })
     }}>{topics.map((topic, i) => <div className="hub-wheel-option" key={topic.name}><button aria-label={topic.label} aria-pressed={category === topic.name} onClick={() => selectCategory(topic.name)} style={{ '--topic-distance': Math.min(3, Math.abs(i - selectedTopic)) } as CSSProperties}><span>{topic.label}</span><small>{topic.name === '全部' ? publicQuestions.length : publicQuestions.filter(q => topicOf(q.category) === topic.name).length}</small></button></div>)}</nav></div><button className="hub-wheel-arrow" aria-label="下一个话题" disabled={selectedTopic === topics.length - 1} onClick={() => selectCategory(topics[selectedTopic + 1].name)}><ChevronDown size={20}/></button></div></aside>
    <section className="forum-board hub-feed" ref={board}>
     <div className="hub-feed-heading"><h2>{category === '全部' ? '发现讨论' : category}</h2><div className="hub-sort" aria-label="问题排序">{['最新', '热议', '等你回答'].map(item => <button key={item} onClick={() => setSort(item)} aria-pressed={sort === item}>{item}</button>)}</div></div>
     {process.env.NODE_ENV === 'development' && <div className="hub-demo-toolbar"><span>{showExamples?'示例讨论 · 每个话题 3 条，内容为演示编写':'正在查看真实讨论'}</span><button onClick={()=>{setShowExamples(!showExamples);setPage(1)}}>{showExamples?'查看真实讨论':'预览示例讨论'}</button></div>}
     {loading && !showExamples ? <div className="community-empty" role="status"><MessageCircle /><h3>正在加载讨论…</h3></div> : error && !showExamples ? <div className="community-empty" role="alert"><h3>加载失败</h3><p>{error}</p><button onClick={load}>重新连接</button></div> : !filtered.length ? <div className="community-empty"><MessageCircle /><h3>{query || category !== '全部' || sort === '等你回答' ? '没有找到符合条件的问题' : '还没有公开问题'}</h3><p>把你的疑问留在这里，让经历过的人一起回答。</p>{(query || category !== '全部' || sort !== '最新') && <button className="forum-reset" onClick={() => { setQuery(''); selectCategory('全部'); setSort('最新') }}>查看全部讨论</button>}</div> : <div className="forum-question-grid" key={`${current}-${category}-${sort}-${query}`}>
      {filtered.slice((current - 1) * 12, current * 12).map(q => <article key={q.id} className="forum-question" data-example={isExampleQuestion(q.id)}>
       <header className="hub-question-meta"><div className="question-author"><span className="question-avatar" aria-hidden="true">{q.isAnonymous ? '?' : (q.askerName || '同学').slice(0, 1)}</span><div>{!q.isAnonymous && q.askerId ? <Link href={`/users/${q.askerId}`}>{q.askerName || '一位同学'}</Link> : <span>{q.isAnonymous ? '匿名同学' : q.askerName || '一位同学'}</span>}<time>{isExampleQuestion(q.id)?'示例讨论':`${formatRelativeTime(q.date)} · 提出了问题`}</time></div></div><button className="hub-category" onClick={() => selectCategory(topicOf(q.category))}>{topicOf(q.category)}</button></header>
       <Link href={`/forum/${q.id}`} onClick={event=>openExample(event,q.id)} className="question-main"><h3>{q.title}</h3><p>{q.content}</p></Link>
       <footer className="question-bottom"><div className="question-actions"><button aria-label={`点赞：${q.likes || 0}`} aria-pressed={isExampleQuestion(q.id)?!!exampleVotes[q.id]:!!q.likesRel?.some(l => l.userId === session?.user?.id)} onClick={() => like(q.id)} disabled={pending === q.id}><Heart size={18} /><span>{q.likes || 0}</span></button><Link href={`/forum/${q.id}`} onClick={event=>openExample(event,q.id)}><MessageCircle size={18} />{q.repliesCount ? `${q.repliesCount} 条回答` : '写下第一个回答'}</Link></div><div className="hub-question-end">{session?.user?.id && q.askerId === session.user.id && <button aria-label="删除我的问题" onClick={() => setDeleting(q.id)} disabled={pending === q.id}><Trash2 size={17} /></button>}<Link href={`/forum/${q.id}`} onClick={event=>openExample(event,q.id)} aria-label={`参与讨论：${q.title}`}><PenLine size={17} /><span>{isExampleQuestion(q.id)?'查看讨论':'回答'}</span></Link></div></footer>
      </article>)}
     </div>}
     <PageTurner page={current} total={total} change={turn} />
    </section>

   </div>
  </div>
  {exampleDetail && <CommunityModal title={exampleDetail.title} close={()=>setExampleDetail(null)}><div className="hub-example-detail"><span className="hub-example-label">示例讨论 · {topicOf(exampleDetail.category)}</span><h2>{exampleDetail.title}</h2><p>{exampleDetail.content}</p><div className="hub-example-replies"><h3>示例回答</h3>{exampleDetail.exampleReplies.length?exampleDetail.exampleReplies.map((reply,index)=><article key={index}><strong>示例同学 {index+1}</strong><p>{reply}</p></article>):<p>这条示例暂时没有回答，用来预览“等你回答”的状态。</p>}</div><footer><button className="community-primary" onClick={()=>setExampleDetail(null)}>返回讨论列表</button></footer></div></CommunityModal>}
  {notice && <CommunityModal title="提示" close={() => setNotice('')}><h2>提示</h2><p>{notice}</p><footer><button className="community-primary" onClick={() => setNotice('')}>知道了</button>{!session && <Link href="/auth/login?callbackUrl=/forum">去登录 →</Link>}</footer></CommunityModal>}
  {deleting && <CommunityModal title="删除问题" close={() => setDeleting(null)}><h2>收回这个问题？</h2><p>问题和相关回复删除后无法恢复。</p><footer><button onClick={() => setDeleting(null)}>保留问题</button><button className="community-primary" disabled={!!pending} onClick={remove}>{pending ? '正在删除…' : '确认删除'}</button></footer></CommunityModal>}
 </div>
}
