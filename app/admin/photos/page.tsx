'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import '../admin.css'
import './photos.css'

type Photo = { id: string; title: string; category: string; thumbnail: string; src: string; status: string; reviewNote?: string | null; createdAt: string; user?: { nickname?: string | null; username?: string | null } }
const labels: Record<string, string> = { pending: '待审核', approved: '已展示', rejected: '未通过' }
export default function PhotoReviewPage() {
  const { status: sessionStatus } = useSession()
  const [status, setStatus] = useState('pending'), [rows, setRows] = useState<Photo[]>([])
  const [cursor, setCursor] = useState<string | null>(null), [loading, setLoading] = useState(true)
  const [error, setError] = useState(''), [denied, setDenied] = useState(0), [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState<Photo | null>(null), [action, setAction] = useState<{ photo: Photo; status: string } | null>(null)
  const [note, setNote] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const previewDialog = useRef<HTMLDialogElement>(null)
  const reviewDialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (selected) previewDialog.current?.showModal(); else previewDialog.current?.close() }, [selected])
  useEffect(() => { if (action) reviewDialog.current?.showModal(); else reviewDialog.current?.close() }, [action])
  useEffect(() => {
    if (sessionStatus === 'loading') return
    const controller = new AbortController(); setLoading(true); setError(''); setRows([]); setCursor(null)
    fetch(`/api/campus-photos?scope=admin&status=${status}`, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const body = await response.json()
      if (!response.ok) { setDenied(response.status); throw Error(body.error || '照片加载失败') }
      setDenied(0); setRows(body.items); setCursor(body.nextCursor)
    }).catch(cause => { if (!controller.signal.aborted) setError(cause.message) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [status, revision, sessionStatus])
  async function more() {
    if (!cursor || loading) return
    setLoading(true)
    try {
      const response = await fetch(`/api/campus-photos?scope=admin&status=${status}&cursor=${cursor}`, { cache: 'no-store' })
      const body = await response.json(); if (!response.ok) throw Error(body.error || '加载失败')
      setRows(previous => [...previous, ...body.items]); setCursor(body.nextCursor)
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : '加载失败，请重试') }
    finally { setLoading(false) }
  }
  async function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!action || busy) return
    setBusy(true); setNotice('')
    try {
      const response = await fetch(`/api/campus-photos/${action.photo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action.status, note }) })
      const body = await response.json(); if (!response.ok) throw Error(body.error || '审核未完成')
      setNotice(action.status === 'approved' ? '已通过审核，这张照片现在可以在首页照片墙展示。' : '已设为未通过，照片不会公开展示。')
      setAction(null); setRevision(value => value + 1)
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : '操作失败，请重试') }
    finally { setBusy(false) }
  }
  return <main className="admin-workspace"><header className="admin-masthead"><Link href="/admin">← 返回管理后台</Link><span>校园照片审核</span><Link href="/#campus-gallery">查看照片墙 →</Link></header>
    <section className="admin-intro"><div><p>校园记忆 · 共同收藏</p><h1>让每一张照片，安心被看见。</h1></div></section>
    <section className="admin-content"><div className="admin-list-heading"><div><h2>用户照片投稿</h2></div><button aria-label="刷新照片审核列表" onClick={() => setRevision(value => value + 1)} disabled={loading}>↻</button></div><p className="photo-review-explain">用户上传的照片先进入待审核列表。检查图片和标题后，点击通过才会公开展示；已展示照片也可以重新设为未通过。</p>
      <nav className="admin-report-tabs" aria-label="照片审核状态">{Object.entries(labels).map(([key, label]) => <button key={key} aria-pressed={status === key} onClick={() => { setStatus(key); setNotice('') }}>{label}</button>)}</nav>
      {notice && !action && <p className="admin-notice" role="status">{notice}</p>}
      {error ? <div className="admin-empty" role="alert"><p>{error}</p>{denied === 401 ? <Link href="/auth/login?callbackUrl=%2Fadmin%2Fphotos">登录后继续</Link> : denied === 403 ? <Link href="/">返回网站</Link> : <button onClick={() => setRevision(value => value + 1)}>重新加载</button>}</div> : !rows.length ? <p className="admin-empty" role="status">{loading ? '正在读取照片…' : '这个列表暂时没有照片。'}</p> : <div className="photo-review-grid">{rows.map(photo => <article key={photo.id} className="photo-review-card"><button type="button" className="photo-review-preview" aria-label={`放大查看${photo.title}`} onClick={() => setSelected(photo)}><img src={photo.thumbnail} alt={photo.title} loading="lazy" /></button><div><p>{photo.category} · {new Date(photo.createdAt).toLocaleDateString('zh-CN')}</p><h3>{photo.title}</h3><p>投稿人 · {photo.user?.nickname || photo.user?.username || '用户'}</p>{photo.reviewNote && <p>审核说明：{photo.reviewNote}</p>}<footer>{photo.status !== 'approved' && <button onClick={() => { setAction({ photo, status: 'approved' }); setNote(''); setNotice('') }}>通过并展示</button>}{photo.status !== 'rejected' && <button onClick={() => { setAction({ photo, status: 'rejected' }); setNote(''); setNotice('') }}>{photo.status === 'approved' ? '撤下展示' : '不通过'}</button>}</footer></div></article>)}</div>}
      {cursor && <div className="admin-pagination"><button disabled={loading} onClick={() => void more()}>{loading ? '正在读取…' : '加载更多照片'}</button></div>}
    </section>
    <dialog ref={previewDialog} className="photo-review-lightbox" aria-label={selected?.title || '照片预览'} onCancel={() => setSelected(null)}>{selected && <><button autoFocus aria-label="关闭照片预览" onClick={() => setSelected(null)}>×</button><img src={selected.src} alt={selected.title} /><p>{selected.title}</p></>}</dialog>
    <dialog ref={reviewDialog} className="photo-review-confirm" aria-labelledby="photo-review-confirm-title" onCancel={event => { if (busy) event.preventDefault(); else setAction(null) }}>{action && <form className="admin-dialog" onSubmit={review}><h2 id="photo-review-confirm-title">{action.status === 'approved' ? '通过并公开这张照片？' : '这张照片暂不展示'}</h2><p>{action.photo.title}</p><label className="photo-review-note">审核说明{action.status === 'rejected' ? '（必填）' : '（选填）'}<textarea autoFocus value={note} onChange={event => setNote(event.target.value)} maxLength={200} minLength={action.status === 'rejected' ? 2 : undefined} required={action.status === 'rejected'} disabled={busy} /></label>{notice && <p role="alert">{notice}</p>}<div><button type="button" disabled={busy} onClick={() => setAction(null)}>取消</button><button disabled={busy}>{busy ? '正在保存…' : '确认审核'}</button></div></form>}</dialog>
  </main>
}
