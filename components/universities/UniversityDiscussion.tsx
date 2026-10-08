'use client'
import { FormEvent, useEffect, useId, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send } from 'lucide-react'
function ConversationIcon({ small = false }: { small?: boolean }) {
  const gradient = useId().replace(/:/g, '')
  if (small) return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"><path d="M7 5.5h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4.5 3v-3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z" /><path d="M8 10h8m-8 3.5h5" opacity=".6" /></svg>
  return <svg className="uni-conversation-art" viewBox="0 0 180 138" width="180" height="138" aria-hidden="true" fill="none">
    <defs><linearGradient id={gradient} x1="32" y1="22" x2="126" y2="109" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" stopOpacity=".95" /><stop offset="1" stopColor="#d5e7f6" stopOpacity=".8" /></linearGradient></defs>
    <ellipse cx="92" cy="121" rx="55" ry="6" fill="#648aab" opacity=".06" />
    <g className="uni-conversation-art-back"><path d="M86 49h47a12 12 0 0 1 12 12v29a12 12 0 0 1-12 12h-4v14l-18-14H86a12 12 0 0 1-12-12V61a12 12 0 0 1 12-12Z" fill="#d5e5f2" fillOpacity=".6" stroke="#88a9c3" strokeWidth="1.4" /><path d="M100 73h27m-27 9h19" stroke="#87a6be" strokeWidth="1.5" strokeLinecap="round" opacity=".65" /></g>
    <g className="uni-conversation-art-front"><path d="M47 24h61a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14H74L53 102V86h-6a14 14 0 0 1-14-14V38a14 14 0 0 1 14-14Z" fill={'url(#'+gradient+')'} stroke="#658dac" strokeWidth="1.6" strokeLinejoin="round" /><path d="M47 29h53" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".8" /><g fill="#6c92b0"><circle className="uni-conversation-dot" cx="59" cy="55" r="3" /><circle className="uni-conversation-dot" cx="78" cy="55" r="3" /><circle className="uni-conversation-dot" cx="97" cy="55" r="3" /></g></g>
  </svg>
}
type Comment = { id: string; content: string; name: string; date: string; replies: { id: string; content: string; name: string; date: string }[] }
export default function UniversityDiscussion({ universityId, initialComments, count }: { universityId: string; initialComments: Comment[]; count: number }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [pending, setPending] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { setComments(initialComments) }, [initialComments])
  const loginUrl = '/auth/login?callbackUrl=' + encodeURIComponent('/universities/' + universityId + '#university-discussion')
  function dateLabel(date: string) { return new Date(date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  async function submit(event: FormEvent, commentId?: string) {
    event.preventDefault()
    if (pending) return
    setPending(true); setMessage('')
    try {
      const response = await fetch('/api/universities/' + universityId + '/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: commentId ? reply : content, replyTo: commentId, isAnonymous: anonymous }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '发送失败，稍后再试试')
      if (commentId) { setReply(''); setReplyTo(null) } else setContent('')
      router.refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : '网络连接失败') }
    finally { setPending(false) }
  }
  async function loadMore() {
    setLoadingMore(true); setMessage('')
    try {
      const response = await fetch('/api/universities/' + universityId + '/comments?cursor=' + encodeURIComponent(comments[comments.length - 1].id))
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '加载失败')
      setComments(current => [...current, ...result.comments.filter((c: Comment) => !current.some(old => old.id === c.id))])
    } catch (error) { setMessage(error instanceof Error ? error.message : '网络连接失败') }
    finally { setLoadingMore(false) }
  }
  return <section className="uni-comment-section" id="university-discussion">
    <header className="uni-comment-heading"><h2>校园讨论</h2><span className="uni-conversation-count"><b>{count.toString().padStart(2, '0')}</b>条评论</span></header>
    <div className="uni-conversation-workspace"><aside className="uni-message-desk">
    <form className="uni-comment-compose" onSubmit={event => submit(event)}><div className="uni-message-desk-heading"><span className="uni-desk-avatar" aria-hidden="true">{anonymous ? '匿' : session?.user?.name?.slice(0, 1) || '我'}</span><h3>说两句</h3><span className="uni-draft-count">{content.length} / 3000</span></div>
      <textarea aria-label="评论内容" maxLength={3000} required value={content} onChange={event => setContent(event.target.value)} placeholder="聊聊这所学校，分享近况，或留下一个问题…" rows={5} />
      <div className="uni-comment-compose-bottom"><label><input type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} />匿名</label>{status === 'loading' ? <span>正在加载…</span> : session ? <button type="submit" disabled={pending || !content.trim()}>{pending ? '发送中…' : '发送'}<Send size={16} /></button> : <Link href={loginUrl}>登录后发言<Send size={16} /></Link>}</div>
    </form>
    {message && <p role="status" className="uni-feedback">{message}</p>}</aside><div className="uni-conversation-stream">
    <div className="uni-comment-list">{comments.length ? comments.map(comment => <article className="uni-comment" key={comment.id}>
      <span className="uni-comment-avatar" aria-hidden="true">{comment.name.slice(0, 1)}</span>
      <div className="uni-comment-main"><div className="uni-comment-meta"><strong>{comment.name}</strong><time dateTime={comment.date}>{dateLabel(comment.date)}</time></div><p>{comment.content}</p>
        <button className="uni-comment-reply-toggle" type="button" onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReply('') }}><ConversationIcon small />{replyTo === comment.id ? '收起' : '回复'}</button>
        {comment.replies.length > 0 && <div className="uni-comment-replies">{comment.replies.map(r => <div className="uni-comment-response" key={r.id}><div className="uni-comment-meta"><strong>{r.name}</strong><time dateTime={r.date}>{dateLabel(r.date)}</time></div><p>{r.content}</p></div>)}</div>}
        {replyTo === comment.id && <form className="uni-inline-reply" onSubmit={event => submit(event, comment.id)}><textarea aria-label={'回复' + comment.name} required maxLength={3000} value={reply} onChange={event => setReply(event.target.value)} placeholder={'回复 ' + comment.name + '…'} rows={2} /><div className="uni-comment-compose-bottom">{session ? <button type="submit" disabled={pending || !reply.trim()}>{pending ? '发送中…' : '发送回复'}<Send size={15} /></button> : <Link href={loginUrl}>登录后回复</Link>}</div></form>}
      </div>
    </article>) : <div className="uni-comments-empty"><span className="uni-empty-conversation" aria-hidden="true"><ConversationIcon /></span><p>还没有评论，来聊两句吧。</p></div>}</div>
    {comments.length < count && <button className="uni-comments-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? '加载中…' : '查看更多评论'}</button>}
    </div></div>
  </section>
}


