'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowUpRight, ChevronDown, Heart, MessageCircle, Plus, Search, Send, X } from 'lucide-react'
import type { Major } from '@/data/majors'
import { questionsApi, repliesApi, formatRelativeTime, type Question, type Reply } from '@/lib/api-client'
import { discussionTree } from '@/lib/discussion-tree'
import DiscussionLink from '@/components/community/DiscussionLink'

import './major-discussion.css'

type Props = {
  major: Major
  questions: Question[]
  onChange: (questions: Question[]) => void
  onNotice: (notice: { title: string; message?: string }) => void
}

function ReplyBranch({ replies, depth = 0 }: { replies: Reply[]; depth?: number }) {
  return <div className={'corridor-replies' + (depth > 1 ? ' corridor-replies-flat' : '')}>{replies.map(reply => <div className="corridor-reply" key={reply.id}>
    <div className="corridor-reply-by"><strong>{reply.isAnonymous ? '匿名同学' : reply.replier?.nickname || reply.replierName || '一位同学'}</strong><time dateTime={reply.date}>{formatRelativeTime(reply.date)}</time></div>
    <p>{reply.content}</p>
    {!!reply.children?.length && <ReplyBranch replies={reply.children} depth={depth + 1} />}
  </div>)}</div>
}

export default function MajorDiscussion({ major, questions, onChange, onNotice }: Props) {
  const { data: session } = useSession()
  const [composerOpen, setComposerOpen] = useState(false)
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'new' | 'popular'>('new')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const corridorRef = useRef<HTMLElement>(null)
  useEffect(() => { if (composerOpen) composerRef.current?.focus({ preventScroll: true }) }, [composerOpen])
  useEffect(() => { setComposerOpen(false); setContent(''); setQuery(''); setExpanded(null); setReplyText(''); setNotice('') }, [major.id])
  useEffect(() => {
    const root = corridorRef.current
    if (!root || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.corridor-heading, .corridor-toolbar, .corridor-thread, .corridor-empty'))
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        ;(entry.target as HTMLElement).dataset.corridorReveal = 'visible'
        observer.unobserve(entry.target)
      })
    }, { threshold: .04, rootMargin: '0px 0px -6% 0px' })
    targets.forEach((target, index) => {
      if (target.dataset.corridorReveal === 'visible') return
      target.dataset.corridorReveal = 'pending'
      target.style.setProperty('--corridor-reveal-delay', `${Math.min(index % 3 * 65, 130)}ms`)
      observer.observe(target)
    })
    const revealFocus = (event: FocusEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-corridor-reveal]')
      if (target) { target.dataset.corridorReveal = 'visible'; observer.unobserve(target) }
    }
    root.addEventListener('focusin', revealFocus)
    return () => { observer.disconnect(); root.removeEventListener('focusin', revealFocus) }
  }, [major.id, questions, query, sort])

  function requireUser() {
    if (session?.user?.id) return session.user
    onNotice({ title: '登录后参与讨论', message: '登录后就可以发表、回复和点赞。' })
    return null
  }
  async function publish(event: FormEvent) {
    event.preventDefault()
    if (!requireUser() || !content.trim() || pending) return
    setPending(true)
    try {
      const text=content.trim()
      const title=text.split(/[。！？\n]/)[0].slice(0,80)
      const created=await questionsApi.create({title:title.length>=2?title:major.name+'讨论',content:text,majorId:major.id,category:'专业选择',isAnonymous:anonymous})
      const full=await questionsApi.get(created.id)
      onChange([full,...questions]);setContent('');setQuery('');setSort('new');setComposerOpen(false);setNotice('已发表')
    } catch(e){onNotice({title:'暂时无法发表',message:e instanceof Error?e.message:'请稍后重试。'})} finally{setPending(false)}
  }
  async function publishReply(event: FormEvent, question: Question) {
    event.preventDefault()
    if (!requireUser() || !replyText.trim() || pending) return
    setPending(true)
    try {await repliesApi.create(question.id,{content:replyText.trim(),isAnonymous:false});const full=await questionsApi.get(question.id);onChange(questions.map(item=>item.id===question.id?full:item));setReplyText('');setNotice('回复已发表')}
    catch(e){onNotice({title:'暂时无法回复',message:e instanceof Error?e.message:'请稍后重试。'})}finally{setPending(false)}
  }
  async function like(question: Question) {
    if (!requireUser() || pending) return
    setPending(true)
    try {await questionsApi.toggleLike(question.id);const full=await questionsApi.get(question.id);onChange(questions.map(item=>item.id===question.id?full:item))}
    catch(e){onNotice({title:'暂时无法点赞',message:e instanceof Error?e.message:'请稍后重试。'})}finally{setPending(false)}
  }
  async function openReplies(question: Question) {
    if(expanded===question.id){setExpanded(null);return}
    setExpanded(question.id);setReplyText('')
    try {const full=await questionsApi.get(question.id);onChange(questions.map(item=>item.id===question.id?full:item))}
    catch(e){onNotice({title:'回复加载失败',message:e instanceof Error?e.message:'请稍后重试。'})}
  }
  const visible = questions.filter(item => (item.title + ' ' + item.content).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'popular' ? b.likes - a.likes || Date.parse(b.date) - Date.parse(a.date) : Date.parse(b.date) - Date.parse(a.date))

  return <section ref={corridorRef} id="discussion" className="major-corridor" aria-labelledby="corridor-title">
    <header className="corridor-heading"><div><h2 id="corridor-title">专业讨论<span>{questions.length}</span></h2><p>{major.name} · 课堂之外的声音</p></div>
      <button className="corridor-write" type="button" aria-expanded={composerOpen} aria-controls="corridor-composer" onClick={() => setComposerOpen(!composerOpen)}>{composerOpen ? <X size={20} /> : <Plus size={20} />}<span>{composerOpen ? '收起' : '写一条'}</span></button>
    </header>
    <div className="corridor-compose-reveal" data-open={composerOpen} id="corridor-composer"><div>
      <form className="corridor-composer" onSubmit={publish}>
        <label htmlFor="corridor-draft">你的问题，或亲身经历</label>
        <textarea id="corridor-draft" ref={composerRef} disabled={!composerOpen || pending} placeholder="写在这里…" value={content} onChange={event => setContent(event.target.value)} rows={4} maxLength={3000} required />
        <div className="corridor-compose-actions"><button className="corridor-anonymous" disabled={!composerOpen || pending} type="button" role="switch" aria-label="匿名发表" aria-checked={anonymous} onClick={() => setAnonymous(value => !value)}><span className="corridor-anonymous-track" aria-hidden="true"><i /></span><span className="corridor-anonymous-copy"><strong>匿名发表</strong><span>{anonymous ? '隐藏你的名字' : '显示你的名字'}</span></span></button><span className="corridor-character-count" aria-live="off">{content.length}<span> / 3000</span></span><button className="corridor-publish" disabled={!composerOpen || pending} type="submit">发表<Send size={22} /></button></div>
        {!session?.user && <p className="corridor-login"><Link tabIndex={composerOpen ? 0 : -1} href={'/auth/login?callbackUrl=' + encodeURIComponent('/majors/' + major.id + '/forum')}>登录</Link>后即可发表</p>}
      </form>
    </div></div>
    <div className="corridor-toolbar"><div className="corridor-sort"><button type="button" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>最新</button><button type="button" aria-pressed={sort === 'popular'} onClick={() => setSort('popular')}>热门</button></div>
      <label className="corridor-search"><Search size={18} /><input aria-label="搜索本专业讨论" placeholder="找一条讨论" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}><X size={16} /></button>}</label>
    </div>
    <p className="corridor-notice" role="status">{notice}</p>
    <div className="corridor-stream">{!visible.length ? <div className="corridor-empty"><span className="corridor-empty-mark" aria-hidden="true">“</span><h3>{query ? '没有匹配的讨论' : '第一条留言，留给你。'}</h3><button type="button" onClick={() => query ? setQuery('') : setComposerOpen(true)}>{query ? '查看全部' : '写一条'}<ArrowUpRight size={20} /></button></div> : visible.map(question => {
      const user = !question.isAnonymous ? question.asker : undefined
      const name = question.isAnonymous ? '匿名同学' : user?.nickname || user?.name || question.askerName || '同学'
      const liked = !!session?.user?.id && !!question.likesRel?.some(like=>like.userId===session.user.id)
      const open = expanded === question.id
      return <article className="corridor-thread" key={question.id}>
        <span className="corridor-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
        <div className="corridor-message"><header><strong>{name}</strong><time dateTime={question.date}>{formatRelativeTime(question.date)}</time></header>
          <h3>{question.title}</h3>{question.content !== question.title && <p>{question.content}</p>}
          <footer><button type="button" aria-expanded={open} aria-controls={'corridor-thread-' + question.id} onClick={() => void openReplies(question)}><MessageCircle size={18} />{question.repliesCount ? question.repliesCount + ' 条回复' : '回复'}<ChevronDown size={15} className={open ? 'is-open' : ''} /></button><button type="button" aria-label={'为' + question.title + '点赞'} aria-pressed={liked} onClick={() => like(question)}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /><span>{question.likes || '赞'}</span></button><DiscussionLink href={'/forum/'+question.id} /></footer>
          <div className="corridor-thread-reveal" data-open={open} id={'corridor-thread-' + question.id}><div>
            {!!question.replies?.length && <ReplyBranch replies={discussionTree(question.replies)} />}
            <form className="corridor-inline-compose" onSubmit={event => publishReply(event, question)}><textarea ref={open ? replyRef : undefined} disabled={!open || pending} aria-label={'回复' + name} placeholder={'回复 ' + name + '…'} rows={2} maxLength={3000} required value={open ? replyText : ''} onChange={event => setReplyText(event.target.value)} /><button disabled={!open || pending} type="submit" aria-label="发表回复"><Send size={18} /></button></form>
          </div></div>
        </div>
      </article>
    })}</div>
  </section>
}
