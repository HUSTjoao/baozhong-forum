'use client'

import AnimationControl from './AnimationControl'
import { useEffect, useId, useRef, useState } from 'react'
import CollegeStrokeFragments from './CollegeStrokeFragments'
import useScrollChapters from './useScrollChapters'

const journeyChapters = [{ progress: 1, duration: 3800 }] as const
const nextLetter = { selector: '#home-explore', stageSelector: '.admission-stage', progress: .6073, duration: 4400 } as const

const universities = [
  { name: '清华大学', x: 18, y: 25, size: 29, mx: 23, my: 31, ms: 15 },
  { name: '北京大学', x: 81, y: 25, size: 27, mx: 76, my: 29, ms: 15 },
  { name: '华中科技大学', x: 82, y: 36, size: 23, mx: 85, my: 47, ms: 12 },
  { name: '新加坡国立大学', x: 68, y: 75, size: 22, mx: 54, my: 73, ms: 12 },
  { name: '武汉大学', x: 31, y: 70, size: 25, mx: 22, my: 63, ms: 14 },
  { name: '浙江大学', x: 85, y: 61, size: 28, mx: 79, my: 62, ms: 14 },
  { name: '西北工业大学', x: 48, y: 16, size: 22, mx: 47, my: 24, ms: 12 },
  { name: '西安交通大学', x: 10, y: 49, size: 24, mx: 15, my: 45, ms: 12 },
  { name: '复旦大学', x: 92, y: 47, size: 22, mx: 0, my: 0, ms: 0 },
  { name: '上海交通大学', x: 49, y: 78, size: 24, mx: 0, my: 0, ms: 0 },
  { name: '南京大学', x: 31, y: 21, size: 21, mx: 0, my: 0, ms: 0 },
  { name: '中国科学技术大学', x: 16, y: 35, size: 19, mx: 0, my: 0, ms: 0 },
  { name: '四川大学', x: 20, y: 65, size: 22, mx: 0, my: 0, ms: 0 },
  { name: '哈尔滨工业大学', x: 66, y: 18, size: 19, mx: 0, my: 0, ms: 0 },
  { name: '中山大学', x: 13, y: 56, size: 21, mx: 0, my: 0, ms: 0 },
  { name: '西安电子科技大学', x: 77, y: 69, size: 20, mx: 0, my: 0, ms: 0 },
]

function phase(start: number, end: number, progress: number) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return value * value * (3 - 2 * value)
}

export default function UniversityJourney() {
  const sectionRef = useRef<HTMLElement>(null)
  const { playing, progress, completed, skipAnimation, replayAnimation } = useScrollChapters(sectionRef, '.journey-stage', journeyChapters, 0, nextLetter)
  const maskId = 'school-clearance-' + useId().replace(/:/g, '')
  const [mobile, setMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [geometry, setGeometry] = useState({ width: 1440, height: 900, fontSize: 100 })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const stage = section.querySelector<HTMLElement>('.journey-stage')
      const title = section.querySelector<HTMLElement>('.journey-title')
      if (stage && title) {
        const width = stage.clientWidth
        const height = stage.clientHeight
        const fontSize = parseFloat(getComputedStyle(title).fontSize)
        setGeometry(old => old.width === width && old.height === height && old.fontSize === fontSize ? old : { width, height, fontSize })
      }
      const distance = Math.max(1, section.offsetHeight - (stage?.offsetHeight ?? window.innerHeight))
      const next = motion.matches ? 0 : Math.max(0, Math.min(1, -rect.top / distance))
      setMobile(window.innerWidth <= 760)
      setReducedMotion(motion.matches)
      document.documentElement.dataset.journeyActive = String(next > .06 && next < 1 && rect.bottom > window.innerHeight)
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
      window.cancelAnimationFrame(frame)
      delete document.documentElement.dataset.journeyActive
    }
  }, [])

  const fade = 1 - phase(.02, .2, progress)
  const center = phase(.24, .65, progress)
  const fracture = phase(.12, .6, progress)
  const escape = phase(.12, .3, progress)
  const shardOpacity = phase(.1, .16, progress) * (1 - phase(.4, .62, progress))
  const network = phase(.35, .76, progress)
  const nodes = mobile ? universities.filter(node => node.ms > 0) : universities
  const schoolX = 500 + (center - 1) * 2.14 * geometry.fontSize * 1000 / geometry.width
  const schoolHalfWidth = (2.14 * geometry.fontSize * (1 - center * .4) + (mobile ? 12 : 20)) * 1000 / geometry.width
  const schoolHalfHeight = (.675 * geometry.fontSize * (1 - center * .4) + 12) * 1000 / geometry.height

  return (
    <section ref={sectionRef} className="university-journey" data-playing={playing} data-reduced-motion={reducedMotion} data-progress={progress.toFixed(3)} aria-labelledby="forum-title">
      <div className="university-hero journey-stage">
        <div className="university-hero-shade" aria-hidden="true" />
        <p className="university-hero-eyebrow journey-eyebrow" lang="en" style={{ opacity: fade, transform: `translateY(${(1 - fade) * -16}px)` }}>Baoji Middle School · University Community</p>
        <h1 id="forum-title" className="journey-title" aria-label="宝鸡中学高校论坛">
          <span className="journey-school" aria-hidden="true" style={{ transform: `translateX(${center * 2.14}em) scale(${1 - center * .4})` }}>宝鸡中学</span>
          <span className="journey-colleges" aria-hidden="true">
            <span style={{ opacity: 1 - phase(.1, .18, progress) }}>高校</span>
            <CollegeStrokeFragments fracture={fracture} escape={escape} opacity={shardOpacity} mobile={mobile} />
          </span>
          <span aria-hidden="true" style={{ opacity: 1 - phase(.03, .2, progress), transform: `translateX(${phase(.03, .2, progress) * 18}px)` }}>论坛</span>
        </h1>
        <p className="university-hero-description journey-description" style={{ opacity: fade, transform: `translateY(${(1 - fade) * 18}px)` }}><span>宝鸡中学的你们向往着大学的我们，</span><span>大学的我们怀念着宝鸡中学的你们。</span></p>
        <div className="journey-network" aria-hidden="true" style={{ opacity: network }}>
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="journey-connections">
            <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="white" /><rect x={schoolX - schoolHalfWidth} y={460 - schoolHalfHeight} width={schoolHalfWidth * 2} height={schoolHalfHeight * 2} rx="8" fill="black" /></mask></defs>
            <g mask={`url(#${maskId})`}>
            {nodes.map((node, index) => {
              const x = (mobile ? node.mx : node.x) * 10
              const y = (mobile ? node.my : node.y) * 10
              const stagger = index / nodes.length * .12
              const draw = phase(.56 + stagger, .85 + stagger, progress)
              const dx = x - schoolX
              const dy = y - 460
              // Begin outside the school name, and stop before the university label.
              const boundary = Math.min(schoolHalfWidth / Math.max(1, Math.abs(dx)), schoolHalfHeight / Math.max(1, Math.abs(dy)))
              const startX = schoolX + dx * boundary
              const startY = 460 + dy * boundary
              const size = mobile ? node.ms : node.size * Math.max(.65, Math.min(1.1, geometry.width / 1440))
              const labelHalfWidth = node.name.length * size * (mobile ? 1.035 : 1.09) * .5 * 1000 / geometry.width
              const labelHalfHeight = size * .75 * 1000 / geometry.height
              const labelBoundary = Math.min(
                (labelHalfWidth + 7 * 1000 / geometry.width) / Math.max(1, Math.abs(dx)),
                (labelHalfHeight + 7 * 1000 / geometry.height) / Math.max(1, Math.abs(dy)),
              )
              const endX = x - dx * labelBoundary
              const endY = y - dy * labelBoundary
              // Each curve stays in its own radial sector, with pixel-consistent spacing.
              const lineX = endX - startX
              const lineY = endY - startY
              const length = Math.hypot(lineX, lineY)
              const bend = Math.min(10, length * .025) * (index % 2 ? 1 : -1)
              const offsetX = length ? -lineY / length * bend : 0
              const offsetY = length ? lineX / length * bend : 0
              const path = `M ${startX} ${startY} C ${startX + lineX * .33 + offsetX} ${startY + lineY * .33 + offsetY} ${startX + lineX * .7 + offsetX} ${startY + lineY * .7 + offsetY} ${endX} ${endY}`
              return <g key={node.name}>
                <path className="journey-connection" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} d={path} />
                <circle className="journey-node-dot" cx={endX} cy={endY} r={mobile ? 2 : 2.5} style={{ opacity: draw }} />
              </g>
            })}
            </g>
          </svg>
          {nodes.map((node, index) => {
            const stagger = index / nodes.length * .16
            const appear = phase(.36 + stagger, .64 + stagger, progress)
            const x = mobile ? node.mx : node.x
            const y = mobile ? node.my : node.y
            return <span key={node.name} className="journey-university" style={{ left: `${x}%`, top: `${y}%`, fontSize: mobile ? node.ms : node.size * Math.max(.65, Math.min(1.1, geometry.width / 1440)), opacity: appear, transform: `translate(calc(-50% + ${(50 - x) * (1 - appear) * 2}px), calc(-50% + ${(46 - y) * (1 - appear) * 2}px)) scale(${.8 + appear * .2})` }}>{node.name}</span>
          })}
        </div>
        <div className="journey-network-caption" style={{ opacity: Math.max(fade, phase(.82, 1, progress)), bottom: `${(mobile ? 8 : 7) + fade * 6}%` }}><p className="journey-caption-chinese">培育走向世界的现代中国人</p><p className="journey-caption-english" lang="en">Training Modern Chinese People To the World</p></div>
        <div className="university-hero-scroll" style={{ opacity: playing ? 0 : Math.max(1 - phase(.02, .14, progress), phase(.94, 1, progress)) }} aria-hidden="true"><span>↓</span></div>
        <AnimationControl className="journey-skip" completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />
      </div>
    </section>
  )
}
