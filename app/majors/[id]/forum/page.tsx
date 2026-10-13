'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MajorDiscussion from '@/components/majors/MajorDiscussion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { majors as builtInMajors, majorAliases, type Major, type MajorCategory } from '@/data/majors'
import { majorEnglishNames } from '@/data/major-english-names'
import { getMajorApplications, getMajorExploration } from '@/data/major-exploration'
import { questionsApi, type Question } from '@/lib/api-client'

import { AlertDialog } from '@/components/Dialog'
import MajorCardArtwork from '@/components/majors/MajorCardArtwork'
import MajorFitArtwork from '@/components/majors/MajorFitArtwork'
import useMajorNavigation from '@/components/majors/useMajorNavigation'
import '../../majors.css'
import './major-detail.css'

const fieldNames: Record<MajorCategory, string> = { arts: '文科', science: '理科', engineering: '工科', medicine: '医科', other: '其他' }
const fitLabels = ['你的好奇心', '你的学习方式', '你愿意投入的事']

export default function MajorForumPage({ params }: { params: { id: string } }) {
  const navigateMajor = useMajorNavigation()

  const pageRef = useRef<HTMLDivElement>(null)

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [camera, setCamera] = useState(0)
  const [major, setMajor] = useState<Major>()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)





  const [alert, setAlert] = useState<{ title: string; message?: string } | null>(null)
  const [returnField, setReturnField] = useState<MajorCategory>()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    void (async()=>{
    let found = builtInMajors.find(item=>item.id===(majorAliases[params.id]||params.id))
    if(!found){const response=await fetch('/api/catalog/majors',{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('专业资料暂时无法加载');const catalog:Major[]=await response.json();found=catalog.find(item=>item.id===params.id)}
    if(controller.signal.aborted)return
    setMajor(found)
    try {
      const previous = JSON.parse(sessionStorage.getItem('major-catalog-return') || 'null')
      setReturnField(previous?.majorId === found?.id && previous.field in fieldNames ? previous.field : found?.category)
    } catch { setReturnField(found?.category) }
    setQuestions([])
    if (found) void questionsApi.list(controller.signal,{majorId:found.id}).then(setQuestions).catch(error=>{if(!controller.signal.aborted)setAlert({title:'讨论加载失败',message:error.message})})
    setCamera(0); setLoading(false)
    })().catch(error=>{if(!controller.signal.aborted){setAlert({title:'资料加载失败',message:error.message});setLoading(false)}})
    return () => controller.abort()
  }, [params.id])

  useEffect(() => {
    if (!major || !pageRef.current) return
    const root = pageRef.current
    const header = document.querySelector('.site-header')
    const updateHeader = () => root.style.setProperty('--detail-header-height', `${header?.getBoundingClientRect().height ?? 84}px`)
    updateHeader()
    const resize = new ResizeObserver(updateHeader)
    if (header) resize.observe(header)
    return () => resize.disconnect()
  }, [major])

  function goTo(id: string) {
    const index = ['overview', 'future', 'fit'].indexOf(id)
    if (index >= 0) setCamera(index)
    document.getElementById(index >= 0 ? 'major-camera' : id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  useEffect(() => {
    const stage = pageRef.current?.querySelector<HTMLElement>('.md-camera-stage')
    if (!stage) return
    const panels = Array.from(stage.querySelectorAll<HTMLElement>('.md-camera-panel'))
    const update = () => {
      const overviewHeight = panels[0]?.scrollHeight || 0
      const fitTop = Math.ceil(overviewHeight * .67 + 100)
      stage.style.setProperty('--scene-fit-top', `${fitTop}px`)
      const bottom = Math.max(...panels.map((panel, index) => {
        const focused = panel.classList.contains('is-focused')
        const scale = camera < 0 ? .67 : focused ? 1 : .67
        const top = index === 2 && !focused ? fitTop : focused ? 75 : 42
        return top + panel.scrollHeight * scale
      }))
      stage.style.setProperty('--scene-content-height', `${Math.ceil(Math.max(900, bottom + 120))}px`)
    }
    const observer = new ResizeObserver(update)
    panels.forEach(panel => observer.observe(panel))
    update()
    return () => observer.disconnect()
  }, [major, camera])

  function trackCamera(index: number, pointerType: string) {
    cancelCameraHover()
    if (pointerType !== 'mouse' || camera === index) return
    hoverTimer.current = setTimeout(() => {
      hoverTimer.current = null
      setCamera(index)
    }, 120)
  }

  function cancelCameraHover() {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  useEffect(() => () => cancelCameraHover(), [])

  if (loading) return <div className="md-state" role="status">正在打开专业档案…</div>
  if (!major) return <div className="md-state"><h1>暂未找到这个专业</h1><Link href="/majors">返回专业认知</Link></div>

  const profile = getMajorExploration(major)
  const intro = (major.description.match(/[^。！？]+[。！？]?/g) ?? [major.description]).filter(sentence => !/毕业|就业|所学知识可用于/.test(sentence))
  const returnHref = '/majors?field=' + (returnField || major.category) + '&resume=1'

  return <div ref={pageRef} className={'major-detail md-field-' + major.category}>
    <AlertDialog open={!!alert} title={alert?.title || ''} message={alert?.message} onClose={() => setAlert(null)} />
    <div className="md-atmosphere" aria-hidden="true"><i /><i /><i /></div>
    <div className="md-wrap">
      <header className="md-hero">
        <div className="md-hero-top"><Link href={returnHref} className="md-back" aria-label="返回专业列表" onClick={event => navigateMajor(event, 'back')}><span className="md-back-orbit" aria-hidden="true"><ArrowLeft size={23} /></span><span className="md-back-label">返回</span></Link></div>
        <div className="md-hero-copy"><span className="md-hero-english" lang="en">{majorEnglishNames[major.name] || 'Explore your possibilities'}</span><h1 className={major.name.length > 10 ? 'md-long-name' : undefined}>{major.name}</h1></div>
        <div className="md-hero-art" aria-hidden="true"><MajorCardArtwork field={major.category} /></div>

      </header>

      <div className="md-detail-layout">
      <div className="md-detail-content">
      <div id="major-camera" className="md-profile-composition md-camera-stage" data-camera={camera} aria-label="专业资料，聚焦查看三个部分">
      <div className="md-camera-controls"><button className="md-camera-reset" type="button" aria-label="恢复三个部分总览" aria-pressed={camera < 0} onClick={() => setCamera(-1)}><svg className="md-overview-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><rect className="md-overview-tile md-overview-tile-main" x="4" y="5" width="11" height="14" rx="2.5" fill="currentColor" fillOpacity=".12" /><rect className="md-overview-tile md-overview-tile-right" x="19" y="8" width="9" height="11" rx="2.5" /><rect className="md-overview-tile md-overview-tile-bottom" x="7" y="23" width="12" height="5" rx="2" /><path d="M1 10V4a3 3 0 0 1 3-3h6m12 30h6a3 3 0 0 0 3-3v-6" strokeOpacity=".35" /></svg><span>总览</span></button></div>
      <div className="md-camera-track">

      <section id="overview" tabIndex={0} aria-label="专业介绍" className={'md-section md-overview md-camera-panel' + (camera === 0 ? ' is-focused' : '')} onPointerMove={event => trackCamera(0, event.pointerType)} onPointerLeave={cancelCameraHover} onFocusCapture={() => setCamera(0)} onClick={() => { if (camera !== 0) setCamera(0) }}>
        <div className="md-section-heading"><h2>专业介绍</h2></div>
        <div className="md-overview-grid"><div className="md-introduction">{intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><aside className="md-study-note"><span className="md-note-mark" aria-hidden="true">“</span><h3>它不只是一门课，<br />也是一种看待问题的方式。</h3><p>{profile.interests[0]}，可以成为了解这个专业的起点。</p><button type="button" onClick={() => goTo('fit')}>看看它与你的联系<ArrowUpRight size={17} /></button></aside></div>
      </section>

      <section id="future" tabIndex={0} aria-label="未来前景" className={'md-section md-future md-camera-panel' + (camera === 1 ? ' is-focused' : '')} onPointerMove={event => trackCamera(1, event.pointerType)} onPointerLeave={cancelCameraHover} onFocusCapture={() => setCamera(1)} onClick={() => setCamera(1)}>
        <div className="md-section-heading"><h2>未来前景</h2></div>
        <p className="md-section-lead">{profile.direction}</p>
        <div className="md-path-grid"><article className="md-path-card md-career"><span className="md-path-kicker">从学习，到实践</span><h3>可以走向哪些领域</h3><p>{getMajorApplications(major)}</p><div className="md-direction-tags">{profile.paths.map(path => <span key={path}>{path}</span>)}</div></article><article className="md-path-card md-further"><span className="md-path-kicker">把一个问题，继续研究下去</span><h3>进一步学习的方向</h3><p>{profile.furtherStudy}</p><div className="md-growth-line" aria-hidden="true"><span>基础</span><i /><span>实践</span><i /><span>深入</span></div></article></div>
      </section>

      <section id="fit" tabIndex={0} aria-label="适合谁学" className={'md-section md-fit md-camera-panel' + (camera === 2 ? ' is-focused' : '')} onPointerMove={event => trackCamera(2, event.pointerType)} onPointerLeave={cancelCameraHover} onFocusCapture={() => setCamera(2)} onClick={() => setCamera(2)}>
        <div className="md-section-heading"><h2>适合什么样的人学</h2></div><p className="md-section-lead">不必一开始就擅长所有事情。看看这些学习状态，哪些让你觉得“我愿意试试”。</p>
        <div className="md-fit-grid">{profile.interests.map((interest, index) => <article key={interest} className="md-fit-card"><span className={'md-fit-symbol md-fit-symbol-' + index} aria-hidden="true"><MajorFitArtwork index={index} /></span><span className="md-fit-label">{fitLabels[index]}</span><h3>{interest}</h3></article>)}</div>
      </section>

      </div></div>
      <MajorDiscussion major={major} questions={questions} onChange={setQuestions} onNotice={setAlert} />
      <footer className="md-page-end"><span>选择可以慢慢来，好奇心可以先出发。</span><Link href={returnHref} onClick={event => navigateMajor(event, 'back')}>再认识一个专业<ArrowUpRight size={16} /></Link></footer>
      </div></div>
    </div>
  </div>
}
