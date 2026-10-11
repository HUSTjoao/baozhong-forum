'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowUpRight, ChevronDown, Heart, MessageCircle, Plus, Search, Send, X } from 'lucide-react'
import type { Major } from '@/data/majors'
import { addQuestion, addReply, formatRelativeTime, getQuestions, toggleQuestionLike, type Question, type Reply } from '@/data/questions'
import { getUserById } from '@/data/users'
import './major-discussion.css'

type Props = {
  major: Major
  questions: Question[]
  onChange: (questions: Question[]) => void
  onNotice: (notice: { title: string; message?: string }) => void
}

function ReplyBranch({ replies, depth = 0 }: { replies: Reply[]; depth?: number }) {
  return <div className={'corridor-replies' + (depth > 1 ? ' corridor-replies-flat' : '')}>{replies.map(reply => <div className="corridor-reply" key={reply.id}>
    <div className="corridor-reply-by"><strong>{reply.isAnonymous ? '匿名同学' : reply.replier}</strong><time dateTime={reply.date}>{formatRelativeTime(reply.date)}</time></div>
    <p>{reply.content}</p>
    {!!reply.subReplies?.length && <ReplyBranch replies={reply.subReplies} depth={depth + 1} />}
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
  function publish(event: FormEvent) {
    event.preventDefault()
    const user = requireUser()
    if (!user || !content.trim()) return
    const text = content.trim()
    const created = addQuestion({ title: text.split(/[。！？\n]/)[0].slice(0, 40) || major.name + '讨论', content: text,
      asker: anonymous ? '匿名同学' : user.nickname || user.name || '同学', askerId: user.id,
      date: new Date().toISOString(), universityId: '', majorId: major.id, category: '专业选择', isAnonymous: anonymous })
    if (!created) { onNotice({ title: '暂时无法发布', message: '请检查账号状态后再试。' }); return }
    onChange([created, ...questions]); setContent(''); setQuery(''); setSort('new'); setComposerOpen(false); setNotice('已发表')
  }
  function publishReply(event: FormEvent, question: Question) {
    event.preventDefault()
    const user = requireUser()
    if (!user || !replyText.trim()) return
    const created = addReply(question.id, { replier: user.nickname || user.name || '同学', replierId: user.id,
      date: new Date().toISOString(), content: replyText.trim(), isAlumni: user.role === 'alumni' })
    if (!created) { onNotice({ title: '暂时无法回复', message: '请检查账号状态后再试。' }); return }
    const updated = getQuestions().find(item => item.id === question.id)
    if (updated) onChange(questions.map(item => item.id === question.id ? { ...updated } : item))
    setReplyText(''); setNotice('回复已发表')
  }
  function like(question: Question) {
    const user = requireUser()
    if (!user) return
    const updated = toggleQuestionLike(question.id, user.id)
    if (updated) onChange(questions.map(item => item.id === question.id ? { ...updated } : item))
    else onNotice({ title: '暂时无法点赞', message: '请检查账号状态后再试。' })
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
        <textarea id="corridor-draft" ref={composerRef} disabled={!composerOpen} placeholder="写在这里…" value={content} onChange={event => setContent(event.target.value)} rows={4} maxLength={3000} required />
        <div className="corridor-compose-actions"><label><input disabled={!composerOpen} type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} />匿名发表</label><span>{content.length} / 3000</span><button disabled={!composerOpen} type="submit">发表<Send size={17} /></button></div>
        {!session?.user && <p className="corridor-login"><Link tabIndex={composerOpen ? 0 : -1} href={'/auth/login?callbackUrl=' + encodeURIComponent('/majors/' + major.id + '/forum')}>登录</Link>后即可发表</p>}
      </form>
    </div></div>
    <div className="corridor-toolbar"><div className="corridor-sort"><button type="button" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>最新</button><button type="button" aria-pressed={sort === 'popular'} onClick={() => setSort('popular')}>热门</button></div>
      <label className="corridor-search"><Search size={18} /><input aria-label="搜索本专业讨论" placeholder="找一条讨论" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}><X size={16} /></button>}</label>
    </div>
    <p className="corridor-notice" role="status">{notice}</p>
    <div className="corridor-stream">{!visible.length ? <div className="corridor-empty"><span className="corridor-empty-mark" aria-hidden="true">“</span><h3>{query ? '没有匹配的讨论' : '第一条留言，留给你。'}</h3><button type="button" onClick={() => query ? setQuery('') : setComposerOpen(true)}>{query ? '查看全部' : '写一条'}<ArrowUpRight size={20} /></button></div> : visible.map(question => {
      const user = !question.isAnonymous && question.askerId ? getUserById(question.askerId) : undefined
      const name = question.isAnonymous ? '匿名同学' : user?.nickname || user?.name || question.asker || '同学'
      const liked = !!session?.user?.id && !!question.likedBy?.includes(session.user.id)
      const open = expanded === question.id
      return <article className="corridor-thread" key={question.id}>
        <span className="corridor-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
        <div className="corridor-message"><header><strong>{name}</strong><time dateTime={question.date}>{formatRelativeTime(question.date)}</time><Link href={'/forum/' + question.id} aria-label={'打开完整讨论：' + question.title}><ArrowUpRight size={20} /></Link></header>
          <h3>{question.title}</h3>{question.content !== question.title && <p>{question.content}</p>}
          <footer><button type="button" aria-expanded={open} aria-controls={'corridor-thread-' + question.id} onClick={() => { setExpanded(open ? null : question.id); setReplyText('') }}><MessageCircle size={18} />{question.replies ? question.replies + ' 条回复' : '回复'}<ChevronDown size={15} className={open ? 'is-open' : ''} /></button><button type="button" aria-label={'为' + question.title + '点赞'} aria-pressed={liked} onClick={() => like(question)}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /><span>{question.likes || '赞'}</span></button></footer>
          <div className="corridor-thread-reveal" data-open={open} id={'corridor-thread-' + question.id}><div>
            {!!question.replyList?.length && <ReplyBranch replies={question.replyList} />}
            <form className="corridor-inline-compose" onSubmit={event => publishReply(event, question)}><textarea ref={open ? replyRef : undefined} disabled={!open} aria-label={'回复' + name} placeholder={'回复 ' + name + '…'} rows={2} maxLength={3000} required value={open ? replyText : ''} onChange={event => setReplyText(event.target.value)} /><button disabled={!open} type="submit" aria-label="发表回复"><Send size={18} /></button></form>
          </div></div>
        </div>
      </article>
    })}</div>
  </section>
}
