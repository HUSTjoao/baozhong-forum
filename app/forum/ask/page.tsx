'use client'
import { forumTopics } from '@/data/forum-topics'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Check, Send } from 'lucide-react'
import { questionsApi } from '@/lib/api-client'
import { CommunityModal } from '@/components/community/CommunityUI'
import '../forum.css'
import './ask.css'
const categories = forumTopics.slice(1).map(topic => topic.name)
function AskQuestion() {
 const router = useRouter(), params = useSearchParams()
 const { data: session, status } = useSession()
 const [title, setTitle] = useState(''), [content, setContent] = useState(''), [category, setCategory] = useState('')
 const [anonymous, setAnonymous] = useState(false), [pending, setPending] = useState(false), [notice, setNotice] = useState('')
 const universityId = params.get('university') || ''
 const back = universityId ? `/universities/${universityId}/forum` : '/forum'
 async function submit(e: React.FormEvent) {
  e.preventDefault()
  if (!session?.user) return
  if (title.trim().length < 2 || !content.trim() || (!universityId && !category)) { setNotice('请填写标题和正文，并选择一个话题。'); return }
  setPending(true)
  try { const question = await questionsApi.create({ title:title.trim(),content:content.trim(),isAnonymous:anonymous,category:category || undefined,universityId:universityId || undefined }); router.push(`/forum/${question.id}`) }
  catch (e) { setNotice(e instanceof Error ? e.message : '发布失败，请稍后重试'); setPending(false) }
 }
 return <div className="community-page forum-space"><div className="community-shell ask-shell"><Link className="ask-back" href={back}><ArrowLeft size={20} />返回讨论</Link><div className="ask-layout"><aside><span className="ask-kicker">从一个问号开始</span><h1>把你的问题，<br /><span>认真说出来。</span></h1><p>你不必知道答案。<br />描述真实的处境，让大家陪你一起想。</p><div className="ask-help"><span>一个好问题，可以这样写</span><ol><li>说说你现在遇到的情况</li><li>告诉大家你纠结的地方</li><li>分享你已经尝试过的方法</li></ol></div></aside><section className="ask-paper">
 {status === 'loading' ? <p role="status">正在连接你的身份…</p> : !session ? <div className="ask-login"><h2>先认识一下你。</h2><p>登录后即可提问，也可以选择匿名发布。</p><Link className="community-primary" href={`/auth/login?callbackUrl=${encodeURIComponent('/forum/ask' + (universityId ? `?university=${universityId}` : ''))}`}>登录并继续<ArrowUpRight /></Link></div> : <form onSubmit={submit}>
  {!universityId && <fieldset><legend>这次，想聊哪一件事？</legend><div className="ask-categories">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{category === item && <Check size={16} />}{item}</button>)}</div></fieldset>}
  <label className="ask-label" htmlFor="question-title">给你的问题一个标题<span>{title.length} / 100</span></label><input id="question-title" className="ask-title-input" minLength={2} maxLength={100} required value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：选学校和选专业，该怎么取舍？" />
  <label className="ask-label" htmlFor="question-content">展开聊聊你的情况<span>{content.length} / 5000</span></label><textarea id="question-content" value={content} onChange={e => setContent(e.target.value)} required maxLength={5000} rows={8} placeholder="我最近在纠结的是……" />
  <footer><label className="ask-anonymous"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />匿名发布<span>给自己留一点空间</span></label><button className="community-primary" disabled={pending}><Send size={19} />{pending ? '正在送出…' : '发布这个问题'}</button></footer>
 </form>}
 </section></div></div>{notice && <CommunityModal title="发布提示" close={() => setNotice('')}><h2>再检查一下</h2><p>{notice}</p><footer><button className="community-primary" onClick={() => setNotice('')}>继续编辑</button></footer></CommunityModal>}</div>
}
export default function AskPage() { return <Suspense fallback={<div className="community-page forum-space community-empty">正在准备提问页…</div>}><AskQuestion /></Suspense> }
