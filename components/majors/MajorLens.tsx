 'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft, Search, Aperture } from 'lucide-react'
import { majors as initialMajors, getAllMajors, type Major } from '@/data/majors'

type Field = 'arts' | 'science' | 'engineering' | 'medicine' | 'other'
const fields: { id: Field; title: string; english: string; line: string; examples: string; word: string }[] = [
  { id: 'arts', title: '文科', english: 'Humanities', line: '在文字与思想之间，理解人。', examples: '文学 · 历史 · 哲学', word: 'READ' },
  { id: 'science', title: '理科', english: 'Sciences', line: '从一个问题，走向世界的规律。', examples: '数学 · 物理 · 化学', word: 'DISCOVER' },
  { id: 'engineering', title: '工科', english: 'Engineering', line: '把想象，变成可以触碰的现实。', examples: '计算机 · 电子 · 建筑', word: 'CREATE' },
  { id: 'medicine', title: '医科', english: 'Medicine', line: '认识生命，也学会守护生命。', examples: '临床 · 口腔 · 药学', word: 'CARE' },
  { id: 'other', title: '其他', english: 'More possibilities', line: '每一种热爱，都有自己的方向。', examples: '农学 · 教育 · 经管 · 艺体', word: 'EXPLORE' }
]
const fieldSlogans: Record<Exclude<Field, 'engineering'>, string[]> = {
  arts: ['以诗书，涵养心性。', '以学识，回应时代。'],
  science: ['让好奇，抵达未知。'],
  medicine: ['以仁心，守护生命。', '让研究，带来希望。'],
  other: ['循着热爱，走自己的路。', '把可能，写成新的答案。']
}
const fieldDisciplines: Record<Field, string[]> = {
  arts: ['汉语言文学', '历史学', '哲学', '法学', '新闻传播', '政治学', '外国语言文学', '社会学', '考古学', '国际关系'],
  science: ['数学', '物理学', '化学', '生物科学', '统计学', '天文学', '地理科学', '心理学', '地质学', '生态学'],
  engineering: ['计算机', '机械工程', '能源动力工程', '电子信息', '集成电路', '船舶与海洋工程', '航空航天', '土木工程'],
  medicine: ['临床医学', '口腔医学', '药学', '护理学', '公共卫生', '中医学', '预防医学', '医学影像学', '康复治疗学', '麻醉学'],
  other: ['教育学', '经济管理', '农学', '艺术设计', '体育学', '金融学', '会计学', '音乐学', '园林', '旅游管理']
}
const fieldPhotos: Record<Field, number[]> = {
  arts: [19572098, 8111889, 7876088, 8730785, 12124094, 5668775, 6549912, 19069486, 6549592, 7964203],
  science: [36727266, 8325715, 9628799, 8532836, 3735703, 9628840, 4033020, 9574545, 9243720, 6129868],
  engineering: [9242833, 6805152, 7937365, 7988086, 17395035, 18935831, 9242835, 9242852, 9242823, 9242261],
  medicine: [8376271, 8533099, 6129243, 11660581, 9628840, 8532836, 6129589, 6129653, 6129879, 8531343],
  other: [5212703, 9849633, 5230953, 7097474, 2544829, 30585023, 32323479, 7580635, 7014674, 6231973]
}
function PhotoScenery({ field, scrollRoot, count }: { field: Field; scrollRoot: React.RefObject<HTMLDivElement>; count: number }) {
  const scene = useRef<HTMLDivElement>(null)
  const desiredCount = Math.max(fieldPhotos[field].length, Math.ceil(count / 2))
  const [photoCount, setPhotoCount] = useState(2)
  useEffect(() => {
    const scroller = scrollRoot.current
    const layer = scene.current
    if (!scroller || !layer) return
    const photos = Array.from(layer.querySelectorAll<HTMLElement>('.field-scene-photo'))
    function position() {
      const catalog = layer!.parentElement?.querySelector<HTMLElement>('.lens-catalog-list')
      const firstTop = (catalog?.offsetTop ?? 300) + 35
      const photoHeight = photos[0]?.offsetHeight ?? 420
      const available = Math.max(0, layer!.clientHeight - firstTop - photoHeight - 50)
      setPhotoCount(Math.max(1, Math.min(desiredCount, Math.floor(available / (photoHeight + 80)) + 1)))
      photos.forEach((photo, index) => { photo.style.top = `${firstTop + available * index / Math.max(1, photos.length - 1)}px` })
    }
    position()
    const resize = new ResizeObserver(position)
    resize.observe(layer)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      photos.forEach(photo => photo.classList.add('is-revealed'))
      return () => resize.disconnect()
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    }, { root: scroller, threshold: .12, rootMargin: '0px 0px -12% 0px' })
    photos.forEach(photo => observer.observe(photo))
    return () => { observer.disconnect(); resize.disconnect() }
  }, [field, scrollRoot, photoCount, desiredCount])
  return <div ref={scene} className="field-scattered-photos" aria-hidden="true">{Array.from({ length: photoCount }, (_, index) => {
    const photo = fieldPhotos[field][index % fieldPhotos[field].length]
    return <div key={index} className={'field-scene-photo field-scene-' + (index % 2 ? 'right' : 'left')} style={{ '--photo-angle': `${[-4, 3, 2, -3, -2, 4][index % 6]}deg` } as React.CSSProperties}><img src={`https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=1400`} alt="" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" onError={event => { event.currentTarget.style.visibility = 'hidden' }} /></div>
  })}</div>
}
// These are exploration entrances rather than official degree classifications.
function fieldOf(major: Major): Field {
  if (/经济|金融|财政|税收|贸易|会计|财务|审计|工商|管理|营销|物流|旅游|酒店|人力资源|行政|教育|师范|学前|体育|运动|艺术|美术|音乐|舞蹈|戏剧|表演|动画|摄影|设计|广播电视编导|播音|农学|农业|林学|森林|园林|园艺|植物|动物|水产|茶学|食品|酿酒/.test(major.name)) return 'other'
  return major.category
}
function ScienceArtwork() {
  const digits = useRef<HTMLDivElement>(null)
  const cosmos = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scene = cosmos.current
    const blade = scene?.closest('button')
    if (!scene || !blade || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    function move(event: PointerEvent) {
      if (event.pointerType === 'touch') return
      const bounds = scene!.getBoundingClientRect()
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / bounds.width))
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / bounds.height))
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        scene!.style.setProperty('--space-x', `${x * 18}deg`)
        scene!.style.setProperty('--space-y', `${-y * 14}deg`)
      })
    }
    function reset() {
      cancelAnimationFrame(frame)
      scene!.style.setProperty('--space-x', '0deg')
      scene!.style.setProperty('--space-y', '0deg')
    }
    blade.addEventListener('pointermove', move)
    blade.addEventListener('pointerleave', reset)
    return () => { cancelAnimationFrame(frame); blade.removeEventListener('pointermove', move); blade.removeEventListener('pointerleave', reset) }
  }, [])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let stopped = false
    let batch = 0
    const animations = new Set<Animation>()
    const timer = setInterval(() => {
      if (document.hidden || !digits.current) return
      const cells = Array.from(digits.current.children)
      cells.filter((_, index) => index % 3 === batch % 3).forEach((cell, index) => {
        const number = cell.firstElementChild as HTMLElement
        const outgoing = number.animate([{ transform: 'translateY(0)', opacity: .85 }, { transform: 'translateY(-22px)', opacity: 0 }], { duration: 180, delay: index * 14, easing: 'ease-in' })
        animations.add(outgoing)
        outgoing.finished.then(() => {
          animations.delete(outgoing)
          if (stopped) return
          number.textContent = (Math.random() * 99.999).toFixed(3)
          const incoming = number.animate([{ transform: 'translateY(22px)', opacity: 0 }, { transform: 'translateY(0)', opacity: .85 }], { duration: 260, easing: 'ease-out' })
          animations.add(incoming)
          incoming.finished.then(() => animations.delete(incoming)).catch(() => {})
        }).catch(() => {})
      })
      batch++
    }, 560)
    return () => { stopped = true; clearInterval(timer); animations.forEach(animation => animation.cancel()) }
  }, [])
  return <>
    <div ref={digits} className="science-digits">{Array.from({ length: 24 }, (_, index) => <span key={index}><b>{((index * 7.137 + 3.142) % 100).toFixed(3)}</b></span>)}</div>
    <div ref={cosmos} className="science-solar"><div className="science-space-glow" /><div className="science-space-stars">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ left: `${(index * 37 + 13) % 100}%`, top: `${(index * 23 + 7) % 100}%`, '--star-delay': `${index * -.37}s` } as React.CSSProperties} />)}</div><div className="science-space-stage"><div className="science-sun" />{[0, 1, 2].map(index => <div key={index} className={'science-orbit-plane science-orbit-plane-' + index}><div className={'science-orbit science-orbit-' + index}><span className="science-planet" /></div></div>)}</div></div>
    <div className="science-chemistry-photo" /><div className="science-chemistry-wash" />
  </>
}
function InteractiveFocus() {
  const surface = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation | null>(null)
  useEffect(() => () => animation.current?.cancel(), [])
  function focus() {
    const ring = surface.current?.querySelector('.focus-iris')
    if (!ring || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animation.current?.cancel()
    animation.current = ring.animate([
      { transform: 'rotate(0deg) scale(1)' },
      { transform: 'rotate(28deg) scale(.72)', offset: .4 },
      { transform: 'rotate(72deg) scale(1)' }
    ], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' })
  }
  return <div ref={surface} className="lens-center interactive-focus" role="button" tabIndex={0} aria-label="点击体验镜头聚焦" onClick={focus} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); focus() } }} onPointerMove={event => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--focus-tilt-x', `${-(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 12}deg`)
    event.currentTarget.style.setProperty('--focus-tilt-y', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 12}deg`)
  }} onPointerLeave={event => { event.currentTarget.style.setProperty('--focus-tilt-x', '0deg'); event.currentTarget.style.setProperty('--focus-tilt-y', '0deg') }}>
    <svg className="focus-iris" viewBox="0 0 240 240" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => <path key={index} d="M120 9 A111 111 0 0 1 225.6 85.7 L209 91.1 A94 94 0 0 0 120 26" transform={`rotate(${index * 72} 120 120)`} />)}
    </svg>
    <div className="focus-content"><Aperture className="focus-symbol" size={25} strokeWidth={1} aria-hidden="true" /><p lang="en">FIND YOUR FOCUS</p><h1>专业认知</h1></div>
  </div>
}
function FieldArtwork({ field }: { field: Field }) {
  return <div className={'lens-art lens-art-' + field} aria-hidden="true">
    {field === 'arts' && <>
      <div className="humanities-photo humanities-photo-scholar" /><div className="humanities-photo humanities-photo-lawyer" /><div className="humanities-paper-wash" />
      <div className="humanities-poems"><span>读书破万卷，下笔如有神。<small>杜甫 · 奉赠韦左丞丈二十二韵</small></span><span>腹有诗书气自华。<small>苏轼 · 和董传留别</small></span></div>
      <span className="humanities-seal">文<br />心</span>
    </>}
    {field === 'science' && <ScienceArtwork />}
    {field === 'engineering' && <>
      <div className="engineering-photo engineering-photo-workshop" /><div className="engineering-photo engineering-photo-code" /><div className="engineering-photo-shade" />
      <span className="lens-engineering-measure">IDEA → PROTOTYPE → REALITY</span>
      <div className="engineering-slogans"><span>让构想，走出图纸。</span><span>用技术，回应世界。</span></div>
    </>}
    {field === 'medicine' && <>
      <div className="medicine-hospital-photo" /><div className="medicine-photo medicine-photo-doctor" /><div className="medicine-photo medicine-photo-laboratory" /><div className="medicine-photo-wash" />
    </>}
    {field === 'other' && <><div className="other-career-wall">{[
      [5212703, 32323479, 30585023],
      [5230953, 7580635, 7097474],
      [9849633, 2544829, 7014674]
    ].map((photos, column) => <div className="other-career-column" key={column}><div className="other-career-track">{[0, 1].map(copy => <div className="other-career-group" key={copy}>{photos.map(photo => <div className="other-career-photo" key={photo} style={{ backgroundImage: `url(https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=1400)` }} />)}</div>)}</div></div>)}</div><div className="other-career-veil" /></>}
  </div>
}
export default function MajorLens() {
  const root = useRef<HTMLElement>(null)
  const catalogPanel = useRef<HTMLDivElement>(null)
  const catalogScroll = useRef<HTMLDivElement>(null)
  const lastField = useRef<Field | null>(null)
  const outgoing = useRef<HTMLElement | null>(null)
  const outgoingAnimation = useRef<Animation | null>(null)
  const [slideDirection, setSlideDirection] = useState(0)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousNavColors = useRef<{ backgroundColor: string; color: string; borderBottomColor: string } | null>(null)
  const [catalog, setCatalog] = useState(initialMajors)
  const [selected, setSelected] = useState<Field | null>(null)
  const [query, setQuery] = useState('')
  useEffect(() => setCatalog(getAllMajors()), [])
  useLayoutEffect(() => {
    const nav = catalogPanel.current?.querySelector<HTMLElement>('.lens-field-nav')
    const previous = previousNavColors.current
    previousNavColors.current = null
    if (!nav || !previous || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const style = getComputedStyle(nav)
    const animation = nav.animate([previous, { backgroundColor: style.backgroundColor, color: style.color, borderBottomColor: style.borderBottomColor }], { duration: 900, easing: 'ease-in-out', fill: 'both' })
    return () => animation.cancel()
  }, [selected])
  useLayoutEffect(() => {
    const page = document as Document & { majorLensPlayed?: boolean }
    if (!root.current || page.majorLensPlayed || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.current.dataset.entering = 'true'
    const timer = setTimeout(() => { page.majorLensPlayed = true; root.current?.removeAttribute('data-entering') }, 2100)
    return () => clearTimeout(timer)
  }, [])
  function clearOutgoing() { outgoingAnimation.current?.cancel(); outgoing.current?.remove(); outgoing.current = null }
  useEffect(() => () => { outgoingAnimation.current?.cancel(); outgoing.current?.remove(); if (closeTimer.current) clearTimeout(closeTimer.current) }, [])
  function open(field: Field) {
    if (closing || closeTimer.current) return
    if (field === selected) return
    const nav = catalogPanel.current?.querySelector('.lens-field-nav')
    if (selected && nav) {
      const style = getComputedStyle(nav)
      previousNavColors.current = { backgroundColor: style.backgroundColor, color: style.color, borderBottomColor: style.borderBottomColor }
    }
    clearOutgoing()
    const direction = selected ? (fields.findIndex(item => item.id === field) > fields.findIndex(item => item.id === selected) ? 1 : -1) : 0
    if (selected && catalogPanel.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const snapshot = catalogPanel.current.cloneNode(true) as HTMLElement
      snapshot.classList.add('lens-outgoing')
      snapshot.setAttribute('aria-hidden', 'true')
      snapshot.setAttribute('inert', '')
      snapshot.removeAttribute('tabindex')
      const navigationHeight = catalogPanel.current.querySelector('.lens-field-nav')?.getBoundingClientRect().height || 0
      snapshot.style.clipPath = 'inset(' + navigationHeight + 'px 0 0 0)'
      root.current?.appendChild(snapshot)
      const previousScroll = snapshot.querySelector('.lens-expanded-body')
      if (previousScroll) previousScroll.scrollTop = catalogScroll.current?.scrollTop || 0
      outgoing.current = snapshot
      const motion = snapshot.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], { duration: 900, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' })
      outgoingAnimation.current = motion
      motion.finished.then(() => { snapshot.remove(); if (outgoing.current === snapshot) outgoing.current = null }).catch(() => {})
    }
    setSlideDirection(direction)
    lastField.current = field; root.current?.removeAttribute('data-entering'); setSelected(field); setQuery('')
  }
  function close() {
    if (closing || closeTimer.current) return
    clearOutgoing(); setSlideDirection(0)
    function finish() { setSelected(null); setClosing(false); setQuery(''); closeTimer.current = null; requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('.lens-blade-' + lastField.current)?.focus({ preventScroll: true })) }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return }
    setClosing(true)
    closeTimer.current = setTimeout(finish, 1050)
  }
  useEffect(() => {
    if (!selected) return
    catalogPanel.current?.scrollTo({ top: 0 })
    catalogPanel.current?.focus({ preventScroll: true })
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') close() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [selected])
  const active = fields.find(field => field.id === selected)
  const visible = catalog.filter(major => fieldOf(major) === selected && (major.name + major.description).includes(query.trim()))
  return <section ref={root} className="major-lens" data-expanded={selected || undefined} data-closing={closing ? 'true' : undefined} data-switching={slideDirection ? 'true' : undefined} aria-label="专业认知，选择你的学科方向">
    <div className="lens-blades" aria-hidden={selected ? true : undefined}>{fields.map((field, index) => <button key={field.id} type="button" className={'lens-blade lens-blade-' + field.id + (selected === field.id ? ' is-expanded' : '')} tabIndex={selected ? -1 : 0} onClick={() => open(field.id)} aria-label={'探索' + field.title + '专业'} style={{ '--blade-index': index } as React.CSSProperties}>
      <FieldArtwork field={field.id} />
      <div className={'lens-disciplines' + (field.id === 'engineering' ? ' engineering-disciplines' : '')}>{fieldDisciplines[field.id].map((name, disciplineIndex) => <span key={name} style={{ '--discipline-index': disciplineIndex } as React.CSSProperties}>{name}</span>)}</div>
      {field.id !== 'engineering' && field.id !== 'other' && <div className="lens-slogans" aria-hidden="true">{fieldSlogans[field.id].map(line => <span key={line}>{line}</span>)}</div>}
      <span className="lens-field-copy"><span className="lens-field-heading">{field.title}</span><span className="lens-field-english" lang="en">{field.english}</span><span className="lens-field-line">{field.line}</span><span className="lens-field-examples">{field.examples}</span></span>
    </button>)}</div>
    <svg className="lens-seams" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="lens-seam-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff" stopOpacity=".65" /><stop offset=".5" stopColor="#ffffff" stopOpacity=".9" /><stop offset="1" stopColor="#b6ccdd" stopOpacity=".45" /></linearGradient></defs><g className="lens-seam-shadow"><path d="M500 0V500M1000 300L500 500M900 1000L500 500M100 1000L500 500M0 300L500 500" /></g><g className="lens-seam-light"><path d="M500 0V500M1000 300L500 500M900 1000L500 500M100 1000L500 500M0 300L500 500" /></g></svg>
    <InteractiveFocus />


    {selected && <div key={selected} ref={catalogPanel} tabIndex={-1} data-slide={slideDirection || undefined} style={{ '--slide-start': `${slideDirection * 100}%` } as React.CSSProperties} className={'lens-expanded lens-expanded-' + selected} aria-label={active?.title + '专业探索'}>
      <div className="field-photo-scenery" aria-hidden="true" />
      <nav className="lens-field-nav" aria-label="切换学科"><button className="lens-return" type="button" onClick={close}><ArrowLeft size={18} /><span>返回</span></button><div className="lens-field-tabs">{fields.map(field => <button key={field.id} className={'lens-tab-' + field.id} type="button" aria-pressed={selected === field.id} onClick={() => open(field.id)}><span>{field.title}</span></button>)}</div></nav>
      <div ref={catalogScroll} className="lens-expanded-body"><div className="lens-scroll-content"><PhotoScenery field={selected} scrollRoot={catalogScroll} count={visible.length} />
      <div className="lens-catalog-heading"><div><p lang="en">{active?.english}</p><h2>{active?.title}<span>专业探索</span></h2><p className="lens-expanded-line">{active?.line}</p></div></div>
      <label className="lens-catalog-search"><Search size={18} /><input aria-label="搜索当前学科专业" placeholder="寻找感兴趣的专业" value={query} onChange={event => setQuery(event.target.value)} /><span>{visible.length} 个专业</span></label>
      <div className="lens-catalog-list">{visible.map(major => <article key={major.id}><h3>{major.name}</h3><p>{major.description}</p><Link href={'/majors/' + major.id + '/forum'}>参与专业讨论<ArrowUpRight size={16} /></Link></article>)}{!visible.length && <p className="lens-catalog-empty">暂时没有匹配的专业，试试其他关键词。</p>}</div>
      </div></div>
    </div>}
  </section>
}











