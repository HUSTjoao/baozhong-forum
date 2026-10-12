'use client'

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowUpRight, Check, ChevronDown, Heart, MessageCircle, PenLine, Search, Share2, Upload, UserRound } from 'lucide-react'
import { CommunityModal } from '@/components/community/CommunityUI'
import { getAllUniversities } from '@/data/universities'
import { exampleProfile } from '@/data/example-profile'
import { type ProfileActivity, type ProfileData, type ProfileUser } from '@/lib/profile'
import './profile.css'
import ProfileActivityDeck from '@/components/profile/ProfileActivityDeck'
import ProfilePillNav from '@/components/profile/ProfilePillNav'

const GhostFibers = dynamic(() => import('@/components/profile/ReactBitsGhostFibers'), { ssr: false })
const StudentBadge = dynamic(() => import('@/components/profile/StudentBadge'), { ssr: false, loading: () => <div className="profile-badge-loading" aria-busy="true">正在制作校园名片…</div> })

type Tab = 'all' | 'question' | 'reply' | 'letter' | 'applications'
const labels = { question: '提出了问题', reply: '写下了回答', letter: '寄出了一封信' }
function dateLabel(value: string) { return new Date(value).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) }
function schoolName(value: string | null) { return getAllUniversities().find(u => u.id === value)?.name || value || '' }

async function avatarFromFile(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('请选择 5MB 以内的 JPG、PNG 或 WebP 图片。')
  const source = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    const side = Math.min(image.width, image.height)
    canvas.width = canvas.height = Math.min(384, side)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('图片处理失败，请重试。')
    context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height)
    for (let quality = .9; quality >= .4; quality -= .1) {
      const result = canvas.toDataURL('image/jpeg', quality)
      if (result.length <= 270000) return result
    }
    throw new Error('图片过大，请尝试更小的图片。')
  } finally { URL.revokeObjectURL(source) }
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const goBack = () => { if (window.history.length > 1) router.back(); else router.push('/') }
  const preview = process.env.NODE_ENV === 'development' && id === 'preview'
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(6)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [notice, setNotice] = useState('')
  const [reading, setReading] = useState<ProfileActivity | null>(null)
  const [draft, setDraft] = useState({ nickname: '', bio: '', universityId: '', major: '', graduationYear: '', avatarUrl: '' })
  const avatarInput = useRef<HTMLInputElement>(null)
  const [processingAvatar, setProcessingAvatar] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setData(null); setTab('all'); setShown(6); setQuery('')
    if (preview) { setData(structuredClone(exampleProfile)); setLoading(false); return () => controller.abort() }
    void fetch(`/api/users/${encodeURIComponent(id)}`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || '主页加载失败。')
      if (!controller.signal.aborted) setData(body)
    }).catch(err => { if (!controller.signal.aborted) setError(err.message || '主页加载失败。') }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, preview, retry])

  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3600); return () => clearTimeout(timer) }, [notice])
  const activities = useMemo(() => (data?.activities || []).filter(item => (tab === 'all' || item.kind === tab) && (!query.trim() || `${item.title} ${item.content} ${item.label}`.toLowerCase().includes(query.trim().toLowerCase()))), [data, tab, query])

  function beginEdit() {
    if (!data) return
    const user = data.user
    setDraft({ nickname: user.nickname || user.name, bio: user.bio || '', universityId: schoolName(user.universityId), major: user.major || '', graduationYear: user.graduationYear || (user.role === 'alumni' ? '' : 'gaoyi'), avatarUrl: user.avatarUrl || '' })
    setEditError(''); setEditing(true)
  }
  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setProcessingAvatar(true); setEditError('')
    try { const image = await avatarFromFile(file); setDraft(current => ({ ...current, avatarUrl: image })) }
    catch (err) { setEditError(err instanceof Error ? err.message : '图片处理失败。') }
    finally { setProcessingAvatar(false); event.target.value = '' }
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!data || !draft.nickname.trim()) return
    setSaving(true); setEditError('')
    try {
      let user: ProfileUser
      if (preview) { user = { ...data.user, ...draft, name: draft.nickname.trim(), nickname: draft.nickname.trim() } }
      else {
        const response = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || '保存失败。')
        user = body.user
        window.dispatchEvent(new Event('profile-updated'))
      }
      setData(current => current && { ...current, user }); setEditing(false)
      setNotice(preview ? '示例资料已更新，仅用于本次预览。' : '个人资料已保存。')
    } catch (err) { setEditError(err instanceof Error ? err.message : '保存失败。') }
    finally { setSaving(false) }
  }
  async function share() {
    try { await navigator.clipboard.writeText(location.href); setNotice('主页链接已复制。') }
    catch { setNotice('请复制浏览器地址栏中的主页链接。') }
  }

  if (loading || !data) return <div className="profile-page"><div className="profile-shell"><button type="button" className="profile-breadcrumb profile-return" onClick={goBack}><span className="profile-return-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M24 16H9m7-7-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 11v10" stroke="currentColor" strokeWidth="1" opacity=".25" strokeLinecap="round"/></svg></span><span className="profile-return-label">返回</span></button>{loading ? <div className="profile-loading" aria-busy="true"><div /><span /><p>正在打开这位同学的主页…</p></div> : <div className="profile-unavailable"><UserRound size={36} /><h1>{error || '这位同学的主页暂时不存在。'}</h1><button onClick={() => setRetry(n => n + 1)}>重新加载</button></div>}</div></div>
  const { user, stats, isOwner } = data
  const tabs: { id: Tab; title: string; count?: number }[] = [{ id: 'all', title: '动态' }, { id: 'question', title: '提问', count: stats.questions }, { id: 'reply', title: '回答', count: stats.replies }, { id: 'letter', title: '寄语', count: stats.letters }, ...(isOwner && data.applications.length ? [{ id: 'applications' as const, title: '我的申请', count: data.applications.length }] : [])]
  return <div className="profile-page">
    <div className="profile-shell">
      <div className="profile-topline"><button type="button" className="profile-breadcrumb profile-return" onClick={goBack}><span className="profile-return-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M24 16H9m7-7-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 11v10" stroke="currentColor" strokeWidth="1" opacity=".25" strokeLinecap="round"/></svg></span><span className="profile-return-label">返回</span></button>{preview && <span className="profile-preview-label">设计预览 · 人物与动态为虚构示例</span>}</div>
      <header className="profile-header profile-stage-header">
        <h1 className="profile-page-title">{user.name}</h1>
        <div className="profile-theatre">
          <div className="profile-light-backdrop" aria-hidden="true"><GhostFibers glowColor="#87aec5" lineColor="#c5e0eb" speed={.15} glow={1.6} brightness={1.3} vignette={.45} grain={.018} dpr={1} className="profile-ghost-fibers" /></div>
          <div className="profile-stage-badge"><StudentBadge user={user} school={schoolName(user.universityId)} stats={stats} actions={<>{isOwner && <button type="button" onClick={beginEdit} className="badge-edit"><PenLine size={17}/><span>编辑资料</span></button>}<button type="button" onClick={share} aria-label="分享个人主页"><Share2 size={17}/><span>分享</span></button></>} /></div>
        </div>
        <ProfilePillNav items={tabs} activeId={tab} onSelect={id => { setTab(id as Tab); setShown(6); setQuery('') }} />
      </header>
      <div className="profile-columns profile-stage-timeline">
        <section className="profile-feed" id="profile-content" role="tabpanel" aria-label={tabs.find(item => item.id === tab)?.title}>
          <div className="profile-feed-heading"><div><span className="profile-feed-line" /><h2>{tab === 'all' ? '全部动态' : tabs.find(item => item.id === tab)?.title}</h2></div>{tab !== 'applications' && <label className="profile-feed-search"><Search size={16} /><input aria-label="搜索主页内容" placeholder="搜索动态" value={query} onChange={e => { setQuery(e.target.value); setShown(6) }} /></label>}</div>
          {tab === 'applications' ? <div className="profile-application-list">{data.applications.map(item => <article key={`${item.kind}-${item.id}`}><div><span>{item.kind === 'university' ? '大学资料' : '专业资料'}</span><h3>{item.name}</h3></div><span className="profile-review-status" data-status={item.status}>{item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '未通过' : '待审核'}</span></article>)}</div> : activities.length ? <div className="profile-activity-deck-list"><ProfileActivityDeck key={`${tab}:${query}:${shown}`}>{activities.slice(0, shown).map((item, index) => <article key={`${item.kind}-${item.id}`} className={`profile-activity profile-activity-${item.kind}`} style={{ animationDelay: `${Math.min(index, 5) * 55}ms` }}>
            <div className="profile-activity-meta"><span className="profile-mini-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.name.slice(0, 1)}</span><div><strong>{user.name}</strong><span>{labels[item.kind]}{item.anonymous && ' · 匿名，仅自己可见'}{item.pending && ' · 待审核'}</span></div><time dateTime={item.date}>{dateLabel(item.date)}</time></div>
            <div className="profile-activity-body"><span className="profile-activity-topic">{item.label}</span><h3>{preview || item.kind === 'letter' ? <button onClick={() => setReading(item)}>{item.title}</button> : <Link href={item.href}>{item.title}</Link>}</h3><p>{item.content}</p></div>
            <footer><div><span><Heart size={16} />{item.likes}</span>{item.kind === 'question' && <span><MessageCircle size={16} />{item.replies} 条回答</span>}</div>{preview || item.kind === 'letter' ? <button onClick={() => setReading(item)}>{item.kind === 'letter' ? '展开这封信' : '读这条分享'}<ArrowUpRight size={17} /></button> : <Link href={item.href}>查看讨论<ArrowUpRight size={17} /></Link>}</footer>
          </article>)}</ProfileActivityDeck>{shown < activities.length && <button className="profile-load-more" onClick={() => setShown(n => n + 6)}>更多分享<ChevronDown size={18} /></button>}{((tab === 'question' && stats.questions > 40) || (tab === 'reply' && stats.replies > 40) || (tab === 'letter' && stats.letters > 40)) && <p className="profile-recent-note">这里展示最近 40 条分享。</p>}</div> : <div className="profile-empty"><div><MessageCircle size={32} /></div><h3>{query.trim() ? '没有找到这条分享' : '暂无动态'}</h3><p>{query.trim() ? '换个关键词，再找找看。' : isOwner ? '你发布的提问、回答和寄语会展示在这里。' : '这位同学还没有发布相关内容。'}</p>{isOwner && !query.trim() && <Link href={tab === 'letter' ? '/messages' : '/forum/ask'}>{tab === 'letter' ? '去看看寄语' : '写下一个问题'}<ArrowUpRight size={16} /></Link>}</div>}
        </section>
      </div>
    </div>
    <div className="profile-toast" role="status" aria-live="polite">{notice && <span><Check size={17} />{notice}</span>}</div>
    {reading && <CommunityModal title={reading.title} close={() => setReading(null)}><div className="profile-reading"><span>{preview ? '虚构示例 · 设计预览' : labels[reading.kind]}</span><h2>{reading.title}</h2><p>{reading.content}</p><footer>{user.name}<time>{dateLabel(reading.date)}</time></footer></div></CommunityModal>}
    {editing && <CommunityModal title="编辑个人资料" close={() => { if (!saving && !processingAvatar) setEditing(false) }}><form className="profile-editor" onSubmit={save}><h2>编辑个人资料</h2><p>{preview ? '示例编辑仅用于预览，不会写入数据库。' : '这些资料会展示在你的个人主页。'}</p><div className="profile-editor-avatar"><button type="button" onClick={() => avatarInput.current?.click()} disabled={processingAvatar} aria-label="上传头像">{draft.avatarUrl ? <img src={draft.avatarUrl} alt="头像预览" /> : <UserRound size={30} />}<span><Upload size={15} /></span></button><div><strong>{processingAvatar ? '正在处理图片…' : '换一张头像'}</strong><span>JPG / PNG / WebP · 5MB 以内</span></div><input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="profile-file-input" onChange={uploadAvatar} /></div><label>昵称<input value={draft.nickname} onChange={e => setDraft(d => ({ ...d, nickname: e.target.value }))} maxLength={24} required /></label><label>个人介绍<textarea aria-label="个人介绍" value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} maxLength={200} rows={3} placeholder="说说你喜欢的事，或愿意分享的经验。" /><span className="profile-input-count" aria-hidden="true">{draft.bio.length} / 200</span></label>{user.role === 'alumni' ? <div className="profile-editor-fields"><label>学校（选填）<input value={draft.universityId} onChange={e => setDraft(d => ({ ...d, universityId: e.target.value }))} maxLength={100} /></label><label>专业（选填）<input value={draft.major} onChange={e => setDraft(d => ({ ...d, major: e.target.value }))} maxLength={80} /></label><label>毕业年份（选填）<select value={draft.graduationYear} onChange={e => setDraft(d => ({ ...d, graduationYear: e.target.value }))}><option value="">暂不填写</option>{Array.from({ length: new Date().getFullYear() - 1994 }, (_, i) => new Date().getFullYear() - i).map(year => <option value={year} key={year}>{year} 年</option>)}</select></label></div> : <label>年级<select value={draft.graduationYear} onChange={e => setDraft(d => ({ ...d, graduationYear: e.target.value }))}><option value="gaoyi">高一</option><option value="gaoer">高二</option><option value="gaosan">高三</option></select></label>}{editError && <div className="profile-edit-error" role="alert">{editError}</div>}<footer><button type="button" disabled={saving || processingAvatar} onClick={() => setEditing(false)}>取消</button><button type="submit" disabled={saving || processingAvatar || !draft.nickname.trim()}><Check size={17} />{saving ? '正在保存…' : '保存资料'}</button></footer></form></CommunityModal>}
  </div>
}









