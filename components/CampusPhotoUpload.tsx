'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Camera, Upload, X } from 'lucide-react'
import { campusPhotoCategories, campusPhotoUploadLimit } from '@/lib/campus-photos-shared'

type Submission = { id: string; title: string; status: string; thumbnail: string; reviewNote?: string | null }
const statusLabel: Record<string, string> = { pending: '等待审核', approved: '已在照片墙展示', rejected: '暂未通过' }
export default function CampusPhotoUpload() {
  const { data: session, status } = useSession()
  const dialog = useRef<HTMLDialogElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file); setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  async function loadSubmissions() {
    try { const response = await fetch('/api/campus-photos?scope=mine', { cache: 'no-store' }); const body = await response.json(); if (response.ok) setSubmissions(body.items) } catch { /* Upload success does not depend on the history refresh. */ }
  }
  function open() { setError(''); setNotice(''); dialog.current?.showModal(); if (session) void loadSubmissions() }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !file) { if (!file) setError('先选一张你想分享的校园照片。'); return }
    const form = event.currentTarget
    const data = new FormData(form); data.set('photo', file)
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/campus-photos', { method: 'POST', body: data })
      const body = await response.json().catch(() => null)
      if (!response.ok) throw Error(body?.error || (response.status === 413 ? '图片过大，请选择 8 MB 以内的图片。' : '上传未完成，请稍后再试。'))
      setNotice(body.message); setFile(null); form.reset(); await loadSubmissions()
    } catch (cause) { setError(cause instanceof Error ? cause.message : '网络暂时不可用，请稍后重试。') }
    finally { setBusy(false) }
  }
  return <>
    <button type="button" className="campus-upload-trigger" onClick={open}><Camera size={18} />分享我的校园照片</button>
    <dialog ref={dialog} className="campus-upload-dialog" aria-labelledby="campus-upload-title" onCancel={event => { if (busy) event.preventDefault() }}>
      <button type="button" className="campus-upload-close" aria-label="关闭上传窗口" disabled={busy} onClick={() => dialog.current?.close()}><X size={22} /></button>
      <p className="campus-upload-eyebrow">BAOZHONG / YOUR PERSPECTIVE</p>
      <h2 id="campus-upload-title">把你眼里的宝中，留在这里。</h2>
      <p className="campus-upload-intro">一束光、一条熟悉的小路，或一个值得记住的课间。</p>
      {status === 'loading' ? <p role="status">正在确认登录状态…</p> : !session ? <div className="campus-upload-login"><Camera size={36} /><p>登录后，就能分享你的校园照片。</p><Link href="/auth/login?callbackUrl=%2F%23campus-gallery">去登录</Link></div> : <>
        <form onSubmit={submit} className="campus-upload-form">
          <label className="campus-upload-picker" aria-disabled={busy}>
            {preview ? <img src={preview} alt="待上传照片预览" /> : <><Upload size={30} /><strong>选一张校园照片</strong><span>JPG、PNG 或 WebP · 不超过 8 MB</span></>}
            <input ref={fileInput} name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} aria-label="选择校园照片" onChange={event => {
              const picked = event.target.files?.[0]; setError(''); setNotice('')
              if (!picked) { setFile(null); return }
              if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type) || picked.size > campusPhotoUploadLimit) { setError('请选择 8 MB 以内的 JPG、PNG 或 WebP 图片。'); event.target.value = ''; setFile(null); return }
              setFile(picked)
            }} />
          </label>
          {file && <div className="campus-upload-file"><span>{file.name}</span><button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>换一张</button></div>}
          <div className="campus-upload-fields"><label>给照片起个名字<input name="title" required minLength={2} maxLength={40} placeholder="例如：晚自习前的那束光" disabled={busy} /></label><label>照片分类<select name="category" disabled={busy}>{campusPhotoCategories.map(category => <option key={category}>{category}</option>)}</select></label></div>
          <label className="campus-upload-consent"><input type="checkbox" name="consent" value="yes" required disabled={busy} /><span>这是我拍摄或已获授权的校园照片，可以在本站展示。</span></label>
          <p className="campus-upload-hint">照片会自动压缩并移除拍摄位置等元数据，审核通过后公开展示。每天最多投稿 10 张，待审核最多 5 张。</p>
          {error && <p role="alert" className="campus-upload-error">{error}</p>}{notice && <p role="status" className="campus-upload-success">{notice}</p>}
          <button type="submit" className="campus-upload-submit" disabled={busy || !file}>{busy ? '正在上传，请稍候…' : '提交照片，等待审核'}</button>
        </form>
        {!!submissions.length && <section className="campus-upload-history" aria-label="我的照片投稿"><h3>我的最近投稿</h3>{submissions.slice(0, 10).map(item => <article key={item.id}><img src={item.thumbnail} alt="" loading="lazy" /><div><strong>{item.title}</strong><span>{statusLabel[item.status] || '处理中'}</span>{item.reviewNote && <p>{item.reviewNote}</p>}</div></article>)}</section>}
        {session.user.role === 'admin' && <Link className="campus-upload-admin" href="/admin/photos">进入照片审核 →</Link>}
      </>}
    </dialog>
  </>
}
