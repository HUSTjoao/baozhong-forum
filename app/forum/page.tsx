'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, MessageCircle, Search, Trash2, X, Plus, PenLine, Compass, ChevronUp, ChevronDown } from 'lucide-react'
import { questionsApi, formatRelativeTime, type Question } from '@/lib/api-client'
import { CommunityModal, PageTurner } from '@/components/community/CommunityUI'
import { forumTopics as topics, forumTopicOf as topicOf } from '@/data/forum-topics'
import './forum.css'
const wheelStep = 80
export default function ForumPage() {
 const { data: session } = useSession()
 const [questions, setQuestions] = useState<Question[]>([])
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
 const publicQuestions = useMemo(() => questions.filter(q => !q.majorId && !q.universityId?.trim()), [questions])
 const filtered = useMemo(() => publicQuestions.filter(q => (category === '全部' || topicOf(q.category) === category) && `${q.title} ${q.content}`.toLowerCase().includes(query.trim().toLowerCase()) && (sort !== '等你回答' || !q.repliesCount)).sort((a, b) => sort === '热议' ? (b.repliesCount + b.likes) - (a.repliesCount + a.likes) : new Date(b.date).getTime() - new Date(a.date).getTime()), [publicQuestions, category, query, sort])
 const total = Math.max(1, Math.ceil(filtered.length / 12)), current = Math.min(page, total)
 useEffect(() => { setPage(1) }, [category, query, sort])
 function turn(next: number) { setPage(next); board.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }
 async function like(id: string) {
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
  <div className="community-shell">
   <header className="hub-header">
    <div><h1>问答论坛<span>在这里，交换真实的经验。</span></h1></div>
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
     {loading ? <div className="community-empty" role="status"><MessageCircle /><h3>正在加载讨论…</h3></div> : error ? <div className="community-empty" role="alert"><h3>加载失败</h3><p>{error}</p><button onClick={load}>重新连接</button></div> : !filtered.length ? <div className="community-empty"><MessageCircle /><h3>{query || category !== '全部' || sort === '等你回答' ? '没有找到符合条件的问题' : '还没有公开问题'}</h3><p>把你的疑问留在这里，让经历过的人一起回答。</p>{(query || category !== '全部' || sort !== '最新') && <button className="forum-reset" onClick={() => { setQuery(''); selectCategory('全部'); setSort('最新') }}>查看全部讨论</button>}</div> : <div className="forum-question-grid" key={`${current}-${category}-${sort}-${query}`}>
      {filtered.slice((current - 1) * 12, current * 12).map(q => <article key={q.id} className="forum-question">
       <header className="hub-question-meta"><div className="question-author"><span className="question-avatar" aria-hidden="true">{q.isAnonymous ? '?' : (q.askerName || '同学').slice(0, 1)}</span><div>{!q.isAnonymous && q.askerId ? <Link href={`/users/${q.askerId}`}>{q.askerName || '一位同学'}</Link> : <span>{q.isAnonymous ? '匿名同学' : q.askerName || '一位同学'}</span>}<time>{formatRelativeTime(q.date)} · 提出了问题</time></div></div><button className="hub-category" onClick={() => selectCategory(topicOf(q.category))}>{topicOf(q.category)}</button></header>
       <Link href={`/forum/${q.id}`} className="question-main"><h3>{q.title}</h3><p>{q.content}</p></Link>
       <footer className="question-bottom"><div className="question-actions"><button aria-label={`点赞：${q.likes || 0}`} aria-pressed={!!q.likesRel?.some(l => l.userId === session?.user?.id)} onClick={() => like(q.id)} disabled={pending === q.id}><Heart size={18} /><span>{q.likes || 0}</span></button><Link href={`/forum/${q.id}`}><MessageCircle size={18} />{q.repliesCount ? `${q.repliesCount} 条回答` : '写下第一个回答'}</Link></div><div className="hub-question-end">{session?.user?.id && q.askerId === session.user.id && <button aria-label="删除我的问题" onClick={() => setDeleting(q.id)} disabled={pending === q.id}><Trash2 size={17} /></button>}<Link href={`/forum/${q.id}`} aria-label={`参与讨论：${q.title}`}><PenLine size={17} /><span>回答</span></Link></div></footer>
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
