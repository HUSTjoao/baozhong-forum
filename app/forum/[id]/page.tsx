'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ArrowUpRight, ChevronDown, MessageCircle, MoreHorizontal, PenLine, Send, Share2, ThumbsUp, X } from 'lucide-react'
import { questionsApi, repliesApi, reportsApi, formatRelativeTime, type Question, type Reply } from '@/lib/api-client'
import { discussionTree } from '@/lib/discussion-tree'
import { exampleQuestions, isExampleQuestion } from '@/data/example-questions'
import { CommunityModal } from '@/components/community/CommunityUI'
import GradientWaves from '@/components/community/ReactBitsGradientWaves'
import './thread.css'

type Target = { type: 'question' | 'reply'; id: string; content: string; title?: string }
function Author({ name, id, anonymous, avatar, date }: { name: string; id?: string; anonymous?: boolean; avatar?: string; date: string }) {
 const display = anonymous ? '匿名同学' : name || '一位同学'
 const identity = <><span className="qd-avatar">{!anonymous && avatar ? <img src={avatar} alt=""/> : display.slice(0,1)}</span><strong>{display}</strong></>
 return <div className="qd-author">{!anonymous && id ? <Link href={`/users/${id}`}>{identity}</Link> : <span>{identity}</span>}<time dateTime={date}>{formatRelativeTime(date)}</time></div>
}
function AnonymousSwitch({ checked, change, disabled }: { checked: boolean; change: (value: boolean) => void; disabled?: boolean }) {
 return <button type="button" className="qd-anonymous" role="switch" aria-label="匿名发表" aria-checked={checked} disabled={disabled} onClick={()=>change(!checked)}><span aria-hidden="true"><i/></span>匿名发表</button>
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
 const { data: session } = useSession(), router = useRouter()
 const demo = process.env.NODE_ENV === 'development' && isExampleQuestion(params.id)
 const [question,setQuestion] = useState<Question|null>(null), [loading,setLoading] = useState(true), [error,setError] = useState('')
 const [draft,setDraft] = useState(''),[anonymous,setAnonymous] = useState(false),[composer,setComposer] = useState(false)
 const [sort,setSort] = useState<'popular'|'new'>('popular'),[pending,setPending] = useState(''),[notice,setNotice] = useState('')
 const [commenting,setCommenting] = useState<Reply|null>(null),[comment,setComment] = useState(''),[commentAnonymous,setCommentAnonymous] = useState(false)
 const [opened,setOpened] = useState<Set<string>>(new Set()),[expanded,setExpanded] = useState<Set<string>>(new Set())
 const [deleting,setDeleting] = useState<Target|null>(null),[reporting,setReporting] = useState<Target|null>(null),[reason,setReason] = useState('')
 const [related,setRelated] = useState<Question[]>([])
 const input=useRef<HTMLTextAreaElement>(null),answerArea=useRef<HTMLElement>(null)
 const userId=session?.user?.id, admin=session?.user?.role==='admin'
 const viewerId=userId||(demo?'preview':undefined)
 const canUse = () => {
  if (demo) return true
  if (!userId) {setNotice('登录后就可以回答、评论和赞同。');return false}
  if ((session?.user as typeof session.user & {isMuted?:boolean})?.isMuted) {setNotice('你的账号暂时无法参与讨论。');return false}
  return true
 }
 useEffect(()=>{
  let cancelled=false;setLoading(true);setError('');setQuestion(null);setComposer(false);setDraft('');setOpened(new Set());setExpanded(new Set());setRelated([]);setCommenting(null)
  if(demo){const example=exampleQuestions.find(q=>q.id===params.id);if(example){setQuestion({...example,replies:example.exampleReplies.map((content,index)=>({id:`${example.id}-answer-${index}`,questionId:example.id,content,date:example.date,likes:index===0?12:4,isAnonymous:false,replierName:`示例同学 ${index+1}`,children:[]}))});setRelated(exampleQuestions.filter(q=>q.id!==params.id&&q.category===example.category).slice(0,4))}else setError('示例讨论不存在');setLoading(false);return}
  void questionsApi.get(params.id).then(q=>{if(!cancelled){setQuestion(q);void questionsApi.list(undefined,q.majorId?{majorId:q.majorId}:q.universityId?{universityId:q.universityId}:undefined).then(items=>{if(!cancelled)setRelated(items.filter(item=>item.id!==q.id).slice(0,4))}).catch(()=>{})}}).catch(e=>{if(!cancelled)setError(e.message||'无法加载讨论')}).finally(()=>{if(!cancelled)setLoading(false)})
  return()=>{cancelled=true}
 },[params.id])
 useEffect(()=>{if(composer)input.current?.focus({preventScroll:true})},[composer])
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer)},[notice])
 const answers=useMemo(()=>discussionTree(question?.replies||[]).sort((a,b)=>sort==='popular'?b.likes-a.likes||Date.parse(b.date)-Date.parse(a.date):Date.parse(b.date)-Date.parse(a.date)),[question,sort])
 async function run(key:string,action:()=>Promise<void>){if(pending)return;setPending(key);try{await action()}catch(e){setNotice(e instanceof Error?e.message:'操作失败，请稍后重试。')}finally{setPending('')}}
 async function refresh(){if(!demo)setQuestion(await questionsApi.get(params.id))}
 async function vote(id?:string){
  if(demo){setQuestion(q=>{if(!q)return q;const flip=(item:{likes:number;likesRel?:{userId:string}[]})=>{const liked=item.likesRel?.some(l=>l.userId===viewerId);return{...item,likes:item.likes+(liked?-1:1),likesRel:liked?item.likesRel?.filter(l=>l.userId!==viewerId):[...(item.likesRel||[]),{userId:viewerId!}]}};return id?{...q,replies:q.replies?.map(r=>r.id===id?{...r,...flip(r)}:r)}:{...q,...flip(q)}});return}
  if(id)await repliesApi.toggleLike(params.id,id);else await questionsApi.toggleLike(params.id);await refresh()
 }
 async function publish(content:string,hidden:boolean,parentReplyId?:string){
  if(demo){setQuestion(q=>q?{...q,repliesCount:q.repliesCount+1,replies:[...(q.replies||[]),{id:crypto.randomUUID(),questionId:q.id,content,isAnonymous:hidden,parentReplyId,replierName:hidden?'匿名同学':'示例体验者',date:new Date().toISOString(),likes:0}]}:q);return}
  await repliesApi.create(params.id,{content,isAnonymous:hidden,parentReplyId});await refresh()
 }
 function answer(){setComposer(true);requestAnimationFrame(()=>input.current?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'}))}
 async function share(){try{await navigator.clipboard.writeText(location.href);setNotice('讨论链接已复制。')}catch{setNotice('请复制地址栏中的讨论链接。')}}
 function toggle(setter:typeof setOpened,id:string){setter(current=>{const next=new Set(current);next.has(id)?next.delete(id):next.add(id);return next})}
 const fallback=question?.majorId?`/majors/${question.majorId}/forum`:question?.universityId?`/universities/${question.universityId}/forum`:'/forum'
 function back(){if(history.length>1)router.back();else router.push(fallback)}
 function operations(target:Target,owner?:string){return <details className="qd-more"><summary aria-label="更多操作"><MoreHorizontal size={21}/></summary><div><button onClick={share}><Share2 size={16}/>复制链接</button>{userId&&<button onClick={()=>{setReason('');setReporting(target)}}>举报内容</button>}{userId&&(owner===userId||admin)&&<button className="qd-danger" onClick={()=>setDeleting(target)}>删除{target.type==='question'?'问题':'回答'}</button>}</div></details>}
 function replyItem(reply:Reply,depth=0):React.ReactNode {
  const name=reply.isAnonymous?'匿名同学':reply.replier?.nickname||reply.replier?.name||reply.replierName||'一位同学'
  const children=reply.children||[],liked=!!viewerId&&!!reply.likesRel?.some(l=>l.userId===viewerId)
  const long=reply.content.length>280,show=expanded.has(reply.id)
  return <article className={depth?'qd-comment':'qd-answer'} key={reply.id}>
   <header><Author name={name} id={reply.replierId} anonymous={reply.isAnonymous} avatar={reply.replier?.avatarUrl} date={reply.date}/>{operations({type:'reply',id:reply.id,content:reply.content},reply.replierId)}</header>
   <div className={'qd-answer-text'+(long&&!show?' qd-text-collapsed':'')}>{reply.content.split(/\n+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>
   {long&&<button className="qd-read-more" onClick={()=>toggle(setExpanded,reply.id)}>{show?'收起全文':'阅读全文'}<ChevronDown size={17}/></button>}
   <footer><button className="qd-vote" aria-label={`赞同回答：${reply.likes}`} aria-pressed={liked} disabled={!!pending} onClick={()=>canUse()&&void run('vote-'+reply.id,async()=>{await vote(reply.id)})}><ThumbsUp size={18}/>赞同<span>{reply.likes}</span></button><button onClick={()=>{toggle(setOpened,reply.id)}} aria-expanded={opened.has(reply.id)}><MessageCircle size={18}/>{children.length?`${children.length} 条评论`:'评论'}</button><button onClick={()=>{setComment('');setCommenting(reply)}}>回复</button></footer>
   {opened.has(reply.id)&&children.length>0&&<div className="qd-comments">{children.map(child=>replyItem(child,depth+1))}</div>}
  </article>
 }
 return <main className="qd-page">
  <div className="qd-background" aria-hidden="true"><GradientWaves horizonColor="#ecebe5" waveColor="#54758b" crestColor="#b6c9d7" speed={.25} amplitude={2.5} waveScale={.6} waveRatio={.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={30} detail="low" brightness={1.05} opacity={1} mouseInteraction={false} parallaxStrength={0} grain grainIntensity={.025} className=""/></div>
  <div className="qd-shell"><div className="qd-topbar"><button onClick={back}><ArrowLeft size={21}/>返回</button><Link href="/forum">问答论坛<ArrowUpRight size={18}/></Link></div>
   {loading?<div className="qd-loading" aria-busy="true">正在打开讨论…</div>:!question?<div className="qd-loading"><h1>这条讨论暂时无法打开</h1><p>{error}</p><button onClick={()=>location.reload()}>重新加载</button></div>:<>
   <section className="qd-question"><div className="qd-topic">{demo&&<span className="qd-demo-label">示例讨论 · </span>}{question.major?.name||question.university?.name||question.category||'校园交流'}</div><h1>{question.title}</h1><Author name={question.asker?.nickname||question.asker?.name||question.askerName} id={question.askerId} anonymous={question.isAnonymous} avatar={question.asker?.avatarUrl} date={question.date}/>{question.content!==question.title&&<p className="qd-question-text">{question.content}</p>}<div className="qd-question-actions"><button className="qd-answer-entry" onClick={answer}><PenLine size={20}/>写回答</button><button className="qd-vote" aria-label={`赞同问题：${question.likes}`} aria-pressed={!!viewerId&&!!question.likesRel?.some(l=>l.userId===viewerId)} disabled={!!pending} onClick={()=>canUse()&&void run('question-vote',async()=>{await vote()})}><ThumbsUp size={18}/>赞同<span>{question.likes}</span></button><button onClick={()=>answerArea.current?.scrollIntoView({block:'start',behavior:'smooth'})}><MessageCircle size={19}/>{answers.length} 个回答</button>{operations({type:'question',id:question.id,content:question.content,title:question.title},question.askerId)}</div></section>
   <div className="qd-body"><section className="qd-conversation" ref={answerArea}>
    {composer&&<form className="qd-composer" onSubmit={e=>{e.preventDefault();if(!canUse()||!draft.trim())return;void run('answer',async()=>{await publish(draft.trim(),anonymous);setDraft('');setComposer(false);setNotice(demo?'示例回答已加入，仅本次预览可见。':'回答已发表。')})}}><header><h2>写下你的回答</h2><button type="button" aria-label="收起回答编辑器" onClick={()=>setComposer(false)}><X size={21}/></button></header><textarea ref={input} aria-label="回答内容" placeholder="分享你的经历、判断，或一个具体的建议…" value={draft} onChange={e=>setDraft(e.target.value)} required rows={5} maxLength={3000}/><div><AnonymousSwitch checked={anonymous} change={setAnonymous}/><span className="qd-count">{draft.length} / 3000</span><button className="qd-answer-entry" disabled={!!pending||!draft.trim()} type="submit">{pending==='answer'?'发表中…':'发表回答'}<Send size={18}/></button></div>{!userId&&!demo&&<Link className="qd-login" href={`/auth/login?callbackUrl=${encodeURIComponent('/forum/'+params.id)}`}>登录后发表回答<ArrowUpRight size={17}/></Link>}</form>}
    <div className="qd-answer-heading"><h2>回答<span>{answers.length}</span></h2><div><button aria-pressed={sort==='popular'} onClick={()=>setSort('popular')}>推荐</button><button aria-pressed={sort==='new'} onClick={()=>setSort('new')}>最新</button></div></div>
    <div className="qd-answers">{answers.length?answers.map(reply=>replyItem(reply)):<div className="qd-empty"><MessageCircle size={30}/><h3>还没有回答</h3><p>你的经历，可能正好是另一位同学需要的答案。</p><button onClick={answer}>写第一个回答<ArrowUpRight size={18}/></button></div>}</div>
   </section>{related.length>0&&<aside className="qd-related"><h2>继续看看</h2>{related.map(item=><Link key={item.id} href={`/forum/${item.id}`}><strong>{item.title}</strong><span>{item.repliesCount} 条回应<ArrowUpRight size={17}/></span></Link>)}</aside>}</div>
   </>}
  </div>
  <div className="qd-notice" role="status" aria-live="polite">{notice&&<span>{notice}</span>}</div>
  {commenting&&<CommunityModal className="qd-dialog" title="回复回答" close={()=>setCommenting(null)}><form onSubmit={e=>{e.preventDefault();if(!canUse()||!comment.trim())return;void run('comment',async()=>{await publish(comment.trim(),commentAnonymous,commenting.id);setOpened(current=>new Set([...current,commenting.id]));setCommenting(null);setComment('');setNotice(demo?'示例评论已加入，仅本次预览可见。':'评论已发表。')})}}><h2>回复{commenting.isAnonymous?'匿名同学':commenting.replier?.nickname||commenting.replierName||'这位同学'}</h2><blockquote>{commenting.content.slice(0,140)}{commenting.content.length>140?'…':''}</blockquote><textarea autoFocus aria-label="评论内容" value={comment} onChange={e=>setComment(e.target.value)} placeholder="接着聊聊你的想法…" required rows={4} maxLength={3000}/><footer><AnonymousSwitch checked={commentAnonymous} change={setCommentAnonymous}/><button className="qd-answer-entry" type="submit" disabled={!!pending||!comment.trim()}>发表评论<Send size={18}/></button></footer></form></CommunityModal>}
  {deleting&&<CommunityModal className="qd-dialog" title="删除内容" close={()=>setDeleting(null)}><h2>删除这条{deleting.type==='question'?'问题':'回答'}？</h2><p>下方的相关评论也会被删除。</p><footer><button onClick={()=>setDeleting(null)}>取消</button><button className="qd-answer-entry" disabled={!!pending} onClick={()=>void run('delete',async()=>{if(demo){if(deleting.type==='question')router.push('/forum');else setQuestion(q=>{if(!q)return q;const ids=new Set([deleting.id]);let size=0;while(size!==ids.size){size=ids.size;q.replies?.forEach(r=>{if(r.parentReplyId&&ids.has(r.parentReplyId))ids.add(r.id)})}const replies=q.replies?.filter(r=>!ids.has(r.id))||[];return{...q,replies,repliesCount:replies.length}});setDeleting(null);return}if(deleting.type==='question'){await questionsApi.delete(params.id);router.push(fallback)}else{await repliesApi.delete(params.id,deleting.id);await refresh()}setDeleting(null)})}>确认删除</button></footer></CommunityModal>}
  {reporting&&<CommunityModal className="qd-dialog" title="举报内容" close={()=>setReporting(null)}><form onSubmit={e=>{e.preventDefault();void run('report',async()=>{if(!demo)await reportsApi.create({type:reporting.type,targetId:reporting.id,targetContent:reporting.content,targetTitle:reporting.title,questionId:params.id,reason:reason.trim()});setReporting(null);setNotice(demo?'示例模式不会提交举报。':'举报已提交。')})}}><h2>举报内容</h2><textarea aria-label="举报原因" value={reason} onChange={e=>setReason(e.target.value)} placeholder="描述需要处理的问题…" required maxLength={1000} rows={4}/><footer><button type="button" onClick={()=>setReporting(null)}>取消</button><button className="qd-answer-entry" type="submit" disabled={!!pending||!reason.trim()}>提交举报</button></footer></form></CommunityModal>}
 </main>
}
