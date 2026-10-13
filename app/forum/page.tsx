'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, MessageCircle, Search, Trash2, X, Plus, PenLine, Compass, Clock3, Flame } from 'lucide-react'
import { questionsApi, formatRelativeTime, type Question } from '@/lib/api-client'
import { CommunityModal, PageTurner } from '@/components/community/CommunityUI'
import { forumTopics as topics, forumTopicOf as topicOf } from '@/data/forum-topics'
import { exampleQuestions, isExampleQuestion } from '@/data/example-questions'
import './forum.css'
import GradientWaves from '@/components/community/ReactBitsGradientWaves'
import DiscussionLink from '@/components/community/DiscussionLink'
import OptionWheel from '@/components/community/ReactBitsOptionWheel'
export default function ForumPage() {
 const { data: session } = useSession()
 const [questions, setQuestions] = useState<Question[]>([])
 const [showExamples,setShowExamples] = useState(process.env.NODE_ENV === 'development')
 const [exampleVotes,setExampleVotes] = useState<Record<string,boolean>>({})
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [query, setQuery] = useState('')
 const [category, setCategory] = useState('全部')
 const [sort, setSort] = useState<'最新' | '热议'>('最新')
 const [page, setPage] = useState(1)
 const [pending, setPending] = useState<string | null>(null)
 const [notice, setNotice] = useState('')
 const [deleting, setDeleting] = useState<string | null>(null)
 const board = useRef<HTMLElement>(null)
 const forum = useRef<HTMLDivElement>(null)
 const selectedTopic = Math.max(0, topics.findIndex(topic => topic.name === category))
 const wheelItems = useMemo(() => topics.map(topic => topic.label), [])
 function selectCategory(name: string) { setCategory(name) }
 async function load() {
  setLoading(true); setError('')
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000)
  try { setQuestions(await questionsApi.list(controller.signal)) } catch (e) { setError(controller.signal.aborted ? '连接时间较长，请稍后重试。' : e instanceof Error ? e.message : '暂时无法连接讨论区') } finally { clearTimeout(timeout); setLoading(false) }
 }
 useEffect(() => { void load() }, [])
 useEffect(() => {
  const header = document.querySelector('.site-header')
  if (!header) return
  const update = () => forum.current?.style.setProperty('--forum-top', `${header.getBoundingClientRect().bottom}px`)
  const observer = new ResizeObserver(update)
  observer.observe(header); update()
  return () => observer.disconnect()
 }, [])
 const publicQuestions = useMemo(() => showExamples ? exampleQuestions.map(q=>({...q,likes:q.likes+(exampleVotes[q.id]?1:0)})) : questions.filter(q => !q.majorId && !q.universityId?.trim()), [questions,showExamples,exampleVotes])
 const filtered = useMemo(() => publicQuestions.filter(q => (category === '全部' || topicOf(q.category) === category) && `${q.title} ${q.content}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === '热议' ? (b.repliesCount + b.likes) - (a.repliesCount + a.likes) : new Date(b.date).getTime() - new Date(a.date).getTime()), [publicQuestions, category, query, sort])
 const total = Math.max(1, Math.ceil(filtered.length / 12)), current = Math.min(page, total)
 useEffect(() => { setPage(1); if (window.matchMedia('(min-width: 761px)').matches) board.current?.scrollTo({top:0}) }, [category, query, sort])
 function turn(next: number) { setPage(next); const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; if (window.matchMedia('(min-width: 761px)').matches) board.current?.scrollTo({top:0,behavior}); else board.current?.scrollIntoView({behavior,block:'start'}) }
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
 return <div className="community-page forum-space forum-hub" ref={forum}>
  <div className="hub-backdrop forum-flow-backdrop" aria-hidden="true"><GradientWaves horizonColor="#ecebe5" waveColor="#54758b" crestColor="#b6c9d7" speed={.35} amplitude={2.5} waveScale={.6} waveRatio={.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={30} detail="low" brightness={1.05} opacity={1} mouseInteraction={false} parallaxStrength={0} grain grainIntensity={.025} className="forum-gradient-waves" /></div>
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
    <aside className="hub-topics hub-option-picker"><h2><Compass size={20} />话题</h2><div className="hub-option-stage"><span className="hub-option-marker" aria-hidden="true"/><OptionWheel items={wheelItems} defaultSelected={0} selected={selectedTopic} onChange={(index: number) => selectCategory(topics[index].name)} textColor="#777b7b" activeColor="#a63835" fontSize={1.75} spacing={2.1} tilt={12} curve={1} blur={.55} fade={.2} minOpacity={.12} smoothing={210} inset={32} loop={false} draggable className="forum-option-wheel" ariaLabel="话题筛选" renderItem={(label: string, index: number) => <><span>{label}</span><small>{topics[index].name === '全部' ? publicQuestions.length : publicQuestions.filter(q => topicOf(q.category) === topics[index].name).length}</small></>} /></div><p className="hub-option-instruction">滚动或拖动，选择话题</p></aside>
    <section className="forum-board hub-feed" ref={board} tabIndex={0} aria-label="讨论列表">
     <div className="hub-feed-heading"><h2>{category === '全部' ? '发现讨论' : category}</h2><div className="hub-sort" role="group" aria-label="问题排序" data-sort={sort}>{(['最新', '热议'] as const).map(item => <button key={item} type="button" onClick={() => setSort(item)} aria-pressed={sort === item}>{item === '最新' ? <Clock3 size={18} aria-hidden="true" /> : <Flame size={18} aria-hidden="true" />}<span>{item}</span></button>)}</div></div>
     {process.env.NODE_ENV === 'development' && <div className="hub-demo-toolbar"><span>{showExamples?'示例讨论 · 每个话题 3 条，内容为演示编写':'正在查看真实讨论'}</span><button onClick={()=>{setShowExamples(!showExamples);setPage(1)}}>{showExamples?'查看真实讨论':'预览示例讨论'}</button></div>}
     {loading && !showExamples ? <div className="community-empty" role="status"><MessageCircle /><h3>正在加载讨论…</h3></div> : error && !showExamples ? <div className="community-empty" role="alert"><h3>加载失败</h3><p>{error}</p><button onClick={load}>重新连接</button></div> : !filtered.length ? <div className="community-empty"><MessageCircle /><h3>{query || category !== '全部' ? '没有找到符合条件的问题' : '还没有公开问题'}</h3><p>把你的疑问留在这里，让经历过的人一起回答。</p>{(query || category !== '全部' || sort !== '最新') && <button className="forum-reset" onClick={() => { setQuery(''); selectCategory('全部'); setSort('最新') }}>查看全部讨论</button>}</div> : <div className="forum-question-grid" key={`${current}-${category}-${sort}-${query}`}>
      {filtered.slice((current - 1) * 12, current * 12).map(q => <article key={q.id} className="forum-question" data-example={isExampleQuestion(q.id)}>
       <header className="hub-question-meta"><div className="question-author"><span className="question-avatar" aria-hidden="true">{q.isAnonymous ? '?' : (q.askerName || '同学').slice(0, 1)}</span><div>{!q.isAnonymous && q.askerId ? <Link href={`/users/${q.askerId}`}>{q.askerName || '一位同学'}</Link> : <span>{q.isAnonymous ? '匿名同学' : q.askerName || '一位同学'}</span>}<time>{isExampleQuestion(q.id)?'示例讨论':`${formatRelativeTime(q.date)} · 提出了问题`}</time></div></div><button className="hub-category" onClick={() => selectCategory(topicOf(q.category))}>{topicOf(q.category)}</button></header>
       <Link href={`/forum/${q.id}`} className="question-main"><h3>{q.title}</h3><p>{q.content}</p></Link>
       <footer className="question-bottom"><div className="question-actions"><button aria-label={`点赞：${q.likes || 0}`} aria-pressed={isExampleQuestion(q.id)?!!exampleVotes[q.id]:!!q.likesRel?.some(l => l.userId === session?.user?.id)} onClick={() => like(q.id)} disabled={pending === q.id}><Heart size={18} /><span>{q.likes || 0}</span></button><Link href={`/forum/${q.id}`}><MessageCircle size={18} />{q.repliesCount ? `${q.repliesCount} 条回答` : '写下第一个回答'}</Link></div><div className="hub-question-end">{session?.user?.id && q.askerId === session.user.id && <button aria-label="删除我的问题" onClick={() => setDeleting(q.id)} disabled={pending === q.id}><Trash2 size={17} /></button>}<DiscussionLink href={`/forum/${q.id}`} /></div></footer>
      </article>)}
     </div>}
     <PageTurner page={current} total={total} change={turn} />
    </section>

   </div>
  </div>
  {notice && <CommunityModal title="提示" close={() => setNotice('')}><h2>提示</h2><p>{notice}</p><footer><button className="community-primary" onClick={() => setNotice('')}>知道了</button>{!session && <Link href="/auth/login?callbackUrl=/forum">去登录 →</Link>}</footer></CommunityModal>}
  {deleting && <CommunityModal title="删除问题" close={() => setDeleting(null)}><h2>收回这个问题？</h2><p>问题和相关回复删除后无法恢复。</p><footer><button onClick={() => setDeleting(null)}>保留问题</button><button className="community-primary" disabled={!!pending} onClick={remove}>{pending ? '正在删除…' : '确认删除'}</button></footer></CommunityModal>}
 </div>
}
